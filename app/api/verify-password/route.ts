import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function generateRandomPassword(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase não configurado.' },
        { status: 400 }
      );
    }

    const { password } = await req.json();

    const { data: config, error } = await supabase
      .from('site_config')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'Tabela site_config não encontrada no banco.' },
          { status: 500 }
        );
      }
      
      if (error.code === 'PGRST116') {
        const newPass = generateRandomPassword();
        await supabase.from('site_config').insert([{
          id: 1,
          current_password: newPass,
          updated_at: new Date().toISOString()
        }]);
        return NextResponse.json(
          { success: false, error: 'Senha incorreta ou expirada.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const now = new Date();
    const updatedAt = new Date(config.updated_at);
    const TWENTY_MINUTES = 20 * 60 * 1000;
    const isExpired = now.getTime() - updatedAt.getTime() > TWENTY_MINUTES;

    if (isExpired) {
      const newPass = generateRandomPassword();
      await supabase
        .from('site_config')
        .update({ current_password: newPass, updated_at: now.toISOString() })
        .eq('id', config.id);

      return NextResponse.json({ 
        success: false, 
        error: 'A senha expirou. Uma nova senha foi gerada no banco de dados.',
        expired: true
      }, { status: 401 });
    }

    if (password === config.current_password) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Senha incorreta.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
