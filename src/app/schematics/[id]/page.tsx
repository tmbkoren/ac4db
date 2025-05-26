import { Container } from "@mantine/core";
import { createClient } from '@/utils/supabase/server';
import SchematicPartsDisplay from "@/components/SchematicPartsDisplay";
import SchematicTuningDisplay from "@/components/SchematicTuningDisplay";
import Image from "next/image";
import { SchematicParts, SchematicTuning } from "@/utils/types/global.types";


export default async function SchematicPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;
    const { data, error } = await supabase.from('schematics').select('*').eq('id', id);

    if (error) {
        //console.error('Error fetching schematic:', error);
        return <Container>Error fetching schematic</Container>;
    }

    if (!data || data.length === 0) {
        return <Container>Schematic not found</Container>;
    }

    const schematic = data[0];
    const parts = schematic.parts as SchematicParts;
    const tuning = schematic.tunings as SchematicTuning;
    console.log('Parts: ', schematic);

    return (
        <Container>
            <h1>{schematic.design_name}</h1>
            <p>{schematic.designer_name}</p>
            <SchematicPartsDisplay parts={parts} />
            <SchematicTuningDisplay tuning={tuning} />
            <Image
              src={schematic.image_url || ''}
              alt={schematic.design_name}
              layout='responsive'
              width={800}
              height={450}
              style={{ border: '1px solid #ccc', marginTop: '1rem' }}
            />
            <a href={schematic.file_path} target="_blank" rel="noopener noreferrer">
                Download Schematic
            </a>
        </Container>
    );
}

