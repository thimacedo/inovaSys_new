-- ===============================================================
-- FIX: RLS para tabela processo_counters + Trigger de numeração automática
-- Erro: "new row violates row-level security policy for table processo_counters"
-- ===============================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- ===============================================================

-- 1. Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS public.processo_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camara_id UUID REFERENCES public.camaras(id) ON DELETE CASCADE,
    organization_id UUID,
    ano INTEGER NOT NULL,
    ultimo_numero INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (camara_id, ano),
    UNIQUE (organization_id, ano)
);

-- 2. Habilitar RLS
ALTER TABLE public.processo_counters ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Counters: Leitura" ON public.processo_counters;
DROP POLICY IF EXISTS "Counters: Insercao" ON public.processo_counters;
DROP POLICY IF EXISTS "Counters: Atualizacao" ON public.processo_counters;
DROP POLICY IF EXISTS "Counters: Todos" ON public.processo_counters;

-- 4. Política de LEITURA
CREATE POLICY "Counters: Leitura"
ON public.processo_counters
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 5. Política de INSERÇÃO
CREATE POLICY "Counters: Insercao"
ON public.processo_counters
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Política de ATUALIZAÇÃO
CREATE POLICY "Counters: Atualizacao"
ON public.processo_counters
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Permissão explícita ao role authenticated
GRANT SELECT, INSERT, UPDATE ON public.processo_counters TO authenticated;

-- ===============================================================
-- FUNÇÃO SECURITY DEFINER: gera número do processo e atualiza contador
-- Roda com permissões do owner (postgres), bypassando RLS completamente
-- ===============================================================

CREATE OR REPLACE FUNCTION public.gerar_numero_processo(
    p_camara_id UUID DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ano INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
    v_numero INTEGER;
    v_prefixo TEXT := 'PROC';
BEGIN
    IF p_camara_id IS NOT NULL THEN
        INSERT INTO public.processo_counters (camara_id, organization_id, ano, ultimo_numero)
        VALUES (p_camara_id, p_organization_id, v_ano, 1)
        ON CONFLICT (camara_id, ano) DO UPDATE
            SET ultimo_numero = processo_counters.ultimo_numero + 1
        RETURNING ultimo_numero INTO v_numero;
    ELSIF p_organization_id IS NOT NULL THEN
        INSERT INTO public.processo_counters (camara_id, organization_id, ano, ultimo_numero)
        VALUES (NULL, p_organization_id, v_ano, 1)
        ON CONFLICT (organization_id, ano) DO UPDATE
            SET ultimo_numero = processo_counters.ultimo_numero + 1
        RETURNING ultimo_numero INTO v_numero;
    END IF;

    IF v_numero IS NULL THEN
        v_numero := 1;
    END IF;

    RETURN v_prefixo || '/' || v_ano || '/' || LPAD(v_numero::TEXT, 3, '0');
END;
$$;

-- Permissão para authenticated executar a função
GRANT EXECUTE ON FUNCTION public.gerar_numero_processo(UUID, UUID) TO authenticated;

-- ===============================================================
-- TRIGGER: preenche numero_processo automaticamente no INSERT
-- A função de trigger usa SECURITY DEFINER para bypassar RLS
-- ===============================================================

CREATE OR REPLACE FUNCTION public.trigger_gerar_numero_processo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Só gera se ainda não foi definido
    IF NEW.numero_processo IS NULL OR NEW.numero_processo = '' THEN
        NEW.numero_processo := public.gerar_numero_processo(
            NEW.camara_id,
            NEW.organization_id
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Remove trigger antiga se existir
DROP TRIGGER IF EXISTS set_numero_processo ON public.processos;

-- Cria a trigger BEFORE INSERT na tabela processos
CREATE TRIGGER set_numero_processo
    BEFORE INSERT ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_gerar_numero_processo();

-- ===============================================================
-- VERIFICAÇÃO: consulte as políticas criadas
-- ===============================================================
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'processo_counters';
