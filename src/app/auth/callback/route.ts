import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  console.log(searchParams, origin);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('CALLBACK: ', code, error);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';

      // checking if user already has a profile, if not, create one
      const { data: session, error: session_error } =
        await supabase.auth.getUser();
      if (session_error) {
        console.error(session_error);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      const userId = session.user.id; // Store user ID for clarity
      console.log('Authenticated User ID:', userId);
      const { data: profile, error: profile_error } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', userId);

      if (profile_error) {
        console.error('Profile error: ', profile_error);
        //return; // Handle error appropriately
      }
      console.error('Profile: ', profile);

      const discordData = session.user.identities?.find(
        (id) => id.provider === 'discord'
      );

      if (profile) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            discord_id: discordData?.id,
            discord_username: discordData?.identity_data?.full_name,
          })
          .eq('user_id', userId);
        if (updateError) {
          console.error('Error during update:', updateError);
        } else {
          console.log('Profile updated:', updatedProfile);
        }
      } else {
        // Profile does not exist, insert a new one

        const { data, error } = await supabase.from('profiles').insert({
          user_id: userId,
          discord_id: discordData?.id,
          discord_username: discordData?.identity_data?.full_name,
        });

        if (error) {
          console.error('Error during insert:', error);
        } else {
          console.log('Profile created:', data);
        }
      }
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
