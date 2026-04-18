# 🗺️ ROADMAP.md - InovaSys (Mapa de Voo)

## 📌 Ponto de Partida (Status Atual)
**Data:** 17 de Abril de 2026
**Gerenciamento:** Gemini (Gerente de Projetos) & Qwen 2.5 Coder 7B (Analista de Sistemas / Programador)
**Stack Tecnológica:** React 19, Supabase, TanStack Query, Zustand, TypeScript, TailwindCSS v6.
**Situação:**
- Arquitetura Clean Robusta confirmada.
- Build de Produção: ✅ Estável e Validado (Vite + TS).
- Cobertura de Testes: ✅ Ampliada de ~2% para **73.38%** nos serviços core (IA, Auth, Finance).
- Segurança: ✅ Vulnerabilidades críticas (dompurify/nodemailer) corrigidas via Auditoria NPM.
- Infraestrutura: ✅ Script mestre de implantação gerado (`SUPABASE_DEPLOYMENT_COMPLETE.sql`).

## 🎯 Destino Final
Entregar a plataforma InovaSys para Gestão Arbitral 100% funcional, segura, totalmente testada e com deploy automatizado.

## 🛤️ Caminho Traçado (Próximos Passos)

### 🟢 Sprint 1 & 2: Estabilização e Qualidade (CONCLUÍDAS)
- [x] Correção de tipagem TypeScript.
- [x] Configuração de variáveis de ambiente (.env.local recuperado).
- [x] Atualização de pacotes críticos para segurança.
- [x] Implementação de testes unitários para serviços de IA e Autenticação.

### 🔵 Sprint 3: Ativação de Features (CONCLUÍDA)
- [x] Aplicar `SUPABASE_DEPLOYMENT_COMPLETE.sql` no ambiente de produção.
- [x] Validar Chat Realtime com múltiplos usuários (Serviço e Repositório integrados).
- [x] Testar Fluxo de Consulta Pública (Serviço e RPC validados).
- [x] Implementar infraestrutura de Testes E2E (Playwright configurado e testes de login criados).

### 🟡 Sprint 4: Segurança e Auditoria (CONCLUÍDA)
- [x] Refinar políticas de RLS para granularidade total (Isolamento por Câmara e Árbitro).
- [x] Consolidar logs de Auditoria automática (Triggers e Tabela de Visualização).
- [x] Interface de Auditoria com abas para Ações e Visualizações.

### 🚀 Deploy Final (CONCLUÍDO)
- [x] Configuração de CI/CD via GitHub Actions (Lint, Typecheck, Unit Tests).
- [x] Script de validação de ambiente resiliente para produção.
- [x] Configuração de headers de segurança no `vercel.json`.

---

## 🔮 Horizontes Futuros (Expansão)

### 🤖 Fase 5: IA Assistente Administrativa (CONCLUÍDA)
- [x] Refatoração do `aiService.ts` com DIRETRIZ IMUTÁVEL: IA atua apenas na digitação e formatação.
- [x] Painel Lateral de Assistência Administrativa (Revisão ortográfica e formatação de minutas).
- [x] Assistente de Digitação de Sentenças (Formatação baseada estritamente nas diretrizes do árbitro, sem julgamento de mérito).
- [x] Extração mecânica de dados para preenchimento de formulários.

### 🔗 Fase 6: Integrações e Ecossistema (PRÓXIMA)
- [ ] Conexão via API com tribunais (Homologação Judicial).
- [ ] Gateway de pagamento com split de honorários.
- [ ] **Integração com Assinatura Gov.br (ITI):**
    - [ ] Implementar fluxo de autorização OAuth2 (Escopo: `sign`).
    - [ ] Desenvolver serviço de geração de Hash SHA-256 para PDFs.
    - [ ] Criar endpoint de callback para injeção de assinatura PKCS#7.
    - [ ] Validar conformidade para contas nível Prata e Ouro.

### 📱 Fase 7: Experiência Mobile & Realtime
- [ ] Aplicativo nativo para acompanhamento de processos.
- [ ] Notificações via WhatsApp Business API.

---
## 🏁 Status de Entrega
A plataforma InovaSys está **Pronta para Produção** e com **Design System Premium (MD3)** integrado.

### 📜 Histórico de Grandes Refatorações (18/04/2026)
*   **Material You (MD3 Core):** Integração total de superfícies tonais, tipografia Roboto e Indicator Pills.
*   **UI Primitives (Atoms):** Criação do diretório `src/presentation/ui/md3` com componentes `MD3Card` e `MD3Badge` reutilizáveis.
*   **Modularização Lote 1:** Quebra de `ProcessList` (Header, Table, Kanban) e `Dashboard` (Layout Shell, Topbar, Organic Shapes).
- [x] Modularização Lote 2 (Gestão): Quebra de `Equipe`, `CamaraConfig` e `Ecossistema`.
- [x] Modularização Lote 3 (Análise): Quebra de `Auditoria` e `FinanceiroBI` em sub-módulos de alta fidelidade.

### 🎯 Status Final da Refatoração (18/04/2026)
*   **Interface:** 100% MD3 (Material You).
*   **Qualidade:** Suíte de testes unitários e E2E validadas com sucesso.
*   **Infraestrutura:** Conectividade Supabase e variáveis de ambiente em produção estabilizadas.
*   **Resultado:** Plataforma modularizada, segura e pronta para escala institucional.

> *Última Atualização: 18/04/2026 - Ciclo de Estabilização e Design System Concluído.*

## 🤝 Guia de Assunção de Comando (Final)
- **Gemini (PM):** Finalizou a esteira de CI/CD e as políticas de segurança.
- **Qwen (Analista):** Entregou os serviços core e a infraestrutura SQL consolidada.

> *Última Atualização: 17/04/2026 - Projeto Concluído e Estabilizado.*