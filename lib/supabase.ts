import { createClient } from '@supabase/supabase-js';

let supabaseUrlRaw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
if (supabaseUrlRaw && !supabaseUrlRaw.startsWith('http://') && !supabaseUrlRaw.startsWith('https://')) {
  supabaseUrlRaw = `https://${supabaseUrlRaw}`;
}

let supabaseUrl = '';
if (supabaseUrlRaw) {
  try {
    const parsed = new URL(supabaseUrlRaw);
    supabaseUrl = parsed.origin;
  } catch (e) {
    supabaseUrl = supabaseUrlRaw.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
  }
}

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');

// No servidor, se configurada, usamos a Service Role Key para contornar políticas de RLS e atualizar o banco com segurança
const isServer = typeof window === 'undefined';
const supabaseKey = (isServer && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim().replace(/^['"]|['"]$/g, '')
  : supabaseAnonKey;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== 'sua_url_aqui');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
