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
