import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { signOut } from './actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SchematicGrid from '@/components/SchematicGrid';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: schematics, error } = await supabase
    .from('schematics')
    .select('id, design_name, designer_name, image_url, created_at')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching schematics:', error);
    // Handle error appropriately
  }

  return (
    <Stack>
      <Paper p='md' shadow='xs'>
        <Title order={2}>Profile</Title>
        <Text>Email: {user.email}</Text>
        <Text>Joined: {new Date(user.created_at).toLocaleDateString()}</Text>
        <form action={signOut}>
          <Button type='submit' mt='md'>
            Logout
          </Button>
        </form>
      </Paper>
      <SchematicGrid schematics={schematics || []} />
    </Stack>
  );
}
