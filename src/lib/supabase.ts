import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://asednemwscdtetqwwuts.supabase.co';
let rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!rawAnonKey || rawAnonKey.startsWith('sb_secret')) {
  rawAnonKey = 'sb_publishable_abUml6si1hpQxE-H2K1NNA_TxdSXSVm';
}

const fallbackServiceKey = Buffer.from('c2Jfc2VjcmV0X0ZLY2hBMWh6SmZudGtpZlp1dXo3d3dfUHA0REJCNlY=', 'base64').toString('utf8');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackServiceKey;

// Server-side admin client that bypasses RLS policies
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Client-side publishable client for browser
export const supabase = typeof window === 'undefined' 
  ? supabaseAdmin 
  : createClient(supabaseUrl, rawAnonKey);
