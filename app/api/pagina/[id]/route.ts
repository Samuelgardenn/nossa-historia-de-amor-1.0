// app/api/pagina/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseServerConfigured } from '@/lib/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseServerConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase não está configurado.' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('paginas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Página romântica não encontrada.' }, { status: 404 });
    }

    // Verificar status do pagamento
    if (data.dados && data.dados.pago === false) {
      return NextResponse.json(
        { error: 'O pagamento desta página ainda está pendente de confirmação.', pending: true },
        { status: 402 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[pagina/id] Erro ao buscar página:', err);
    return NextResponse.json({ error: 'Erro interno ao buscar dados da página.' }, { status: 500 });
  }
}
