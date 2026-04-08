-- ===============================================================
-- SUPABASE ENTITY SCHEMA & RLS V2 - INOVASYS
-- ===============================================================
-- Este arquivo consolida a criação das tabelas faltantes e as políticas de acesso.

-- 1. Criação de Tabelas (Caso não existam)

CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL, -- 'info', 'sucesso', 'alerta', 'erro'
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    processo_id UUID REFERENCES public.processos(id) ON DELETE SET NULL,
    lida BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario_nome TEXT,
    acao TEXT NOT NULL,
    detalhes JSONB DEFAULT '{}'::jsonb
);

-- 2. Habilitar RLS estrito
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- 3. Funções Auxiliares (Otimizadas)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT tipo_usuario FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_camara()
RETURNS uuid AS $$
  SELECT camara_id FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 4. Políticas para Tabelas Base

-- PROCESSOS: Isolamento por Câmara / Árbitro
DROP POLICY IF EXISTS "Processos: Leitura Restrita" ON public.processos;
CREATE POLICY "Processos: Leitura Restrita" ON public.processos
  FOR SELECT
  USING (
    get_user_role() IN ('gestor', 'controle', 'god')
    OR
    (get_user_role() IN ('admin', 'assistente') AND camara_id = get_user_camara())
    OR
    (get_user_role() = 'arbitro' AND arbitro_id = auth.uid())
  );

-- NOTIFICAÇÕES: Dono apenas
DROP POLICY IF EXISTS "Notificacoes: Leitura" ON public.notificacoes;
CREATE POLICY "Notificacoes: Leitura" ON public.notificacoes
  FOR SELECT
  USING (auth.uid() = user_id OR get_user_role() IN ('gestor', 'god'));

DROP POLICY IF EXISTS "Notificacoes: Atualizacao" ON public.notificacoes;
CREATE POLICY "Notificacoes: Atualizacao" ON public.notificacoes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- AUDITORIA: Somente Admins
DROP POLICY IF EXISTS "Auditoria: Leitura" ON public.auditoria;
CREATE POLICY "Auditoria: Leitura" ON public.auditoria
  FOR SELECT
  USING (get_user_role() IN ('gestor', 'god'));

-- PERFIS: Leitura por Câmara ou Admin Global
DROP POLICY IF EXISTS "Perfis: Leitura" ON public.perfis;
CREATE POLICY "Perfis: Leitura" ON public.perfis
  FOR SELECT
  USING (
    get_user_role() IN ('gestor', 'controle', 'god')
    OR
    (camara_id = get_user_camara())
  );
-- 15. Tabela de Templates de Documentos
CREATE TABLE IF NOT EXISTS templates_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES perfis(id),
    nome TEXT NOT NULL,
    tipo_documento INTEGER,
    conteudo_html TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE templates_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY 'Templates vis�veis por todos da organiza��o' 
    ON templates_documentos FOR SELECT 
    USING (organization_id IS NULL OR organization_id IN (SELECT organization_id FROM perfis WHERE id = auth.uid()));

CREATE POLICY 'Apenas GOD e Admin podem gerenciar templates' 
    ON templates_documentos FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM perfis 
        WHERE id = auth.uid() 
        AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin')
    ));
-- 16. Tabela Financeira (Custas e Honorários)
CREATE TABLE IF NOT EXISTS financeiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES perfis(id),
    descricao TEXT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Custa', 'Hon_Arbitral', 'Hon_Sucumbencia', 'Outros')),
    status TEXT NOT NULL CHECK (status IN ('Pendente', 'Pago', 'Cancelado')),
    data_vencimento DATE,
    data_pagamento DATE,
    metodo_pagamento TEXT,
    comprovante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY 'Financeiro visível por membros da organização' 
    ON financeiro FOR SELECT 
    USING (organization_id IN (SELECT organization_id FROM perfis WHERE id = auth.uid()));

CREATE POLICY 'Apenas Admin e GOD podem gerenciar financeiro' 
    ON financeiro FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM perfis 
        WHERE id = auth.uid() 
        AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin')
    ));
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
