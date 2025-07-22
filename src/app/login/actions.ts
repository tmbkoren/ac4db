'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function loginWithDiscord() {
  const supabase = await createClient();
  let callbackUrl = 'http://localhost:3000';

  if (process.env.NODE_ENV === 'production') {
    callbackUrl = 'https://ac4db.vercel.app/';
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${callbackUrl}/auth/callback`,
      scopes: 'identify'
    },
  });

  console.log('auth data: ', data)

  if (error) {
    console.error(error);
    redirect('/error');
  }

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error(error);
    redirect('/error');
  }

  redirect('/');
}


