-- ===============================================================
-- 🚀 INOVASYS - SQL DE IMPLANTAÇÃO COMPLETA (v3.0)
-- Este arquivo consolida TODAS as tabelas, funções e RLS.
-- ===============================================================

-- 0. Extensões Necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Estrutura de Câmaras e Planos
CREATE TABLE IF NOT EXISTS public.planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    limite_usuarios INTEGER DEFAULT 5,
    valor_mensal DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS public.camaras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    endereco TEXT,
    fone TEXT,
    logo TEXT,
    plano_id UUID REFERENCES public.planos(id),
    limite_usuarios_extra INTEGER DEFAULT 0,
    signature_provider TEXT DEFAULT 'clicksign',
    signature_api_token TEXT,
    webhook_url TEXT,
    webhook_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Perfis e RBAC
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    tipo_usuario TEXT DEFAULT 'arbitro', -- 'gestor', 'controle', 'admin', 'assistente', 'arbitro', 'god'
    camara_id UUID REFERENCES public.camaras(id),
    cpf TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Processos e Fluxo de Trabalho
CREATE TABLE IF NOT EXISTS public.processos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_processo TEXT UNIQUE NOT NULL,
    requerente_nome TEXT NOT NULL,
    requerente_documento TEXT,
    requerente_endereco TEXT,
    requerido_nome TEXT NOT NULL,
    requerido_documento TEXT,
    requerido_endereco TEXT,
    valor_causa DECIMAL(12,2) DEFAULT 0,
    resumo_fatos TEXT,
    status TEXT DEFAULT 'Protocolado',
    camara_id UUID REFERENCES public.camaras(id),
    arbitro_id UUID REFERENCES public.perfis(id),
    user_id UUID REFERENCES auth.users(id), -- Criador do processo
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Anexos e Categorias (STEP 2)
CREATE TABLE IF NOT EXISTS public.anexos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    caminho_arquivo TEXT NOT NULL,
    categoria TEXT DEFAULT 'Outros',
    metadados_ia JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Chat em Tempo Real (STEP 6)
CREATE TABLE IF NOT EXISTS public.mensagens_processo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES auth.users(id),
    autor_nome TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Assinaturas e Documentos Gerados (STEP 4)
CREATE TABLE IF NOT EXISTS public.documentos_assinados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    documento_tipo INTEGER, -- 1: Notificação, 8: Sentença, etc.
    nome_documento TEXT,
    html_final TEXT,
    signatario_id UUID REFERENCES auth.users(id),
    signatario_nome TEXT,
    ip_address TEXT,
    user_agent TEXT,
    hash_assinatura TEXT UNIQUE, -- Usado na Consulta Pública
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Financeiro (Controle de Custas)
CREATE TABLE IF NOT EXISTS public.financeiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- camara_id
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    tipo TEXT CHECK (tipo IN ('Custa', 'Hon_Arbitral', 'Hon_Sucumbencia', 'Outro')),
    status TEXT CHECK (status IN ('Pendente', 'Pago', 'Cancelado')),
    data_vencimento DATE,
    data_pagamento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Notificações e Auditoria
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    processo_id UUID REFERENCES public.processos(id),
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id),
    acao TEXT NOT NULL,
    tabela TEXT,
    registro_id TEXT,
    dados_novos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===============================================================
-- 🛡️ SEGURANÇA E RLS
-- ===============================================================

ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_processo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_assinados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Funções de Apoio
CREATE OR REPLACE FUNCTION get_user_role() RETURNS text AS $$
    SELECT tipo_usuario FROM public.perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_camara() RETURNS uuid AS $$
    SELECT camara_id FROM public.perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Políticas de Processos (Exemplo)
CREATE POLICY "Leitura de Processos" ON public.processos
    FOR SELECT USING (
        get_user_role() IN ('gestor', 'god') OR 
        camara_id = get_user_camara() OR 
        arbitro_id = auth.uid()
    );

-- ===============================================================
-- 🔎 CONSULTA PÚBLICA (STEP 8)
-- ===============================================================

CREATE OR REPLACE FUNCTION public.consultar_sentenca_publica(p_numero_processo TEXT, p_codigo_validacao TEXT)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    SELECT jsonb_build_object(
        'numero_processo', p.numero_processo,
        'requerente_nome', p.requerente_nome,
        'requerido_nome', p.requerido_nome,
        'status', p.status,
        'data_conclusao', p.updated_at,
        'conteudo_html', da.html_final,
        'assinado_por', da.signatario_nome,
        'hash_validacao', da.hash_assinatura
    ) INTO v_resultado
    FROM public.processos p
    JOIN public.documentos_assinados da ON da.processo_id = p.id
    WHERE p.numero_processo = p_numero_processo
      AND da.hash_assinatura = p_codigo_validacao
      AND p.status IN ('Concluído', 'Arquivado')
      AND da.documento_tipo = 8;

    IF v_resultado IS NULL THEN
        RETURN jsonb_build_object('error', 'Documento não encontrado ou código inválido.');
    END IF;

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
