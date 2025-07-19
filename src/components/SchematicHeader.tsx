'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Title, Text } from '@mantine/core';

type SchematicHeaderProps = {
  imageUrl: string | null;
  designName: string;
  designerName: string;
};

export default function SchematicHeader({
  imageUrl,
  designName,
  designerName,
}: SchematicHeaderProps) {
  const [showFallback, setShowFallback] = useState(!imageUrl);

  if (showFallback) {
    return (
      <>
        <Title order={1}>{designName}</Title>
        <Text>Designed by: {designerName}</Text>
      </>
    );
  }

  return (
    <Image
      src={imageUrl!}
      alt={designName}
      layout="responsive"
      width={800}
      height={450}
      style={{ border: '1px solid #ccc', marginTop: '1rem' }}
      onError={() => setShowFallback(true)}
    />
  );
}
