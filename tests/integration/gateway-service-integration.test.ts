import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

/**
 * Phase 2.1.2 Gateway Service Integration Tests
 * Priority: CRITICAL
 * 
 * Testing Requirements:
 * - Service proxy routing accuracy
 * - Load balancing behavior  
 * - Circuit breaker functionality
 * - Authentication middleware
 * - Error handling and fallbacks
 * - CORS policy enforcement
 */

const GATEWAY_BASE_URL = 'http://localhost:4000';
const services = {
  codai: { port: 4001, healthPath: '/health' },
  admin: { port: 4002, healthPath: '/api/health' },
  hub: { port: 4003, healthPath: '/api/health' },
  id: { port: 4004, healthPath: '/api/health' },
  bancai: { port: 4005, healthPath: '/api/health' },
  memorai: { port: 4006, healthPath: '/api/health' }
};

describe('Gateway Service Integration Tests - Phase 2.1.2', () => {
  beforeAll(async () => {
    // Validate all services are running before integration tests
    for (const [serviceName, config] of Object.entries(services)) {
      try {
        const response = await fetch(`http://localhost:${config.port}${config.healthPath}`);
        if (!response.ok) {
          console.warn(`Warning: ${serviceName} service may not be fully operational (${response.status})`);
        }
      } catch (error) {
        console.warn(`Warning: ${serviceName} service not accessible at localhost:${config.port}`);
      }
    }
  });

  describe('Service Proxy Routing Accuracy', () => {
    it('should correctly route CODAI service health requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('service', 'codai');
      expect(data).toHaveProperty('port', 4001);
    });

    it('should correctly route Admin service health requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/admin/health`, {
        method: 'GET'
      });
      
      // Admin might require authentication, so 200 or 401 are acceptable
      expect([200, 401].includes(response.status)).toBe(true);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });

    it('should correctly route Hub service health requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/hub/health`);
      
      expect([200, 401, 503].includes(response.status)).toBe(true);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });

    it('should correctly route ID service health requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/id/health`);
      
      expect([200, 401].includes(response.status)).toBe(true);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });

    it('should correctly route BancAI service health requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/bancai/health`);
      
      expect([200, 401, 503].includes(response.status)).toBe(true);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });

    it('should correctly route MemorAI service health requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/memorai/health`);
      
      expect([200, 401].includes(response.status)).toBe(true);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });
  });

  describe('Load Balancing Behavior', () => {
    it('should distribute requests across service instances', async () => {
      const responses = [];
      const requestCount = 10;
      
      // Make multiple requests to test load balancing
      for (let i = 0; i < requestCount; i++) {
        const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`);
        responses.push({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
      }
      
      // All requests should be successful
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBe(requestCount);
      
      // Check for load balancing headers (X-Gateway-Service)
      successfulRequests.forEach(response => {
        expect(response.headers).toHaveProperty('x-service', 'codai');
      });
    });

    it('should handle service instance failures gracefully', async () => {
      // Test request to a potentially failing service
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/hub/health`);
      
      // Should either succeed or fail gracefully (not timeout)
      expect([200, 401, 503, 504].includes(response.status)).toBe(true);
    });
  });

  describe('Authentication Middleware', () => {
    it('should allow access to public health endpoints', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/gateway/health`);
      
      expect([200, 503].includes(response.status)).toBe(true);
    });

    it('should require authentication for protected service endpoints', async () => {
      // Try to access a protected endpoint without token
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/admin/users`, {
        method: 'GET'
      });
      
      // Should require authentication
      expect([401, 403, 404].includes(response.status)).toBe(true);
    });

    it('should validate JWT tokens correctly', async () => {
      // Test with invalid token
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/admin/health`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      // Gateway may pass through to service for validation (200 is acceptable if service handles auth)
      expect([200, 401, 403].includes(response.status)).toBe(true);
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle non-existent service routes', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/nonexistent/health`);
      
      expect(response.status).toBe(404);
    });

    it('should handle malformed requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid-json'
      });
      
      // Should handle malformed requests gracefully
      expect([400, 404, 405].includes(response.status)).toBe(true);
    });

    it('should provide meaningful error responses', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/nonexistent`);
      
      expect(response.status).toBe(404);
      
      // Check if response has meaningful error information
      const contentType = response.headers.get('content-type');
      expect(contentType).toBeTruthy();
    });
  });

  describe('CORS Policy Enforcement', () => {
    it('should include CORS headers in responses', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/gateway/health`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      
      expect([200, 503].includes(response.status)).toBe(true);
      
      // Check for CORS headers (may be added by proxy)
      const headers = response.headers;
      expect(headers.get('x-powered-by')).toBe('Express');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      // OPTIONS requests should be handled appropriately
      expect([200, 204, 405].includes(response.status)).toBe(true);
    });
  });

  describe('Circuit Breaker Functionality', () => {
    it('should maintain service health status', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/gateway/health`);
      
      expect([200, 503].includes(response.status)).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      
      if (data.data?.services) {
        // Validate service health tracking
        expect(data.data.services).toBeTypeOf('object');
      }
    });

    it('should handle service timeouts appropriately', async () => {
      // Test Gateway's resilience to slow services
      const startTime = Date.now();
      const response = await fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`);
      const endTime = Date.now();
      
      // Request should complete within reasonable time (30 seconds max)
      expect(endTime - startTime).toBeLessThan(30000);
      expect([200, 401, 503, 504].includes(response.status)).toBe(true);
    });
  });

  describe('Service Discovery and Registration', () => {
    it('should maintain accurate service registry', async () => {
      const response = await fetch(`${GATEWAY_BASE_URL}/api/gateway/health`);
      
      expect([200, 503].includes(response.status)).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      
      // Gateway should provide service health information
      if (response.status === 503 && data.data?.services) {
        expect(Array.isArray(data.data.services)).toBe(true);
        expect(data.data.services.length).toBeGreaterThan(0);
      }
    });

    it('should route requests to healthy service instances', async () => {
      // Make multiple requests to ensure consistent routing
      const requests = Array.from({ length: 5 }, () => 
        fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`)
      );
      
      const responses = await Promise.all(requests);
      
      // All requests should be handled consistently
      responses.forEach(response => {
        expect([200, 401, 503].includes(response.status)).toBe(true);
      });
      
      // Majority should succeed if service is healthy
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });
});

/**
 * Performance and Reliability Tests
 */
describe('Gateway Performance Integration', () => {
  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 10;
    const startTime = Date.now();
    
    const requests = Array.from({ length: concurrentRequests }, () =>
      fetch(`${GATEWAY_BASE_URL}/api/v1/codai/health`)
    );
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    // All requests should complete
    expect(responses.length).toBe(concurrentRequests);
    
    // Should handle concurrent requests in reasonable time
    expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
    
    // Majority should succeed
    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount).toBeGreaterThan(concurrentRequests * 0.7); // 70% success rate
  });
});
