import { test, expect } from '@playwright/test';

/**
 * 🧪 INOVASYS SMOKE TESTS (v3.2 - State-Based Architecture)
 * Foco: Resiliência total para sistema sem rotas de URL.
 */

test.describe('Navegação Pública InovaSys', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Aguardar estabilização da Landing Page
    await expect(page.locator('nav')).toBeVisible();
    // Garantir que não houve crash inicial
    await expect(page.getByText('Falha Crítica no Sistema')).not.toBeVisible();
  });

  test('deve carregar a Landing Page e validar elementos chave', async ({ page }) => {
    const heroTitle = page.locator('main h1').first();
    await expect(heroTitle).toContainText(/Gestão de processos/i);
    await expect(page.locator('nav').getByText('InovaSys')).toBeVisible();
  });

  test('deve navegar para a Central de Ajuda (Docs View)', async ({ page }) => {
    // 1. Clicar no botão da Navbar
    await page.getByRole('button', { name: 'Documentação' }).click();
    
    // 2. Aguardar a transição de componente (o header de Docs deve aparecer)
    const docsHeader = page.getByText('Central de Ajuda');
    await expect(docsHeader).toBeVisible({ timeout: 10000 });

    // 3. Validar que o conteúdo antigo da Landing saiu do DOM (ou ficou invisível)
    await expect(page.locator('main h1').filter({ hasText: 'Gestão de processos' })).not.toBeVisible();
    
    // 4. Validar o título do documento inicial nos Docs
    const docTitle = page.locator('main h1').filter({ hasText: 'Guia de Início' });
    await expect(docTitle).toBeVisible();
  });

  test('deve abrir o fluxo de autenticação', async ({ page }) => {
    await page.getByRole('button', { name: 'Entrar' }).first().click();
    
    // Validar se o formulário de login apareceu via visibilidade de componente
    await expect(page.getByText('Acessar Painel')).toBeVisible();
  });

  test('deve trocar entre documentos na Central de Ajuda', async ({ page }) => {
    // 1. Entrar na view de Docs
    await page.getByRole('button', { name: 'Documentação' }).click();
    
    // 2. Aguardar a Sidebar aparecer
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    
    // 3. Clicar em 'Diretrizes de IA' na sidebar
    await sidebar.getByRole('button', { name: /Diretrizes de IA/i }).click();
    
    // 4. Validar a troca de conteúdo (Título do h1 muda)
    await expect(page.locator('main h1').filter({ hasText: 'Diretrizes de IA' })).toBeVisible();
    
    // 5. Validar conteúdo específico do doc
    await expect(page.getByText(/Proibições Absolutas/i)).toBeVisible();
  });
});
