-- Migration: 15_fix_security_policies
-- Description: Closes RLS gaps that let any signed-in user modify other users' data,
-- and hardens functions and storage buckets.

-- 1. schematic_parts / schematic_tunings
-- The previous policies only checked `auth.uid() IS NOT NULL`, so any signed-in user
-- could insert, update or delete rows for any schematic. The app only ever inserts
-- (through create_schematic_with_details), and deletes cascade from schematics,
-- so INSERT is the only write that needs a policy, restricted to the schematic's owner.
DROP POLICY "Enable insert for authenticated users" ON public.schematic_parts;
DROP POLICY "Enable update for authenticated users" ON public.schematic_parts;
DROP POLICY "Enable delete for authenticated users" ON public.schematic_parts;
DROP POLICY "Enable insert for authenticated users" ON public.schematic_tunings;
DROP POLICY "Enable update for authenticated users" ON public.schematic_tunings;
DROP POLICY "Enable delete for authenticated users" ON public.schematic_tunings;

CREATE POLICY "Owners can insert parts" ON public.schematic_parts
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.schematics s
    WHERE s.id = schematic_id AND s.user_id = (SELECT auth.uid())
));

CREATE POLICY "Owners can insert tunings" ON public.schematic_tunings
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.schematics s
    WHERE s.id = schematic_id AND s.user_id = (SELECT auth.uid())
));

-- 2. schematics
-- Permissive policies are OR'ed. This one only checked that the caller was signed in,
-- which overrode "Enable insert for authenticated users only" (user_id = auth.uid())
-- and allowed uploading schematics under another user's id.
DROP POLICY "Allow insert for authenticated users" ON public.schematics;

-- 3. create_schematic_with_details
-- Same signature as the live function. Rejects a p_user_id that isn't the caller,
-- and pins search_path, so every relation is schema-qualified.
-- Also drops the "ensure profile exists" upsert, which was added for anonymous users.
-- Anonymous sign-in is disabled, and handle_new_user creates the profile at signup.
CREATE OR REPLACE FUNCTION public.create_schematic_with_details(
    p_design_name TEXT,
    p_designer_name TEXT,
    p_user_id UUID,
    p_file_path TEXT,
    p_regulation_id UUID,
    p_usage_type TEXT[],
    p_parts JSONB,
    p_tunings JSONB,
    p_image_url TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    new_schematic_id UUID;
    part_record RECORD;
    master_part_id UUID;
    tuning_key TEXT;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'p_user_id must match the authenticated user';
    END IF;

    -- Step 1: Insert the main schematic record.
    INSERT INTO public.schematics (
        design_name,
        designer_name,
        user_id,
        file_path,
        image_url,
        description,
        game,
        regulation_id,
        usage_type
    )
    VALUES (
        p_design_name,
        p_designer_name,
        p_user_id,
        p_file_path,
        p_image_url,
        p_description,
        'ACFA',
        p_regulation_id,
        p_usage_type
    )
    RETURNING id INTO new_schematic_id;

    -- Step 2: Loop through the parts JSON array and insert into the `schematic_parts` join table.
    FOR part_record IN SELECT * FROM jsonb_to_recordset(p_parts) AS x(slot_name TEXT, game_id TEXT, lookup_category TEXT)
    LOOP
        -- Find the master part ID from our 'parts' table using the lookup info.
        SELECT id INTO master_part_id FROM public.parts
        WHERE parts.game_id = part_record.game_id AND parts.lookup_category = part_record.lookup_category;

        -- Insert the link into the join table.
        IF master_part_id IS NOT NULL THEN
            INSERT INTO public.schematic_parts (schematic_id, part_id, slot_name)
            VALUES (new_schematic_id, master_part_id, part_record.slot_name);
        END IF;
    END LOOP;

    -- Step 3: Loop through the tunings JSON object and insert into the `schematic_tunings` table.
    FOR tuning_key IN SELECT * FROM jsonb_object_keys(p_tunings)
    LOOP
        INSERT INTO public.schematic_tunings (schematic_id, tuning_label, tuning_value)
        VALUES (new_schematic_id, tuning_key, (p_tunings->>tuning_key)::INT);
    END LOOP;

    -- Step 4: Return the ID of the newly created schematic.
    RETURN new_schematic_id;
END;
$$;

-- 4. Remaining functions: pin search_path (bodies are already schema-qualified).
ALTER FUNCTION public.search_schematics(TEXT[], TEXT[], UUID[], TEXT, TEXT, TEXT[], TEXT, TEXT, INT, INT) SET search_path = '';
ALTER FUNCTION public.check_usage_type_values(TEXT[]) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- handle_new_user is a SECURITY DEFINER trigger function and shouldn't be callable via /rest/v1/rpc.
-- The trigger keeps working: EXECUTE is only checked when the trigger is created.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 5. Storage
-- The previous policies allowed any signed-in user to insert, update and delete
-- any object in any bucket. The app only uploads new files (no upsert), and both buckets
-- are public, so reads skip RLS. INSERT into the app's two buckets is all that's needed.
DROP POLICY "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY "Enable update for authenticated users only" ON storage.objects;
DROP POLICY "Enable delete for authenticated users only" ON storage.objects;

CREATE POLICY "Authenticated users can upload schematics and images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('schematics', 'images'));

-- Enforce content types at the bucket level. SVG is excluded on purpose:
-- it can carry scripts, and these buckets are public.
UPDATE storage.buckets SET allowed_mime_types = ARRAY['application/octet-stream'] WHERE id = 'schematics';
UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'] WHERE id = 'images';

-- ---
-- End of migration
-- ---
