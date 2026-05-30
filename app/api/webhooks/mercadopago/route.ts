// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook Mercado Pago recebido:', JSON.stringify(body));

    if (!supabase) {
      console.error('Webhook: Supabase não configurado.');
      return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 500 });
    }

    // O Mercado Pago pode enviar dados de diferentes tipos.
    // Estamos interessados em notificações de pagamento ("payment").
    const paymentId = body.data?.id || (body.type === 'payment' ? body.id : null);

    if (!paymentId) {
      // Retorna 200 para indicar ao Mercado Pago que a notificação foi recebida,
      // mesmo que não seja um evento de pagamento que precisamos processar.
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token || token.includes('COLE_SEU_ACCESS_TOKEN')) {
      console.error('Webhook: Mercado Pago não está configurado no backend (.env).');
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 500 });
    }

    // 1. Consultar detalhes do pagamento no Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!mpResponse.ok) {
      console.error(`Webhook: Erro ao consultar pagamento ${paymentId} no Mercado Pago.`);
      return NextResponse.json({ error: 'Erro ao consultar pagamento.' }, { status: 500 });
    }

    const payment = await mpResponse.json();
    const pageId = payment.external_reference;

    // 2. Verificar se o status é aprovado e se temos a referência da página
    if (payment.status === 'approved' && pageId) {
      console.log(`Webhook: Pagamento ${paymentId} aprovado para a página ${pageId}. Ativando...`);

      // 3. Buscar dados atuais da página no Supabase
      const { data: pageData, error: fetchError } = await supabase
        .from('paginas')
        .select('dados')
        .eq('id', pageId)
        .single();

      if (fetchError || !pageData) {
        console.error('Webhook: Página não encontrada no Supabase:', pageId);
        return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
      }

      // Evitar atualizar se já estiver ativo/pago
      if (pageData.dados?.pago === true) {
        console.log(`Webhook: Página ${pageId} já estava ativa.`);
        return NextResponse.json({ success: true, message: 'Já ativa.' }, { status: 200 });
      }

      const novosDados = {
        ...(pageData.dados as object),
        pago: true,
        status: 'ativo'
      };

      // 4. Atualizar status no Supabase
      const { error: updateError } = await supabase
        .from('paginas')
        .update({ dados: novosDados })
        .eq('id', pageId);

      if (updateError) {
        console.error('Webhook: Erro ao atualizar status no Supabase:', updateError);
        return NextResponse.json({ error: 'Erro ao ativar página.' }, { status: 500 });
      }

      console.log(`Webhook: Página ${pageId} ativada com sucesso!`);
    } else {
      console.log(`Webhook: Pagamento ${paymentId} com status "${payment.status}" não ativa a página.`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook: Erro de processamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
