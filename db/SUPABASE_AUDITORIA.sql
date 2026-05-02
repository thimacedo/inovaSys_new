-- ==========================================================
-- INOVASYS - CORREÇÃO DA TABELA DE AUDITORIA
-- ==========================================================

-- 1. Criar/Atualizar Tabela de Auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id),
    acao TEXT NOT NULL,
    tabela TEXT,
    registro_id TEXT,
    dados_antigos JSONB DEFAULT '{}'::jsonb,
    dados_novos JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso
-- Apenas Admins podem ver logs
DROP POLICY IF EXISTS "Admins veem auditoria" ON auditoria;
CREATE POLICY "Admins veem auditoria" ON auditoria
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfis 
            WHERE id = auth.uid() 
            AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin')
        )
    );

-- Sistema/Users podem inserir (necessário para registrar ações)
DROP POLICY IF EXISTS "Users podem inserir auditoria" ON auditoria;
CREATE POLICY "Users podem inserir auditoria" ON auditoria
    FOR INSERT WITH CHECK (true);

-- 4. Índice para performance
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria (usuario_id);
