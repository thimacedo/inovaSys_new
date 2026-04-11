import '@testing-library/cypress/add-commands';
import './commands';

// Ignora erros não críticos da aplicação
Cypress.on('uncaught:exception', (err) => {
  // Erros de runtime esperados durante testes (ex.: props opcionais)
  if (err.message.includes('Loading chunk')) return false;
  return true;
});