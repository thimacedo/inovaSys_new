-- ==========================================================
-- INOVASYS - MIGRAÇÃO DE ARBITROS.ID PARA UUID
-- ==========================================================

BEGIN;

-- 1. Criar coluna temporária UUID caso a atual seja bigint
-- Se a tabela já usa UUID mas sem FK correta, este passo garante a integridade.
-- Caso o ID seja BIGINT, precisamos converter.

-- Remover FKs dependentes temporariamente
ALTER TABLE IF EXISTS processos DROP CONSTRAINT IF EXISTS processos_arbitro_id_fkey;

-- Se o ID for BIGINT, vamos converter para UUID (gerando novos UUIDs)
-- Ou, preferencialmente, vincular ao auth.users se for um perfil.
-- No InovaSys, 'arbitros' geralmente mapeia para 'perfis'.

-- Ajuste na tabela de processos
ALTER TABLE processos 
  ALTER COLUMN arbitro_id TYPE UUID USING (arbitro_id::text::uuid);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_processos_arbitro_id ON processos(arbitro_id);

-- Restaurar FK (assumindo que aponta para perfis.id que é UUID)
ALTER TABLE processos
  ADD CONSTRAINT processos_arbitro_id_fkey 
  FOREIGN KEY (arbitro_id) REFERENCES perfis(id) ON DELETE SET NULL;

COMMIT;
