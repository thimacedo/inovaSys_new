-- ==========================================================
-- INOVASYS - CORREÇÃO DE SCHEMA DA TABELA CÂMARAS
-- Execute este script no SQL Editor do Supabase para habilitar a edição de dados.
-- ==========================================================

-- 1. Adicionar colunas faltantes para Configurações Completas
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS estado TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS fone TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS presidente_nome TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS webhook_token TEXT;

-- 2. Garantir que as polticas de RLS permitem a atualização pelos Admins
DROP POLICY IF EXISTS "Admins podem atualizar dados da câmara" ON camaras;
CREATE POLICY "Admins podem atualizar dados da câmara" ON camaras
    FOR UPDATE
    USING (
        id IN (SELECT camara_id FROM perfis WHERE id = auth.uid() AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin'))
    )
    WITH CHECK (
        id IN (SELECT camara_id FROM perfis WHERE id = auth.uid() AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin'))
    );

-- 3. Habilitar inserção inicial para GOD (Ecossistema)
DROP POLICY IF EXISTS "GOD gerencia todas as câmaras" ON camaras;
CREATE POLICY "GOD gerencia todas as câmaras" ON camaras
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM perfis 
            WHERE id = auth.uid() 
            AND LOWER(tipo_usuario) = 'god'
        )
    );
