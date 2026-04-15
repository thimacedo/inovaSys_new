-- ==========================================================
-- INOVASYS - WORKFLOW DE ASSINATURAS (v2.0)
-- Tabela para registro de assinaturas digitais internas
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.documentos_assinados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    documento_tipo INTEGER,
    nome_documento TEXT,
    html_final TEXT, -- Conteúdo no momento da assinatura
    signatario_id UUID REFERENCES auth.users(id),
    signatario_nome TEXT,
    ip_address TEXT,
    user_agent TEXT,
    hash_assinatura TEXT, -- Hash SHA-256 para integridade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.documentos_assinados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver assinaturas do processo" ON public.documentos_assinados
    FOR SELECT USING (
        processo_id IN (SELECT id FROM processos)
    );

CREATE POLICY "Qualquer autenticado pode assinar" ON public.documentos_assinados
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
