-- ==========================================================
-- INOVASYS - CLASSIFICAÇÃO DE DOCUMENTOS (v2.0)
-- Adiciona categoria e metadados aos anexos
-- ==========================================================

ALTER TABLE public.anexos ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Outros';
ALTER TABLE public.anexos ADD COLUMN IF NOT EXISTS metadados_ia JSONB DEFAULT '{}'::jsonb;

-- Política de atualização para permitir que a IA/Sistema classifique
CREATE POLICY "Permitir atualização de metadados" ON public.anexos
    FOR UPDATE USING (true);
