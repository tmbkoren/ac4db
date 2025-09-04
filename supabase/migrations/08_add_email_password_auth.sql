-- Migration: 08_add_email_password_auth
-- Description: Updates the profiles table to support email/password, Google, and Discord authentication.

-- 1. Make discord_id and discord_username nullable
-- This is to accommodate users who sign up with email and password or Google.
ALTER TABLE public.profiles
ALTER COLUMN discord_id DROP NOT NULL,
ALTER COLUMN discord_username DROP NOT NULL;

-- 2. Rename designer_name to username and make it unique and nullable
-- This will serve as the primary display name for all users. It is nullable
-- so that users can choose their username after signing up.
ALTER TABLE public.profiles
RENAME COLUMN designer_name TO username;

-- Make username nullable
ALTER TABLE public.profiles
ALTER COLUMN username DROP NOT NULL;

-- Add a unique constraint to the new username column.
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- 3. Create a trigger to automatically create a profile for new users.
-- This function will be triggered whenever a new user is added to auth.users.
-- It only inserts the user_id, and the rest of the profile is populated by the application.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger on the auth.users table.
-- We will drop the old trigger if it exists, and then create the new one.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();