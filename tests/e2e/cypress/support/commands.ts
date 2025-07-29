// Custom Cypress commands for CODAI ecosystem

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.getByTestId('email-input').type(email);
  cy.getByTestId('password-input').type(password);
  cy.getByTestId('login-button').click();
  cy.waitForLoad();
});

Cypress.Commands.add('logout', () => {
  cy.getByTestId('user-menu').click();
  cy.getByTestId('logout-button').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('visitWithAuth', (url: string) => {
  // Set auth token in localStorage if needed
  cy.window().then((win) => {
    win.localStorage.setItem('auth-token', 'test-token');
  });
  cy.visit(url);
  cy.waitForLoad();
});

Cypress.Commands.add('waitForLoad', () => {
  // Wait for common loading indicators to disappear
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
  cy.get('.loading', { timeout: 10000 }).should('not.exist');
  cy.get('[aria-label="Loading"]', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('getByTestId', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`);
});

// CODAI-specific service testing commands
Cypress.Commands.add('waitForService', (service: string) => {
  const services = Cypress.env('SERVICES');
  const serviceConfig = services[service];
  
  if (!serviceConfig) {
    throw new Error(`Unknown service: ${service}`);
  }

  return cy.request({
    method: 'GET',
    url: `http://localhost:${serviceConfig.port}${serviceConfig.healthPath}`,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true,
    timeout: 30000
  }).should((response) => {
    expect(response.status).to.be.oneOf([200, 503]); // 503 is acceptable for aggregated health checks
  });
});

Cypress.Commands.add('checkServiceHealth', (port: number) => {
  return cy.request({
    method: 'GET',
    url: `http://localhost:${port}/health`,
    failOnStatusCode: false,
    timeout: 10000
  });
});

Cypress.Commands.add('testAPI', (endpoint: string, method = 'GET', body = null) => {
  const options: any = {
    method,
    url: endpoint,
    failOnStatusCode: false,
    timeout: 30000
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = body;
    options.headers = {
      'Content-Type': 'application/json'
    };
  }

  return cy.request(options);
});
