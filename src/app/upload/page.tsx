
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Container, Stack } from '@mantine/core';
import { sendSchematic } from '@/app/upload/actions';

async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <Container
      size='md'
      style={{ marginTop: '2rem' }}
    >
      <form>
        <Stack
          style={{ marginTop: '1rem' }}
        >
          <label htmlFor='image'>Image (optional):</label>
          <input
            type='file'
            name='image'
            accept='image/*'
          />
          <label htmlFor='schematic'>Schematic File:</label>
          <input
            type='file'
            name='schematic'
            accept='.ac4a'
          />
          <button formAction={sendSchematic}>Upload</button>
        </Stack>
      </form>
    </Container>
  );
}

export default PrivatePage;