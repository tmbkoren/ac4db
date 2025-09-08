import { Suspense } from 'react';
import SchematicGrid from '@/components/SchematicGrid/SchematicGrid';
import { createClient } from '@/utils/supabase/server';
import { AppShell, Box } from '@mantine/core';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import SearchAndFilter from '@/components/SearchAndFilter/SearchAndFilter';
import Pagination from '@/components/Pagination/Pagination';

const ITEMS_PER_PAGE = 10;

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

async function SchematicsList({
  query,
  sortBy,
  currentPage,
}: {
  query?: string;
  sortBy?: string;
  currentPage: number;
}) {
  const supabase = await createClient();

  // Start building the query for data fetching
  let queryBuilder = supabase
    .from('schematics')
    .select('id, design_name, designer_name, image_url, created_at');

  // Apply search filter if a query is provided
  if (query) {
    queryBuilder = queryBuilder.or(
      `design_name.ilike.%${query}%,designer_name.ilike.%${query}%`
    );
  }

  // Apply sorting
  const isAscending = sortBy === 'oldest';
  queryBuilder = queryBuilder.order('created_at', { ascending: isAscending });

  // Apply pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data: schematics, error } = await queryBuilder;

  if (error) {
    throw new Error(`Failed to fetch schematics: ${error.message}`);
  }

  return <SchematicGrid schematics={schematics} />;
}

async function PaginationData({ query }: { query?: string }) {
  const supabase = await createClient();

  // Build query to count the total number of matching schematics
  let countQueryBuilder = supabase
    .from('schematics')
    .select('*', { count: 'exact', head: true });

  if (query) {
    countQueryBuilder = countQueryBuilder.or(
      `design_name.ilike.%${query}%,designer_name.ilike.%${query}%`
    );
  }

  const { count, error } = await countQueryBuilder;

  if (error) {
    throw new Error(`Failed to count schematics: ${error.message}`);
  }

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return <Pagination totalPages={totalPages} />;
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const sortBy = searchParams?.sort;
  const page = Number(searchParams?.page) || 1;

  return (
    <AppShell>
      <Box p='md'>
        <SearchAndFilter />
        <Suspense
          key={query + sortBy + page}
          fallback={<LoadingSpinner />}
        >
          <SchematicsList
            query={query}
            sortBy={sortBy}
            currentPage={page}
          />
        </Suspense>
        <Suspense fallback={null}>
          <PaginationData query={query} />
        </Suspense>
      </Box>
    </AppShell>
  );
}
