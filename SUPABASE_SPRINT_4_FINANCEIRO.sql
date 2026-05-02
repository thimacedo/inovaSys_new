-- 🚀 SPRINT 4: REORGANIZAÇÃO DE USUÁRIOS E FINANCEIRO PIX
-- Este script organiza as tabelas para suportar os 5 perfis oficiais e o controle de limites.

-- 1. Normalização dos Perfis
-- Garante que o banco aceite apenas os tipos definidos no InovaSys
ALTER TABLE public.perfis DROP CONSTRAINT IF EXISTS check_tipo_usuario;
ALTER TABLE public.perfis ADD CONSTRAINT check_tipo_usuario 
CHECK (tipo_usuario IN ('god', 'vendas', 'presidente', 'arbitro', 'assistente'));

-- 2. Controle de Assinaturas e Limites nas Câmaras
-- Adiciona campos de controle na tabela de câmaras/organizações
ALTER TABLE public.camaras ADD COLUMN IF NOT EXISTS plano_id UUID;
ALTER TABLE public.camaras ADD COLUMN IF NOT EXISTS limite_usuarios INTEGER DEFAULT 5;
ALTER TABLE public.camaras ADD COLUMN IF NOT EXISTS usuarios_avulsos INTEGER DEFAULT 0;

-- 3. Histórico Financeiro PIX
CREATE TABLE IF NOT EXISTS public.faturas_pix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camara_id UUID REFERENCES public.camaras(id),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Expirado')),
    pix_code TEXT, -- Código "Copia e Cola"
    criado_at TIMESTAMPTZ DEFAULT now(),
    pago_at TIMESTAMPTZ
);

-- 4. Função para Validar Limites (Prevenção de Cadastro acima do limite)
CREATE OR REPLACE FUNCTION public.validar_limite_usuarios()
RETURNS TRIGGER AS $$
DECLARE
    v_total_atual INTEGER;
    v_limite_total INTEGER;
BEGIN
    -- Se for God ou Vendas (SaaS), não há limite
    IF NEW.tipo_usuario IN ('god', 'vendas') THEN
        RETURN NEW;
    END IF;

    -- Conta usuários atuais da câmara
    SELECT count(*) INTO v_total_atual 
    FROM public.perfis 
    WHERE camara_id = NEW.camara_id;

    -- Pega o limite total (Base + Avulsos)
    SELECT (limite_usuarios + usuarios_avulsos) INTO v_limite_total
    FROM public.camaras
    WHERE id = NEW.camara_id;

    IF v_total_atual >= v_limite_total THEN
        RAISE EXCEPTION 'Limite de usuários atingido para esta Câmara. Adquira mais assentos via PIX.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para aplicar a validação
DROP TRIGGER IF EXISTS tr_validar_limite ON public.perfis;
CREATE TRIGGER tr_validar_limite
BEFORE INSERT ON public.perfis
FOR EACH ROW EXECUTE FUNCTION public.validar_limite_usuarios();
