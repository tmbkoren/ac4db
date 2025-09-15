import { Suspense } from 'react';
import SchematicGrid from '@/components/SchematicGrid/SchematicGrid';
import { createClient } from '@/utils/supabase/server';
import { AppShell, Box } from '@mantine/core';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Pagination from '@/components/Pagination/Pagination';
import AdvancedSearchAndFilter from '@/components/AdvancedSearchAndFilter/AdvancedSearchAndFilter';
import { SupabaseClient } from '@supabase/supabase-js';

const ITEMS_PER_PAGE = 10;

type SearchParams = {
  q?: string;
  sort?: string;
  page?: string;
  legs?: string;
  parts?: string;
  reg_family?: string;
  reg_name?: string;
  usage?: string;
};

// Helper to get part IDs from part strings (e.g., "Head-HD-012 FATIMA")
async function getPartIds(
  supabase: SupabaseClient,
  partParams?: string
): Promise<string[] | null> {
  if (!partParams) return null;

  const partStrings = partParams.split(',');
  if (partStrings.length === 0) return null;

  // Efficiently parse part strings and build a filter for the query
  const partFilters = partStrings
    .map((partString) => {
      const firstDashIndex = partString.indexOf('-');
      if (firstDashIndex === -1) return null; // Invalid format

      const category = partString.substring(0, firstDashIndex);
      const name = partString.substring(firstDashIndex + 1);
      console.log('Category: %s, Name: %s', category, name);

      // Each part is an 'and' condition, checking both category and name
      return `and(lookup_category.eq.${category},name.eq.${name})`;
    })
    .filter((f): f is string => !!f);

  if (partFilters.length === 0) return null;

  // Combine all the 'and' conditions with 'or'
  const filterString = partFilters.join(',');

  const { data: parts, error } = await supabase
    .from('parts')
    .select('id')
    .or(filterString);

  if (error || !parts) {
    console.error('Error fetching part IDs:', error);
    return null;
  }

  const partIds = parts.map((p) => p.id);

  return partIds.length > 0 ? partIds : null;
}

async function SchematicsList({
  query,
  sortBy,
  currentPage,
  legTypes,
  partIds,
  regulationFamily,
  regulationName,
  usageTypes,
}: {
  query?: string;
  sortBy?: string;
  currentPage: number;
  legTypes?: string[];
  partIds?: string[] | null;
  regulationFamily?: string;
  regulationName?: string;
  usageTypes?: string[];
}) {
  const supabase = await createClient();

  const searchTokens = query ? query.trim().split(/\s+/) : null;

  let sort_by = 'created_at';
  let sort_direction = 'DESC';

  if (sortBy === 'oldest') {
    sort_by = 'created_at';
    sort_direction = 'ASC';
  } else if (sortBy === 'name_asc') {
    sort_by = 'name';
    sort_direction = 'ASC';
  } else if (sortBy === 'name_desc') {
    sort_by = 'name';
    sort_direction = 'DESC';
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data: schematics, error } = await supabase.rpc('search_schematics', {
    p_search_tokens: searchTokens || undefined,
    p_leg_types: legTypes,
    p_required_part_ids: partIds || undefined,
    p_regulation_family: regulationFamily || undefined,
    p_regulation_name: regulationName || undefined,
    p_usage_types: usageTypes || undefined,
    p_sort_by: sort_by,
    p_sort_direction: sort_direction,
    p_limit: ITEMS_PER_PAGE,
    p_offset: from,
  });

  if (error) {
    throw new Error(`Failed to fetch schematics: ${error.message}`);
  }

  return <SchematicGrid schematics={schematics} />;
}

async function PaginationData({
  query,
  legTypes,
  partIds,
  regulationFamily,
  regulationName,
  usageTypes,
}: {
  query?: string;
  legTypes?: string[];
  partIds?: string[] | null;
  regulationFamily?: string;
  regulationName?: string;
  usageTypes?: string[];
}) {
  const supabase = await createClient();

  const searchTokens = query ? query.trim().split(/\s+/) : null;

  // We just need the count, so we can limit to 1 row and get total_count from it.
  const { data, error } = await supabase.rpc('search_schematics', {
    p_search_tokens: searchTokens || undefined,
    p_leg_types: legTypes,
    p_required_part_ids: partIds || undefined,
    p_regulation_family: regulationFamily || undefined,
    p_regulation_name: regulationName || undefined,
    p_usage_types: usageTypes || undefined,
    p_limit: 1,
    p_offset: 0,
  });

  if (error) {
    throw new Error(`Failed to count schematics: ${error.message}`);
  }

  const count = data?.[0]?.total_count ?? 0;
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return <Pagination totalPages={totalPages} />;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = (await searchParams) as SearchParams;
  const query = sParams.q || '';
  const sortBy = sParams.sort;
  const page = Number(sParams.page) || 1;
  const legTypes = sParams.legs?.split(',');
  const partParams = sParams.parts;
  const regulationFamily = sParams.reg_family;
  const regulationName = sParams.reg_name;
  const usageTypes = sParams.usage?.split(',');

  const supabase = await createClient();
  const partIds = await getPartIds(supabase, partParams);

  return (
    <AppShell>
      <Box p="md">
        <AdvancedSearchAndFilter />
        <Suspense
          key={
            query +
            sortBy +
            page +
            (sParams.legs || '') +
            (sParams.parts || '') +
            (sParams.reg_family || '') +
            (sParams.reg_name || '') +
            (sParams.usage || '')
          }
          fallback={<LoadingSpinner />}
        >
          <SchematicsList
            query={query}
            sortBy={sortBy}
            currentPage={page}
            legTypes={legTypes}
            partIds={partIds}
            regulationFamily={regulationFamily}
            regulationName={regulationName}
            usageTypes={usageTypes}
          />
        </Suspense>
        <Suspense fallback={null}>
          <PaginationData
            query={query}
            legTypes={legTypes}
            partIds={partIds}
            regulationFamily={regulationFamily}
            regulationName={regulationName}
            usageTypes={usageTypes}
          />
        </Suspense>
      </Box>
    </AppShell>
  );
}
