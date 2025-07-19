import { Container, Flex, Text } from '@mantine/core';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import SchematicPartsDisplay from '@/components/SchematicPartsDisplay';
import SchematicTuningDisplay from '@/components/SchematicTuningDisplay';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SchematicParts, SchematicTuning } from '@/utils/types/global.types';
import SchematicHeader from '@/components/SchematicHeader';

async function SchematicDetails({ id }: { id: string }) {
  const supabase = await createClient();
  const { data: schematic, error } = await supabase
    .from('schematics')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !schematic) {
    notFound();
  }

  const parts = schematic.parts as SchematicParts;
  const tuning = schematic.tunings as SchematicTuning;
  const description = schematic.description || 'No description available';

  return (
    <Container>
      <SchematicHeader
        imageUrl={schematic.image_url}
        designName={schematic.design_name}
        designerName={schematic.designer_name}
      />
      <Text
        size='lg'
        style={{ marginTop: '1rem' }}
      >
        {description}
      </Text>
      <Flex
        direction='column'
        gap='md'
        mt='md'
      >
        <SchematicPartsDisplay parts={parts} />
        <SchematicTuningDisplay tuning={tuning} />
      </Flex>

      <a
        href={schematic.file_path}
        target='_blank'
        rel='noopener noreferrer'
        style={{ display: 'block', marginTop: '1rem' }}
      >
        Download Schematic
      </a>
    </Container>
  );
}

export default async function SchematicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SchematicDetails id={id} />
    </Suspense>
  );
}
