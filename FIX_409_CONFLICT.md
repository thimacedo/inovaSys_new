# Correção do Erro 409 Conflict - Atualização de Processos

## 📋 Problema Identificado

O erro **409 Conflict** ocorria durante requisições `PATCH` para atualizar processos devido a:

1. **Falta de validação prévia de campos imutáveis** - O sistema permitia tentativas de edição de campos como `numero_processo`, `camara_id`, `organization_id`, que são bloqueados apenas no service layer, mas não na UI.

2. **Tratamento genérico de erros** - Mensagens de erro não eram específicas o suficiente para ajudar o usuário a entender a causa raiz.

3. **Ausência de feedback visual** - Usuários não sabiam quais campos podiam ou não ser editados.

## ✅ Correções Implementadas

### 1. Validação Reforçada no Service Layer
**Arquivo:** `src/services/processService.ts`

- Adicionada verificação para garantir que pelo menos um campo válido exista após remoção de campos imutáveis
- Lançamento de erro descritivo quando nenhum campo válido resta para atualização

```typescript
if (Object.keys(safeData).length === 0) {
  throw new Error('Nenhum campo válido para atualização. Campos imutáveis removidos: ' + IMMUTABLE_FIELDS.join(', '));
}
```

### 2. Bloqueio na Camada de Apresentação
**Arquivo:** `src/presentation/hooks/useProcessActions.ts`

- Adicionada verificação de campos imutáveis ANTES de abrir o modal de edição
- Toast de atenção informando que o campo não pode ser editado
- Tratamento específico para erro 409 com mensagem amigável

```typescript
const IMMUTABLE_FIELDS = ['id', 'numero_processo', 'created_at', 'camara_id', 'organization_id'];
if (IMMUTABLE_FIELDS.includes(field as string)) {
  showToast(`O campo "${label}" não pode ser editado.`, 'attention');
  return;
}
```

### 3. Mensagens de Erro Detalhadas
**Arquivo:** `src/infrastructure/database/BaseSupabaseRepository.ts`

- Mapeamento de códigos de erro PostgreSQL para mensagens em português:
  - `409` / `23505`: Violação de unicidade (valor duplicado)
  - `23503`: Violação de chave estrangeira
  - `23502`: Campo obrigatório não preenchido
- Inclusão de detalhes e dicas do Supabase nas mensagens de erro

### 4. Campos Imutáveis Documentados

Os seguintes campos são **IMUTÁVEIS** e não podem ser alterados após criação:

| Campo | Motivo |
|-------|--------|
| `id` | Identificador único do processo |
| `numero_processo` | Gerado automaticamente via trigger (sequencial único) |
| `created_at` | Timestamp de criação (imutável por definição) |
| `camara_id` | Vínculo institucional (alterar causaria violação de isolamento) |
| `organization_id` | Vínculo organizacional (alterar causaria violação de RLS) |

## 🧪 Como Testar

### Teste 1: Tentar editar campo imutável via UI
1. Abra um processo existente
2. Tente clicar no ícone de edição em qualquer campo
3. **Resultado esperado:** Toast de atenção informando que o campo não pode ser editado

### Teste 2: Tentar editar campo editável
1. Abra um processo existente
2. Edite um campo permitido (ex: `requerente_nome`, `status`, `valor_causa`)
3. **Resultado esperado:** Atualização bem-sucedida com toast de sucesso

### Teste 3: Simular erro 409 (se constraint UNIQUE existir)
1. Se houver constraint UNIQUE no banco para `numero_processo`
2. Tente criar dois processos com mesmo número
3. **Resultado esperado:** Erro 409 com mensagem clara sobre duplicidade

## 📦 Arquivos Modificados

1. `src/services/processService.ts` - Validação reforçada
2. `src/presentation/hooks/useProcessActions.ts` - Bloqueio na UI + tratamento de erro
3. `src/infrastructure/database/BaseSupabaseRepository.ts` - Mensagens de erro detalhadas

## 🔒 Segurança

As correções mantêm a segurança em múltiplas camadas:
- **Service Layer:** Remove campos imutáveis do payload
- **Repository Layer:** Herda validação do service
- **Database Layer:** Trigger e constraints do banco continuam ativos
- **UI Layer:** Previne tentativas desnecessárias que causariam erros

## 📝 Notas Adicionais

- O número do processo é gerado automaticamente via trigger `set_numero_processo`
- A função `gerar_numero_processo()` é SECURITY DEFINER para bypassar RLS
- Contador sequencial garantido pela tabela `processo_counters` com `ON CONFLICT DO UPDATE`
