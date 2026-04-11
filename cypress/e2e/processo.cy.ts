describe('Fluxo de Processo', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Deve criar um novo processo', () => {
    const numero = `TEST-${Date.now()}`;
    cy.createProcess({
      numero,
      titulo: 'Processo E2E Cypress',
      requerente: 'Empresa ABC',
      requerido: 'Fornecedor XYZ',
      valor: 15000,
    });

    cy.contains('Processo E2E Cypress').should('be.visible');
    cy.contains(numero).should('be.visible');
  });

  it('Deve listar processos existentes', () => {
    cy.visit('/processos');
    cy.findByRole('heading', { name: /processos/i }).should('be.visible');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Deve filtrar processos por número', () => {
    cy.visit('/processos');
    cy.findByPlaceholderText(/buscar|pesquisar/i).type('TEST-');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Deve acessar detalhes de um processo', () => {
    cy.visit('/processos');
    cy.get('table tbody tr').first().click();
    cy.url().should('include', '/processos/');
    cy.findByRole('heading', { name: /detalhes|processo/i }).should('be.visible');
  });
});