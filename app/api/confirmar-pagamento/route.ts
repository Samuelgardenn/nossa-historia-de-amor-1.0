// app/api/confirmar-pagamento/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseServerConfigured } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { paymentId, pageId } = await request.json();

    if (!isSupabaseServerConfigured || !supabaseAdmin) {
      console.error('[confirmar-pagamento] Supabase não configurado.');
      return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 500 });
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
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json().catch(() => ({}));
      console.error('[confirmar-pagamento] Erro ao consultar MP:', errorData);
      return NextResponse.json(
        { error: 'Erro ao validar o pagamento com o Mercado Pago.' },
        { status: 500 }
      );
    }

    const payment = await mpResponse.json();
    console.log(`[confirmar-pagamento] Status do pagamento ${paymentId}: ${payment.status}`);

    // 2. PIX ainda aguardando confirmação bancária → instruir frontend a aguardar
    if (payment.status === 'pending' || payment.status === 'in_process' || payment.status === 'authorized') {
      return NextResponse.json(
        { pending: true, paymentStatus: payment.status, pageId },
        { status: 202 }
      );
    }

    // 3. Pagamento rejeitado, cancelado ou com erro
    if (payment.status !== 'approved') {
      return NextResponse.json(
        { error: `Pagamento não aprovado (status: ${payment.status}). Verifique com o Mercado Pago.` },
        { status: 402 }
      );
    }

    // 4. Verificar se external_reference corresponde ao pageId
    if (String(payment.external_reference) !== String(pageId)) {
      console.error(`[confirmar-pagamento] external_reference mismatch: ${payment.external_reference} !== ${pageId}`);
      return NextResponse.json(
        { error: 'A referência do pagamento não corresponde a esta página.' },
        { status: 403 }
      );
    }

    // 5. Buscar dados atuais da página
    const { data: pageData, error: fetchError } = await supabaseAdmin
      .from('paginas')
      .select('dados')
      .eq('id', pageId)
      .single();

    if (fetchError || !pageData) {
      console.error('[confirmar-pagamento] Página não encontrada:', pageId, fetchError);
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    // 6. Se já estiver paga, retornar sucesso diretamente (idempotente)
    if ((pageData.dados as any)?.pago === true) {
      console.log(`[confirmar-pagamento] Página ${pageId} já estava ativa.`);
      return NextResponse.json({ success: true, pageId, message: 'Página já estava ativa.' });
    }

    // 7. Atualizar status da página para pago/ativo
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
      console.error('[confirmar-pagamento] Erro ao atualizar página no DB:', updateError);
      return NextResponse.json(
        { error: 'Erro ao ativar sua página no banco de dados. Entre em contato com o suporte.' },
        { status: 500 }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error('[confirmar-pagamento] Update retornou 0 linhas para pageId:', pageId);
      // Tentar verificar se o registro existe
      const { data: checkData } = await supabaseAdmin
        .from('paginas')
        .select('id, dados')
        .eq('id', pageId)
        .single();
      console.error('[confirmar-pagamento] Estado atual da página:', checkData);
      return NextResponse.json(
        { error: 'Não foi possível ativar a página. Possível problema de permissão no banco de dados. Configure SUPABASE_SERVICE_ROLE_KEY na Vercel.' },
        { status: 500 }
      );
    }

    console.log(`[confirmar-pagamento] Página ${pageId} ativada com sucesso! Linhas atualizadas: ${updatedRows.length}`);

    return NextResponse.json({
      success: true,
      pageId,
      message: 'Pagamento confirmado! Sua página está ativa.',
    });
  } catch (error: any) {
    console.error('[confirmar-pagamento] Erro inesperado:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno.' },
      { status: 500 }
    );
  }
}
