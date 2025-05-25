import Image from 'next/image';
import Link from 'next/link';

interface SchematicCardProps {
  schematicId: string;
  schematicName: string;
  authorName: string;
  gameName: string;
  imageUrl: string | null;
}

const SchematicCard = ({ schematicId, schematicName, authorName, gameName, imageUrl }: SchematicCardProps) => {
  return (
    <Link href={`/schematics/${schematicId}`}>
      <h2>{schematicName}</h2>
      <p>Author: {authorName}</p>
      <p>Game: {gameName}</p>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={`${schematicName} schematic`}
          width={200}
          height={200}
        />
      )}
    </Link>
  );
};

export default SchematicCard;
