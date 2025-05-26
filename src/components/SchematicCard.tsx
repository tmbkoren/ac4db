import { Card, Container, CardSection } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

interface SchematicCardProps {
  schematicId: string;
  schematicName: string;
  authorName: string;
  gameName: string;
  imageUrl: string | null;
}

const SchematicCard = ({
  schematicId,
  schematicName,
  authorName,
//  gameName,
  imageUrl,
}: SchematicCardProps) => {
  return (
    <Card
      shadow='sm'
      padding='lg'
      radius='md'
      withBorder
    >
      <CardSection>
        <Link href={`/schematics/${schematicId}`}>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={`${schematicName} schematic`}
              width={200}
              height={200}
            />
          )}
          <Container style={{ textAlign: 'center', cursor: 'pointer' }}>
            <h2>{schematicName}</h2>
            <p>Author: {authorName}</p>
          </Container>
        </Link>
      </CardSection>
    </Card>
  );
};

export default SchematicCard;
