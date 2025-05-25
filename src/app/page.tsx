import SchematicCard from '@/components/SchematicCard';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: schematics, error } = await supabase.from('schematics').select('*');
  if (error) {
    console.error('Error fetching schematics:', error);
    return <p>Error loading schematics.</p>;
  }
  console.log(schematics);

  //console.log(data, error);
  return (
    <>
      <h2>Your Schematics</h2>
      <ul>
        {schematics?.map((s) => (
          <SchematicCard
            key={s.id}
            schematicName={s.design_name}
            authorName={s.designer_name}
            gameName={s.game || 'ACFA'}
            imageUrl={s.image_url}
          />
        ))}
      </ul>
    </>
  );
}
