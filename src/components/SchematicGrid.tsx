import { SimpleGrid } from '@mantine/core';
import SchematicCard from './SchematicCard';

type SchematicGridProps = {
    schematics: Array<{ id: string; [key: string]: any }>;
    columns?: number;
};

const SchematicGrid: React.FC<SchematicGridProps> = ({ schematics}) => {
    return (
        <SimpleGrid cols={2} spacing="md">
            {schematics.map((schematic) => (
                <SchematicCard
                    key={schematic.id}
                    schematicId={schematic.id}
                    schematicName={schematic.design_name}
                    authorName={schematic.designer_name}
                    gameName={schematic.game_name}
                    imageUrl={schematic.image_url || null} // Assuming image_url is the field for the image
                />
            ))}
        </SimpleGrid>
    );
};

export default SchematicGrid;