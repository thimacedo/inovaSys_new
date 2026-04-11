# ✅ Implementação Triggers Perfis - Código Vercel

> Documentação técnica para aplicação das alterações no banco de dados Supabase no código do projeto InovaSys.

---

## 🔄 Alterações Implementadas no Banco

### 1. Trigger Sincronização `organization_id`
- **Gatilho:** `BEFORE INSERT OR UPDATE OF camara_id` na tabela `public.perfis`
- **Função:** Preenche automaticamente `organization_id` com base na câmara selecionada
- **Status:** ✅ Aplicado no banco

### 2. Trigger Sincronização `email`
- **Gatilho:** `BEFORE INSERT OR UPDATE OF email` na tabela `public.perfis`
- **Função:** Preenche automaticamente `email` a partir da tabela `auth.users` quando estiver `NULL`
- **Status:** ✅ Aplicado no banco

---

## 📋 Ajustes Obrigatórios no Código

### ✅ Criação de Novo Perfil

| Campo | Ação |
|-------|------|
| `id` | **Obrigatório** - Enviar o UUID do usuário criado no auth |
| `camara_id` | **Obrigatório** - Enviar o UUID da câmara |
| `organization_id` | ❌ **NÃO ENVIAR** - Deixe o trigger preencher automaticamente |
| `email` | ❌ **NÃO ENVIAR** - Deixe o trigger buscar do auth |

**✅ Payload Mínimo Correto:**
```json
{
  "id": "uuid-do-usuario-auth",
  "camara_id": "uuid-da-camara"
}
```

---

### ✅ Atualização de Perfil Existente

| Cenário | Regra |
|---------|-------|
| Alteração de `camara_id` | ✅ Apenas envie `camara_id` - **NÃO envie `organization_id` junto**. O trigger atualizará automaticamente. |
| Atualização de outros campos (`nome`, `telefone`, etc) | ⚠️ Atenção: O trigger de email **não será disparado** nestes casos (o gatilho só executa quando o campo `email` é modificado). |

---

## ⚠️ Ponto Crítico de Atenção

O trigger de email atualmente **só executa quando o campo `email` é enviado na requisição de atualização**.

Se o fluxo do Antigravity faz **atualizações parciais** (altera apenas nome/telefone sem incluir o campo email) e precisa garantir que o email seja sempre sincronizado:

> ✅ **Ajuste Recomendado no Trigger:**
> ```sql
> CREATE OR REPLACE TRIGGER trg_sync_perfis_email
>   BEFORE INSERT OR UPDATE ON public.perfis
>   FOR EACH ROW
>   EXECUTE FUNCTION public.sync_perfis_email_from_auth();
> ```
> Isto garante que QUALQUER atualização no perfil dispare a sincronização do email.

---

## 🧪 Testes para Validar no Ambiente Vercel

1. **Criar novo perfil** com apenas `id` e `camara_id`
   - ✅ Verificar que `organization_id` foi preenchido automaticamente
   - ✅ Verificar que `email` foi copiado corretamente do `auth.users`

2. **Alterar `camara_id` de perfil existente**
   - ✅ Confirmar que `organization_id` foi atualizado para a nova câmara
   - ✅ Confirmar que não houve erros na requisição

3. **Atualizar apenas `nome` ou `telefone`**
   - ✅ Verificar comportamento do email após esta operação
   - ✅ Definir se precisa ajustar o trigger para disparar em todas atualizações

---

## 📌 Status da Implementação

| Item | Status |
|------|--------|
| Triggers criados no banco Supabase | ✅ Concluído |
| Documentação técnica criada | ✅ Concluído |
| Ajustes no código de criação de perfil | ⏳ Pendente |
| Ajustes no código de atualização de perfil | ⏳ Pendente |
| Validação em ambiente de desenvolvimento | ⏳ Pendente |
| Deploy para Vercel | ⏳ Pendente |

---

> Última atualização: 11/04/2026 - Aplicável para versão deployada na Vercel