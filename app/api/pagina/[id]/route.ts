import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ error: 'Supabase não está configurado.' }, { status: 500 });
    }

    // Fetch directly from Supabase table 'paginas'
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Página romântica não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching page:', err);
    return NextResponse.json({ error: 'Erro interno ao buscar dados da página.' }, { status: 500 });
  }
}
