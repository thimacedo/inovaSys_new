# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Navegação Pública InovaSys >> deve navegar para a Central de Ajuda (/docs)
- Location: tests\e2e\smoke.spec.ts:25:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main h1')
Expected substring: "Guia de Início"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('main h1')
    3 × locator resolved to <h1 class="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-up delay-100 text-md-on-surface">…</h1>
      - unexpected value "Gestão de processosarbitrais simplificada"

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "Falha Crítica no Sistema" [level=2] [ref=e6]
    - paragraph [ref=e7]: Ocorreu um erro inesperado na aplicação.
  - button "Tentar Novamente" [ref=e9]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * 🧪 INOVASYS SMOKE TESTS (v3.0 - Resiliente)
  5  |  * Foco: Estabilidade total em transições MD3 com AnimatePresence.
  6  |  */
  7  | 
  8  | test.describe('Navegação Pública InovaSys', () => {
  9  |   
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await page.goto('/');
  12 |     // Garantir que a Navbar carregou antes de qualquer ação
  13 |     await page.waitForSelector('nav');
  14 |   });
  15 | 
  16 |   test('deve carregar a Landing Page e validar título único', async ({ page }) => {
  17 |     // Buscar o H1 da Landing Page (Hero) especificamente
  18 |     const heroTitle = page.locator('main h1').first();
  19 |     await expect(heroTitle).toContainText(/Gestão de processos/i);
  20 |     
  21 |     // Validar marca na Navbar
  22 |     await expect(page.locator('nav').getByText('InovaSys')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('deve navegar para a Central de Ajuda (/docs)', async ({ page }) => {
  26 |     // Clicar no botão da Navbar
  27 |     await page.getByRole('button', { name: 'Documentação' }).click();
  28 |     
  29 |     // ESPERA CRÍTICA: Aguardar o container de docs aparecer
  30 |     // Isso garante que a transição de view começou
  31 |     const docsHeader = page.getByText('Central de Ajuda');
  32 |     await expect(docsHeader).toBeVisible();
  33 |     
  34 |     // Validar o título H1 interno do módulo de Docs
  35 |     // Usamos locator('main h1') mas garantimos que o docsHeader já está visível
  36 |     const docTitle = page.locator('main h1');
> 37 |     await expect(docTitle).toContainText('Guia de Início');
     |                            ^ Error: expect(locator).toContainText(expected) failed
  38 |   });
  39 | 
  40 |   test('deve abrir o fluxo de autenticação', async ({ page }) => {
  41 |     // Clicar no entrar da Navbar
  42 |     await page.getByRole('button', { name: 'Entrar' }).first().click();
  43 |     
  44 |     // Validar se o formulário de login apareceu
  45 |     // Buscamos o botão de 'Acessar Painel' que é exclusivo da tela de Auth
  46 |     await expect(page.getByText('Acessar Painel')).toBeVisible();
  47 |   });
  48 | 
  49 |   test('deve trocar entre documentos na Central de Ajuda', async ({ page }) => {
  50 |     // Entrar nos docs
  51 |     await page.getByRole('button', { name: 'Documentação' }).click();
  52 |     await page.waitForSelector('aside'); // Aguardar sidebar
  53 |     
  54 |     // Clicar em 'Diretrizes de IA' na sidebar
  55 |     await page.locator('aside').getByRole('button', { name: /Diretrizes de IA/i }).click();
  56 |     
  57 |     // Validar título do novo documento
  58 |     await expect(page.locator('main h1')).toContainText('Diretrizes de IA');
  59 |     
  60 |     // Validar conteúdo interno
  61 |     await expect(page.getByText(/Proibições Absolutas/i)).toBeVisible();
  62 |   });
  63 | });
  64 | 
```