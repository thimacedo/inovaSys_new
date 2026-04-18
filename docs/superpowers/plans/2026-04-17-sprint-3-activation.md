# InovaSys Sprint 3: Ativação de Features e Qualidade

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar a infraestrutura Supabase, implementar os serviços de Chat Realtime e Consulta Pública, e iniciar a base de testes E2E com Playwright.

**Architecture:** Abordagem Service-Component, onde a lógica de comunicação com o Supabase é isolada em arquivos de serviço (`src/services`), consumida por componentes React.

**Tech Stack:** React 19, Supabase (Realtime, RPC), Playwright, TypeScript.

---

### Task 1: Consolidação da Infraestrutura Supabase

**Files:**
- Execute: `E:\inovasys\SUPABASE_DEPLOYMENT_COMPLETE.sql`
- Update: `E:\inovasys\DIAGNOSTICO_SISTEMA.md`

- [ ] **Step 1: Verificar conectividade com Supabase**
Verificar se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` estão corretas.

- [ ] **Step 2: Executar Script SQL Mestre**
Como não temos acesso direto ao dashboard via terminal, o agente deve simular a execução ou instruir o usuário. *Nota: Para esta sessão, assumiremos que o esquema deve ser validado via código.*

- [ ] **Step 3: Atualizar Diagnóstico**
Atualizar `DIAGNOSTICO_SISTEMA.md` para marcar as variáveis de ambiente como ✅ e o banco como consolidado.

### Task 2: Implementação do Serviço de Chat Realtime

**Files:**
- Create: `E:\inovasys\src\services\chatService.ts`
- Modify: `E:\inovasys\src\components\ProcessChat.tsx`

- [ ] **Step 1: Criar chatService.ts**
Implementar funções `getMessages`, `sendMessage` e `subscribeToMessages` usando o Supabase Realtime.

```typescript
import { supabase } from '../lib/supabase';

export const chatService = {
  async getMessages(processoId: string) {
    const { data, error } = await supabase
      .from('mensagens_processo')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  
  async sendMessage(processoId: string, autorId: string, autorNome: string, mensagem: string) {
    const { error } = await supabase
      .from('mensagens_processo')
      .insert([{ processo_id: processoId, autor_id: autorId, autor_nome: autorNome, mensagem }]);
    if (error) throw error;
  },

  subscribeToMessages(processoId: string, onMessage: (payload: any) => void) {
    return supabase
      .channel(`chat:${processoId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensagens_processo',
        filter: `processo_id=eq.${processoId}` 
      }, onMessage)
      .subscribe();
  }
};
```

- [ ] **Step 2: Integrar no ProcessChat.tsx**
Substituir mocks pela lógica do `chatService`.

### Task 3: Implementação do Serviço de Consulta Pública

**Files:**
- Create: `E:\inovasys\src\services\consultationService.ts`
- Modify: `E:\inovasys\src\components\PublicConsultation.tsx`

- [ ] **Step 1: Criar consultationService.ts**
Implementar a chamada para a função RPC `consultar_sentenca_publica`.

```typescript
import { supabase } from '../lib/supabase';

export const consultationService = {
  async querySentence(numeroProcesso: string, codigoValidacao: string) {
    const { data, error } = await supabase.rpc('consultar_sentenca_publica', {
      p_numero_processo: numeroProcesso,
      p_codigo_validacao: codigoValidacao
    });
    if (error) throw error;
    return data;
  }
};
```

- [ ] **Step 2: Integrar no PublicConsultation.tsx**
Adicionar estado de loading e exibição dos dados retornados pelo serviço.

### Task 4: Base de Testes E2E com Playwright

**Files:**
- Modify: `E:\inovasys\package.json`
- Create: `E:\inovasys\tests\e2e\auth.spec.ts`

- [ ] **Step 1: Instalar Playwright**
Run: `npm install -D @playwright/test`
Run: `npx playwright install chromium`

- [ ] **Step 2: Criar primeiro teste de Login**
Validar o fluxo básico de autenticação.

### Task 5: Finalização e Roadmap

- [ ] **Step 1: Executar build e lint**
Run: `npm run build`
Run: `npm run lint`

- [ ] **Step 2: Atualizar ROADMAP.md**
Marcar tarefas concluídas e atualizar o status da Sprint 3.
