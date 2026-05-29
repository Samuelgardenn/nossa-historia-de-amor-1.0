// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageConfig } = body;

    if (!pageConfig) {
      return NextResponse.json(
        { error: 'Configuração da página é obrigatória.' },
        { status: 400 }
      );
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token || token.includes('COLE_SEU_ACCESS_TOKEN')) {
      return NextResponse.json(
        { error: 'Mercado Pago não está configurado. Configure a variável MERCADOPAGO_ACCESS_TOKEN no arquivo .env.local.' },
        { status: 500 }
      );
    }

    // 1. Salvar a página como "pendente" no Supabase
    const pageId = crypto.randomUUID();
    const pageConfigWithPayment = {
      ...pageConfig,
      pago: false,
      status: 'pendente'
    };

    const { error: dbError } = await supabase
      .from('paginas')
      .insert({
        id: pageId,
        dados: pageConfigWithPayment,
        created_by: 'mercadopago_checkout'
      });

    if (dbError) {
      console.error('Erro ao salvar página pendente:', dbError);
      return NextResponse.json(
        { error: 'Erro ao preparar sua página. Tente novamente.' },
        { status: 500 }
      );
    }

    // 2. Criar sessão de checkout (preferência) no Mercado Pago
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const mpResponse = await fetch('https://api.mercadopago.com/v1/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: '💕 Página de Amor Permanente',
            description: 'Sua história de amor eternizada em uma página exclusiva e permanente na web.',
            quantity: 1,
            unit_price: 29.90,
            currency_id: 'BRL',
            picture_url: 'https://img.icons8.com/emoji/96/red-heart.png'
          }
        ],
        back_urls: {
          success: `${origin}/pagamento/sucesso`,
          failure: `${origin}/pagamento/cancelado`,
          pending: `${origin}/pagamento/sucesso`
        },
        auto_return: 'approved',
        external_reference: pageId,
      })
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Erro ao criar preferência no Mercado Pago:', errorData);
      return NextResponse.json(
        { error: 'Erro ao gerar a sessão de pagamento com o Mercado Pago.' },
        { status: 500 }
      );
    }

    const preference = await mpResponse.json();

    // init_point é para produção, sandbox_init_point é para testes (sandbox)
    // Se o token for de produção (começa com APP_USR), podemos usar init_point.
    // De qualquer forma, retornar o link correspondente. Usamos init_point por padrão,
    // mas se o usuário estiver usando sandbox, sandbox_init_point pode ser retornado também.
    // Para simplificar e cobrir ambos: se for sandbox_init_point e o token for de teste, usamos ele.
    const checkoutUrl = preference.init_point || preference.sandbox_init_point;

    return NextResponse.json({ url: checkoutUrl, pageId }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no checkout Mercado Pago:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao criar sessão de pagamento.' },
      { status: 500 }
    );
  }
}
