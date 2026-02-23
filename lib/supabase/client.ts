import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_ANON_KEY ?? '';

if (!url || !key) {
  console.warn('SUPABASE_URL and SUPABASE_ANON_KEY must be set for database sync.');
}

export const supabase = url && key ? createClient(url, key) : null;
