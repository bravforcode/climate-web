// Supabase client foundation (Epic Phase A).
// Null-safe: returns null until VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are
// provided (.env.local). Existing localStorage mock keeps working unchanged.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
let resolved = false;

export function getSupabase(): SupabaseClient | null {
  if (!resolved) {
    resolved = true;
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (url && anonKey) {
      cached = createClient(url, anonKey);
    }
  }
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
