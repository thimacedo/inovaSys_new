-- ===============================================================
-- 🛡️ INOVASYS - SCRIPT MESTRE DE SEGURANÇA E RLS (Sprint 4)
-- Garantindo isolamento total entre Câmaras e Usuários
-- ===============================================================

-- 1. Garantir colunas de isolamento
ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS camara_id UUID REFERENCES public.camaras(id);
ALTER TABLE public.logs_visualizacao ADD COLUMN IF NOT EXISTS camara_id UUID REFERENCES public.camaras(id);

-- 2. Habilitar RLS em todas as tabelas críticas
ALTER TABLE public.camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_processo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_assinados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_visualizacao ENABLE ROW LEVEL SECURITY;

-- 3. Funções de Apoio
CREATE OR REPLACE FUNCTION get_user_role() RETURNS text AS $$
    SELECT tipo_usuario FROM public.perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_camara() RETURNS uuid AS $$
    SELECT camara_id FROM public.perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 4. Políticas para PROCESSOS (Isolamento por Câmara / Árbitro)
DROP POLICY IF EXISTS "Processos: Isolamento Total" ON public.processos;
CREATE POLICY "Processos: Isolamento Total" ON public.processos
    FOR ALL USING (
        get_user_role() = 'god' OR 
        (camara_id = get_user_camara() AND get_user_role() IN ('gestor', 'admin', 'controle', 'assistente')) OR
        (arbitro_id = auth.uid()) OR
        (user_id = auth.uid())
    );

-- 5. Políticas para ANEXOS (Herda acesso do processo)
DROP POLICY IF EXISTS "Anexos: Acesso via Processo" ON public.anexos;
CREATE POLICY "Anexos: Acesso via Processo" ON public.anexos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.processos p 
            WHERE p.id = anexos.processo_id
        )
    );

-- 6. Políticas para MENSAGENS (Herda acesso do processo)
DROP POLICY IF EXISTS "Mensagens: Acesso via Processo" ON public.mensagens_processo;
CREATE POLICY "Mensagens: Acesso via Processo" ON public.mensagens_processo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.processos p 
            WHERE p.id = mensagens_processo.processo_id
        )
    );

-- 7. Políticas para DOCUMENTOS ASSINADOS (Herda acesso do processo)
DROP POLICY IF EXISTS "Documentos: Acesso via Processo" ON public.documentos_assinados;
CREATE POLICY "Documentos: Acesso via Processo" ON public.documentos_assinados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.processos p 
            WHERE p.id = documentos_assinados.processo_id
        )
    );

-- 8. Políticas para PERFIS (Somente mesma câmara ou God)
DROP POLICY IF EXISTS "Perfis: Isolamento por Câmara" ON public.perfis;
CREATE POLICY "Perfis: Isolamento por Câmara" ON public.perfis
    FOR SELECT USING (
        get_user_role() = 'god' OR
        camara_id = get_user_camara()
    );

DROP POLICY IF EXISTS "Perfis: Atualização Própria" ON public.perfis;
CREATE POLICY "Perfis: Atualização Própria" ON public.perfis
    FOR UPDATE USING (auth.uid() = id);

-- 9. Políticas para AUDITORIA e LOGS (Isolamento por Câmara)
DROP POLICY IF EXISTS "Auditoria: Somente Gestores" ON public.auditoria;
CREATE POLICY "Auditoria: Somente Gestores" ON public.auditoria
    FOR SELECT USING (
        get_user_role() = 'god' OR
        camara_id = get_user_camara()
    );

DROP POLICY IF EXISTS "Logs Visualização: Somente Gestores" ON public.logs_visualizacao;
CREATE POLICY "Logs Visualização: Somente Gestores" ON public.logs_visualizacao
    FOR SELECT USING (
        get_user_role() = 'god' OR
        camara_id = get_user_camara() OR
        (processo_id IN (SELECT id FROM processos))
    );

-- 10. Sistema de Auditoria Automática (Triggers)
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS trigger AS $$
DECLARE
    v_camara_id UUID;
BEGIN
    -- Tenta obter camara_id do registro se existir, senão do perfil do usuário
    IF TG_TABLE_NAME = 'processos' THEN
        v_camara_id := (CASE WHEN TG_OP = 'DELETE' THEN OLD.camara_id ELSE NEW.camara_id END);
    ELSIF TG_TABLE_NAME = 'financeiro' THEN
        v_camara_id := (CASE WHEN TG_OP = 'DELETE' THEN OLD.organization_id ELSE NEW.organization_id END);
    ELSE
        SELECT camara_id INTO v_camara_id FROM public.perfis WHERE id = auth.uid();
    END IF;

    INSERT INTO public.auditoria (usuario_id, acao, tabela, registro_id, dados_novos, camara_id)
    VALUES (
        auth.uid(), 
        TG_OP, 
        TG_TABLE_NAME, 
        (CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END), 
        (CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END),
        v_camara_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar Triggers
DROP TRIGGER IF EXISTS audit_processos_trigger ON public.processos;
CREATE TRIGGER audit_processos_trigger AFTER INSERT OR UPDATE OR DELETE ON public.processos 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_financeiro_trigger ON public.financeiro;
CREATE TRIGGER audit_financeiro_trigger AFTER INSERT OR UPDATE OR DELETE ON public.financeiro 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
