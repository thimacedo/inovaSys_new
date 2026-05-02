-- Script de Migração de Dados (Retrocompatibilidade)
-- Sincroniza a transição de camara_id para organization_id na tabela de perfis

UPDATE perfis
SET organization_id = camara_id
WHERE organization_id IS NULL AND camara_id IS NOT NULL;

-- (Opcional) Verifica se a atualização foi bem sucedida
SELECT id, nome, email, camara_id, organization_id FROM perfis WHERE tipo_usuario = 'gestor';
