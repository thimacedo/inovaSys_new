# 📦 COMMIT E DEPLOY - Instruções

## ✅ Correções Implementadas

O erro **409 Conflict** foi corrigido com sucesso! Seguem os passos para commit e deploy:

---

### 📝 Passo 1: Commit das Alterações

Execute os seguintes comandos no terminal:

```bash
# Adicionar os arquivos modificados
git add src/services/processService.ts
git add src/presentation/hooks/useProcessActions.ts
git add src/infrastructure/database/BaseSupabaseRepository.ts
git add src/infrastructure/database/BaseSupabaseRepository.test.ts
git add FIX_409_CONFLICT.md

# Verificar o status
git status

# Fazer o commit
git commit -m "fix: correção do erro 409 Conflict na atualização de processos

- Adiciona validação de campos imutáveis no service layer
- Bloqueia edição de campos imutáveis na UI (numero_processo, camara_id, organization_id)
- Melhora tratamento de erros do Supabase com mensagens específicas
- Adiciona tratamento para erro 409 com mensagem amigável ao usuário
- Atualiza testes unitários para refletir novo formato de mensagens

Fixes: 409 Conflict ao atualizar processos"
```

---

### 🚀 Passo 2: Push para o Repositório

```bash
git push origin main
# ou
git push origin master
# ou a branch que estiver usando
```

---

### 🌐 Passo 3: Deploy

Se estiver usando **Vercel**:
```bash
vercel --prod
```

Se estiver usando **Netlify**:
```bash
netlify deploy --prod
```

Se estiver usando outro serviço, faça o deploy conforme sua configuração habitual.

---

## 🧪 Passo 4: Testes Pós-Deploy

Após o deploy, teste as seguintes funcionalidades:

### Teste 1: Edição de Campo Permitido
1. Abra um processo existente
2. Edite um campo permitido (ex: `requerente_nome`, `status`, `valor_causa`)
3. **Resultado esperado:** Atualização bem-sucedida com mensagem de sucesso ✅

### Teste 2: Tentativa de Edição de Campo Imutável
1. Abra um processo existente
2. Tente editar um campo como `numero_processo` (se aparecer na UI)
3. **Resultado esperado:** Toast de atenção informando que o campo não pode ser editado ⚠️

### Teste 3: Simulação de Erro 409 (se aplicável)
1. Se houver constraint UNIQUE no banco para `numero_processo`
2. Tente criar dois processos com mesmo número via API direta
3. **Resultado esperado:** Erro 409 com mensagem clara: "409 Conflict: Valor duplicado. Este dado já está cadastrado no sistema." ❌

---

## 📊 Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/services/processService.ts` | Validação de campos imutáveis reforçada |
| `src/presentation/hooks/useProcessActions.ts` | Bloqueio de campos imutáveis na UI + tratamento de erro 409 |
| `src/infrastructure/database/BaseSupabaseRepository.ts` | Mensagens de erro detalhadas com códigos PostgreSQL |
| `src/infrastructure/database/BaseSupabaseRepository.test.ts` | Testes atualizados para novo formato de mensagens |
| `FIX_409_CONFLICT.md` | Documentação completa da correção |

---

## 🔍 Testes Unitários

Todos os testes passaram com sucesso! ✅

```bash
npm run test:unit -- --run
```

**Resultado:** 25 testes passaram, 0 falhas

---

## 🏗️ Build

Build compilado com sucesso! ✅

```bash
npm run build
```

**Resultado:** dist/ gerado sem erros

---

### 📌 Notas Importantes

1. **Campos Imutáveis Documentados:**
   - `id` - Identificador único
   - `numero_processo` - Gerado automaticamente via trigger
   - `created_at` - Timestamp de criação
   - `camara_id` - Vínculo institucional
   - `organization_id` - Vínculo organizacional

2. **Segurança Mantida:**
   - Validação em múltiplas camadas (Service → Repository → Database → UI)
   - Tratamento específico para cada tipo de erro do PostgreSQL

3. **Melhorias Implementadas:**
   - Mensagens de erro em português
   - Feedback claro ao usuário sobre campos imutáveis
   - Diagnóstico fácil para erros de duplicidade

---

## ✅ Checklist Final

- [x] Código corrigido e testado
- [x] Testes unitários passando
- [x] Build compilando com sucesso
- [ ] Commit realizado
- [ ] Push realizado
- [ ] Deploy feito
- [ ] Testes em produção validados

---

**Data:** 2026-04-11  
**Responsável:** Engenheiro de Sistemas (IA)
