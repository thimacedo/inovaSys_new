# InovaSys Sprint: Deploy Final e CI/CD

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar a automação de deploy e garantia de qualidade (CI/CD) para que cada commit resulte em um build estável e testado na Vercel.

**Architecture:** Esteira baseada em GitHub Actions com estágios de: Lint -> Typecheck -> Testes Unitários -> Testes E2E -> Build.

**Tech Stack:** GitHub Actions, Vercel, Playwright, Vitest.

---

### Task 1: Otimização do Workflow de CI

**Files:**
- Modify: `E:\inovasys\.github\workflows\ci.yml`
- Modify: `E:\inovasys\scripts\validate-env.mjs`

- [ ] **Step 1: Atualizar ci.yml**
Garantir que os testes unitários e o build ocorram em paralelo para velocidade.

```yaml
name: CI InovaSys

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm install
      - run: npm run lint
      - run: npm run typecheck

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm install
      - run: npm run test:coverage

  build:
    needs: [quality, unit-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm install
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

- [ ] **Step 2: Ajustar Script de Validação**
Tornar o `validate-env.mjs` fatal em produção para evitar deploys quebrados.

### Task 2: Configuração de Deploy na Vercel

**Files:**
- Modify: `E:\inovasys\vercel.json`

- [ ] **Step 1: Configurar Headers de Segurança**
Adicionar políticas de cache e segurança no `vercel.json`.

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Task 3: Finalização do Projeto e Entrega

**Files:**
- Update: `E:\inovasys\ROADMAP.md`
- Update: `E:\inovasys\README.md`

- [ ] **Step 1: Atualizar Guia de Instalação**
Documentar o fluxo de CI/CD e como configurar as Secrets do GitHub.

- [ ] **Step 2: Concluir Roadmap**
Marcar o Deploy Final como concluído e preparar o sistema para entrega ao usuário.
