'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const origin = (await headers()).get('origin');
  const redirectTo = `${origin}/auth/callback?next=/profile/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return redirect(`/reset-password?error=${error.message}`);
  }

  return redirect(
    '/reset-password?message=Password reset link has been sent to your email.'
  );
}
