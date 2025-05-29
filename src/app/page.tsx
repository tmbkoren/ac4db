import SchematicGrid from '@/components/SchematicGrid';
import { createClient } from '@/utils/supabase/server';
import { AppShell } from '@mantine/core';

export default async function Home() {
  const supabase = await createClient();
  const { data: schematics, error } = await supabase
    .from('schematics')
    .select('*');
  if (error) {
    console.error('Error fetching schematics:', error);
    return <p>Error loading schematics.</p>;
  }
  console.log(schematics);

  //console.log(data, error);
  return (
    <AppShell>
      <SchematicGrid schematics={schematics} />
    </AppShell>
  );
}
