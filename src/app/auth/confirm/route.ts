import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // const next = searchParams.get('next') ?? '/';
  const origin = request.nextUrl.origin;

  // create redirect link for failed verification
  const redirectUrl = new URL('/login', origin);
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
      return NextResponse.redirect(redirectUrl);
    }
  }

  // redirect the user to an error page with some instructions
  return NextResponse.redirect(redirectUrl);
}
