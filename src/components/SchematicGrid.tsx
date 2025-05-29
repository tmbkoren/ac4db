'use client';

import { Stack } from '@mantine/core';
import SchematicCard from './SchematicCard';

type SchematicGridProps = {
  schematics: Array<{
    id: string;
    design_name: string;
    designer_name: string;
    image_url: string | null;
    created_at: string; // formatted or ISO string
  }>;
};

const SchematicGrid = ({ schematics }: SchematicGridProps) => {
  return (
    <Stack gap={1}>
      {schematics.map((schematic) => (
        <SchematicCard
          key={schematic.id}
          schematicId={schematic.id}
          schematicName={schematic.design_name}
          authorName={schematic.designer_name}
          imageUrl={schematic.image_url}
          createdAt={schematic.created_at}
        />
      ))}
    </Stack>
  );
};

export default SchematicGrid;
