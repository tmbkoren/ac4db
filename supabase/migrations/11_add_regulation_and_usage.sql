-- Migration: 11_add_regulations_table
-- Description: Creates a dedicated table for regulations and links it to schematics.

-- 1. Create the 'regulations' table to store regulation data
CREATE TABLE regulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    family TEXT NOT NULL,
    sort_order INT NOT NULL
);

-- 2. Add indexes for faster lookups
CREATE INDEX idx_regulations_family ON regulations(family);

-- 3. Pre-populate the table with known regulations
INSERT INTO regulations (name, family, sort_order) VALUES
('1.00', '1.00', 10),
('1.10', '1.10', 20),
('1.15', '1.15', 30),
('1.20', '1.20', 40),
('1.30', '1.30', 50),
('1.40', '1.40', 60),
('1.99-08k', '1.99', 100);

-- 4. Add the foreign key column to the 'schematics' table
ALTER TABLE schematics
ADD COLUMN regulation_id UUID REFERENCES regulations(id);

-- 5. Add an index on the new foreign key for performance
CREATE INDEX idx_schematics_regulation_id ON schematics(regulation_id);

-- 6. Backfill the regulation_id for all existing schematics
DO $$
DECLARE
    latest_regulation_id UUID;
BEGIN
    -- Find the ID for the latest regulation ('1.99-08k')
    SELECT id INTO latest_regulation_id FROM regulations WHERE name = '1.99-08k';

    -- Update all existing schematics to use this regulation
    UPDATE schematics
    SET regulation_id = latest_regulation_id
    WHERE regulation_id IS NULL;
END $$;
