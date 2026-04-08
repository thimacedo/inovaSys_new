# Changelog - InovaSys

Histórico de atualizações e melhorias técnicas implementadas.

## [2026-04-08] - Normalização RBAC e Estabilização

### Adicionado
- **Novo Papel de Usuário: `GOD` (Super Admin)**: Implementação completa em todo o ecossistema (Auth, Dashboard, Processos e Equipe).
- **Hook `usePermissions`**: Centralização de toda a lógica de níveis de acesso para facilitar manutenção e expansão.
- **Tabelas de Sistema**: Definição das tabelas `notificacoes` e `auditoria` no script de banco de dados global.
- **Manual de Recuperação (SQL)**: Consolidação de políticas RLS em um arquivo mestre para fácil restauração do banco.

### Alterado
- **Padronização de Schema**: Migração global do campo `org_id` para `organization_id` em interfaces, serviços e repositórios de infraestrutura.
- **Resiliência de Logout**: Ajuste no `App.tsx` para garantir limpeza de sessão local mesmo em falhas de comunicação com o servidor.
- **Melhoria no Dashboard**: Refatoração do menu lateral e lógica de renderização de telas baseada no novo hook de permissões.
- **Vercel Manager**: Refinamento da visualização de erros e suporte a variáveis de ambiente para monitoramento de builds.

### Corrigido
- **Fuga de Sidebar**: Corrigido bug onde o menu lateral desaparecia em resoluções específicas após atualizações de estado.
- **Erros de Sintaxe JSX**: Higienização do `Dashboard.tsx` para remover tags desalinhadas que quebravam o build de produção.
- **Erro de Redundância no `App.tsx`**: Removido loop de atualização de estado no `onAuthStateChange`.

---
*Log gerado automaticamente pelo assistente de codificação.*

## 🗺️ Planejamento de Próximas Fases (Roadmap)

### Fase 1: Inteligência e Automação de Documentos
- [ ] **Templates Dinâmicos**: Implementar edição de templates de documentos via interface (CKEditor/TinyMCE).
- [ ] **Assinatura Digital**: Integração com APIs de assinatura (DocuSign/Clicksign) para finalização de termos.
- [ ] **Geração em Lote**: Permitir gerar todos os documentos de um processo (Capa, Notificação, Termos) em um único clique.

### Fase 2: Comunicação e Notificações
- [ ] **WhatsApp Integration**: Disparo automático de notificações de andamento via WhatsApp para as partes.
- [ ] **E-mail Service 2.0**: Templates de e-mail personalizados com a logo da câmara em todas as comunicações.
- [ ] **Central de Ajuda**: Wiki baseada em IA para tirar dúvidas de árbitros sobre o sistema.

### Fase 3: Expansão e Enterprise
- [ ] **Multi-Chamber Sync**: Dashboard para gestores de rede visualizarem estatísticas de múltiplas câmaras simultaneamente.
- [ ] **Financeiro**: Módulo de controle de custas e honorários arbitrais com geração de boletos/PIX.
- [ ] **App Mobile**: Versão PWA para acesso rápido de árbitros via celular.
