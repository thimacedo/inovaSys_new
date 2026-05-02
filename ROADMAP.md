# ROADMAP: InovaSys ERP

## Visão Geral
Sistema de gestão administrativa e financeira modular para câmaras e instituições públicas.

## Status Atual
- [x] Base de dados configurada no Supabase e credenciais de acesso normalizadas.
- [x] Autenticação e Gestão de Usuários (Refatorados para Strong Typing).
- [x] Módulo Financeiro avançado (PIX) com UI/UX focada e tipada.
- [x] Limpeza e Consolidação: Projetos na Unidade E; Refatoração Implacável e Clean Code aplicados aos componentes core.
- [ ] Dashboards de Auditoria.
- [ ] Módulo de Assinaturas (Stripe/Pix).

## Próximos Passos
1. Implementar logs de auditoria em tempo real nas tabelas críticas (próximo Sprint).
2. Finalizar integração completa do Stripe Checkout para os planos e gestão de assinaturas recorrentes.
3. Refatorar componentes de UI para acessibilidade (WCAG) conforme padronização do MD3 adotada.

## Instruções de Execução
- Manter o foco em estabilidade, segurança e evitar tipagem insegura (any).
- Seguir o padrão de entidades definidas em src/core/domain/entities para expansão da base de código.
