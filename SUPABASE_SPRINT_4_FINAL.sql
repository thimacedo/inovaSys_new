-- 🚀 SPRINT 4 (REVISADA): INFRAESTRUTURA DE USUÁRIOS E FINANCEIRO PIX
-- Alinhado com o Schema Real do Supabase InovaSys

-- 1. Estabilização de Perfis (Roles Oficiais)
-- Nota: O campo tipo_usuario agora suporta a hierarquia SaaS e Câmara.
ALTER TABLE public.perfis DROP CONSTRAINT IF EXISTS check_tipo_usuario;
ALTER TABLE public.perfis ADD CONSTRAINT check_tipo_usuario 
CHECK (tipo_usuario IN ('god', 'vendas', 'presidente', 'arbitro', 'assistente', 'operador'));

-- Migração de legados (Opcional, para manter compatibilidade)
UPDATE public.perfis SET tipo_usuario = 'presidente' WHERE tipo_usuario IN ('admin', 'gestor');
UPDATE public.perfis SET tipo_usuario = 'assistente' WHERE tipo_usuario = 'operador';

-- 2. Reforço de Limites na Tabela de Câmaras
-- A tabela real já possui 'limite_usuarios_extra', vamos garantir a lógica.
COMMENT ON COLUMN public.camaras.limite_usuarios_extra IS 'Quantidade de assentos avulsos adquiridos via PIX';

-- 3. Criação da Tabela de Faturas PIX (Centro de Recebimento)
CREATE TABLE IF NOT EXISTS public.faturas_pix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camara_id UUID REFERENCES public.camaras(id),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Expirado', 'Cancelado')),
    pix_payload TEXT, -- Para o "Copia e Cola"
    criado_at TIMESTAMPTZ DEFAULT now(),
    pago_at TIMESTAMPTZ,
    validado_por UUID REFERENCES public.perfis(id) -- ID do 'god' que confirmou
);

-- 4. Trigger de Segurança: Bloqueio de Over-Quota
-- Impede a criação de novos usuários se o limite do plano + extras for atingido.
CREATE OR REPLACE FUNCTION public.check_user_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_limit_base INTEGER;
    v_limit_extra INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Ignora limites para administradores do sistema (SaaS)
    IF NEW.tipo_usuario IN ('god', 'vendas') THEN
        RETURN NEW;
    END IF;

    -- Busca o limite base definido no plano vinculado à câmara
    SELECT p.limite_usuarios INTO v_limit_base
    FROM public.planos p
    JOIN public.camaras c ON c.plano_id = p.id
    WHERE c.id = NEW.camara_id;

    -- Busca o limite extra (compras avulsas)
    SELECT limite_usuarios_extra INTO v_limit_extra
    FROM public.camaras
    WHERE id = NEW.camara_id;

    -- Conta usuários ativos (excluindo os de nível SaaS)
    SELECT count(*) INTO v_current_count
    FROM public.perfis
    WHERE camara_id = NEW.camara_id 
    AND tipo_usuario NOT IN ('god', 'vendas');

    IF v_current_count >= (COALESCE(v_limit_base, 3) + COALESCE(v_limit_extra, 0)) THEN
        RAISE EXCEPTION 'Limite de assentos da Câmara atingido (%/%). Adquira mais assentos via PIX no Painel Financeiro.', v_current_count, (COALESCE(v_limit_base, 3) + COALESCE(v_limit_extra, 0));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_user_limits ON public.perfis;
CREATE TRIGGER tr_check_user_limits
BEFORE INSERT ON public.perfis
FOR EACH ROW EXECUTE FUNCTION public.check_user_limits();

-- 5. Comentários para IA e Documentação
COMMENT ON TABLE public.perfis IS 'Perfis de usuários: god (SaaS Admin), vendas (SaaS Sales), presidente (Chamber Admin), arbitro (Executor), assistente (Operacional)';
