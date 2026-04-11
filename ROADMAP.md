# 🗺️ Roadmap de Evolução - InovaSys

Este documento descreve as fases planejadas para a estabilização, expansão e evolução da plataforma InovaSys.

---

## 🛠️ Fase 1 — Estabilização (Semanas 1–2)
**Foco:** Reforçar a infraestrutura, segurança e integridade dos dados para garantir uma base sólida para produção.

| Prioridade | Tarefa | Arquivo Afetado | Status |
| :--- | :--- | :--- | :--- |
| 🔴 **Alta** | Implementar validação de env em runtime | `scripts/validate-env.mjs` | ✅ Concluído |
| 🔴 **Alta** | Ampliar cobertura de testes para ≥ 30% | `src/test/` | ✅ Concluído |
| 🔴 **Alta** | Integrar tabela auditoria no frontend | `src/services/auditoriaService.ts` | ✅ Concluído |
| 🟠 **Média** | Substituir mock de e-mail por Resend/SMTP real | `server.ts` / `api/vercel/email` | ✅ Concluído |
| 🟠 **Média** | Corrigir schema financeiro (campo organization_id com FK explícita) | `SUPABASE_REPAIR.sql` | ✅ Concluído |

---

## 🚀 Fase 2 — Funcionalidades Core (Semanas 3–5)
**Foco:** Entrega de valor direto ao usuário final e automação de processos críticos.

| Prioridade | Tarefa | Observação | Status |
| :--- | :--- | :--- | :--- |
| 🔴 **Alta** | Central de Notificações | Realtime via Supabase WebSocket | ✅ Concluído |
| 🔴 **Alta** | Geração de documentos em lote | Integrar `html2pdf.js` já instalado | ✅ Concluído |
| 🟠 **Média** | Integração Clicksign/DocuSign | Edge Function Supabase (coluna `signature_api_token`) | 🕒 Planejado |
| 🟠 **Média** | E-mail Service 2.0 com templates | Requer logo por organização | 🕒 Planejado |
| 🟡 **Baixa** | App Mobile PWA | Testes em dispositivos reais (Manifest configurado) | 🕒 Planejado |

---

## 🏢 Fase 3 — Expansão Enterprise (Semanas 6–9)
**Foco:** Inteligência artificial, métricas avançadas e monetização.

| Prioridade | Tarefa | Observação | Status |
| :--- | :--- | :--- | :--- |
| 🟠 **Média** | Wiki IA (Central de Ajuda) para árbitros | Integrar `@google/generative-ai` já instalado | 🕒 Futuro |
| 🟠 **Média** | Dashboard executivo amplo | `DashboardHome` — ampliar métricas com filtros | 🕒 Futuro |
| 🟡 **Baixa** | Módulo de planos/faturamento | Integração Stripe ou Pagar.me (`planos` table existe) | 🕒 Futuro |
| 🟡 **Baixa** | Exportação de relatórios (CSV/PDF) | Usar `html2pdf.js` + dados filtrados | 🕒 Futuro |

---

## 📈 Acompanhamento
- **Critérios de Aceite:** Todas as tarefas de prioridade 🔴 **Alta** devem possuir cobertura de testes e validação de CI/CD.
- **Ciclos de Review:** Revisão semanal do progresso com foco na Fase 1.

---
*Atualizado em: 11 de Abril de 2026*
