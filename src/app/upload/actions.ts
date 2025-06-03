'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { randomUUID } from 'crypto';
import partMap from '@/utils/lib/part_mapping.json';
import { parseAc4aFile } from '@/utils/lib/parseAc4a';

export async function sendSchematic(formData: FormData) {
  const supabase = await createClient();
  const imageFile = formData.get('image') as File;
  const schematicFile = formData.get('schematic') as File;
  const description = formData.get('description') as string;

  if (!schematicFile) {
    throw new Error('No file provided');
  }

  const parsedSchematic = parseAc4aFile(
    Buffer.from(await schematicFile.arrayBuffer()),
    partMap
  );

  const id = randomUUID();
  const schematicPath = `${id}.ac4a`;
  const imagePath = imageFile
    ? `${id}.${imageFile.name.split('.').pop()}`
    : null;

  const { error: schematicUploadError } = await supabase.storage
    .from('schematics')
    .upload(schematicPath, Buffer.from(await schematicFile.arrayBuffer()), {
      contentType: 'application/octet-stream',
    });

  if (schematicUploadError) {
    throw new Error('Failed to upload schematic file');
  }

  const schematicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/schematics/${schematicPath}`;

  let imageUrl: string | null = null;
  if (imageFile && imagePath) {
    const { error: imageUploadError } = await supabase.storage
      .from('images')
      .upload(imagePath, Buffer.from(await imageFile.arrayBuffer()), {
        contentType: imageFile.type,
      });

    if (imageUploadError) {
      throw new Error('Failed to upload image');
    }

    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${imagePath}`;
  }
  const { data, error } = await supabase.auth.getUser();
  const user_id = data?.user?.id || null;

  if (error || !user_id) {
    throw new Error('User not authenticated');
  }

  const res = await supabase.from('schematics').insert({
    design_name: parsedSchematic.name,
    designer_name: parsedSchematic.designer,
    game: 'ACFA',
    user_id: user_id,
    file_path: schematicUrl,
    image_url: imageUrl || null,
    parts: parsedSchematic.parts,
    tunings: parsedSchematic.tuning,
    description: description || null,
  });

  console.log('Insert result:', res);

  if (res.error) {
    throw new Error('Failed to insert schematic metadata');
  }

  redirect(`/`);
}
