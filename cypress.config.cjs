const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
  },
  
  retries: {
    runMode: 1,
    openMode: 0,
  },
});
