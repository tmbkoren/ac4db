
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Container, Stack } from '@mantine/core';
import { sendSchematic } from '@/app/test/actions';

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
      <h1>Private Page</h1>
      <p>Welcome to the private page, you are authenticated!</p>
      <p>User ID: {data.user.id}</p>
      <p>Email: {data.user.email}</p>
      <form>
        <Stack
          style={{ marginTop: '1rem' }}
        >
          <input
            type='text'
            name='name'
            placeholder='Schematic Name'
          />
          <input
            type='text'
            name='author'
            placeholder='Schematic Author'
          />
          <input
            type='file'
            name='image'
            accept='image/*'
          />
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