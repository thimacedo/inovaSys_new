-- ===============================================================
-- SUPABASE RLS POLICIES V2 - INOVASYS (Gestor, Controle, Admin, Árbitro, Assistente)
-- ===============================================================
-- Este arquivo substitui as políticas antigas para implementar o isolamento 
-- rigoroso exigido por ambientes Enterprise com o novo RBAC de 5 níveis.

-- 1. Habilitar RLS estrito em todas as tabelas sensíveis
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- 2. Recriar Funções Auxiliares (Otimizadas para Cache / STABLE)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT tipo_usuario FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS uuid AS $$
  SELECT organization_id FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_camara()
RETURNS uuid AS $$
  SELECT camara_id FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 3. Limpar políticas obsoletas antigas (Prevenção de conflito)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ===============================================================
-- VERDADEIRAS POLÍTICAS PARA: TABELA 'processos'
-- ===============================================================

-- SELECT: 
-- Gestor e Controle veem TUDO.
-- Admin e Assistente veem os processos de sua própria Câmara (ou Organização).
-- Árbitro vê os processos de sua Câmara APENAS SE ele for o arbitro_id designado (Isolamento Máximo).
CREATE POLICY "Processos: Leitura Restrita" ON public.processos
  FOR SELECT
  USING (
    get_user_role() IN ('gestor', 'controle')
    OR
    (get_user_role() IN ('admin', 'assistente') AND camara_id = get_user_camara())
    OR
    (get_user_role() = 'arbitro' AND arbitro_id = auth.uid())
  );

-- INSERT:
-- Gestor e Controle podem criar em qualquer lugar.
-- Admin e Assistente podem criar apenas dentro da sua própria Câmara.
-- Árbitro NÃO pode criar novos processos do zero.
CREATE POLICY "Processos: Inserção" ON public.processos
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('gestor', 'controle')
    OR
    (get_user_role() IN ('admin', 'assistente') AND camara_id = get_user_camara())
  );

-- UPDATE (Edição / Andamento):
-- Gestor pode alterar qualquer coisa TUDO.
-- Admin altera qualquer coisa na sua Câmara.
-- Árbitro só altera dados do processo SE ele for designado ao processo.
-- Assistente NÃO altera processo. Controle NÃO altera processo.
CREATE POLICY "Processos: Atualização" ON public.processos
  FOR UPDATE
  USING (
    get_user_role() = 'gestor'
    OR
    (get_user_role() = 'admin' AND camara_id = get_user_camara())
    OR
    (get_user_role() = 'arbitro' AND arbitro_id = auth.uid())
  )
  WITH CHECK (
    get_user_role() = 'gestor'
    OR
    (get_user_role() = 'admin' AND camara_id = get_user_camara())
    OR
    (get_user_role() = 'arbitro' AND arbitro_id = auth.uid())
  );

-- DELETE:
-- Apenas Gestor pode deletar qualquer coisa.
-- Admin pode deletar na sua Câmara.
-- Ninguém mais deleta processos legais.
CREATE POLICY "Processos: Exclusão" ON public.processos
  FOR DELETE
  USING (
    get_user_role() = 'gestor'
    OR
    (get_user_role() = 'admin' AND camara_id = get_user_camara())
  );

-- ===============================================================
-- POLÍTICAS PARA: TABELA 'perfis' (Equipe)
-- ===============================================================

-- SELECT:
-- Gestor e Controle = TUDO.
-- Resto = Somente sua própria organização/câmara.
CREATE POLICY "Perfis: Leitura" ON public.perfis
  FOR SELECT
  USING (
    get_user_role() IN ('gestor', 'controle')
    OR
    (camara_id = get_user_camara() OR organization_id = get_user_organization())
  );

-- UPDATE:
-- Gestor = TUDO.
-- Admin = Pode atualizar perfis da sua câmara.
-- Outros = Só podem atualizar a si mesmos.
CREATE POLICY "Perfis: Atualização" ON public.perfis
  FOR UPDATE
  USING (
    get_user_role() = 'gestor'
    OR (get_user_role() = 'admin' AND camara_id = get_user_camara())
    OR id = auth.uid()
  )
  WITH CHECK (
    get_user_role() = 'gestor'
    OR (get_user_role() = 'admin' AND camara_id = get_user_camara())
    OR id = auth.uid()
  );

-- ===============================================================
-- POLÍTICAS PARA: TABELA 'notificacoes'
-- ===============================================================

CREATE POLICY "Notificacoes: Leitura" ON public.notificacoes
  FOR SELECT
  USING (auth.uid() = user_id OR get_user_role() = 'gestor');

CREATE POLICY "Notificacoes: Atualizacao" ON public.notificacoes
  FOR UPDATE
  USING (auth.uid() = user_id OR get_user_role() = 'gestor');

CREATE POLICY "Notificacoes: Insercao" ON public.notificacoes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
