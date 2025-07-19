// scripts/migrate_schematics.mjs
import { createClient } from '@supabase/supabase-js';
// --- IMPORTANT ---
// Replace these with your actual Supabase project details.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY';
// ---

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_SERVICE_KEY === 'YOUR_SUPABASE_SERVICE_KEY') {
  console.error('Error: Please fill in your Supabase URL and Service Key in the script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper to convert a specific slot name like 'Right Arm Unit' back to its fundamental lookup category 'Arm Unit'.
function getLookupCategory(slotName) {
  if (slotName.includes('Arm Unit')) return 'Arm Unit';
  if (slotName.includes('Back Unit')) return 'Back Unit';
  return slotName; // For all others (Head, Core, etc.), the names match.
}

async function migrateSchematicData() {
  console.log('Starting schematic data migration...');

  // 1. Get all master parts from the DB to use as a local map for faster lookups.
  console.log('Fetching master parts list...');
  const { data: allParts, error: partsError } = await supabase.from('parts').select('*');
  if (partsError) {
    console.error('Error fetching master parts list:', partsError);
    return;
  }
  console.log(`Found ${allParts.length} master parts.`);

  // 2. Get all existing schematics with their old JSON data.
  // IMPORTANT: This assumes the old columns are still named `parts` and `tunings`.
  console.log('Fetching existing schematics with old JSON data...');
  const { data: schematics, error: schematicsError } = await supabase
    .from('schematics')
    .select('id, parts, tunings');
  if (schematicsError) {
    console.error('Error fetching schematics:', schematicsError);
    return;
  }
  console.log(`Found ${schematics.length} schematics to migrate.`);

  let migratedCount = 0;
  for (const schematic of schematics) {
    // Skip if the old columns are null or empty, which might happen if migration was partially run before.
    if (!schematic.parts && !schematic.tunings) {
      continue;
    }

    const newSchematicParts = [];
    const newSchematicTunings = [];

    // --- Migrate Parts ---
    if (schematic.parts && Array.isArray(schematic.parts)) {
      for (const part of schematic.parts) {
        // Use the correct field name 'category' from the old JSON structure.
        const slotName = part.category;
        const lookupCategory = getLookupCategory(slotName);
        
        const masterPart = allParts.find(
          (p) => p.game_id === part.part_id && p.lookup_category === lookupCategory
        );

        if (masterPart) {
          newSchematicParts.push({
            schematic_id: schematic.id,
            part_id: masterPart.id,
            // The value from the old 'category' field is the new 'slot_name'.
            slot_name: slotName,
          });
        } else {
          console.warn(`  - Warning: Could not find master part for game_id=${part.part_id}, category=${lookupCategory}`);
        }
      }
    }

    // --- Migrate Tunings ---
    if (schematic.tunings && typeof schematic.tunings === 'object') {
      for (const label in schematic.tunings) {
        newSchematicTunings.push({
          schematic_id: schematic.id,
          tuning_label: label,
          tuning_value: schematic.tunings[label],
        });
      }
    }

    // --- Insert the new relational data ---
    if (newSchematicParts.length > 0) {
      const { error: insertPartsError } = await supabase.from('schematic_parts').insert(newSchematicParts);
      if (insertPartsError) {
        console.error(`Error inserting parts for schematic ${schematic.id}:`, insertPartsError.message);
        // Stop on first error to allow for investigation.
        return;
      }
    }

    if (newSchematicTunings.length > 0) {
      const { error: insertTuningsError } = await supabase.from('schematic_tunings').insert(newSchematicTunings);
      if (insertTuningsError) {
        console.error(`Error inserting tunings for schematic ${schematic.id}:`, insertTuningsError.message);
        // Stop on first error.
        return;
      }
    }
    migratedCount++;
    console.log(`  - Successfully migrated schematic ${migratedCount}/${schematics.length} (ID: ${schematic.id})`);
  }

  console.log('---');
  console.log('Migration complete!');
  console.log('---');
}

migrateSchematicData();
