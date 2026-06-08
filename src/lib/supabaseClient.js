// ─────────────────────────────────────────────────────────
// FILE: src/lib/supabaseClient.js  (frontend — Next.js)
//
// ADD to Vercel env vars:
//   NEXT_PUBLIC_SUPABASE_URL  = https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
//
// Both are in Supabase Dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────
 
import { createClient } from '@supabase/supabase-js';
 
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
 
