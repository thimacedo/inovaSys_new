-- ==========================================================
-- INOVASYS - LOGS DE VISUALIZAÇÃO DE DOCUMENTOS (v2.0)
-- Rastreamento de compliance e leitura de documentos
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.logs_visualizacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id),
    documento_nome TEXT NOT NULL,
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.logs_visualizacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver logs do próprio processo" ON public.logs_visualizacao
    FOR SELECT USING (
        processo_id IN (SELECT id FROM processos)
    );

CREATE POLICY "Qualquer autenticado pode registrar log" ON public.logs_visualizacao
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
