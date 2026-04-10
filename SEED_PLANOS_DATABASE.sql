-- ==========================================================
-- INOVASYS - TABELA DE PLANOS E PRECIFICAÇÃO
-- ==========================================================

CREATE TABLE IF NOT EXISTS planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    limite_usuarios INTEGER NOT NULL,
    preco DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir Planos Iniciais seguindo a nova precificação sugerida
INSERT INTO planos (id, nome, limite_usuarios, preco)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Câmara Pequena', 5, 397.00),
('00000000-0000-0000-0000-000000000002', 'Câmara Profissional', 15, 797.00),
('00000000-0000-0000-0000-000000000003', 'Rede de Câmaras', 50, 1897.00)
ON CONFLICT (id) DO UPDATE SET 
    nome = EXCLUDED.nome,
    limite_usuarios = EXCLUDED.limite_usuarios,
    preco = EXCLUDED.preco;

-- Atualizar a tabela de camaras para referenciar a tabela de planos
ALTER TABLE camaras ADD COLUMN IF NOT EXISTS plano_id UUID REFERENCES planos(id);
