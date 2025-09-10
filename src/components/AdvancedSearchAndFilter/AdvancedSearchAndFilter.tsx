'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import {
  TextInput,
  Select,
  Flex,
  Paper,
  Title,
  Checkbox,
  Group,
  Stack,
  Tabs,
  MultiSelect,
  Accordion,
  Radio,
} from '@mantine/core';
import partData from '@/utils/lib/part_mapping.json';

// --- UI Data ---
const legTypeSubcategories = [
  'Lightweight Bipedal',
  'Mediumweight Bipedal',
  'Heavyweight Bipedal',
  'Reverse Joint',
  'Quad',
  'Tank',
];

// Create a flat list of all parts for the searchable MultiSelect.
const allPartsList = Object.entries(partData)
  .flatMap(([category, parts]) =>
    Object.values(parts as Record<string, string>).map((partName) => ({
      value: `${category}-${partName}`,
      label: partName,
    }))
  )
  .filter((part) => part.label !== 'None');
// --- End UI Data ---

export default function AdvancedSearchAndFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Get current values from URL params to control the inputs
  const currentSearch = searchParams.get('q') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';
  const currentLegs = searchParams.get('legs')?.split(',') ?? [];
  const currentParts = searchParams.get('parts')?.split(',') ?? [];

  // --- Handlers to update URL search params ---

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSortChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleLegsChange = (legs: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (legs.length > 0) {
      params.set('legs', legs.join(','));
    } else {
      params.delete('legs');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  // --- Part Filter Handlers ---

  // Helper to update the 'parts' search param in the URL
  function updatePartsInUrl(parts: string[]) {
    const params = new URLSearchParams(searchParams);
    if (parts.length > 0) {
      params.set('parts', parts.join(','));
    } else {
      params.delete('parts');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  // Handles changes from the MultiSelect, enforcing one part per category.
  const handlePartsChange = (newParts: string[]) => {
    // If a part was added, find it and replace any existing part from the same category.
    if (newParts.length > currentParts.length) {
      const addedPart = newParts.find((p) => !currentParts.includes(p));
      if (!addedPart) {
        updatePartsInUrl(newParts); // Should not happen, but as a fallback
        return;
      }
      const category = addedPart.split('-')[0];
      const otherParts = currentParts.filter((p) => !p.startsWith(`${category}-`));
      const finalParts = [...otherParts, addedPart];
      updatePartsInUrl(finalParts);
    } else {
      // A part was removed or cleared, the new list is valid.
      updatePartsInUrl(newParts);
    }
  };

  // Handles changes from the Radio groups in the part browser.
  const handleRadioPartChange = (newPart: string | null) => {
    if (!newPart) return;
    const category = newPart.split('-')[0];
    const otherParts = currentParts.filter((p) => !p.startsWith(`${category}-`));
    const finalParts = [...otherParts, newPart];
    updatePartsInUrl(finalParts);
  };

  return (
    <Paper withBorder shadow="sm" p="md" mb="xl">
      <Stack gap="xl">
        {/* --- Top Bar: Text Search and Sorting --- */}
        <Flex
          gap="md"
          justify="space-between"
          align="center"
          direction={{ base: 'column', sm: 'row' }}
        >
          <TextInput
            placeholder="Search by name, author, or part subcategory (e.g. Rifle; Sniper; Missiles etc.)"
            style={{ flex: 1, width: '100%' }}
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            placeholder="Sort by"
            data={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'name_asc', label: 'Name (A-Z)' },
              { value: 'name_desc', label: 'Name (Z-A)' },
            ]}
            value={currentSort}
            onChange={handleSortChange}
          />
        </Flex>

        {/* --- Advanced Filter Section (Collapsible) --- */}
        <Accordion>
          <Accordion.Item value="advanced-filters">
            <Accordion.Control>Advanced Filters</Accordion.Control>
            <Accordion.Panel>
              <Flex gap="lg" direction={{ base: 'column', md: 'row' }} mt="sm">
                {/* Leg Type Filter */}
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Title order={5}>Leg Type</Title>
                  <Paper withBorder p="sm" radius="md">
                    <Checkbox.Group
                      value={currentLegs}
                      onChange={handleLegsChange}
                    >
                      <Group mt="xs">
                        <Stack gap="xs">
                          {legTypeSubcategories.map((leg) => (
                            <Checkbox key={leg} value={leg} label={leg} />
                          ))}
                        </Stack>
                      </Group>
                    </Checkbox.Group>
                  </Paper>
                </Stack>

                {/* Must Include Parts Filter */}
                <Stack gap="xs" style={{ flex: 2 }}>
                  <Title order={5}>Must Include Parts</Title>
                  <MultiSelect
                    placeholder="Type or use the browser below to add parts..."
                    data={allPartsList}
                    value={currentParts}
                    onChange={handlePartsChange}
                    searchable
                    clearable
                  />

                  <Accordion chevronPosition="left" variant="transparent">
                    <Accordion.Item value="part-browser">
                      <Accordion.Control>
                        <Title order={6}>Part Browser</Title>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Paper
                          withBorder
                          radius="md"
                          style={{ maxHeight: 300, overflowY: 'auto' }}
                        >
                          <Tabs orientation="vertical" defaultValue="Head">
                            <Tabs.List>
                              {Object.keys(partData).map((category) => (
                                <Tabs.Tab key={category} value={category}>
                                  {category}
                                </Tabs.Tab>
                              ))}
                            </Tabs.List>

                            {Object.entries(partData).map(
                              ([category, parts]) => (
                                <Tabs.Panel
                                  key={category}
                                  value={category}
                                  pt="xs"
                                  pl="xs"
                                >
                                  <Radio.Group
                                    value={
                                      currentParts.find((p) =>
                                        p.startsWith(`${category}-`)
                                      ) || null
                                    }
                                    onChange={handleRadioPartChange}
                                  >
                                    <Stack gap="xs">
                                      {Object.values(
                                        parts as Record<string, string>
                                      ).map((partName) => {
                                        if (partName === 'None') return null;
                                        const uniqueValue = `${category}-${partName}`;
                                        return (
                                          <Radio
                                            key={uniqueValue}
                                            value={uniqueValue}
                                            label={partName}
                                          />
                                        );
                                      })}
                                    </Stack>
                                  </Radio.Group>
                                </Tabs.Panel>
                              )
                            )}
                          </Tabs>
                        </Paper>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Stack>
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Paper>
  );
}
