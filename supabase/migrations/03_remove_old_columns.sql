-- Migration: 03_remove_old_columns
-- Description: Removes the old JSON columns `parts` and `tunings` from the `schematics` table.
--
-- !!! WARNING !!!
-- DO NOT RUN THIS SCRIPT until after you have successfully migrated all existing data
-- from the JSON columns into the new `schematic_parts` and `schematic_tunings` tables.
-- Running this script before migration will result in PERMANENT DATA LOSS.
-- !!! WARNING !!!

ALTER TABLE schematics DROP COLUMN parts;
ALTER TABLE schematics DROP COLUMN tunings;

-- ---
-- End of migration
-- ---
