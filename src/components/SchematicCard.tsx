import Image from 'next/image';

interface SchematicCardProps {
  schematicName: string;
  authorName: string;
  gameName: string;
  imageUrl: string | null;
}

const SchematicCard = ({ schematicName, authorName, gameName, imageUrl }: SchematicCardProps) => {
  return (
    <div>
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
    </div>
  );
};

export default SchematicCard;
