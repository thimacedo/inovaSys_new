describe('Assinatura Digital', () => {
  beforeEach(() => {
    cy.login();
    // Assume que já existe um processo com documento gerado
    cy.visit('/processos');
    cy.get('table tbody tr').first().click();
  });

  it('Deve exibir o botão de envio para assinatura', () => {
    cy.findByRole('button', { name: /enviar para assinatura/i }).should('be.visible');
  });

  it('Deve abrir modal de configuração de assinatura ao clicar', () => {
    cy.findByRole('button', { name: /enviar para assinatura/i }).click();
    cy.contains(/signatários|destinatários/i).should('be.visible');
    cy.findByRole('button', { name: /cancelar|fechar/i }).click();
  });

  it('Deve preencher signatários e simular envio (mock)', () => {
    // Intercepta a chamada à API para evitar requisição real
    cy.intercept('POST', '/api/click/sign', {
      statusCode: 200,
      body: { success: true, envelopeKey: 'mock-key', statusUrl: 'https://app.clicksign.com/mock' },
    }).as('createEnvelope');

    cy.findByRole('button', { name: /enviar para assinatura/i }).click();
    cy.findByLabelText(/nome do signatário/i).type('João Silva');
    cy.findByLabelText(/email do signatário/i).type('joao@exemplo.com');
    cy.findByRole('button', { name: /adicionar/i }).click();
    cy.findByRole('button', { name: /enviar/i }).click();

    cy.wait('@createEnvelope');
    cy.contains(/envelope criado|sucesso/i).should('be.visible');
  });
});