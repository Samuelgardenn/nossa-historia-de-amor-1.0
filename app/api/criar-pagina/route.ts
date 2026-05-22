import { NextRequest, NextResponse } from 'next/server';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// In-memory rate limiting cache
const rateLimitCache = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const timestamps = rateLimitCache.get(ip) || [];
  
  // Filter timestamps from the last hour
  const recent = timestamps.filter(t => now - t < oneHour);
  recent.push(now);
  rateLimitCache.set(ip, recent);
  
  return recent.length <= 15; // Increased allowance slightly for convenient client testing
}

// XSS Sanitizer
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
  if (data !== null && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check Payload Size Limit (15MB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Payload muito grande. Limite de 15MB excedido.' },
        { status: 413 }
      );
    }

    // 2. IP Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Você pode criar até 15 páginas por hora.' },
        { status: 429 }
      );
    }

    // 3. Read Body & Sanitization
    const rawBody = await req.json();
    const sanitizedBody = sanitizeData(rawBody);

    // Generate pageId (UUID)
    const pageId = typeof crypto?.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const dadosFinal = { ...sanitizedBody };

    // 4. Connect and Save directly to Firestore collection 'paginas'
    try {
      const docPath = `paginas/${pageId}`;
      await setDoc(doc(db, 'paginas', pageId), {
        id: pageId,
        dados: dadosFinal,
        criado_em: new Date().toISOString(),
        created_by: 'public'
      });
    } catch (fireError) {
      handleFirestoreError(fireError, OperationType.CREATE, `paginas/${pageId}`);
    }

    return NextResponse.json({ id: pageId, success: true });
  } catch (err: any) {
    console.error('Error creating romantic page:', err);
    return NextResponse.json(
      { error: err?.message || 'Ocorreu um erro ao criar a página.' },
      { status: 500 }
    );
  }
}
