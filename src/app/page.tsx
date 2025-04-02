import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  let profile = null;
  if (!error) {
    const { data: prof, error: profError } = await supabase
      .from('profiles')
      .select()
      .eq('user_id', data?.user?.id)
      .single();
    if (!profError) {
      profile = prof;
    }
  }

  //console.log(data, error);
  return <div>{profile?.discord_username}</div>;
}
