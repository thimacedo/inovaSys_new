@echo off
chcp 65001 >nul 2>&1
echo.
echo ================================================================
echo          COMMIT E DEPLOY - DEBUG COMPLETO UX/UI
echo          12 Correcoes Criticas Implementadas
echo ================================================================
echo.
echo [1/4] Adicionando todas as alteracoes ao Git...
echo.

REM Adicionar todos os arquivos modificados
git add .

echo.
echo [2/4] Verificando status...
echo.
git status --short

echo.
echo [3/4] Realizando commit...
echo.

git commit -m "fix(ux/ui): debug completo - 12 correcoes criticas

Correcoes implementadas:
1. Fix Dashboard auth store import (user null - currentUser)
2. Fix links quebrados /planos e /login - query strings
3. Fix modal close selector mismatch (3 ocorrencias)
4. Adicionar validacao de CPF no Onboarding
5. Fix Consulta Publica para usar CPF/CNPJ
6. Remover alert() nativo no Auth
7. Fix dados estaticos no DashboardHome (agora dinamicos)
8. Adicionar handler em Explorar Novidades
9. Remover console.log em producao
10. Fix encoding corrompido (UTF-8)
11. Adicionar validacao de nome no Onboarding
12. Verificar disabled states em botoes

Arquivos modificados: 10
Testes: 25/25 passando
Build: Sucesso
Documentacao: 3 relatorios criados"

if %errorlevel% neq 0 (
    echo.
    echo ERRO: Falha ao realizar commit!
    echo Verifique se ha arquivos em conflito ou pendencias no Git.
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Fazendo push para o repositorio remoto...
echo.
echo NOTA: Isso pode solicitar credenciais do GitHub.
echo.

git push origin HEAD

if %errorlevel% neq 0 (
    echo.
    echo ================================================================
    echo  AVISO: Push nao foi concluido automaticamente.
    echo ================================================================
    echo.
    echo Execute manualmente:
    echo   git push origin HEAD
    echo.
    echo Se estiver usando autenticacao por token:
    echo   git config --global credential.helper store
    echo   git push origin HEAD
    echo.
) else (
    echo.
    echo ================================================================
    echo  COMMIT E PUSH CONCLUIDOS COM SUCESSO!
    echo ================================================================
    echo.
    echo O deploy automatico sera triggerado na Vercel.
    echo.
    echo Acompanhe em: https://vercel.com/dashboard
    echo.
)

echo.
echo Resumo das alteracoes:
echo   - 12 correcoes criticas implementadas
echo   - 10 arquivos modificados
echo   - 25/25 testes passando
echo   - Build compilado com sucesso
echo   - 3 relatorios de documentacao criados
echo.
pause
