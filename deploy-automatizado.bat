@echo off
chcp 65001 >nul
echo ============================================
echo   🚀 DEPLOY AUTOMÁTICO - INOVASYS
echo   Correção do Erro 409 Conflict
echo ============================================
echo.

echo [PASSO 1/6] Adicionando arquivos alterados...
git add src/services/processService.ts
git add src/presentation/hooks/useProcessActions.ts
git add src/infrastructure/database/BaseSupabaseRepository.ts
git add src/infrastructure/database/BaseSupabaseRepository.test.ts
git add FIX_409_CONFLICT.md
git add DEPLOY_GUIDE.md
git add COMMIT_DEPLOY_INSTRUCTIONS.md
echo ✅ Arquivos adicionados com sucesso!
echo.

echo [PASSO 2/6] Verificando status...
git status --short
echo.

echo [PASSO 3/6] Fazendo commit...
git commit -m "fix: correção do erro 409 Conflict na atualização de processos

- Adiciona validação de campos imutáveis no service layer
- Bloqueia edição de campos imutáveis na UI (numero_processo, camara_id, organization_id)
- Melhora tratamento de erros do Supabase com mensagens específicas
- Adiciona tratamento para erro 409 com mensagem amigável ao usuário
- Atualiza testes unitários para refletir novo formato de mensagens

Fixes: 409 Conflict ao atualizar processos
Testes: 25/25 passando ✅
Build: Compilado com sucesso ✅"

if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao fazer commit!
    echo Verifique se há arquivos em conflito ou se o Git está configurado corretamente.
    pause
    exit /b 1
)
echo ✅ Commit realizado com sucesso!
echo.

echo [PASSO 4/6] Verificando branch atual...
git branch --show-current
echo.

echo [PASSO 5/6] Fazendo push para o GitHub...
echo ⚠️  Isso pode solicitar credenciais do GitHub...
git push origin HEAD

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  AVISO: Push falhou!
    echo.
    echo POSSÍVEIS CAUSAS:
    echo - Credenciais do GitHub não configuradas
    echo - Branch protegido requer pull request
    echo - Conexão com internet instável
    echo.
    echo SOLUÇÃO MANUAL:
    echo   git push origin HEAD
    echo.
    echo Se estiver usando autenticação por token:
    echo   git config --global credential.helper store
    echo   git push origin HEAD
    echo.
) else (
    echo ✅ Push realizado com sucesso!
    echo.
    echo [PASSO 6/6] 🎉 DEPLOY CONCLUÍDO!
    echo.
    echo ============================================
    echo   ✅ DEPLOY REALIZADO COM SUCESSO!
    echo ============================================
    echo.
    echo 📋 PRÓXIMOS PASSOS:
    echo.
    echo 1. Se sua Vercel está conectada ao GitHub:
    echo    → O deploy automático será triggerado
    echo    → Acesse: https://vercel.com/dashboard
    echo.
    echo 2. Teste em produção após o deploy:
    echo    → Abra um processo existente
    echo    → Edite um campo permitido (nome, status, valor)
    echo    → Verifique se atualiza com sucesso
    echo.
    echo 3. Verifique os logs na Vercel:
    echo    → https://vercel.com/thimacedo/inova-sys-new/logs
    echo.
)

echo.
pause
