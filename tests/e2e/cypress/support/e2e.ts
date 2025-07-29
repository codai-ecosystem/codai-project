import './commands';
import '@cypress/code-coverage/support';

// Cypress custom command definitions
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      visitWithAuth(url: string): Chainable<void>;
      waitForLoad(): Chainable<void>;
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
      /**
       * Wait for service to be healthy
       * @param service - Service name
       */
      waitForService(service: string): Chainable<Response<any>>;
      
      /**
       * Check service health
       * @param port - Service port
       */
      checkServiceHealth(port: number): Chainable<Response<any>>;
      
      /**
       * Test API endpoint
       * @param endpoint - API endpoint
       * @param method - HTTP method
       * @param body - Request body
       */
      testAPI(endpoint: string, method?: string, body?: any): Chainable<Response<any>>;
    }
  }
}

// Hide fetch/XHR requests from command log for cleaner output
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Service health check configuration
const SERVICES = {
  gateway: { port: 4000, healthPath: '/api/gateway/health' },
  codai: { port: 4001, healthPath: '/health' },
  admin: { port: 4002, healthPath: '/api/health' },
  hub: { port: 4003, healthPath: '/api/health' },
  id: { port: 4004, healthPath: '/api/health' },
  bancai: { port: 4005, healthPath: '/api/health' },
  memorai: { port: 4006, healthPath: '/api/health' }
};

// Set global service configuration
Cypress.env('SERVICES', SERVICES);

// Global configuration for uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  console.warn('Uncaught exception:', err);
  return false;
});
