-- Migration: 04_add_rls_policies
-- Description: Enables Row Level Security (RLS) and defines policies for the application.

-- 1. Enable RLS on all relevant tables
ALTER TABLE schematics ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematic_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematic_tunings ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow public read access to all tables
-- This allows anyone, including anonymous users, to view schematics and parts.
CREATE POLICY "Allow public read access" ON schematics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON schematic_parts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON schematic_tunings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON parts FOR SELECT USING (true);

-- 3. Create a policy to allow any authenticated user to insert schematics
-- This allows both permanent and anonymous users to upload.
CREATE POLICY "Allow insert for authenticated users" ON schematics FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- --- 
-- End of migration
-- ---
