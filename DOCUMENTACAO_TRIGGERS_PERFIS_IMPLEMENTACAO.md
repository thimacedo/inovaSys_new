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
| `email` | ❌ **NÃO ENVIAR** - Deixe o trigger buscar do auth
