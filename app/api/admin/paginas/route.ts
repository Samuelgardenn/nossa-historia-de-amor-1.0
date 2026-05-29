import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'amor123';

function authenticateAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === ADMIN_PASSCODE;
}

export async function GET(req: NextRequest) {
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Error fetching pages:', err);
    return NextResponse.json({ error: 'Erro ao buscar páginas.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 550 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID ausente.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('paginas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Página deletada com sucesso.' });
  } catch (err: any) {
    console.error('Error deleting page:', err);
    return NextResponse.json({ error: err.message || 'Erro ao deletar página.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 500 });
  }

  try {
    const { id, dados } = await req.json();

    if (!id || !dados) {
      return NextResponse.json({ error: 'Dados ou ID ausentes.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('paginas')
      .update({ dados })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Página atualizada com sucesso.' });
  } catch (err: any) {
    console.error('Error updating page:', err);
    return NextResponse.json({ error: err.message || 'Erro ao atualizar página.' }, { status: 500 });
  }
}
