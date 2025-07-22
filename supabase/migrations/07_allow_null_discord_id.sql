-- Migration: 07_allow_null_discord_id
-- Description: Alters the profiles table to allow the discord_id column to be null.
-- This is necessary to support anonymous users who do not have a Discord ID.

ALTER TABLE public.profiles
ALTER COLUMN discord_id DROP NOT NULL;

-- --- 
-- End of migration
-- ---
