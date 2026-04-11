/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      createProcess(processData: {
        numero: string;
        titulo: string;
        requerente: string;
        requerido: string;
        valor?: number;
      }): Chainable<void>;
    }
  }
}

// Comando de login usando UI
Cypress.Commands.add('login', (email = 'teste@inovasys.com', password = 'senha123') => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.findByLabelText(/email/i).type(email);
    cy.findByLabelText(/senha/i).type(password);
    cy.findByRole('button', { name: /entrar/i }).click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.findByRole('button', { name: /sair|logout/i }).click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('createProcess', (processData) => {
  cy.visit('/processos/novo');
  cy.findByLabelText(/número/i).type(processData.numero);
  cy.findByLabelText(/título/i).type(processData.titulo);
  cy.findByLabelText(/requerente/i).type(processData.requerente);
  cy.findByLabelText(/requerido/i).type(processData.requerido);
  if (processData.valor) {
    cy.findByLabelText(/valor da causa/i).type(processData.valor.toString());
  }
  cy.findByRole('button', { name: /salvar|protocolar/i }).click();
  cy.url().should('include', '/processos/');
  cy.contains(processData.titulo).should('be.visible');
});

export {};