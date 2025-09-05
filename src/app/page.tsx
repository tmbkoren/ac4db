import { Suspense } from 'react';
import SchematicGrid from '@/components/SchematicGrid';
import { createClient } from '@/utils/supabase/server';
import { AppShell, Box } from '@mantine/core';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchAndFilter from '@/components/SearchAndFilter';

type HomePageProps = {
  searchParams?: {
    q?: string;
    sort?: string;
  };
};

// This new component contains the actual data fetching logic
async function SchematicsList({ query, sortBy }: { query?: string; sortBy?: string }) {
  const supabase = await createClient();

  // Start building the query
  let queryBuilder = supabase
    .from('schematics')
    .select('id, design_name, designer_name, image_url, created_at');

  // Apply search filter if a query is provided
  if (query) {
    // Use 'or' to search in both design_name and designer_name
    queryBuilder = queryBuilder.or(
      `design_name.ilike.%${query}%,designer_name.ilike.%${query}%`
    );
  }

  // Apply sorting
  const isAscending = sortBy === 'oldest';
  queryBuilder = queryBuilder.order('created_at', { ascending: isAscending });

  const { data: schematics, error } = await queryBuilder;

  if (error) {
    // Throwing an error will be caught by the Error Boundary
    throw new Error(`Failed to fetch schematics: ${error.message}`);
  }

  return <SchematicGrid schematics={schematics} />;
}

export default function Home({ searchParams }: HomePageProps) {
  const query = searchParams?.q;
  const sortBy = searchParams?.sort;

  return (
    <AppShell>
      <Box p="md">
        <SearchAndFilter />
        <Suspense key={query + sortBy} fallback={<LoadingSpinner />}>
          <SchematicsList query={query} sortBy={sortBy} />
        </Suspense>
      </Box>
    </AppShell>
  );
}
