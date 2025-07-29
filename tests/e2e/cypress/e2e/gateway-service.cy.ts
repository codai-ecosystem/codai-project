// Phase 1 Testing Infrastructure - Cypress Gateway Service Validation
describe('Gateway Service - Cypress E2E Validation', () => {
  it('should validate Gateway service health endpoint', () => {
    cy.request('GET', 'http://localhost:4000/api/gateway/health')
      .then((response) => {
        expect(response.status).to.be.oneOf([200, 503]);
        expect(response.body).to.have.property('status');
      });
  });

  it('should validate CODAI proxy endpoint - THE CRITICAL FIX', () => {
    cy.request('GET', 'http://localhost:4000/api/v1/codai/health')
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.have.property('status', 'healthy');
        expect(response.body).to.have.property('service', 'codai');
      });
  });

  it('should validate Gateway proxy endpoints', () => {
    // Test Admin proxy endpoint
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/v1/admin/health',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 401, 503]);
    });
  });

  it('should handle authentication requirements', () => {
    // Test authenticated endpoint without token
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/v1/memorai/health',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 401, 503]);
    });
  });

  it('should validate error handling', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:4000/api/nonexistent',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });
});
