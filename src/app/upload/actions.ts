'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { randomUUID } from 'crypto';
import partMap from '@/utils/lib/part_mapping.json';
import { parseAc4aFile } from '@/utils/lib/parseAc4a';

export async function sendSchematic(formData: FormData) {
  const supabase = await createClient();

  // --- Extract form data ---
  const imageFile = formData.get('image') as File | null;
  const schematicFile = formData.get('schematic') as File | null;
  const description = formData.get('description') as string | null;
  const regulationId = formData.get('regulation_id') as string | null;
  const usageType = formData.getAll('usage_type') as string[];

  // --- Validation ---
  if (!schematicFile) {
    throw new Error('No schematic file provided.');
  }
  if (!regulationId) {
    throw new Error('Regulation must be selected.');
  }
  if (usageType.length === 0) {
    throw new Error('At least one usage type must be selected.');
  }

  // --- Parse Schematic File ---
  const parsedSchematic = parseAc4aFile(
    Buffer.from(await schematicFile.arrayBuffer()),
    partMap
  );

  // --- Generate IDs and Paths ---
  const id = randomUUID();
  const schematicPath = `${id}.ac4a`;
  const imagePath = imageFile
    ? `${id}.${imageFile.name.split('.').pop()}`
    : null;

  // --- Upload Schematic File ---
  const { error: schematicUploadError } = await supabase.storage
    .from('schematics')
    .upload(schematicPath, Buffer.from(await schematicFile.arrayBuffer()), {
      contentType: 'application/octet-stream',
    });

  if (schematicUploadError) {
    throw new Error('Failed to upload schematic file');
  }
  const schematicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/schematics/${schematicPath}`;

  // --- Upload Image File (if provided) ---
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

  // --- Get User ID ---
  const { data, error } = await supabase.auth.getUser();
  const user_id = data?.user?.id;

  if (error || !user_id) {
    throw new Error('User not authenticated');
  }

  // --- Prepare Payload for RPC ---
  function getLookupCategory(slotName: string): string {
    if (slotName.includes('Arm Unit')) return 'Arm Unit';
    if (slotName.includes('Back Unit')) return 'Back Unit';
    return slotName;
  }

  const partsPayload = parsedSchematic.parts.map((part) => ({
    slot_name: part.slot_name,
    game_id: part.part_id,
    lookup_category: getLookupCategory(part.slot_name),
  }));

  // --- Call RPC Function ---
  const { error: rpcError } = await supabase.rpc(
    'create_schematic_with_details',
    {
      p_design_name: parsedSchematic.name,
      p_designer_name: parsedSchematic.designer,
      p_user_id: user_id,
      p_file_path: schematicUrl,
      p_regulation_id: regulationId,
      p_usage_type: usageType,
      p_image_url: imageUrl || undefined,
      p_description: description || undefined,
      p_parts: partsPayload,
      p_tunings: parsedSchematic.tuning,
    }
  );

  if (rpcError) {
    console.error('Error inserting schematic via RPC:', rpcError);
    throw new Error('Failed to insert schematic metadata');
  }

  redirect(`/`);
}
