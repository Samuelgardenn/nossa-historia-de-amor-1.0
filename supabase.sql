-- Script de configuração do Supabase
-- Copie e cole este código no "SQL Editor" do seu painel do Supabase e clique em "Run" (Rodar).

-- 1. Criação da tabela site_config
CREATE TABLE IF NOT EXISTS public.site_config (
    id integer PRIMARY KEY DEFAULT 1,
    current_password text NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Segurança a Nível de Linha)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de acesso
-- Como nossa API Next.js usa a chave pública anônima para verificar e atualizar a senha,
-- precisamos permitir que as operações de leitura, inserção e atualização sejam feitas.

-- Permitir leitura (SELECT)
CREATE POLICY "Permitir leitura anonima" 
ON public.site_config 
FOR SELECT 
TO public
USING (true);

-- Permitir inserção (INSERT) - usado apenas na primeira vez que a tabela é acessada
CREATE POLICY "Permitir insercao anonima" 
ON public.site_config 
FOR INSERT 
TO public
WITH CHECK (true);

-- Permitir atualização (UPDATE) - usado para renovar a senha a cada 10 min
CREATE POLICY "Permitir atualizacao anonima" 
ON public.site_config 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);
