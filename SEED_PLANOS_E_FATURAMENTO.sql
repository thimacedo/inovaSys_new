-- ==================================================
-- MÓDULO DE FATURAMENTO STRIPE - SUPABASE DATABASE
-- ==================================================

-- Adicionar colunas para Stripe na tabela camaras
ALTER TABLE public.camaras
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS status_assinatura TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS plano_id UUID REFERENCES public.planos(id);

-- Criar índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_camaras_stripe_customer ON public.camaras(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_camaras_status_assinatura ON public.camaras(status_assinatura);

-- Criar tabela de planos (se não existir)
CREATE TABLE IF NOT EXISTS public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_mensal DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT NOT NULL UNIQUE,
  limites JSONB DEFAULT '{}',
  destaque BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de faturas
CREATE TABLE IF NOT EXISTS public.faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camara_id UUID REFERENCES public.camaras(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para faturas
CREATE INDEX IF NOT EXISTS idx_faturas_camara_id ON public.faturas(camara_id);
CREATE INDEX IF NOT EXISTS idx_faturas_stripe_invoice ON public.faturas(stripe_invoice_id);

-- Habilitar RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Planos são visíveis para todos" ON public.planos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Usuários veem apenas faturas da sua câmara" ON public.faturas
  FOR SELECT USING (
    camara_id IN (
      SELECT camara_id FROM public.membros WHERE user_id = auth.uid()
    )
  );

-- Inserir planos padrão
INSERT INTO public.planos (nome, descricao, preco_mensal, stripe_price_id, limites, destaque, ativo)
VALUES
  ('Básico', 'Para câmaras pequenas com até 50 processos', 99.90, 'price_basic', '{"max_processos": 50, "max_usuarios": 5, "suporte_email": true}', false, true),
  ('Profissional', 'Para câmaras em crescimento', 199.90, 'price_pro', '{"max_processos": 200, "max_usuarios": 15, "suporte_email": true, "suporte_telefone": true}', true, true),
  ('Enterprise', 'Para redes de câmaras e alta demanda', 499.90, 'price_enterprise', '{"max_processos": 999999, "max_usuarios": 999999, "suporte_email": true, "suporte_telefone": true, "suporte_prioritario": true}', false, true)
ON CONFLICT (stripe_price_id) DO NOTHING;