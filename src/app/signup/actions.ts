'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signup(formData: FormData) {

  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Supabase returns a user with an empty identities array if the user already exists
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    redirect(
      `/signup?error=${encodeURIComponent(
        'User with this email already exists. Please log in.'
      )}`
    );
  }

  // Redirect to a page that tells the user to check their email for verification
  redirect('/confirm-email');
}
