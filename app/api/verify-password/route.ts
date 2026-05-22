import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Helper to generate a random 6-character password
function generateRandomPassword() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, error: 'Supabase não está configurado.' }, { status: 400 });
    }

    const { password } = await req.json();

    // Query the "site_config" table for the first row
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .limit(1)
      .single();

    // 42P01 = undefined_table (table does not exist)
    if (error && error.code === '42P01') {
       return NextResponse.json({ success: false, error: 'A tabela site_config não existe no Supabase. Crie-a com colunas id, current_password e updated_at.' }, { status: 500 });
    }

    if (error && error.code === 'PGRST116') {
      // Table might exist but is empty, let's create the first row.
      const newPass = generateRandomPassword();
      await supabase.from('site_config').insert([{
        id: 1,
        current_password: newPass,
        updated_at: new Date().toISOString()
      }]);
      return NextResponse.json({ success: false, error: 'Senha incorreta ou expirada.' }, { status: 401 });
    } else if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const config = data;
    const now = new Date();
    const updatedAt = new Date(config.updated_at);
    
    // Check if 30 minutes have passed
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const isExpired = now.getTime() - updatedAt.getTime() > thirtyMinutesInMs;

    if (isExpired) {
      // Regenerate password and update Supabase
      const newPass = generateRandomPassword();
      await supabase
        .from('site_config')
        .update({ current_password: newPass, updated_at: now.toISOString() })
        .eq('id', config.id);

      return NextResponse.json({ 
        success: false, 
        error: 'A senha de acesso expirou. Uma nova senha foi gerada no Supabase.',
        expired: true
      }, { status: 401 });
    }

    // Checking if the passwords match
    if (password === config.current_password) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Senha incorreta.' }, { status: 401 });
    }

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
