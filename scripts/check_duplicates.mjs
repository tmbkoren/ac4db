import fs from 'fs';
import path from 'path';

/**
 * This script checks for duplicate part names in the part_mapping.json file.
 * It identifies names that are used for multiple parts, either within the same
 * category or across different categories, and prints a report.
 */

// 1. Load the JSON file, similar to populate_parts.mjs
const jsonPath = path.join(process.cwd(), 'src', 'utils', 'lib', 'part_mapping.json');
let partData;

try {
  partData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
} catch (error) {
  console.error(`Error reading or parsing ${jsonPath}:`, error);
  process.exit(1);
}

console.log('Checking for duplicate part names in part_mapping.json...');

// 2. Build a map to track where each part name appears.
// The key is the part name, and the value is an array of its locations.
const nameTracker = {};

for (const category in partData) {
  for (const gameId in partData[category]) {
    const partName = partData[category][gameId];

    // Initialize the array if this is the first time we see this name
    if (!nameTracker[partName]) {
      nameTracker[partName] = [];
    }

    // Record the location (category and ID) of this instance of the name
    nameTracker[partName].push({ category, id: gameId });
  }
}

// 3. Filter the tracker to find names that appear more than once and report them.
let duplicateCount = 0;
console.log('\n--- Duplicate Report ---');

for (const partName in nameTracker) {
  const instances = nameTracker[partName];
  if (instances.length > 1) {
    duplicateCount++;
    console.log(`\nFound duplicate name: "${partName}" (${instances.length} times)`);
    instances.forEach((instance) => {
      console.log(`  - In Category: '${instance.category}', with ID: '${instance.id}'`);
    });
  }
}

if (duplicateCount === 0) {
  console.log('\nNo duplicate part names found. All names are unique.');
} else {
  console.log(`\n\nFound a total of ${duplicateCount} unique names that are duplicated.`);
}

console.log('--- End of Report ---\n');