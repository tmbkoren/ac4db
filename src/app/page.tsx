import { Suspense } from 'react';
import SchematicGrid from '@/components/SchematicGrid';
import { createClient } from '@/utils/supabase/server';
import { AppShell } from '@mantine/core';
import LoadingSpinner from '@/components/LoadingSpinner';

// This new component contains the actual data fetching logic
async function SchematicsList() {
  const supabase = await createClient();
  const { data: schematics, error } = await supabase
    .from('schematics')
    .select('*');

  if (error) {
    // Throwing an error will be caught by the Error Boundary
    throw new Error(`Failed to fetch schematics: ${error.message}`);
  }

  return <SchematicGrid schematics={schematics} />;
}

export default function Home() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSpinner />}>
        <SchematicsList />
      </Suspense>
    </AppShell>
  );
}
