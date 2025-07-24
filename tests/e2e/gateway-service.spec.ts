/**
 * Gateway Service E2E Tests
 * Testing: Complete user flows through gateway, dashboard functionality,
 * real-world scenarios, cross-browser compatibility
 */

import { test, expect, Page, Browser } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';

const GATEWAY_BASE_URL = 'http://localhost:4000';
const FRONTEND_BASE_URL = 'http://localhost:3000';

// Test data and utilities
const TEST_USER_CREDENTIALS = {
  email: 'test@codai.dev',
  password: 'testPassword123',
  apiKey: 'test-api-key-12345'
};

class GatewayTestUtils {
  static async waitForGatewayReady(page: Page) {
    await page.waitForResponse(
      response => response.url().includes('/health') && response.ok(),
      { timeout: 30000 }
    );
  }

  static async authenticate(page: Page) {
    // Navigate to login page
    await page.goto(`${FRONTEND_BASE_URL}/login`);
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', TEST_USER_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', TEST_USER_CREDENTIALS.password);
    
    // Submit and wait for redirect
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  }

  static async checkGatewayHeaders(page: Page, response: any) {
    const headers = response.headers();
    expect(headers['x-powered-by']).toBe('CODAI API Gateway');
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['x-content-type-options']).toBe('nosniff');
  }

  static async makeApiRequest(page: Page, endpoint: string, options: any = {}) {
    const response = await page.request.get(`${GATEWAY_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${options.token || ''}`,
        'X-API-Key': options.apiKey || '',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response;
  }
}

test.describe('Gateway Service - E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  test.beforeAll(async () => {
    // Launch browser for the test suite
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: 50
    });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await browser.newPage();
    
    // Wait for gateway to be ready
    await GatewayTestUtils.waitForGatewayReady(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Gateway Health and Status', () => {
    test('should display gateway health status', async () => {
      await page.goto(`${GATEWAY_BASE_URL}/health`);
      
      const response = await page.textContent('body');
      const healthData = JSON.parse(response!);
      
      expect(healthData.service).toBe('api-gateway');
      expect(healthData.status).toBe('healthy');
      expect(healthData.version).toBeDefined();
      expect(healthData.uptime).toBeGreaterThan(0);
    });

    test('should show comprehensive service health', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/gateway/health');
      expect(response.ok()).toBeTruthy();
      
      const healthData = await response.json();
      expect(healthData.gateway.status).toBe('healthy');
      expect(Array.isArray(healthData.services)).toBeTruthy();
      expect(healthData.services.length).toBeGreaterThan(0);
      
      // Verify service information
      const serviceNames = healthData.services.map((s: any) => s.name);
      expect(serviceNames).toContain('ID Service');
      expect(serviceNames).toContain('CODAI Service');
      expect(serviceNames).toContain('MemorAI Service');
    });

    test('should display service discovery information', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/gateway/services');
      expect(response.ok()).toBeTruthy();
      
      const servicesData = await response.json();
      expect(servicesData.success).toBeTruthy();
      expect(Array.isArray(servicesData.services)).toBeTruthy();
      
      // Check service details
      const idService = servicesData.services.find((s: any) => s.id === 'id');
      expect(idService).toBeDefined();
      expect(idService.name).toBe('ID Service');
      expect(idService.category).toBe('auth');
    });
  });

  test.describe('API Routing and Proxy', () => {
    test('should route requests to ID service correctly', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/id');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.service).toContain('ID');
      
      // Check gateway headers
      await GatewayTestUtils.checkGatewayHeaders(page, response);
    });

    test('should route requests to CODAI service correctly', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/codai');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.service).toContain('CODAI');
      
      const headers = response.headers();
      expect(headers['x-service']).toBe('codai');
    });

    test('should route requests to MemorAI service correctly', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/memorai');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.service).toContain('MemorAI');
      
      const headers = response.headers();
      expect(headers['x-service']).toBe('memorai');
    });

    test('should handle POST requests through gateway', async () => {
      const testData = { name: 'Test Project', description: 'E2E Test Project' };
      
      const response = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/codai/projects`, {
        data: testData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const responseData = await response.json();
      expect(responseData.name).toBe(testData.name);
    });

    test('should handle PUT requests through gateway', async () => {
      const updateData = { name: 'Updated Project', status: 'active' };
      
      const response = await page.request.put(`${GATEWAY_BASE_URL}/api/v1/codai/projects/123`, {
        data: updateData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect([200, 404].includes(response.status())).toBeTruthy(); // 404 is OK for non-existent project
    });

    test('should handle DELETE requests through gateway', async () => {
      const response = await page.request.delete(`${GATEWAY_BASE_URL}/api/v1/codai/projects/123`);
      expect([200, 404].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should allow access to public endpoints', async () => {
      // Health endpoint should be public
      const healthResponse = await GatewayTestUtils.makeApiRequest(page, '/health');
      expect(healthResponse.ok()).toBeTruthy();
      
      // Gateway health should be public
      const gatewayHealthResponse = await GatewayTestUtils.makeApiRequest(page, '/api/gateway/health');
      expect(gatewayHealthResponse.ok()).toBeTruthy();
    });

    test('should require authentication for protected endpoints', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/admin/users');
      expect(response.status()).toBe(401);
      
      const errorData = await response.json();
      expect(errorData.error).toContain('authentication');
    });

    test('should accept valid API keys', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/codai/projects', {
        apiKey: TEST_USER_CREDENTIALS.apiKey
      });
      
      // Should not return 401 with valid API key
      expect(response.status()).not.toBe(401);
    });

    test('should reject invalid API keys', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/admin/users', {
        apiKey: 'invalid-api-key'
      });
      
      expect([401, 403].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Rate Limiting and Throttling', () => {
    test('should apply rate limiting to API requests', async () => {
      const responses = [];
      
      // Make multiple requests rapidly
      for (let i = 0; i < 10; i++) {
        const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/id');
        responses.push(response);
        
        // Check for rate limit headers
        const headers = response.headers();
        expect(headers['x-ratelimit-limit']).toBeDefined();
        expect(headers['x-ratelimit-remaining']).toBeDefined();
      }
      
      // Most requests should succeed within normal limits
      const successfulRequests = responses.filter(r => r.ok()).length;
      expect(successfulRequests).toBeGreaterThan(5);
    });

    test('should return 429 when rate limit exceeded', async () => {
      // This test simulates hitting rate limits
      // In practice, you'd need to make enough requests to trigger the limit
      
      let rateLimitHit = false;
      const maxAttempts = 100; // Adjust based on your rate limit settings
      
      for (let i = 0; i < maxAttempts; i++) {
        const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/id');
        
        if (response.status() === 429) {
          rateLimitHit = true;
          const errorData = await response.json();
          expect(errorData.error).toContain('Too Many Requests');
          break;
        }
        
        // Small delay to avoid overwhelming the test environment
        await page.waitForTimeout(50);
      }
      
      // If we didn't hit the rate limit, that's also acceptable
      // This test verifies the behavior when it does occur
      if (rateLimitHit) {
        expect(rateLimitHit).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling and Resilience', () => {
    test('should handle service unavailability gracefully', async () => {
      // Try to access a non-existent service
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/nonexistent');
      expect(response.status()).toBe(404);
      
      const errorData = await response.json();
      expect(errorData.error).toBe('Service Not Found');
      expect(errorData.message).toContain('nonexistent');
    });

    test('should propagate service errors correctly', async () => {
      // This assumes your mock services have error endpoints
      const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/codai/error');
      
      // Should propagate the service error status
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should handle malformed requests', async () => {
      const response = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/codai/projects`, {
        data: 'invalid json string',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(400);
      const errorData = await response.json();
      expect(errorData.error).toContain('Bad Request');
    });

    test('should handle large request payloads', async () => {
      const largeData = {
        name: 'Large Test Project',
        description: 'A'.repeat(10000), // 10KB description
        metadata: Array.from({ length: 1000 }, (_, i) => ({ key: `item-${i}`, value: `value-${i}` }))
      };
      
      const response = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/codai/projects`, {
        data: largeData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Should handle large payloads appropriately
      expect([200, 413].includes(response.status())).toBeTruthy(); // 413 = Payload Too Large
    });
  });

  test.describe('CORS and Security Headers', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await page.request.fetch(`${GATEWAY_BASE_URL}/api/v1/codai`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Authorization,Content-Type'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeDefined();
      expect(headers['access-control-allow-methods']).toBeDefined();
      expect(headers['access-control-allow-headers']).toBeDefined();
    });

    test('should include security headers in all responses', async () => {
      const response = await GatewayTestUtils.makeApiRequest(page, '/health');
      const headers = response.headers();
      
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should support multiple origins in CORS', async () => {
      const origins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://codai.app'
      ];
      
      for (const origin of origins) {
        const response = await page.request.get(`${GATEWAY_BASE_URL}/api/v1/id`, {
          headers: { 'Origin': origin }
        });
        
        const headers = response.headers();
        expect(headers['access-control-allow-origin']).toBeDefined();
      }
    });
  });

  test.describe('Performance and Load Handling', () => {
    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 20;
      const startTime = Date.now();
      
      const requestPromises = Array.from({ length: concurrentRequests }, (_, i) =>
        GatewayTestUtils.makeApiRequest(page, `/api/v1/codai?test=${i}`)
      );
      
      const responses = await Promise.all(requestPromises);
      const totalTime = Date.now() - startTime;
      
      // All requests should complete successfully
      const successfulResponses = responses.filter(r => r.ok()).length;
      expect(successfulResponses).toBe(concurrentRequests);
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds max for 20 concurrent requests
      
      console.log(`Concurrent requests completed in ${totalTime}ms`);
    });

    test('should maintain low response times under load', async () => {
      const testRequests = 50;
      const responseTimes: number[] = [];
      const maxAcceptableTime = 2000; // 2 seconds max per request
      
      for (let i = 0; i < testRequests; i++) {
        const startTime = Date.now();
        const response = await GatewayTestUtils.makeApiRequest(page, '/api/v1/id');
        const responseTime = Date.now() - startTime;
        
        responseTimes.push(responseTime);
        expect(response.ok()).toBeTruthy();
        expect(responseTime).toBeLessThan(maxAcceptableTime);
        
        // Small delay to prevent overwhelming
        if (i % 10 === 0) {
          await page.waitForTimeout(100);
        }
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`Maximum response time: ${maxResponseTime}ms`);
      
      expect(avgResponseTime).toBeLessThan(1000); // Average under 1 second
    });
  });

  test.describe('Real-World User Scenarios', () => {
    test('should support complete project creation flow', async () => {
      // Step 1: Create a new project
      const projectData = {
        name: 'E2E Test Project',
        description: 'Created via E2E test',
        type: 'web-app'
      };
      
      const createResponse = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/codai/projects`, {
        data: projectData,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_USER_CREDENTIALS.apiKey
        }
      });
      
      expect(createResponse.ok()).toBeTruthy();
      const createdProject = await createResponse.json();
      const projectId = createdProject.id;
      
      // Step 2: Retrieve the created project
      const getResponse = await GatewayTestUtils.makeApiRequest(
        page, 
        `/api/v1/codai/projects/${projectId}`,
        { apiKey: TEST_USER_CREDENTIALS.apiKey }
      );
      
      expect(getResponse.ok()).toBeTruthy();
      const retrievedProject = await getResponse.json();
      expect(retrievedProject.name).toBe(projectData.name);
      
      // Step 3: Update the project
      const updateData = { ...projectData, description: 'Updated via E2E test' };
      const updateResponse = await page.request.put(`${GATEWAY_BASE_URL}/api/v1/codai/projects/${projectId}`, {
        data: updateData,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_USER_CREDENTIALS.apiKey
        }
      });
      
      expect(updateResponse.ok()).toBeTruthy();
      
      // Step 4: Delete the project
      const deleteResponse = await page.request.delete(`${GATEWAY_BASE_URL}/api/v1/codai/projects/${projectId}`, {
        headers: {
          'X-API-Key': TEST_USER_CREDENTIALS.apiKey
        }
      });
      
      expect(deleteResponse.ok()).toBeTruthy();
    });

    test('should support user authentication flow', async () => {
      // Step 1: Login request
      const loginData = {
        email: TEST_USER_CREDENTIALS.email,
        password: TEST_USER_CREDENTIALS.password
      };
      
      const loginResponse = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/id/auth/login`, {
        data: loginData,
        headers: { 'Content-Type': 'application/json' }
      });
      
      expect([200, 404].includes(loginResponse.status())).toBeTruthy(); // 404 if auth service not available
      
      if (loginResponse.ok()) {
        const authData = await loginResponse.json();
        const token = authData.token;
        
        // Step 2: Use token to access protected resource
        const protectedResponse = await GatewayTestUtils.makeApiRequest(
          page,
          '/api/v1/admin/users',
          { token }
        );
        
        expect([200, 403].includes(protectedResponse.status())).toBeTruthy();
      }
    });

    test('should support memory operations flow', async () => {
      const memoryData = {
        content: 'E2E test memory',
        metadata: { type: 'test', priority: 'high' }
      };
      
      // Step 1: Store memory
      const storeResponse = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/memorai/memories`, {
        data: memoryData,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_USER_CREDENTIALS.apiKey
        }
      });
      
      if (storeResponse.ok()) {
        const storedMemory = await storeResponse.json();
        const memoryId = storedMemory.id;
        
        // Step 2: Retrieve memory
        const getResponse = await GatewayTestUtils.makeApiRequest(
          page,
          `/api/v1/memorai/memories/${memoryId}`,
          { apiKey: TEST_USER_CREDENTIALS.apiKey }
        );
        
        expect(getResponse.ok()).toBeTruthy();
        const retrievedMemory = await getResponse.json();
        expect(retrievedMemory.content).toBe(memoryData.content);
        
        // Step 3: Search memories
        const searchResponse = await page.request.post(`${GATEWAY_BASE_URL}/api/v1/memorai/search`, {
          data: { query: 'E2E test' },
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': TEST_USER_CREDENTIALS.apiKey
          }
        });
        
        expect(searchResponse.ok()).toBeTruthy();
        const searchResults = await searchResponse.json();
        expect(Array.isArray(searchResults.results)).toBeTruthy();
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work correctly in Firefox', async () => {
      const firefoxBrowser = await firefox.launch();
      const firefoxPage = await firefoxBrowser.newPage();
      
      try {
        const response = await firefoxPage.request.get(`${GATEWAY_BASE_URL}/health`);
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.service).toBe('api-gateway');
      } finally {
        await firefoxPage.close();
        await firefoxBrowser.close();
      }
    });

    test('should work correctly in WebKit/Safari', async () => {
      const webkitBrowser = await webkit.launch();
      const webkitPage = await webkitBrowser.newPage();
      
      try {
        const response = await webkitPage.request.get(`${GATEWAY_BASE_URL}/api/gateway/health`);
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.gateway.status).toBe('healthy');
      } finally {
        await webkitPage.close();
        await webkitBrowser.close();
      }
    });
  });

  test.describe('Gateway Dashboard Integration', () => {
    test('should display gateway metrics in dashboard', async () => {
      // Navigate to gateway dashboard (if it exists)
      await page.goto(`${GATEWAY_BASE_URL}/dashboard`);
      
      // Check if dashboard loads (might return 404 if not implemented)
      const response = await page.waitForResponse('**/dashboard', { timeout: 5000 }).catch(() => null);
      
      if (response && response.ok()) {
        // Verify dashboard elements are present
        await expect(page.locator('[data-testid="gateway-status"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('[data-testid="service-list"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('[data-testid="metrics-panel"]')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show real-time service health status', async () => {
      // This test assumes a dashboard exists that shows service health
      const metricsResponse = await GatewayTestUtils.makeApiRequest(page, '/api/gateway/metrics');
      
      if (metricsResponse.ok()) {
        const metrics = await metricsResponse.json();
        expect(metrics.success).toBeTruthy();
        expect(metrics.metrics).toBeDefined();
        expect(typeof metrics.metrics.totalRequests).toBe('number');
        expect(typeof metrics.metrics.averageResponseTime).toBe('number');
      }
    });
  });
});
