ALTER TABLE public.parts
ADD COLUMN subcategory TEXT;

COMMENT ON COLUMN public.parts.subcategory IS 'A more specific category for filtering, e.g., Bipedal, Laser Rifle, etc. Populated manually.';