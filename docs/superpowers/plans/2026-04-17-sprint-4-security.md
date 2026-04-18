# InovaSys Sprint 4: Segurança e Auditoria

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar as políticas de Row Level Security (RLS) para garantir isolamento total entre câmaras e usuários, e consolidar o sistema de auditoria para conformidade legal (compliance).

**Architecture:** Segurança baseada em políticas nativas do PostgreSQL (Supabase RLS) e auditoria híbrida (Front-end para eventos de UI e Triggers para mudanças de dados).

**Tech Stack:** Supabase (RLS, PL/pgSQL), TypeScript, React Hooks.

---

### Task 1: Consolidação de RLS e Esquema de Auditoria

**Files:**
- Create: `E:\inovasys\SUPABASE_SPRINT_4_SECURITY.sql`
- Update: `E:\inovasys\DIAGNOSTICO_SISTEMA.md`

- [ ] **Step 1: Criar Script de Segurança Consolidado**
Implementar RLS para TODAS as tabelas críticas com isolamento por `camara_id`.

```sql
-- Habilitar RLS em tudo
ALTER TABLE camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_processo ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_assinados ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_visualizacao ENABLE ROW LEVEL SECURITY;

-- Políticas de Processos (Refinado)
DROP POLICY IF EXISTS "Processos: Isolamento Total" ON public.processos;
CREATE POLICY "Processos: Isolamento Total" ON public.processos
  FOR ALL USING (
    get_user_role() = 'god' OR 
    (camara_id = get_user_camara() AND get_user_role() IN ('gestor', 'admin', 'controle', 'assistente')) OR
    (arbitro_id = auth.uid())
  );

-- Políticas de Mensagens (Vincular ao acesso do processo)
DROP POLICY IF EXISTS "Mensagens: Acesso via Processo" ON public.mensagens_processo;
CREATE POLICY "Mensagens: Acesso via Processo" ON public.mensagens_processo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM processos p 
      WHERE p.id = mensagens_processo.processo_id
    )
  );
```

- [ ] **Step 2: Implementar Trigger de Auditoria Automática**
Criar função e trigger para registrar mudanças em `processos` e `financeiro`.

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS trigger AS $$
BEGIN
  INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, dados_novos)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, (CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END), row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_processos_trigger AFTER INSERT OR UPDATE OR DELETE ON processos FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Task 2: Refinamento do AuditService no Frontend

**Files:**
- Modify: `E:\inovasys\src\services\auditService.ts`
- Modify: `E:\inovasys\src\components\DocumentPreview.tsx`

- [ ] **Step 1: Melhorar Captura de IP e Contexto**
Otimizar `registrarVisualizacao` para ser mais resiliente e capturar metadados extras.

- [ ] **Step 2: Integrar Auditoria de Visualização**
Garantir que todos os componentes de visualização de documentos chamem `auditService.registrarVisualizacao`.

### Task 3: Dashboards de Auditoria e Segurança

**Files:**
- Modify: `E:\inovasys\src\components\Auditoria.tsx`
- Modify: `E:\inovasys\src\components\ProcessAudit.tsx`

- [ ] **Step 1: Interface de Logs de Visualização**
Adicionar a lista de visualizações de documentos na aba de Auditoria do processo.

- [ ] **Step 2: Filtros por Usuário e Ação**
Permitir que o Gestor filtre os logs por árbitro ou tipo de ação (ex: "Exclusão de Anexo").

### Task 4: Validação Final e Roadmap

- [ ] **Step 1: Testar RLS via SQL Editor ou Código**
Tentar ler um processo de outra câmara usando o `processService` e validar que retorna nulo/vazio.

- [ ] **Step 2: Atualizar ROADMAP.md**
Concluir a Sprint 4 e planejar o Deploy Final.
