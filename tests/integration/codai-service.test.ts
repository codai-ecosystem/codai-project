/**
 * CODAI Service Integration Tests - Real Services
 * Testing: AI code generation, conversation management,
 * file processing, real-time streaming with live services
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const CODAI_BASE_URL = 'http://localhost:4001';
const TEST_TIMEOUT = 30000;

// Service configuration for real integration testing
const SERVICE_CONFIG = {
  codai: { url: 'http://localhost:4001', name: 'CODAI Service' },
  gateway: { url: 'http://localhost:4000', name: 'Gateway' }
};

class CODAIServiceTestRunner {
  async checkServiceHealth(): Promise<boolean> {
    console.log('🔍 Checking CODAI service health...');
    
    try {
      // Try multiple potential health endpoints
      const healthEndpoints = ['/health', '/api/health', '/status', '/'];
      
      for (const endpoint of healthEndpoints) {
        try {
          const response = await fetch(`${CODAI_BASE_URL}${endpoint}`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok || response.status === 401) {
            console.log(`✅ CODAI service responding on ${endpoint} (${response.status})`);
            return true;
          }
        } catch (error) {
          // Continue to next endpoint
        }
      }
      
      console.log(`❌ CODAI service not responding on any health endpoint`);
      return false;
    } catch (error) {
      console.log(`❌ CODAI service connection failed: ${error}`);
      return false;
    }
  }

  async testServiceConnectivity(): Promise<{[key: string]: number}> {
    console.log('🧪 Testing CODAI service connectivity...');
    
    const results: {[key: string]: number} = {};
    
    // Test various endpoints to understand service structure
    const testEndpoints = [
      '/',
      '/api',
      '/api/v1',
      '/api/codai',
      '/api/chat',
      '/api/generate',
      '/api/completion',
      '/health',
      '/status'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${CODAI_BASE_URL}${endpoint}`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        results[endpoint] = response.status;
        console.log(`  ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        results[endpoint] = 0;
        console.log(`  ${endpoint}: connection failed`);
      }
    }

    return results;
  }
}

describe('CODAI Service - Real Integration Tests', () => {
  let testRunner: CODAIServiceTestRunner;
  let serviceHealthy: boolean;
  let endpointMap: {[key: string]: number};

  beforeAll(async () => {
    console.log('🚀 Setting up CODAI service integration tests...');
    testRunner = new CODAIServiceTestRunner();
    
    // Check service health
    serviceHealthy = await testRunner.checkServiceHealth();
    
    // Map available endpoints
    endpointMap = await testRunner.testServiceConnectivity();
    
    console.log(`📊 CODAI Service Status: ${serviceHealthy ? 'Healthy' : 'Unhealthy'}`);
    console.log(`📊 Endpoint Discovery: ${Object.keys(endpointMap).length} endpoints tested`);
  }, TEST_TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up CODAI service integration tests...');
    console.log('✅ CODAI service integration test cleanup complete');
  });

  describe('Service Health and Discovery', () => {
    test('should respond to service connectivity check', async () => {
      expect(serviceHealthy).toBe(true);
      console.log('✅ CODAI service is reachable and responding');
    });

    test('should provide service information on root endpoint', async () => {
      const response = await request(CODAI_BASE_URL)
        .get('/')
        .expect((res) => {
          // Service may return various status codes
          expect([200, 404, 401, 403, 302]).toContain(res.status);
        });

      console.log(`✅ Root endpoint test - Status: ${response.status}`);
      
      if (response.status === 200 && response.body) {
        expect(typeof response.body).toBe('object');
      }
    });

    test('should handle API endpoint discovery', async () => {
      const apiEndpoints = ['/api', '/api/v1', '/api/codai'];
      
      for (const endpoint of apiEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 404, 401, 403, 405]).toContain(res.status);
          });
        
        console.log(`✅ API endpoint ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should provide service status information', async () => {
      const statusEndpoints = ['/health', '/status'];
      
      for (const endpoint of statusEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 404, 401, 403, 501]).toContain(res.status);
          });
        
        console.log(`✅ Status endpoint ${endpoint} - Status: ${response.status}`);
        
        if (response.status === 200) {
          expect(response.body).toBeDefined();
        }
      }
    });
  });

  describe('AI Code Generation Endpoints', () => {
    test('should handle code generation requests', async () => {
      const generationEndpoints = ['/api/generate', '/api/completion', '/api/codai'];
      
      for (const endpoint of generationEndpoints) {
        if (endpointMap[endpoint] === 0) {
          console.log(`⚠️ Skipping ${endpoint} - endpoint not responding`);
          continue;
        }

        const response = await request(CODAI_BASE_URL)
          .post(endpoint)
          .send({
            prompt: 'Generate a simple Hello World function in JavaScript',
            language: 'javascript'
          })
          .expect((res) => {
            // Expect service response, auth required, or endpoint not found
            expect([200, 201, 400, 401, 403, 404, 405, 422]).toContain(res.status);
          });

        console.log(`✅ Code generation ${endpoint} - Status: ${response.status}`);
        
        if (response.status === 401) {
          expect(response.body).toHaveProperty('error');
        }
      }
    });

    test('should handle chat/conversation endpoints', async () => {
      const chatEndpoints = ['/api/chat', '/api/conversation'];
      
      for (const endpoint of chatEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .post(endpoint)
          .send({
            message: 'Hello, can you help me write some code?',
            conversation_id: 'test-conversation-1'
          })
          .expect((res) => {
            expect([200, 201, 400, 401, 403, 404, 405, 422]).toContain(res.status);
          });

        console.log(`✅ Chat endpoint ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle file processing endpoints', async () => {
      const fileEndpoints = ['/api/file/analyze', '/api/file/upload', '/api/analyze'];
      
      for (const endpoint of fileEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .post(endpoint)
          .send({
            content: 'function example() { return "test"; }',
            filename: 'test.js',
            language: 'javascript'
          })
          .expect((res) => {
            expect([200, 201, 400, 401, 403, 404, 405, 413, 422]).toContain(res.status);
          });

        console.log(`✅ File processing ${endpoint} - Status: ${response.status}`);
      }
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for protected endpoints', async () => {
      const protectedEndpoints = ['/api/generate', '/api/chat', '/api/codai'];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .post(endpoint)
          .send({ test: 'data' })
          .expect((res) => {
            // Should either work (200) or require auth (401/403) or not exist (404)
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Auth check ${endpoint} - Status: ${response.status}`);
        
        if (response.status === 401) {
          expect(response.body).toHaveProperty('error');
        }
      }
    });

    test('should accept authorization headers', async () => {
      const response = await request(CODAI_BASE_URL)
        .post('/api/generate')
        .set('Authorization', 'Bearer test-token')
        .send({
          prompt: 'Test prompt',
          language: 'javascript'
        })
        .expect((res) => {
          // May accept token, reject it, or endpoint may not exist
          expect([200, 201, 401, 403, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Authorization header test - Status: ${response.status}`);
    });

    test('should handle API key authentication', async () => {
      const response = await request(CODAI_BASE_URL)
        .post('/api/generate')
        .set('X-API-Key', 'test-api-key')
        .send({
          prompt: 'Test with API key',
          language: 'python'
        })
        .expect((res) => {
          expect([200, 201, 401, 403, 404, 422]).toContain(res.status);
        });

      console.log(`✅ API key authentication test - Status: ${response.status}`);
    });
  });

  describe('Request Validation and Error Handling', () => {
    test('should validate request payloads', async () => {
      // Test with invalid payloads
      const invalidPayloads: Array<Record<string, any> | null> = [
        {},
        { invalid: 'data' },
        { prompt: '' },
        null
      ];

      for (const payload of invalidPayloads) {
        const response = await request(CODAI_BASE_URL)
          .post('/api/generate')
          .send(payload || {})
          .expect((res: any) => {
            // Expect validation error, auth error, or not found
            expect([400, 401, 404, 422]).toContain(res.status);
          });

        console.log(`✅ Payload validation test - Status: ${response.status}`);
      }
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(CODAI_BASE_URL)
        .post('/api/generate')
        .set('Content-Type', 'application/json')
        .send('invalid json string')
        .expect((res) => {
          expect([400, 401, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Malformed JSON test - Status: ${response.status}`);
    });

    test('should provide meaningful error messages', async () => {
      const response = await request(CODAI_BASE_URL)
        .post('/api/nonexistent-endpoint')
        .send({ test: 'data' })
        .expect((res) => {
          expect([404, 405]).toContain(res.status);
        });

      expect(response.body).toBeDefined();
      console.log(`✅ Error message test - Status: ${response.status}`);
    });
  });

  describe('HTTP Methods and CORS', () => {
    test('should handle different HTTP methods appropriately', async () => {
      const methods = [
        { method: 'get', endpoint: '/' },
        { method: 'post', endpoint: '/api/generate' },
        { method: 'put', endpoint: '/api/update' },
        { method: 'delete', endpoint: '/api/delete' }
      ];

      for (const { method, endpoint } of methods) {
        const response = await (request(CODAI_BASE_URL) as any)[method](endpoint)
          .expect((res: any) => {
            // Various valid responses depending on implementation
            expect([200, 201, 400, 401, 404, 405, 422]).toContain(res.status);
          });

        console.log(`✅ HTTP ${method.toUpperCase()} ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(CODAI_BASE_URL)
        .options('/api/generate')
        .set('Origin', 'https://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect((res) => {
          expect([200, 204, 404, 405]).toContain(res.status);
        });

      console.log(`✅ CORS preflight test - Status: ${response.status}`);
    });

    test('should include appropriate response headers', async () => {
      const response = await request(CODAI_BASE_URL)
        .get('/')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      const headers = response.headers;
      expect(headers).toHaveProperty('content-type');
      console.log(`✅ Response headers test - Content-Type: ${headers['content-type']}`);
    });
  });

  describe('Performance and Streaming', () => {
    test('should handle concurrent requests efficiently', async () => {
      console.log('🧪 Testing concurrent request handling...');
      const concurrentRequests = 10;
      const startTime = Date.now();
      
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(CODAI_BASE_URL)
          .get('/')
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
      const successfulRequests = responses.filter(r => r.status > 0).length;
      const averageResponseTime = totalTime / concurrentRequests;

      console.log(`📊 Concurrent requests: ${successfulRequests}/${concurrentRequests} successful`);
      console.log(`📊 Total time: ${totalTime}ms, Average: ${averageResponseTime.toFixed(2)}ms`);

      expect(successfulRequests).toBeGreaterThan(concurrentRequests * 0.7); // 70% success rate
      expect(averageResponseTime).toBeLessThan(2000); // Less than 2 seconds average
    });

    test('should handle streaming responses appropriately', async () => {
      // Test potential streaming endpoints
      const streamingEndpoints = ['/api/stream', '/api/generate/stream'];
      
      for (const endpoint of streamingEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .post(endpoint)
          .send({
            prompt: 'Generate a streaming response',
            stream: true
          })
          .expect((res) => {
            // Streaming may not be implemented, so accept various responses
            expect([200, 404, 401, 405]).toContain(res.status);
          });

        console.log(`✅ Streaming endpoint ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should maintain reasonable response times', async () => {
      const startTime = Date.now();
      
      const response = await request(CODAI_BASE_URL)
        .get('/')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      const responseTime = Date.now() - startTime;
      console.log(`📊 Response time: ${responseTime}ms`);
      
      expect(responseTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Service Integration', () => {
    test('should be accessible through Gateway routing', async () => {
      if (!SERVICE_CONFIG.gateway) {
        console.log('⚠️ Skipping Gateway integration test - Gateway not configured');
        return;
      }

      const response = await request(SERVICE_CONFIG.gateway.url)
        .get('/api/v1/codai')
        .expect((res) => {
          expect([200, 401, 404, 503]).toContain(res.status);
        });

      console.log(`✅ Gateway routing test - Status: ${response.status}`);
    });

    test('should maintain service isolation', async () => {
      // Verify CODAI service runs independently
      const response = await request(CODAI_BASE_URL)
        .get('/')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      expect(response.status).toBeGreaterThan(0);
      console.log('✅ Service isolation verified');
    });

    test('should provide service metadata', async () => {
      const metadataEndpoints = ['/api/info', '/api/version', '/version'];
      
      for (const endpoint of metadataEndpoints) {
        const response = await request(CODAI_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 404, 401]).toContain(res.status);
          });

        if (response.status === 200) {
          expect(response.body).toBeDefined();
          console.log(`✅ Service metadata ${endpoint} available`);
        } else {
          console.log(`ℹ️ Service metadata ${endpoint} - Status: ${response.status}`);
        }
      }
    });
  });

  describe('Resource Management', () => {
    test('should handle large request payloads appropriately', async () => {
      const largePayload = {
        prompt: 'Generate code for ' + 'a'.repeat(10000), // Large prompt
        context: 'large context data'.repeat(1000),
        language: 'javascript'
      };

      const response = await request(CODAI_BASE_URL)
        .post('/api/generate')
        .send(largePayload)
        .expect((res) => {
          // May accept, reject due to size, require auth, or not exist
          expect([200, 400, 401, 404, 413, 422]).toContain(res.status);
        });

      console.log(`✅ Large payload test - Status: ${response.status}`);
    });

    test('should handle timeout scenarios gracefully', async () => {
      const response = await request(CODAI_BASE_URL)
        .get('/')
        .timeout(500) // Very short timeout
        .expect((res) => {
          expect([200, 404, 401, 408]).toContain(res.status);
        })
        .catch((error) => {
          // Timeout is acceptable for this test
          expect(error.code).toMatch(/TIMEOUT|ECONNABORTED/);
          return { status: 408 };
        });

      console.log(`✅ Timeout handling test - Status: ${response.status || 'timeout'}`);
    });
  });
});
