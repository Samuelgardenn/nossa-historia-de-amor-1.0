// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseServerConfigured } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Mercado Pago às vezes envia corpo vazio em alguns eventos
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log('[webhook-mp] Notificação recebida:', JSON.stringify(body));

    if (!isSupabaseServerConfigured || !supabaseAdmin) {
      console.error('[webhook-mp] Supabase Admin não configurado.');
      return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 500 });
    }

    // Extrair payment ID de diferentes formatos de notificação do Mercado Pago
    let paymentId: string | null = null;

    if (body.type === 'payment' && body.data?.id) {
      paymentId = String(body.data.id);
    } else if (body.topic === 'payment' && body.id) {
      paymentId = String(body.id);
    } else if (body.data?.id) {
      paymentId = String(body.data.id);
    }

    if (!paymentId) {
      console.log('[webhook-mp] Evento sem payment ID — ignorado:', body.type || body.topic);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token || token.includes('COLE_SEU_ACCESS_TOKEN')) {
      console.error('[webhook-mp] Mercado Pago Access Token não configurado.');
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 500 });
    }

    // 1. Consultar detalhes do pagamento no Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!mpResponse.ok) {
      console.error(`[webhook-mp] Erro ao consultar pagamento ${paymentId}`);
      return NextResponse.json({ error: 'Erro ao consultar pagamento.' }, { status: 500 });
    }

    const payment = await mpResponse.json();
    const pageId = payment.external_reference;

    console.log(`[webhook-mp] Pagamento ${paymentId} | Status: ${payment.status} | PageId: ${pageId}`);

    // 2. Só processar pagamentos aprovados
    if (payment.status !== 'approved' || !pageId) {
      return NextResponse.json({ received: true, status: payment.status }, { status: 200 });
    }

    // 3. Buscar dados atuais da página no Supabase
    const { data: pageData, error: fetchError } = await supabaseAdmin
      .from('paginas')
      .select('dados')
      .eq('id', pageId)
      .single();

    if (fetchError || !pageData) {
      console.error('[webhook-mp] Página não encontrada:', pageId, fetchError);
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    // 4. Idempotência: evitar atualizar se já estiver ativo
    if ((pageData.dados as any)?.pago === true) {
      console.log(`[webhook-mp] Página ${pageId} já estava ativa.`);
      return NextResponse.json({ success: true, message: 'Já ativa.' }, { status: 200 });
    }

    // 5. Atualizar status no Supabase
    const novosDados = {
      ...(pageData.dados as object),
      pago: true,
      status: 'ativo',
    };

    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from('paginas')
      .update({ dados: novosDados })
      .eq('id', pageId)
      .select('id');

    if (updateError) {
      console.error('[webhook-mp] Erro ao atualizar status no Supabase:', updateError);
      return NextResponse.json({ error: 'Erro ao ativar página.' }, { status: 500 });
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error('[webhook-mp] Update retornou 0 linhas para pageId:', pageId);
      return NextResponse.json({ error: 'Update não afetou nenhuma linha.' }, { status: 500 });
    }

    console.log(`[webhook-mp] Página ${pageId} ativada com sucesso via webhook!`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[webhook-mp] Erro de processamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
