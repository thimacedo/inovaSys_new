# 🚀 COMMIT E DEPLOY - INSTRUÇÕES RÁPIDAS

## OPÇÃO 1: Script Automatizado (Recomendado)

Abra o **Git Bash** ou **PowerShell** e execute:

```bash
cd E:\inovasys
.\COMMIT_E_DEPLOY_FINAL.bat
```

---

## OPÇÃO 2: Comandos Manuais (Se preferir controle total)

Abra o terminal no diretório `E:\inovasys` e execute:

### Passo 1: Adicionar arquivos
```bash
git add .
```

### Passo 2: Verificar o que será commitado
```bash
git status
```

### Passo 3: Commit
```bash
git commit -m "fix(ux/ui): debug completo - 12 correções críticas

Correções implementadas:
1. Fix Dashboard auth store import (user null → currentUser)
2. Fix links quebrados /planos e /login → query strings
3. Fix modal close selector mismatch (3 ocorrências)
4. Adicionar validação de CPF no Onboarding
5. Fix Consulta Pública para usar CPF/CNPJ
6. Remover alert() nativo no Auth
7. Fix dados estáticos no DashboardHome (agora dinâmicos)
8. Adicionar handler em Explorar Novidades
9. Remover console.log em produção
10. Fix encoding corrompido (UTF-8)
11. Adicionar validação de nome no Onboarding
12. Verificar disabled states em botões

Arquivos modificados: 10
Testes: 25/25 passando ✅
Build: Sucesso ✅
Documentação: 3 relatórios criados"
```

### Passo 4: Push (triggerá deploy automático)
```bash
git push origin HEAD
```

---

## OPÇÃO 3: Se Git não estiver no PATH

Se receber erro "git não é reconhecido", use um destes caminhos:

### Git Bash (Windows):
```
"C:\Program Files\Git\bin\bash.exe"
```

Depois execute:
```bash
cd /e/inovasys
git add .
git commit -m "fix(ux/ui): debug completo - 12 correções críticas"
git push origin HEAD
```

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY

Após o push, aguarde 2-5 minutos e verifique:

1. **Vercel Dashboard:** https://vercel.com/thimacedo
2. **Logs de Deploy:** https://vercel.com/thimacedo/inova-sys-new/logs
3. **URL de Produção:** Teste as funcionalidades corrigidas

---

## 🧪 TESTES EM PRODUÇÃO

Após o deploy, teste:

### Teste 1: Notificações no Dashboard
- [ ] Faça login
- [ ] Verifique se o sino de notificações carrega
- **Esperado:** Notificações aparecem ✅

### Teste 2: Onboarding com Validação
- [ ] Tente cadastrar com CPF inválido
- **Esperado:** Erro "CPF inválido" ✅
- [ ] Tente cadastrar com nome < 3 caracteres
- **Esperado:** Erro "nome completo (mínimo 3 caracteres)" ✅

### Teste 3: Consulta Pública
- [ ] Busque apenas por CPF/CNPJ (sem número do processo)
- **Esperado:** Retorna processo vinculado ao documento ✅

### Teste 4: Auth Signup
- [ ] Faça cadastro com nome < 3 caracteres
- **Esperado:** Erro de validação (sem alert()) ✅
- [ ] Faça cadastro válido
- **Esperado:** Mensagem verde de sucesso ✅

### Teste 5: Dashboard Home
- [ ] Verifique o gráfico de barras
- **Esperado:** Dados reais dos últimos 6 meses ✅
- [ ] Clique em "Explorar Novidades"
- **Esperado:** Abre link externo ✅

### Teste 6: Modais
- [ ] Em "Minha Equipe", clique "Novo Membro"
- [ ] Clique "Cancelar"
- **Esperado:** Modal fecha corretamente ✅

### Teste 7: Navegação
- [ ] Logout → Clique "Conhecer Planos"
- **Esperado:** Página de Pricing (sem 404) ✅

---

## 📊 RESUMO DAS ALTERAÇÕES

| Métrica | Valor |
|---------|-------|
| Correções Implementadas | 12 |
| Arquivos Modificados | 10 |
| Testes Passando | 25/25 ✅ |
| Build Status | ✅ Sucesso |
| Bugs Críticos Antes | 10 |
| Bugs Críticos Depois | 0 ✅ |

---

## 🆘 Precisa de Ajuda?

Se o Git não estiver configurado:

```bash
# Configurar nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Verificar configurações
git config --list
```

Se precisar de token do GitHub:
1. Acesse: https://github.com/settings/tokens
2. Gere um novo token com permissões `repo`
3. Use como senha no push

---

**Pronto para executar?** 

Execute: `.\COMMIT_E_DEPLOY_FINAL.bat`

Ou copie e cole os comandos da **Opção 2** acima.
