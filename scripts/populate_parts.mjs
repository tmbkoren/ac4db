// scripts/populate_parts.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'src', 'utils', 'lib', 'part_mapping.json');
const partMap = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
// ---

// --- IMPORTANT ---
// Replace these with your actual Supabase project details.
// You can find these in your Supabase project settings under "API".
// Use the `service_role` key for this script.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY';
// ---

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_SERVICE_KEY === 'YOUR_SUPABASE_SERVICE_KEY') {
  console.error('Error: Please fill in your Supabase URL and Service Key in the script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function populateParts() {
  console.log('Starting to populate the `parts` table...');

  const partsToInsert = [];

  for (const category in partMap) {
    for (const partId in partMap[category]) {
      partsToInsert.push({
        lookup_category: category, // e.g., "Arm Unit"
        game_id: partId,         // e.g., "0091"
        name: partMap[category][partId], // e.g., "GAN02-NSS-WR"
        game: 'ACFA',
      });
    }
  }

  console.log(`Prepared ${partsToInsert.length} parts for insertion.`);

  // Upsert ensures that if you run the script again, it won't create duplicates.
  // It will update existing records if they match on the conflict target.
  const { data, error } = await supabase.from('parts').upsert(partsToInsert, {
    onConflict: 'game_id,lookup_category,game',
    ignoreDuplicates: false,
  });

  if (error) {
    console.error('Error populating parts table:', error);
  } else {
    console.log('Successfully populated the `parts` table!');
  }
}

populateParts();

