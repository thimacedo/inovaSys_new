-- ==========================================================
-- INOVASYS - SCRIPT DE REPARO E ATUALIZAÇÃO DE BANCO (v2.0)
-- Execute este script no SQL Editor do Supabase para corrigir Erros 400/404
-- ==========================================================

-- 1. Tabela de Notificações (Resolvendo Erro 400: created_at missing)
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela Financeira (Resolvendo Erro 404: Table not found)
CREATE TABLE IF NOT EXISTS financeiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Referência à câmara/organização
    processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Custa', 'Hon_Arbitral', 'Hon_Sucumbencia', 'Outro')),
    status TEXT NOT NULL CHECK (status IN ('Pendente', 'Pago', 'Cancelado')),
    data_vencimento DATE,
    data_pagamento DATE,
    metodo_pagamento TEXT,
    comprovante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Templates de Documentos (Resolvendo Erro 404: Table not found)
CREATE TABLE IF NOT EXISTS templates_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    tipo_documento INTEGER NOT NULL UNIQUE,
    conteudo_html TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Expansão da Tabela de Câmaras (Configurações de Assinatura)
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS signature_provider TEXT DEFAULT 'clicksign';
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS signature_api_token TEXT;

-- ==========================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ==========================================================

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_documentos ENABLE ROW LEVEL SECURITY;

-- Notificações: Usuário vê apenas as suas
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON notificacoes;
CREATE POLICY "Usuários veem suas próprias notificações" ON notificacoes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sistema pode inserir notificações" ON notificacoes;
CREATE POLICY "Sistema pode inserir notificações" ON notificacoes
    FOR INSERT WITH CHECK (true);

-- Financeiro: Isolamento por Organização
DROP POLICY IF EXISTS "Membros da câmara veem financeiro" ON financeiro;
CREATE POLICY "Membros da câmara veem financeiro" ON financeiro
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM perfis WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins podem gerenciar financeiro" ON financeiro;
CREATE POLICY "Admins podem gerenciar financeiro" ON financeiro
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis 
            WHERE id = auth.uid() 
            AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin')
        )
    );

-- Templates: Apenas GOD/Gestor gerencia, todos veem
DROP POLICY IF EXISTS "Templates visíveis por todos" ON templates_documentos;
CREATE POLICY "Templates visíveis por todos" ON templates_documentos
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas GOD gerencia templates" ON templates_documentos;
CREATE POLICY "Apenas GOD gerencia templates" ON templates_documentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis 
            WHERE id = auth.uid() 
            AND LOWER(tipo_usuario) IN ('god', 'gestor')
        )
    );

-- ==========================================================
-- DADOS INICIAIS (SEED)
-- ==========================================================
INSERT INTO templates_documentos (nome, tipo_documento, conteudo_html)
VALUES 
('Notificação Inicial', 1, '<h1>Notificação do Processo {numero_processo}</h1><p>Prezado {requerido_nome}, você está sendo notificado...</p>'),
('Termo de Arbitragem', 2, '<h1>Termo de Arbitragem</h1><p>As partes {requerente_nome} e {requerido_nome} concordam...</p>')
ON CONFLICT (tipo_documento) DO NOTHING;
