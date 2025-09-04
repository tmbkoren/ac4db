'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function loginWithDiscord() {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: 'identify',
    },
  });

  if (error) {
    console.error(error);
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function loginAnonymously() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/');
}

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Email not confirmed') {
      redirect(
        `/login?error=email_not_confirmed&email=${encodeURIComponent(email)}`
      );
    }
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/');
}

export async function resendVerificationEmail(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(
        error.message
      )}&email=${encodeURIComponent(email)}`
    );
  }

  redirect('/confirm-email');
}


