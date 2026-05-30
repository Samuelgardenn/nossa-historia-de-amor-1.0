// lib/supabase.ts
// Cliente Supabase com chave pública (anon). Use este arquivo em Client Components.
// Para operações no servidor (API routes), use @/lib/supabase-server ao invés.
import { createClient } from '@supabase/supabase-js';

function sanitizeUrl(raw: string | undefined): string {
  let url = (raw || '').trim().replace(/^['"]|['"]$/g, '');
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return url.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
  }
}

const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
