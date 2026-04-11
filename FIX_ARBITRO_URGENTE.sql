-- ==========================================================
-- INOVASYS - CORREÇÃO URGENTE: FK arbitro_id
-- Execute este script no Supabase Dashboard → SQL Editor
-- ==========================================================

-- Remove TODAS as constraints relacionadas a arbitro_id
ALTER TABLE processos DROP CONSTRAINT IF EXISTS fk_processos_arbitro;
ALTER TABLE processos DROP CONSTRAINT IF EXISTS processos_arbitro_id_fkey;
ALTER TABLE processos DROP CONSTRAINT IF EXISTS processos_arbitro_id_fkey1;

-- Garante que a coluna aceita NULL (árbitro é designado depois)
ALTER TABLE processos ALTER COLUMN arbitro_id DROP NOT NULL;

-- Converte string vazia para NULL em registros existentes
UPDATE processos SET arbitro_id = NULL WHERE arbitro_id::text = '';

-- Recria a FK apontando para perfis.id com ON DELETE SET NULL
ALTER TABLE processos
  ADD CONSTRAINT fk_processos_arbitro
  FOREIGN KEY (arbitro_id)
  REFERENCES perfis(id)
  ON DELETE SET NULL;

-- Confirmação
SELECT 
  conname AS constraint_name,
  confrelid::regclass AS references_table,
  CASE confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'n' THEN 'SET NULL' END AS on_delete
FROM pg_constraint
WHERE conname = 'fk_processos_arbitro';
