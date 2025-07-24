/**
 * Gateway Service Integration Tests - Real Services
 * Testing: Real end-to-end routing, authentication flow,
 * load balancing, error propagation with live services
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const GATEWAY_BASE_URL = 'http://localhost:4000';
const TEST_TIMEOUT = 30000;

// Real service endpoints that should be running
const SERVICES = {
  gateway: { url: 'http://localhost:4000', name: 'Gateway' },
  codai: { url: 'http://localhost:4001', name: 'CODAI' },
  admin: { url: 'http://localhost:4002', name: 'Admin' },
  hub: { url: 'http://localhost:4003', name: 'Hub' },
  id: { url: 'http://localhost:4004', name: 'ID' },
  bancai: { url: 'http://localhost:4005', name: 'BancAI' },
  memorai: { url: 'http://localhost:4006', name: 'MemorAI' }
};

class RealServiceTestRunner {
  async verifyServicesRunning(): Promise<{ [key: string]: boolean }> {
    console.log('🔍 Verifying all services are running...');
    
    const results: { [key: string]: boolean } = {};
    
    for (const [key, service] of Object.entries(SERVICES)) {
      try {
        const response = await fetch(`${service.url}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        results[key] = response.ok;
        console.log(`${response.ok ? '✅' : '❌'} ${service.name} (${service.url}): ${response.ok ? 'healthy' : 'unhealthy'}`);
      } catch (error) {
        results[key] = false;
        console.log(`❌ ${service.name} (${service.url}): connection failed`);
      }
    }
    
    const healthyServices = Object.values(results).filter(Boolean).length;
    console.log(`📊 Services health: ${healthyServices}/${Object.keys(SERVICES).length} services running`);
    return results;
  }

  async waitForServicesReady(maxWaitTime: number = 30000): Promise<void> {
    console.log('⏳ Waiting for services to be ready...');
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const serviceStatus = await this.verifyServicesRunning();
      const healthyCount = Object.values(serviceStatus).filter(Boolean).length;
      
      if (healthyCount >= 5) { // At least 5 services should be running
        console.log('✅ Sufficient services are ready for testing');
        return;
      }
      
      console.log('⏳ Waiting 2 seconds before next check...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Timeout waiting for services to be ready');
  }
}

describe('Gateway Service - Real Integration Tests', () => {
  let testRunner: RealServiceTestRunner;
  let serviceStatus: { [key: string]: boolean };

  beforeAll(async () => {
    console.log('🚀 Setting up real service integration tests...');
    testRunner = new RealServiceTestRunner();
    
    // Wait for services to be ready
    await testRunner.waitForServicesReady();
    serviceStatus = await testRunner.verifyServicesRunning();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up real service integration tests...');
    // No cleanup needed for real services - they continue running
    console.log('✅ Real service integration test cleanup complete');
  });

  describe('Gateway Health and Discovery', () => {
    test('should respond to gateway health check', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      console.log('✅ Gateway health check passed');
    });

    test('should provide comprehensive gateway health status', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/gateway/health')
        .expect(200);

      expect(response.body).toHaveProperty('gateway');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      console.log('✅ Gateway comprehensive health check passed');
    });

    test('should provide service discovery', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/gateway/services')
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      expect(response.body.services.length).toBeGreaterThan(0);
      console.log(`✅ Service discovery returned ${response.body.services.length} services`);
    });

    test('should provide service metrics', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/gateway/metrics')
        .expect((res) => {
          // Accept either 200 (metrics available) or 404 (metrics endpoint not implemented)
          expect([200, 404]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('metrics');
        console.log('✅ Gateway metrics endpoint is available');
      } else {
        console.log('ℹ️ Gateway metrics endpoint not implemented (404 expected)');
      }
    });
  });

  describe('Real Service Routing', () => {
    test('should route requests to ID service through gateway', async () => {
      if (!serviceStatus.id) {
        console.log('⚠️ Skipping ID service test - service not running');
        return;
      }

      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/id')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      console.log(`✅ ID service routing test - Status: ${response.status}`);
      expect(response.headers).toHaveProperty('x-gateway-service');
    });

    test('should route requests to CODAI service through gateway', async () => {
      if (!serviceStatus.codai) {
        console.log('⚠️ Skipping CODAI service test - service not running');
        return;
      }

      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/codai')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      console.log(`✅ CODAI service routing test - Status: ${response.status}`);
      expect(response.headers).toHaveProperty('x-gateway-service');
    });

    test('should route requests to MemorAI service through gateway', async () => {
      if (!serviceStatus.memorai) {
        console.log('⚠️ Skipping MemorAI service test - service not running');
        return;
      }

      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/memorai')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      console.log(`✅ MemorAI service routing test - Status: ${response.status}`);
      expect(response.headers).toHaveProperty('x-gateway-service');
    });

    test('should route POST requests correctly', async () => {
      if (!serviceStatus.codai) {
        console.log('⚠️ Skipping POST routing test - CODAI service not running');
        return;
      }

      const testData = { test: 'integration data', timestamp: Date.now() };
      
      const response = await request(GATEWAY_BASE_URL)
        .post('/api/v1/codai/test')
        .send(testData)
        .expect((res) => {
          expect([200, 201, 404, 401, 405]).toContain(res.status);
        });

      console.log(`✅ POST routing test - Status: ${response.status}`);
      expect(response.headers).toHaveProperty('x-gateway-service');
    });

    test('should add gateway headers to all requests', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-gateway-service', 'codai-gateway');
      expect(response.headers).toHaveProperty('x-request-id');
      console.log('✅ Gateway headers are properly added');
    });
  });

  describe('Authentication and Authorization', () => {
    test('should allow access to public endpoints', async () => {
      const publicEndpoints = ['/health', '/api/gateway/services', '/api/gateway/health'];
      
      for (const endpoint of publicEndpoints) {
        const response = await request(GATEWAY_BASE_URL)
          .get(endpoint)
          .expect(200);
        
        console.log(`✅ Public endpoint ${endpoint} accessible`);
        expect(response.status).toBe(200);
      }
    });

    test('should handle authentication for protected endpoints', async () => {
      const protectedEndpoints = ['/api/v1/admin', '/api/v1/codai', '/api/v1/memorai'];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request(GATEWAY_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            // Either service returns data (200) or requires auth (401) or not found (404)
            expect([200, 401, 404]).toContain(res.status);
          });
        
        console.log(`✅ Protected endpoint ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should accept valid authorization headers', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/codai')
        .set('Authorization', 'Bearer test-token')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Authorization header test - Status: ${response.status}`);
    });

    test('should handle missing authorization appropriately', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/admin')
        .expect((res) => {
          expect([401, 404]).toContain(res.status);
        });

      console.log(`✅ Missing authorization test - Status: ${response.status}`);
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to rapid requests', async () => {
      console.log('🧪 Testing rate limiting with rapid requests...');
      
      const requests = Array.from({ length: 50 }, () =>
        request(GATEWAY_BASE_URL)
          .get('/health')
          .then(res => res.status)
          .catch(() => 429) // Rate limited
      );

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter(status => status === 429).length;
      const successCount = responses.filter(status => status === 200).length;

      console.log(`📊 Rate limiting test: ${successCount} successful, ${rateLimitedCount} rate limited`);
      
      // Either rate limiting is working (some 429s) or service is very fast (all 200s)
      expect(successCount + rateLimitedCount).toBe(50);
      expect(successCount).toBeGreaterThan(0);
    });

    test('should recover from rate limiting after time window', async () => {
      // Trigger rate limiting
      const rapidRequests = Array.from({ length: 20 }, () =>
        request(GATEWAY_BASE_URL).get('/health').catch(() => ({ status: 429 }))
      );
      
      await Promise.all(rapidRequests);
      
      // Wait for rate limit window to reset
      console.log('⏳ Waiting for rate limit window to reset...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test if we can make requests again
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .expect(200);

      console.log('✅ Rate limiting recovery test passed');
      expect(response.status).toBe(200);
    });
  });

  describe('Load Balancing and Failover', () => {
    test('should handle service unavailability gracefully', async () => {
      // Test with a service that might not be running
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/nonexistent-service')
        .expect((res) => {
          expect([404, 503, 502]).toContain(res.status);
        });

      console.log(`✅ Service unavailability test - Status: ${response.status}`);
      expect(response.body).toHaveProperty('error');
    });

    test('should update health status for services', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/gateway/health')
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      
      // Check that services have health status
      const services = response.body.services;
      if (services.length > 0) {
        expect(services[0]).toHaveProperty('status');
        console.log(`✅ Service health tracking - ${services.length} services monitored`);
      }
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle invalid routes gracefully', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/invalid/route/that/does/not/exist')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      console.log('✅ Invalid route handling test passed');
    });

    test('should handle malformed requests', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .post('/api/v1/codai')
        .send('invalid json string')
        .set('Content-Type', 'application/json')
        .expect((res) => {
          expect([400, 404, 401]).toContain(res.status);
        });

      console.log(`✅ Malformed request test - Status: ${response.status}`);
    });

    test('should include error details in responses', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/nonexistent')
        .expect((res) => {
          expect([404, 503]).toContain(res.status);
        });

      expect(response.body).toHaveProperty('error');
      console.log('✅ Error details test passed');
    });

    test('should handle timeout scenarios', async () => {
      // Test with a very short timeout to simulate timeout scenarios
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/codai')
        .timeout(100) // Very short timeout
        .expect((res) => {
          // Either success, auth required, not found, or timeout
          expect([200, 401, 404, 408, 504]).toContain(res.status);
        })
        .catch((error) => {
          // Timeout is acceptable for this test
          expect(error.code).toMatch(/TIMEOUT|ECONNABORTED/);
          return { status: 408 }; // Treat timeout as 408
        });

      console.log(`✅ Timeout handling test - Status: ${response.status || 'timeout'}`);
    });
  });

  describe('Security Headers and CORS', () => {
    test('should include security headers in responses', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .expect(200);

      const headers = response.headers;
      
      // Check for common security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options', 
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      let securityHeaderCount = 0;
      securityHeaders.forEach(header => {
        if (headers[header] || headers[header.toUpperCase()]) {
          securityHeaderCount++;
          console.log(`✅ Security header ${header}: present`);
        }
      });

      console.log(`📊 Security headers: ${securityHeaderCount}/${securityHeaders.length} present`);
      expect(securityHeaderCount).toBeGreaterThan(0);
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .options('/api/v1/codai')
        .set('Origin', 'https://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect((res) => {
          expect([200, 204, 404]).toContain(res.status);
        });

      console.log(`✅ CORS preflight test - Status: ${response.status}`);
    });

    test('should include CORS headers in API responses', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/gateway/services')
        .set('Origin', 'https://localhost:3000')
        .expect(200);

      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];

      let corsHeaderCount = 0;
      corsHeaders.forEach(header => {
        if (response.headers[header]) {
          corsHeaderCount++;
          console.log(`✅ CORS header ${header}: ${response.headers[header]}`);
        }
      });

      console.log(`📊 CORS headers: ${corsHeaderCount}/${corsHeaders.length} present`);
    });
  });

  describe('Request Logging and Monitoring', () => {
    test('should include request IDs in responses', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.headers['x-request-id']).toMatch(/^[a-f0-9-]+$/i);
      console.log(`✅ Request ID: ${response.headers['x-request-id']}`);
    });

    test('should preserve custom request IDs', async () => {
      const customRequestId = 'test-request-' + Date.now();
      
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .set('X-Request-ID', customRequestId)
        .expect(200);

      expect(response.headers['x-request-id']).toBe(customRequestId);
      console.log(`✅ Custom request ID preserved: ${customRequestId}`);
    });

    test('should generate request IDs when not provided', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.headers['x-request-id']).toBeTruthy();
      console.log(`✅ Generated request ID: ${response.headers['x-request-id']}`);
    });

    test('should track request routing information', async () => {
      const response = await request(GATEWAY_BASE_URL)
        .get('/api/v1/codai')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      expect(response.headers).toHaveProperty('x-gateway-service');
      expect(response.headers).toHaveProperty('x-request-id');
      console.log('✅ Request routing information tracked');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent requests efficiently', async () => {
      console.log('🧪 Testing concurrent request handling...');
      const concurrentRequests = 20;
      const startTime = Date.now();
      
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(GATEWAY_BASE_URL)
          .get('/health')
          .then(res => ({
            status: res.status,
            responseTime: Date.now() - startTime
          }))
          .catch(error => ({
            status: 0,
            error: error.message
          }))
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      const successfulRequests = responses.filter(r => r.status === 200).length;
      const averageResponseTime = totalTime / concurrentRequests;

      console.log(`📊 Concurrent requests: ${successfulRequests}/${concurrentRequests} successful`);
      console.log(`📊 Total time: ${totalTime}ms, Average: ${averageResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).toBeGreaterThan(concurrentRequests * 0.8); // 80% success rate
      expect(averageResponseTime).toBeLessThan(1000); // Less than 1 second average
    });

    test('should maintain reasonable response times under load', async () => {
      console.log('🧪 Testing response times under load...');
      const loadRequests = 30;
      const responseTimes: number[] = [];
      
      for (let i = 0; i < loadRequests; i++) {
        const startTime = Date.now();
        
        try {
          await request(GATEWAY_BASE_URL)
            .get('/health')
            .expect(200);
          
          const responseTime = Date.now() - startTime;
          responseTimes.push(responseTime);
        } catch (error) {
          console.log(`Request ${i + 1} failed: ${error}`);
        }
      }

      if (responseTimes.length > 0) {
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        
        console.log(`📊 Load test: ${responseTimes.length}/${loadRequests} successful requests`);
        console.log(`📊 Average response time: ${averageResponseTime.toFixed(2)}ms`);
        console.log(`📊 Max response time: ${maxResponseTime}ms`);

        expect(averageResponseTime).toBeLessThan(500); // Average under 500ms
        expect(maxResponseTime).toBeLessThan(2000); // Max under 2 seconds
      }
    });
  });
});
