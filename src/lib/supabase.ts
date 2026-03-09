import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
