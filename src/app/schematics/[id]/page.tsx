import { Container } from "@mantine/core";
import { createClient } from '@/utils/supabase/server';
import SchematicPartsDisplay from "@/components/SchematicPartsDisplay";
import SchematicTuningDisplay from "@/components/SchematicTuningDisplay";


export default async function SchematicPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;
    const { data: schematics, error } = await supabase.from('schematics').select('*').eq('id', id);

    if (error) {
        //console.error('Error fetching schematic:', error);
        return <Container>Error fetching schematic</Container>;
    }

    if (!schematics || schematics.length === 0) {
        return <Container>Schematic not found</Container>;
    }

    const schematic = schematics[0];
    console.log('Parts: ', schematic);

    return (
        <Container>
            <h1>{schematic.design_name}</h1>
            <p>{schematic.designer_name}</p>
            <SchematicPartsDisplay parts={schematic.parts || []} />
            <SchematicTuningDisplay tuning={schematic.tunings || {}} />
            <a href={schematic.file_path} target="_blank" rel="noopener noreferrer">
                Download Schematic
            </a>
        </Container>
    );
}

