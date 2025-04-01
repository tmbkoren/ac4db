import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  //console.log(data, error);
  return <div>{data.user?.email}</div>;
}
