import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import SchematicGrid from '@/components/SchematicGrid/SchematicGrid';
import { AppShell, Box, Text } from '@mantine/core';

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient();
  const userId = (await params).id;
  console.log('Fetching profile for user ID:', userId);


    const {data: profile, error: profileError} = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      notFound();
    }

  // Fetch profile data and user's schematics in parallel
  const { data: schematics, error: schematicsError } = await supabase
    .from('schematics')
    .select()
    .eq('user_id', userId);

  if (schematicsError) {
    notFound();
    console.error('Error fetching schematics:', schematicsError);
    // Handle error appropriately
  }



  return (
    <AppShell>
      <Box p='md'>
        <Text
          c='dimmed'
          mb='xl'
        >
          Viewing all schematics uploaded by {profile.username}.
        </Text>

        {schematics && schematics.length > 0 ? (
          <SchematicGrid schematics={schematics} />
        ) : (
          <Text>This user has not uploaded any schematics yet.</Text>
        )}
      </Box>
    </AppShell>
  );
}
