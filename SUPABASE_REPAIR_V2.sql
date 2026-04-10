-- ==========================================================
-- INOVASYS - SCRIPT DE REPARO V2 (REFATORADO)
-- Corrige: FK ausente no financeiro, índices faltantes,
--          política de auditoria excessivamente permissiva.
-- ==========================================================

-- ============================================================
-- BLOCO 1: TABELA DE NOTIFICAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo        TEXT      NOT NULL,
    titulo      TEXT      NOT NULL,
    mensagem    TEXT      NOT NULL,
    processo_id UUID      REFERENCES processos(id) ON DELETE SET NULL,
    lida        BOOLEAN   NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Índices para os padrões de query mais comuns
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id    ON notificacoes (user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida  ON notificacoes (user_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes (created_at DESC);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON notificacoes;
CREATE POLICY "Usuários veem suas próprias notificações" ON notificacoes
    FOR SELECT USING (auth.uid() = user_id);

-- Política de INSERT restrita: apenas o próprio usuário ou admins podem inserir
DROP POLICY IF EXISTS "Sistema pode inserir notificações" ON notificacoes;
CREATE POLICY "Sistema pode inserir notificações" ON notificacoes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM perfis
            WHERE id = auth.uid()
            AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin')
        )
    );

-- ============================================================
-- BLOCO 2: TABELA FINANCEIRA
-- CORREÇÃO CRÍTICA: Adicionada FK para camaras + índices ausentes
-- ============================================================

CREATE TABLE IF NOT EXISTS financeiro (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- CORREÇÃO: FK explícita evita dados órfãos (bug original: coluna sem referência)
    organization_id   UUID         NOT NULL REFERENCES camaras(id) ON DELETE CASCADE,
    processo_id       UUID         REFERENCES processos(id) ON DELETE SET NULL,
    descricao         TEXT         NOT NULL,
    valor             DECIMAL(12,2) NOT NULL CHECK (valor >= 0),
    tipo              TEXT         NOT NULL
                        CHECK (tipo IN ('Custa', 'Hon_Arbitral', 'Hon_Sucumbencia', 'Outro')),
    status            TEXT         NOT NULL
                        CHECK (status IN ('Pendente', 'Pago', 'Cancelado')),
    data_vencimento   DATE,
    data_pagamento    DATE,
    metodo_pagamento  TEXT,
    comprovante_url   TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    -- Garante consistência: data_pagamento só existe se status = 'Pago'
    CONSTRAINT chk_pagamento_consistente CHECK (
        (status = 'Pago' AND data_pagamento IS NOT NULL)
        OR status <> 'Pago'
    )
);

CREATE INDEX IF NOT EXISTS idx_financeiro_org_id     ON financeiro (organization_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_processo_id ON financeiro (processo_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_status      ON financeiro (status);

ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros da câmara veem financeiro" ON financeiro;
CREATE POLICY "Membros da câmara veem financeiro" ON financeiro
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM perfis WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins podem gerenciar financeiro" ON financeiro;
CREATE POLICY "Admins podem gerenciar financeiro" ON financeiro
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis
            WHERE id = auth.uid()
            AND LOWER(tipo_usuario) IN ('god', 'gestor', 'admin')
        )
    );

-- Trigger para manter updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_financeiro_updated_at ON financeiro;
CREATE TRIGGER trg_financeiro_updated_at
    BEFORE UPDATE ON financeiro
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- BLOCO 3: TEMPLATES DE DOCUMENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS templates_documentos (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome            TEXT    NOT NULL,
    tipo_documento  INTEGER NOT NULL UNIQUE,
    conteudo_html   TEXT    NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE templates_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates visíveis por todos da organização" ON templates_documentos;
CREATE POLICY "Templates visíveis por todos autenticados" ON templates_documentos
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Apenas GOD gerencia templates" ON templates_documentos;
CREATE POLICY "Apenas GOD gerencia templates" ON templates_documentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis
            WHERE id = auth.uid()
            AND LOWER(tipo_usuario) IN ('god', 'gestor')
        )
    );

-- ============================================================
-- BLOCO 4: SEED INICIAL DE TEMPLATES (idempotente)
-- ============================================================

INSERT INTO templates_documentos (nome, tipo_documento, conteudo_html) VALUES
(
    'Notificação Inicial',
    1,
    '<h1>Notificação do Processo {numero_processo}</h1><p>Prezado {requerido_nome}, você está sendo notificado...</p>'
),
(
    'Termo de Arbitragem',
    2,
    '<h1>Termo de Arbitragem</h1><p>As partes {requerente_nome} e {requerido_nome} concordam...</p>'
)
ON CONFLICT (tipo_documento) DO UPDATE SET
    nome          = EXCLUDED.nome,
    conteudo_html = EXCLUDED.conteudo_html,
    updated_at    = timezone('utc', now());
