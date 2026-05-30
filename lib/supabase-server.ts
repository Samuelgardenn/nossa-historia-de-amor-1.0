// lib/supabase-server.ts
// SOMENTE PARA USO EM ROTAS DE API (servidor). NUNCA importe este arquivo em Client Components.
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
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');

// Usa a Service Role Key (que bypassa RLS) se disponível; senão usa a anon key.
const serverKey = serviceRoleKey || anonKey;

if (!serviceRoleKey) {
  console.warn(
    '[supabase-server] AVISO: SUPABASE_SERVICE_ROLE_KEY não configurada. ' +
    'Usando anon key como fallback. Adicione a Service Role Key no painel da Vercel para garantir funcionamento correto das atualizações.'
  );
}

export const isSupabaseServerConfigured = !!(supabaseUrl && serverKey);

export const supabaseAdmin = isSupabaseServerConfigured
  ? createClient(supabaseUrl, serverKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
