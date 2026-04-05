-- ===============================================================
-- SUPABASE RLS POLICIES - MULTI-TENANT ARCHITECTURE
-- ===============================================================
-- Este arquivo contém as políticas de Row Level Security (RLS)
-- para implementar o isolamento entre organizações (tenants)
-- e o controle de acesso baseado em funções (RBAC).

-- ===============================================================
-- Modelo de Dados Assumido
-- ===============================================================
-- 
-- Tabela: processos
--   - id: uuid (primary key)
--   - numero_processo: text (required)
--   - requerente_nome: text (required)
--   - status: text (required)
--   - org_id: uuid (required) - ID da organização (tenant)
--   - camara_id: uuid (optional) - ID da câmara vinculada
--   - arbitro_id: uuid (optional) - ID do árbitro responsável
--   - user_id: uuid (required) - ID do criador
--
-- Tabela: perfis
--   - id: uuid (primary key) - Corresponde ao auth.uid()
--   - email: text (required)
--   - tipo_usuario: text (required) - ['member', 'admin', 'owner', 'gestor', 'arbitro', 'god']
--   - org_id: uuid (required) - ID da organização (tenant)
--
-- ===============================================================

-- 1. Habilitar RLS nas tabelas
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- 2. Funções Auxiliares de Segurança
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid AS $$
  SELECT org_id FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT tipo_usuario FROM perfis WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- ===============================================================
-- POLÍTICAS PARA A TABELA 'processos'
-- ===============================================================

-- SELECT: Todos os membros da organização podem ver os processos dela
CREATE POLICY "Visualização por Organização" ON processos
  FOR SELECT
  USING (org_id = get_user_org_id());

-- INSERT: Membros, Admins e Owners podem criar processos na sua organização
CREATE POLICY "Criação por Organização" ON processos
  FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id() AND
    get_user_role() IN ('member', 'admin', 'owner', 'gestor', 'arbitro')
  );

-- UPDATE: Regras de Estado (State Machine)
-- Membros só editam se não estiver 'published'
CREATE POLICY "Edição Restrita (Membros)" ON processos
  FOR UPDATE
  USING (
    org_id = get_user_org_id() AND
    get_user_role() IN ('member', 'arbitro') AND
    status NOT IN ('published', 'Concluído')
  )
  WITH CHECK (
    status NOT IN ('published', 'Concluído')
  );

-- Admins e Owners podem editar qualquer processo da organização (Bypass)
CREATE POLICY "Edição Total (Admin/Owner)" ON processos
  FOR UPDATE
  USING (
    org_id = get_user_org_id() AND
    get_user_role() IN ('admin', 'owner', 'gestor', 'god')
  );

-- DELETE: Apenas Admins e Owners podem deletar
CREATE POLICY "Exclusão Restrita (Admin/Owner)" ON processos
  FOR DELETE
  USING (
    org_id = get_user_org_id() AND
    get_user_role() IN ('admin', 'owner', 'gestor', 'god')
  );

-- ===============================================================
-- POLÍTICAS PARA A TABELA 'camaras'
-- ===============================================================

CREATE POLICY "Leitura de Câmaras da Org" ON camaras
  FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Gestão de Câmaras (Admin/Owner)" ON camaras
  FOR ALL
  USING (
    org_id = get_user_org_id() AND
    get_user_role() IN ('admin', 'owner', 'gestor', 'god')
  );

-- ===============================================================
-- POLÍTICAS PARA A TABELA 'perfis'
-- ===============================================================

CREATE POLICY "Leitura de Membros da Org" ON perfis
  FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Gestão de Membros (Admin/Owner)" ON perfis
  FOR UPDATE
  USING (
    org_id = get_user_org_id() AND
    get_user_role() IN ('admin', 'owner', 'gestor', 'god') AND
    id != auth.uid() -- Bloqueio contra auto-exclusão/auto-rebaixamento
  );
