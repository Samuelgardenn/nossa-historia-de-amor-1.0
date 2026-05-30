import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// No servidor, se configurada, usamos a Service Role Key para contornar políticas de RLS e atualizar o banco com segurança
const isServer = typeof window === 'undefined';
const supabaseKey = (isServer && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
  : supabaseAnonKey;

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== 'sua_url_aqui');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
