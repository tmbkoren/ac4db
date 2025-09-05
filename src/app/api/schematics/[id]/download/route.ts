import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const schematicId = params.id;

    if (!schematicId) {
      return new NextResponse(JSON.stringify({ error: 'Schematic ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // First, retrieve the file path from the schematics table
    const { data: schematicData, error: dbError } = await supabase
      .from('schematics')
      .select('file_path')
      .eq('id', schematicId)
      .single();

    if (dbError || !schematicData) {
      console.error('Database error:', dbError?.message);
      return new NextResponse(JSON.stringify({ error: 'Schematic not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fullUrl = schematicData.file_path;
    if (!fullUrl) {
      return new NextResponse(
        JSON.stringify({ error: 'File path not found for schematic.' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract the path from the full URL.
    // Example URL: https://<project>.supabase.co/storage/v1/object/public/schematics/some-uuid.ac4a
    // We need to extract "some-uuid.ac4a"
    const filePath = fullUrl.substring(fullUrl.lastIndexOf('/') + 1);

    // Now, download the file from storage using the correctly parsed path
    const { data, error: downloadError } = await supabase.storage
      .from('schematics')
      .download(filePath);

    if (downloadError) {
      console.error('Supabase download error:', downloadError.message);
      return new NextResponse(
        JSON.stringify({ error: 'File not found or access denied.' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!data) {
      return new NextResponse(JSON.stringify({ error: 'File data is empty.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${schematicId}.ac4a"`
    );
    headers.set('Content-Length', data.size.toString());

    return new Response(data, { headers });
  } catch (e) {
    const error = e as Error;
    console.error('Unexpected error in download route:', error.message);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
