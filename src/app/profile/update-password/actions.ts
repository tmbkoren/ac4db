'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    return redirect('/profile/update-password?error=Passwords do not match');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(`/profile/update-password?error=${error.message}`);
  }

  revalidatePath('/profile', 'layout');
  redirect('/profile?message=Password updated successfully.');
}
