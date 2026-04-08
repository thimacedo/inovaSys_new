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
