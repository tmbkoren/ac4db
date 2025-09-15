'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Fetches all regulations from the database, ordered by sort_order.
 */
export async function getRegulations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('regulations')
    .select('id, name, family, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching regulations:', error);
    return [];
  }

  return data;
}
