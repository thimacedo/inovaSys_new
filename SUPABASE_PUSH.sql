-- ==========================================================
-- INOVASYS - SUPORTE A NOTIFICAÇÕES PUSH (PWA)
-- ==========================================================

-- 1. Tabela para armazenar assinaturas de Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    device_type TEXT, -- 'mobile', 'desktop'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, subscription_json)
);

-- 2. Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
DROP POLICY IF EXISTS "Usuários gerenciam suas assinaturas" ON push_subscriptions;
CREATE POLICY "Usuários gerenciam suas assinaturas" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 4. Funções de Gatilho (Opcional: Limpeza de assinaturas antigas)
-- No futuro, pode-se adicionar uma função para disparar via Edge Functions.
