'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { TextInput, Select, Flex } from '@mantine/core';

export default function SearchAndFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSort = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Flex
      mb="md"
      gap="md"
      justify="space-between"
      align="center"
      direction={{ base: 'column', sm: 'row' }}
    >
      <TextInput
        placeholder="Search by schematic or author name..."
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ flex: 1, width: '100%' }}
      />
      <Select
        placeholder="Sort by"
        value={searchParams.get('sort')?.toString() ?? 'newest'}
        onChange={handleSort}
        data={[
          { value: 'newest', label: 'Newest First' },
          { value: 'oldest', label: 'Oldest First' },
        ]}
        style={{ minWidth: '180px' }}
      />
    </Flex>
  );
}
