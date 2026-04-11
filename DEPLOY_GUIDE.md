# 🚀 GUIA DE DEPLOY - Correção 409 Conflict

## 📋 Situação Atual

✅ **Código corrigido e testado**
✅ **Build compilado com sucesso** (pasta `dist/` gerada)
✅ **25 testes unitários passando**
⚠️ **Deploy requer configuração manual do projeto na Vercel**

---

## 🔧 PROBLEMA IDENTIFICADO

O sistema tem as variáveis de ambiente configuradas:
- `VERCEL_API_KEY` ✅
- `VERCEL_PROJECT_ID` ✅
- `VERCEL_ORG_ID` ❌ **FALTANDO**

A CLI da Vercel exige **ambos** `VERCEL_PROJECT_ID` e `VERCEL_ORG_ID` quando um projeto ID está especificado.

---

## ✅ SOLUÇÃO 1: Deploy via Dashboard da Vercel (RECOMENDADO)

### Passo 1: Conectar o Repositório ao Git

```bash
# No seu terminal, execute:
git init (se ainda não foi feito)
git add .
git commit -m "fix: correção do erro 409 Conflict na atualização de processos"
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```

### Passo 2: Deploy via Dashboard

1. Acesse: **https://vercel.com/dashboard**
2. Clique em **"Add New Project"**
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `APP_URL`
6. Clique em **"Deploy"**

---

## ✅ SOLUÇÃO 2: Deploy via CLI (Alternativa)

### Passo 1: Obter o ORG_ID

```bash
# Listar suas organizações
vercel teams ls

# Ou acessar o dashboard e copiar o ID da organização
# https://vercel.com/<seu-usuario>/settings
```

### Passo 2: Configurar Variável de Ambiente

```bash
# No Windows (PowerShell):
$env:VERCEL_ORG_ID="seu_org_id_aqui"

# Ou no arquivo .env:
VERCEL_ORG_ID=seu_org_id_aqui
```

### Passo 3: Fazer Deploy

```bash
# Remover .vercel/project.json existente
rm -rf .vercel

# Fazer login novamente
vercel login

# Linkar o projeto
vercel link

# Fazer deploy
vercel --prod
```

---

## ✅ SOLUÇÃO 3: Deploy via Git Push (Se já conectado)

Se seu repositório já está conectado à Vercel:

```bash
# Adicionar arquivos
git add src/services/processService.ts src/presentation/hooks/useProcessActions.ts src/infrastructure/database/BaseSupabaseRepository.ts src/infrastructure/database/BaseSupabaseRepository.test.ts FIX_409_CONFLICT.md

# Commit
git commit -m "fix: correção do erro 409 Conflict na atualização de processos"

# Push (triggerá deploy automático)
git push origin main
```

---

## 📊 O QUE FOI CORRIGIDO

### Arquivos Modificados:
1. `src/services/processService.ts` - Validação de campos imutáveis
2. `src/presentation/hooks/useProcessActions.ts` - Bloqueio na UI + tratamento de erro
3. `src/infrastructure/database/BaseSupabaseRepository.ts` - Mensagens de erro detalhadas
4. `src/infrastructure/database/BaseSupabaseRepository.test.ts` - Testes atualizados

### Testes:
- ✅ 25/25 testes passando
- ✅ Build compilado sem erros
- ✅ Documentação criada (`FIX_409_CONFLICT.md`)

---

## 🧪 TESTES PÓS-DEPLOY

Após o deploy, teste:

1. **Edição de campo permitido:**
   - Abra um processo
   - Edite `requerente_nome` ou `status`
   - ✅ Deve atualizar com sucesso

2. **Tentativa de edição de campo imutável:**
   - Tente editar `numero_processo` (se aparecer)
   - ⚠️ Deve mostrar: "O campo X não pode ser editado"

3. **Erro 409 (se aplicável):**
   - Tente duplicar um número de processo via API
   - ❌ Deve mostrar: "409 Conflict: Valor duplicado"

---

## 📝 COMANDO DE COMMIT PRONTO

```bash
git add src/services/processService.ts ^
  src/presentation/hooks/useProcessActions.ts ^
  src/infrastructure/database/BaseSupabaseRepository.ts ^
  src/infrastructure/database/BaseSupabaseRepository.test.ts ^
  FIX_409_CONFLICT.md

git commit -m "fix: correção do erro 409 Conflict na atualização de processos

- Adiciona validação de campos imutáveis no service layer
- Bloqueia edição de campos imutáveis na UI
- Melhora tratamento de erros do Supabase
- Atualiza testes unitários"

git push origin main
```

---

## 🆘 Precisa de Ajuda?

Se precisar de assistência com o deploy:

1. **Vercel Docs:** https://vercel.com/docs
2. **Suporte Vercel:** https://vercel.com/support
3. **Dashboard:** https://vercel.com/dashboard

---

**Status:** ✅ CÓDIGO PRONTO PARA DEPLOY  
**Data:** 2026-04-11  
**Build:** dist/ ✅  
**Testes:** 25/25 ✅
