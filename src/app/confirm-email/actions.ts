'use server';

import { type EmailOtpType } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function confirmEmail(formData: FormData) {
  const origin = (await headers()).get('origin');
  const token_hash = formData.get('token_hash') as string | null;
  const type = formData.get('type') as EmailOtpType | null;

  // create redirect link for failed verification
  const redirectUrl = new URL('/login', origin!);
  redirectUrl.searchParams.set('error', 'Email link is invalid or has expired');

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirectUrl.searchParams.set('message', 'Email confirmed successfully!');
      redirectUrl.searchParams.delete('error');
      redirect(redirectUrl.toString());
    }
  }

  // redirect the user to an error page with some instructions
  redirect(redirectUrl.toString());
}
