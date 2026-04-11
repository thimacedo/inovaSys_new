-- ==========================================================
-- INOVASYS - CORREÇÃO DA FK fk_processos_arbitro
-- Garante que arbitro_id seja nullable e aponte para perfis
-- ==========================================================

BEGIN;

-- 1. Remover a constraint problemática (qualquer nome que exista)
ALTER TABLE IF EXISTS processos DROP CONSTRAINT IF EXISTS fk_processos_arbitro;
ALTER TABLE IF EXISTS processos DROP CONSTRAINT IF EXISTS processos_arbitro_id_fkey;

-- 2. Garantir que a coluna aceita NULL
ALTER TABLE processos ALTER COLUMN arbitro_id DROP NOT NULL;

-- 3. Garantir que o tipo é UUID
ALTER TABLE processos
  ALTER COLUMN arbitro_id TYPE UUID USING (
    CASE 
      WHEN arbitro_id IS NULL OR arbitro_id::text = '' THEN NULL
      ELSE arbitro_id::text::uuid
    END
  );

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_processos_arbitro_id ON processos(arbitro_id);

-- 5. Recriar FK apontando para perfis.id (árbitros são perfis no InovaSys)
--    com ON DELETE SET NULL para não bloquear exclusão de perfis
ALTER TABLE processos
  ADD CONSTRAINT fk_processos_arbitro
  FOREIGN KEY (arbitro_id) 
  REFERENCES perfis(id) 
  ON DELETE SET NULL;

-- 6. Garantir que a tabela arbitros existe e tem dados de exemplo
--    (caso o sistema use tabela separada de árbitros)
CREATE TABLE IF NOT EXISTS public.arbitros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  camara_id UUID REFERENCES camaras(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Habilitar RLS na tabela arbitros
ALTER TABLE public.arbitros ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para arbitros
DROP POLICY IF EXISTS "Usuários autenticados podem ver árbitros" ON public.arbitros;
CREATE POLICY "Usuários autenticados podem ver árbitros"
ON public.arbitros FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins podem gerenciar árbitros" ON public.arbitros;
CREATE POLICY "Admins podem gerenciar árbitros"
ON public.arbitros FOR ALL
USING (auth.uid() IS NOT NULL);

-- 9. Grant de acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.arbitros TO authenticated;

COMMIT;

-- ==========================================================
-- VERIFICAÇÃO: Execute após o script para confirmar
-- ==========================================================
-- SELECT conname, confrelid::regclass, confdeltype 
-- FROM pg_constraint 
-- WHERE conname LIKE '%arbitro%';
--
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'processos' AND column_name = 'arbitro_id';
