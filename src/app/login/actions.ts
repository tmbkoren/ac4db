'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function loginWithDiscord() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  });

  console.log(data, error);

  if (error) {
    redirect('/error');
  }

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
}
