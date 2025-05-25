import { Container } from '@mantine/core';
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
  gameName,
  imageUrl,
}: SchematicCardProps) => {
  return (
    <Container
      style={{
        border: '1px solid #ccc',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    >
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
    </Container>
  );
};

export default SchematicCard;
