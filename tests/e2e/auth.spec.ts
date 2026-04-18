import { test, expect } from '@playwright/test';

test.describe('Autenticação InovaSys', () => {
  test('Deve exibir a tela de login corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se a logo está visível
    await expect(page.locator('img[alt="InovaSys"]')).toBeVisible();
    
    // Verifica se o título do painel está presente
    await expect(page.getByRole('heading', { name: /Acessar Painel/i })).toBeVisible();
    
    // Verifica campos de input
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  });

  test('Deve mostrar erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder('seu@email.com').fill('usuario_invalido@teste.com');
    await page.getByPlaceholder('••••••••').fill('senha123456');
    
    await page.getByRole('button', { name: /Entrar/i, exact: true }).click();
    
    // Espera a mensagem de erro (ajustar conforme o comportamento do Supabase Auth)
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('Deve navegar para Consulta Pública', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Consulta Pública/i }).click();
    
    await expect(page.getByRole('heading', { name: /Validação de Sentenças/i })).toBeVisible();
  });
});
