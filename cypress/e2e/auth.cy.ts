describe('Autenticação', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Deve exibir a página de login', () => {
    cy.url().should('include', '/login');
    cy.findByRole('button', { name: /entrar/i }).should('exist');
  });

  it('Deve mostrar erro com credenciais inválidas', () => {
    cy.findByLabelText(/email/i).type('invalido@teste.com');
    cy.findByLabelText(/senha/i).type('senhaerrada');
    cy.findByRole('button', { name: /entrar/i }).click();
    cy.contains(/credenciais inválidas|usuário não encontrado/i).should('be.visible');
  });

  it('Deve fazer login com sucesso e acessar o dashboard', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.contains(/dashboard|painel/i).should('be.visible');
  });

  it('Deve fazer logout e retornar à tela de login', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.logout();
    cy.url().should('include', '/login');
  });
});