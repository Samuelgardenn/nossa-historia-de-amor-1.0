// app/api/confirmar-pagamento/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { paymentId, pageId } = await request.json();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase não configurado.' },
        { status: 500 }
      );
    }

    if (!paymentId || !pageId) {
      return NextResponse.json(
        { error: 'paymentId e pageId são obrigatórios.' },
        { status: 400 }
      );
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token || token.includes('COLE_SEU_ACCESS_TOKEN')) {
      return NextResponse.json(
        { error: 'Mercado Pago não está configurado.' },
        { status: 500 }
      );
    }

    // 1. Verificar o status do pagamento no Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Erro ao consultar pagamento no Mercado Pago:', errorData);
      return NextResponse.json(
        { error: 'Erro ao validar o pagamento com o Mercado Pago.' },
        { status: 500 }
      );
    }

    const payment = await mpResponse.json();

    // 2. Verificar se o pagamento está aprovado
    if (payment.status !== 'approved') {
      return NextResponse.json(
        { error: 'O pagamento ainda não foi aprovado pelo Mercado Pago.', paymentStatus: payment.status },
        { status: 402 }
      );
    }

    // 3. Verificar se o external_reference corresponde ao pageId
    if (String(payment.external_reference) !== String(pageId)) {
      return NextResponse.json(
        { error: 'A referência externa do pagamento não corresponde a este ID de página.' },
        { status: 403 }
      );
    }

    // 4. Buscar dados atuais da página
    const { data: pageData, error: fetchError } = await supabase
      .from('paginas')
      .select('dados')
      .eq('id', pageId)
      .single();

    if (fetchError || !pageData) {
      console.error('Erro ao buscar página para confirmar:', fetchError);
      return NextResponse.json(
        { error: 'Página não encontrada.' },
        { status: 404 }
      );
    }

    const novosDados = {
      ...(pageData.dados as object),
      pago: true,
      status: 'ativo'
    };

    // 5. Atualizar status da página para "ativo" / "pago: true"
    const { error: updateError } = await supabase
      .from('paginas')
      .update({ dados: novosDados })
      .eq('id', pageId);

    if (updateError) {
      console.error('Erro ao ativar página:', updateError);
      return NextResponse.json(
        { error: 'Erro ao ativar sua página. Entre em contato com o suporte.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pageId,
      message: 'Pagamento confirmado! Sua página está ativa.',
    });
  } catch (error: any) {
    console.error('Erro na confirmação do pagamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno.' },
      { status: 500 }
    );
  }
}
