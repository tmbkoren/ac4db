-- Migration: 01_create_parts_tables
-- Description: Creates the master 'parts' table, the 'schematic_parts' join table,
-- and the 'schematic_tunings' table to normalize the database schema.

-- 1. Create a master table for all unique parts
CREATE TABLE parts (
    -- Use a UUID as the primary key for stability and performance.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The part ID from the game's data file (e.g., "0031").
    game_id TEXT NOT NULL,

    -- The fundamental category used for lookups (e.g., "Head", "Arm Unit").
    lookup_category TEXT NOT NULL,

    -- The human-readable name of the part (e.g., "GAN02-NSS-H").
    name TEXT NOT NULL,

    -- The game this part belongs to, for future-proofing.
    game TEXT NOT NULL DEFAULT 'ACFA',

    -- A part is defined as unique by the combination of its game ID and its lookup category.
    UNIQUE(game_id, lookup_category, game)
);

-- 2. Create the "join table" to link schematics to their parts
CREATE TABLE schematic_parts (
    -- Foreign key to the schematic this entry belongs to.
    -- ON DELETE CASCADE means if a schematic is deleted, its part entries are also deleted.
    schematic_id UUID NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,

    -- Foreign key to the master part being used from our `parts` table.
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,

    -- The specific, user-facing slot name (e.g., 'Right Arm Unit', 'Left Arm Unit').
    slot_name TEXT NOT NULL,

    -- A schematic can only have one part per slot.
    PRIMARY KEY (schematic_id, slot_name)
);

-- 3. Create a normalized table for tunings
CREATE TABLE schematic_tunings (
    schematic_id UUID NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
    tuning_label TEXT NOT NULL,
    tuning_value INT NOT NULL,
    PRIMARY KEY (schematic_id, tuning_label)
);

-- 4. Add indexes for faster lookups, which is crucial for performance.
CREATE INDEX idx_parts_lookup ON parts(game_id, lookup_category);
CREATE INDEX idx_schematic_parts_schematic_id ON schematic_parts(schematic_id);
CREATE INDEX idx_schematic_parts_part_id ON schematic_parts(part_id);

-- ---
-- End of migration
-- ---
