import { test, expect } from '@playwright/test';

/**
 * 🧪 INOVASYS SMOKE TESTS (v3.1 - Alta Resiliência)
 * Foco: Estabilidade total em transições MD3 com AnimatePresence e Correção de Crash.
 */

test.describe('Navegação Pública InovaSys', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Garantir que a Navbar carregou antes de qualquer ação
    await expect(page.locator('nav')).toBeVisible();
  });

  test('deve carregar a Landing Page e validar título único', async ({ page }) => {
    // Buscar o H1 da Landing Page (Hero) especificamente
    const heroTitle = page.locator('main h1').first();
    await expect(heroTitle).toContainText(/Gestão de processos/i);
    
    // Validar marca na Navbar
    await expect(page.locator('nav').getByText('InovaSys')).toBeVisible();
  });

  test('deve navegar para a Central de Ajuda (/docs)', async ({ page }) => {
    // 1. Iniciar navegação
    await page.getByRole('button', { name: 'Documentação' }).click();
    
    // 2. Aguardar a rota ser resolvida (Essencial para evitar race conditions com a tela anterior)
    // Usamos um padrão que aceita tanto local quanto produção
    await page.waitForURL(url => url.pathname.includes('/docs') || url.hash.includes('/docs'));

    // 3. Aguardar o container de docs aparecer de forma resiliente
    const docsHeader = page.getByText('Central de Ajuda');
    await expect(docsHeader).toBeVisible({ timeout: 10000 });
    
    // 4. Validar o título H1 interno do módulo de Docs
    // Usamos filter para garantir que estamos pegando o H1 que contém o texto esperado
    const docTitle = page.locator('main h1').filter({ hasText: 'Guia de Início' });
    await expect(docTitle).toBeVisible();
  });

  test('deve abrir o fluxo de autenticação', async ({ page }) => {
    // Clicar no entrar da Navbar
    await page.getByRole('button', { name: 'Entrar' }).first().click();
    
    // Validar se o formulário de login apareceu
    await expect(page.getByText('Acessar Painel')).toBeVisible();
  });

  test('deve trocar entre documentos na Central de Ajuda', async ({ page }) => {
    // 1. Entrar nos docs e aguardar estabilização
    await page.getByRole('button', { name: 'Documentação' }).click();
    await page.waitForURL(url => url.pathname.includes('/docs') || url.hash.includes('/docs'));
    
    // 2. Aguardar a Sidebar aparecer (Resiliente a animações)
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    
    // 3. Clicar em 'Diretrizes de IA' na sidebar
    await sidebar.getByRole('button', { name: /Diretrizes de IA/i }).click();
    
    // 4. Validar título do novo documento usando toHaveText (mais rigoroso que containtText)
    const mainTitle = page.locator('main h1');
    await expect(mainTitle).toHaveText(/Diretrizes de IA/i);
    
    // 5. Validar conteúdo interno
    await expect(page.getByText(/Proibições Absolutas/i)).toBeVisible();
  });
});
