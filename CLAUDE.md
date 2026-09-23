# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## What this is

AC4DB ([ac4db.org](https://ac4db.org)) is a community database of Armored Core: For Answer (PS3) schematics. Users upload an exported `.ac4a` file and a screenshot. Anyone can browse, filter by parts, and download the file back.

`.ac4a` files come from a companion desktop app, [ACFA Schematic Tool](https://github.com/tmbkoren/ACFA_Schematic_Tool) (Python/PySide6). It extracts designs from the game's `DESDOC.DAT` save and imports them back, including directly by ac4db schematic ID through `GET /api/schematics/{id}/download`. **That route is a public API used by the desktop tool: don't change its URL or response format.**

## Commands

```bash
npm run dev           # dev server (Turbopack)
npm run build         # production build; needs the env vars below
npm run lint          # ESLint
npx tsc --noEmit      # type check
npx supabase gen types typescript --project-id <project-id> --schema public > database.types.ts
```

There is no test suite. Before calling a change done, run `npx tsc --noEmit` and `npm run lint`, and `npm run build` when env vars are available.

`.env.local` (not committed):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; used only for account deletion)

## Stack and architecture

- **Next.js 15 App Router.** Pages are Server Components by default. All writes go through Server Actions in each route's `actions.ts` (`'use server'`).
- **Mantine 8** for the UI, with CSS modules for component styles. `postcss-preset-mantine` defines the breakpoints. The theme lives in `src/utils/theme/theme.ts`, and the app is dark mode only.
- **Supabase** (Postgres, Auth, Storage). Pick the right client:
  - `src/utils/supabase/server.ts`: Server Components and Server Actions (cookie session). Use this by default.
  - `src/utils/supabase/client.ts`: browser (client components).
  - `src/utils/supabase/admin.ts`: service role, which **bypasses RLS**. Server only; currently used only for account deletion. Never import it into client code.
- **Middleware** (`src/middleware.ts` → `updateSession` in `src/utils/supabase/middleware.ts`) refreshes the session on every request, sends users without a username to `/complete-profile`, and protects `/profile` and `/upload`.
- The import alias `@/*` maps to `src/*`.
- **Types:** use `database.types.ts`, which is generated; regenerate it after schema changes. Hand-written shapes live in `src/utils/types/global.types.ts`.

### Key flows

- **Upload** (`src/app/upload/`):
  1. The client parses the file header for a preview.
  2. The `sendSchematic` action checks auth, then parses the full file with `src/utils/lib/parseAc4a.ts`.
  3. It uploads the `.ac4a` and the image to Storage.
  4. It calls the `create_schematic_with_details` RPC, which inserts the schematic, its parts and its tunings in one transaction.

  Storage uploads are **not** part of that transaction, so a failure after them leaves orphaned files.
- **Search** (`src/app/page.tsx`): filters live in URL search params. `AdvancedSearchAndFilter` writes them. The page resolves `parts` params (`Category-PartName`) to part IDs with `getPartIds`, then calls the `search_schematics` RPC, which handles filtering, sorting and pagination and returns the total count through `COUNT(*) OVER()`.

## Database

Tables:
- `profiles`: 1:1 with `auth.users`. Created by the `handle_new_user` trigger on signup.
- `schematics`: one row per upload.
- `parts`: master list, unique on `(game_id, lookup_category, game)`.
- `schematic_parts`: join table, primary key `(schematic_id, slot_name)`.
- `schematic_tunings`: one row per stat.
- `regulations`: game patch versions.

Storage buckets:
- `schematics`: public, 24,280-byte limit, `application/octet-stream` only.
- `images`: public, 2 MB limit, PNG/JPEG/WebP/GIF/AVIF only.

**RLS is the authorization layer.** The anon key is public, so anyone can call the REST API directly, and server-side checks alone protect nothing.
- Every table needs RLS enabled, with policies that check ownership against `(select auth.uid())`.
- Permissive policies are combined with OR: one loose policy overrides every strict one.
- Database functions are `SECURITY INVOKER` with `SET search_path = ''`, so every relation must be schema-qualified (`public.parts`).

### Migrations: read before touching the schema

- Files are in `supabase/migrations/` as `NN_description.sql`, applied **by hand in the Supabase SQL editor**.
- The remote migration history table is empty, and 01–14 do not reproduce the full schema.
- **Never run `supabase db push`, `supabase db reset --linked`, or anything that writes to the linked project.** Write a new migration file and leave applying it to the user.
- Never edit a migration that has already been applied; add a new one.
- The Supabase MCP server is configured read-only. Use it to inspect the schema, policies, data and logs, not to change them.

## The `.ac4a` format

One raw 24,280-byte schematic block. Offsets used by `parseAc4a.ts`:

| Offset | Field |
|---|---|
| `0x01` | name, 96 bytes UTF-16LE |
| `0x61` | designer, 96 bytes UTF-16LE |
| `0xC0` | timestamp, u64 big-endian |
| `0xC8` | category |
| `0xD8` | 15 part IDs, u16 big-endian |
| `0x126` | 28 tuning bytes |

`parseAc4a.ts` is a port of the desktop tool's `util/schematic.py`, which is the source of truth; keep offsets and slot order in sync with it. Part IDs are only unique within a category, so parts are looked up by `(game_id, lookup_category)`, and left/right arm and back units map to `Arm Unit`/`Back Unit`.

Part names exist in two places: `src/utils/lib/part_mapping.json` (used by the parser and the filter UI) and the `parts` table (used by the RPCs). Update both. `part_mapping_original.json` is unused.

## Gotchas

- `next.config.ts` hardcodes the Supabase storage hostname for `next/image`.
- Server Actions have a 4 MB `bodySizeLimit`, while the image dropzone allows 5 MB and the bucket 2 MB. Keep limits consistent when touching uploads.
- `imageMimeTypes` in `src/app/upload/page.tsx` must match the `images` bucket's allowed MIME types.
- Errors thrown in Server Actions are hidden in production. Return error values if the user needs to see the message.
- Server-rendered client components hit hydration mismatches when they format dates in the local time zone (see `SchematicCard`).
- `schematics.user_id → profiles` has no `ON DELETE` action, so deleting an account with uploads fails.

## Working rules

- Work on a feature branch; Vercel deploys `main` to production.
- Don't commit or push without asking.
- Keep changes scoped to the request. Mention other issues you notice instead of fixing them unasked.
