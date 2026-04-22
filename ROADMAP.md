# 🗺️ ROADMAP.md - InovaSys

## 📖 Visão Geral
Sistema focado em Workflow e Comunicação para Câmaras de Arbitragem.

## 📌 Status Atual
**Data:** 21 de Abril de 2026
**Fase:** Expansão e Qualidade (M5)
**Resumo:** O sistema passou por uma auditoria de governança de IA e limpeza de código. Os módulos core (1-4) estão selados e validados por testes unitários.

## 🎯 Próximos Passos (Sprints)

### 1. 🚀 Alta Performance (CONCLUÍDO)
- [x] Otimização de bundle via `manualChunks`.
- [x] Implementação de `build` otimizado para < 1s.
- [x] Limpeza de links mortos e componentes redundantes.

### 2. 📚 Microfrontend `/docs` (EM INÍCIO)
- [ ] Criar estrutura de rotas separada para documentação técnica e comercial.
- [ ] Implementar motor de busca local (Zero Latency) para artigos de ajuda.
- [ ] Integrar MDX para renderização de manuais dinâmicos.

### 3. 🧪 Qualidade & QA (EM ANDAMENTO)
- [x] Rodar ciclo de testes unitários (Vitest).
- [ ] Implementar Smoke Tests automatizados via Playwright para a Landing Page.
- [ ] Testes de estresse no Webhook do WhatsApp.

## 🛠️ Instruções de Execução
- **Gestor:** Gemini (Arquiteto)
- **Programador:** Qwen Local Coder (1.5B)
- **Regras:** Seguir estritamente as `DIRETRIZES_IA.md`. Manter o padrão Material You (MD3).
