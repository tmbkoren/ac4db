import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const {data: usernameData, error: usernameError} = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .single();

  if (usernameError || !usernameData?.username) {
    redirect('/complete-profile');
  }

  const { data: schematics, error } = await supabase
    .from('schematics')
    .select()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching schematics:', error);
    // Handle error appropriately
  }

  return <ProfileClient user={user} username={usernameData.username} schematics={schematics || []} />;
}
