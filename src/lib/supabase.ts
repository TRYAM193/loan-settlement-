import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://asednemwscdtetqwwuts.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_abUml6si1hpQxE-H2K1NNA_TxdSXSVm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
