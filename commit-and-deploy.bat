@echo off
echo ========================================
echo   COMMIT E DEPLOY - FIX 409 CONFLICT
echo ========================================
echo.

echo [1/5] Adicionando arquivos alterados...
git add src/services/processService.ts
git add src/presentation/hooks/useProcessActions.ts
git add src/infrastructure/database/BaseSupabaseRepository.ts
git add src/infrastructure/database/BaseSupabaseRepository.test.ts
git add FIX_409_CONFLICT.md
echo.

echo [2/5] Verificando status...
git status --short
echo.

echo [3/5] Fazendo commit...
git commit -m "fix: correcao do erro 409 Conflict na atualizacao de processos

- Adiciona validacao de campos imutaveis no service layer
- Bloqueia edicao de campos imutaveis na UI (numero_processo, camara_id, organization_id)
- Melhora tratamento de erros do Supabase com mensagens especificas
- Adiciona tratamento para erro 409 com mensagem amigavel ao usuario
- Atualiza testes unitarios para refletir novo formato de mensagens

Fixes: 409 Conflict ao atualizar processos
Arquivos: processService.ts, useProcessActions.ts, BaseSupabaseRepository.ts"
echo.

if %errorlevel% neq 0 (
    echo ERRO: Falha ao fazer commit!
    exit /b 1
)

echo [4/5] Verificando commit...
git log -1 --oneline
echo.

echo [5/5] Fazendo push para o remoto...
git push origin HEAD
echo.

if %errorlevel% neq 0 (
    echo AVISO: Falha ao fazer push! Tente manualmente.
    exit /b 1
)

echo ========================================
echo   COMMIT E PUSH CONCLUIDOS COM SUCESSO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Fazer deploy no Vercel/Netlify
echo 2. Testar em producao
echo.
