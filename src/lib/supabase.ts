import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://asednemwscdtetqwwuts.supabase.co';
let rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!rawAnonKey || rawAnonKey.startsWith('sb_secret')) {
  rawAnonKey = 'sb_publishable_abUml6si1hpQxE-H2K1NNA_TxdSXSVm';
}

export const supabase = createClient(supabaseUrl, rawAnonKey);
