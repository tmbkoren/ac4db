'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const username = formData.get('username') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/complete-profile?error=${encodeURIComponent('User not found.')}`);
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('user_id', user.id);

  if (error) {
    redirect(
      `/complete-profile?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
