import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseServerConfigured } from '@/lib/supabase-server';

const rateLimitCache = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const timestamps = rateLimitCache.get(ip) || [];
  
  const recent = timestamps.filter(t => now - t < oneHour);
  recent.push(now);
  rateLimitCache.set(ip, recent);
  
  return recent.length <= 15;
}

function sanitizeString(str: string): string {
  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (data && typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      sanitized[key] = sanitizeData(data[key]);
    }
    return sanitized;
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseServerConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 400 });
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Payload muito grande. Limite de 15MB excedido.' },
        { status: 413 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const sanitizedBody = sanitizeData(rawBody);
    
    // Páginas criadas via API direta (como o painel admin) são marcadas como pagas/ativas
    sanitizedBody.pago = true;
    sanitizedBody.status = 'ativo';

    const pageId = crypto.randomUUID();

    const { error } = await supabaseAdmin.from('paginas').insert([{
      id: pageId,
      dados: sanitizedBody,
      criado_em: new Date().toISOString(),
      created_by: 'public'
    }]);

    if (error) throw error;

    return NextResponse.json({ id: pageId, success: true });
  } catch (err: any) {
    console.error('[criar-pagina] Erro:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao criar página.' },
      { status: 500 }
    );
  }
}
