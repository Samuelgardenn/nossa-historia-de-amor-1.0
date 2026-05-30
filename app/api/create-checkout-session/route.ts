// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseServerConfigured } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageConfig } = body;

    if (!isSupabaseServerConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase não configurado.' },
        { status: 500 }
      );
    }

    if (!pageConfig) {
      return NextResponse.json(
        { error: 'Configuração da página é obrigatória.' },
        { status: 400 }
      );
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token || token.includes('COLE_SEU_ACCESS_TOKEN')) {
      return NextResponse.json(
        { error: 'Mercado Pago não está configurado. Configure a variável MERCADOPAGO_ACCESS_TOKEN na Vercel.' },
        { status: 500 }
      );
    }

    // 1. Salvar a página como "pendente" no Supabase
    const pageId = crypto.randomUUID();
    const pageConfigWithPayment = {
      ...pageConfig,
      pago: false,
      status: 'pendente',
    };

    const { error: dbError } = await supabaseAdmin
      .from('paginas')
      .insert({
        id: pageId,
        dados: pageConfigWithPayment,
        created_by: 'mercadopago_checkout',
      });

    if (dbError) {
      console.error('[create-checkout-session] Erro ao salvar página pendente:', dbError);
      return NextResponse.json(
        { error: `Erro ao preparar sua página: ${dbError.message}` },
        { status: 500 }
      );
    }

    console.log(`[create-checkout-session] Página pendente criada: ${pageId}`);

    // 2. Criar preferência de checkout no Mercado Pago
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Mercado Pago exige HTTPS para back_urls com auto_return
    const safeOrigin = origin.startsWith('http://localhost')
      ? origin.replace('http://', 'https://')
      : origin;

    const preferencePayload: Record<string, any> = {
      items: [
        {
          title: '💕 Página de Amor Permanente',
          description: 'Sua história de amor eternizada em uma página exclusiva e permanente na web.',
          quantity: 1,
          unit_price: 19.90,
          currency_id: 'BRL',
          picture_url: 'https://img.icons8.com/emoji/96/red-heart.png',
        },
      ],
      back_urls: {
        success: `${safeOrigin}/pagamento/sucesso`,
        failure: `${safeOrigin}/pagamento/cancelado`,
        pending: `${safeOrigin}/pagamento/sucesso`,
      },
      auto_return: 'approved',
      external_reference: pageId,
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
    };

    // Webhook só funciona com URLs públicas HTTPS
    if (origin.startsWith('https://') && !origin.includes('localhost')) {
      preferencePayload.notification_url = `${origin}/api/webhooks/mercadopago`;
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json().catch(() => ({}));
      console.error('[create-checkout-session] Erro ao criar preferência MP:', errorData);
      return NextResponse.json(
        { error: 'Erro ao gerar a sessão de pagamento com o Mercado Pago.' },
        { status: 500 }
      );
    }

    const preference = await mpResponse.json();
    const checkoutUrl = preference.init_point || preference.sandbox_init_point;

    console.log(`[create-checkout-session] Preferência MP criada: ${preference.id}`);

    return NextResponse.json({ url: checkoutUrl, pageId }, { status: 200 });
  } catch (error: any) {
    console.error('[create-checkout-session] Erro inesperado:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao criar sessão de pagamento.' },
      { status: 500 }
    );
  }
}
