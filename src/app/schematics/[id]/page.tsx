import { Container, Flex, Text } from '@mantine/core';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import SchematicPartsDisplay from '@/components/SchematicPartsDisplay/SchematicPartsDisplay';
import SchematicTuningDisplay from '@/components/SchematicTuningDisplay/SchematicTuningDisplay';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import {
  SchematicParts,
  SchematicTuning,
  SchematicWithDetails, // Import the new type
} from '@/utils/types/global.types';
import SchematicHeader from '@/components/SchematicHeader/SchematicHeader';
import LinkBtn from '@/components/LinkBtn/LinkBtn';

async function SchematicDetails({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: schematic, error } = await supabase
    .from('schematics')
    .select(
      `
      *,
      schematic_parts (
        slot_name,
        parts (
          name
        )
      ),
      schematic_tunings (
        tuning_label,
        tuning_value
      )
    `
    )
    .eq('id', id)
    .single<SchematicWithDetails>(); // Apply the type to the query result

  if (error || !schematic) {
    console.error('Error fetching schematic:', error);
    notFound();
  }

  // 'p' is now correctly typed
  const partsForDisplay: SchematicParts = schematic.schematic_parts
    .filter((p) => p.parts !== null) // Safely filter out null parts
    .map((p) => ({
      category: p.slot_name,
      part_name: p.parts!.name, // Use non-null assertion '!' after filtering
      part_id: '',
    }));

  const tuningForDisplay: SchematicTuning = schematic.schematic_tunings.reduce(
    (acc, tuning) => {
      // Assert that the label from the DB is a valid key of our SchematicTuning type
      const key = tuning.tuning_label as keyof SchematicTuning;
      acc[key] = tuning.tuning_value;
      return acc;
    },
    {} as SchematicTuning
  );

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
        mb='md'
      >
        <SchematicPartsDisplay parts={partsForDisplay} />
        <SchematicTuningDisplay tuning={tuningForDisplay} />
      </Flex>

      <LinkBtn href={`/api/schematics/${id}/download`}>Download schematic</LinkBtn>
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
