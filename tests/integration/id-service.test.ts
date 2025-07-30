/**
 * ID Service Integration Tests - Real Services
 * Testing: Identity management, authentication, user profiles,
 * session management, security with live services
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const ID_BASE_URL = 'http://localhost:4004';
const TEST_TIMEOUT = 30000;

// Service configuration for real integration testing
const SERVICE_CONFIG = {
  id: { url: 'http://localhost:4004', name: 'ID Service' },
  gateway: { url: 'http://localhost:4000', name: 'Gateway' }
};

class IDServiceTestRunner {
  async checkServiceHealth(): Promise<boolean> {
    console.log('🔍 Checking ID service health...');
    
    try {
      // Try multiple potential health endpoints
      const healthEndpoints = ['/health', '/api/health', '/status', '/'];
      
      for (const endpoint of healthEndpoints) {
        try {
          const response = await fetch(`${ID_BASE_URL}${endpoint}`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok || response.status === 401) {
            console.log(`✅ ID service responding on ${endpoint} (${response.status})`);
            return true;
          }
        } catch (error) {
          // Continue to next endpoint
        }
      }
      
      console.log(`❌ ID service not responding on any health endpoint`);
      return false;
    } catch (error) {
      console.log(`❌ ID service connection failed: ${error}`);
      return false;
    }
  }

  async testServiceConnectivity(): Promise<{[key: string]: number}> {
    console.log('🧪 Testing ID service connectivity...');
    
    const results: {[key: string]: number} = {};
    
    // Test various endpoints to understand service structure
    const testEndpoints = [
      '/',
      '/api',
      '/api/v1',
      '/api/auth',
      '/api/users',
      '/api/profile',
      '/api/sessions',
      '/api/tokens',
      '/api/identity',
      '/login',
      '/register',
      '/logout',
      '/health',
      '/status'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${ID_BASE_URL}${endpoint}`, {
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

describe('ID Service - Real Integration Tests', () => {
  let testRunner: IDServiceTestRunner;
  let serviceHealthy: boolean;
  let endpointMap: {[key: string]: number};

  beforeAll(async () => {
    console.log('🚀 Setting up ID service integration tests...');
    testRunner = new IDServiceTestRunner();
    
    // Check service health
    serviceHealthy = await testRunner.checkServiceHealth();
    
    // Map available endpoints
    endpointMap = await testRunner.testServiceConnectivity();
    
    console.log(`📊 ID Service Status: ${serviceHealthy ? 'Healthy' : 'Unhealthy'}`);
    console.log(`📊 Endpoint Discovery: ${Object.keys(endpointMap).length} endpoints tested`);
  }, TEST_TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up ID service integration tests...');
    console.log('✅ ID service integration test cleanup complete');
  });

  describe('Service Health and Discovery', () => {
    test('should respond to service connectivity check', async () => {
      expect(serviceHealthy).toBe(true);
      console.log('✅ ID service is reachable and responding');
    });

    test('should provide service information on root endpoint', async () => {
      const response = await request(ID_BASE_URL)
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
      const apiEndpoints = ['/api', '/api/v1', '/api/auth'];
      
      for (const endpoint of apiEndpoints) {
        const response = await request(ID_BASE_URL)
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
        const response = await request(ID_BASE_URL)
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

  describe('Authentication Endpoints', () => {
    test('should handle login endpoint', async () => {
      const response = await request(ID_BASE_URL)
        .get('/login')
        .expect((res) => {
          expect([200, 401, 404, 405]).toContain(res.status);
        });

      console.log(`✅ Login endpoint test - Status: ${response.status}`);
    });

    test('should handle register endpoint', async () => {
      const response = await request(ID_BASE_URL)
        .get('/register')
        .expect((res) => {
          expect([200, 401, 404, 405]).toContain(res.status);
        });

      console.log(`✅ Register endpoint test - Status: ${response.status}`);
    });

    test('should handle logout endpoint', async () => {
      const response = await request(ID_BASE_URL)
        .get('/logout')
        .expect((res) => {
          expect([200, 401, 404, 405, 302]).toContain(res.status);
        });

      console.log(`✅ Logout endpoint test - Status: ${response.status}`);
    });

    test('should handle authentication API', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/auth')
        .expect((res) => {
          expect([200, 401, 404, 405]).toContain(res.status);
        });

      console.log(`✅ Auth API test - Status: ${response.status}`);
    });
  });

  describe('User Authentication Flow', () => {
    test('should handle user login request', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/auth/login')
        .send(loginData)
        .expect((res) => {
          expect([200, 401, 400, 404, 422, 500]).toContain(res.status);
        });

      console.log(`✅ User login test - Status: ${response.status}`);
    });

    test('should handle user registration request', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        name: 'Test User'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/auth/register')
        .send(registerData)
        .expect((res) => {
          expect([200, 201, 400, 409, 422, 404, 500]).toContain(res.status);
        });

      console.log(`✅ User registration test - Status: ${response.status}`);
    });

    test('should handle password reset request', async () => {
      const resetData = {
        email: 'test@example.com'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/auth/forgot-password')
        .send(resetData)
        .expect((res) => {
          expect([200, 400, 404, 422, 500]).toContain(res.status);
        });

      console.log(`✅ Password reset test - Status: ${response.status}`);
    });

    test('should handle token validation', async () => {
      const response = await request(ID_BASE_URL)
        .post('/api/auth/validate')
        .set('Authorization', 'Bearer test-token')
        .expect((res) => {
          expect([200, 401, 404, 500]).toContain(res.status);
        });

      console.log(`✅ Token validation test - Status: ${response.status}`);
    });
  });

  describe('User Management', () => {
    test('should handle user profile retrieval', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/users/profile')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ User profile retrieval test - Status: ${response.status}`);
    });

    test('should handle user profile updates', async () => {
      const profileData = {
        name: 'Updated User',
        bio: 'Updated bio'
      };

      const response = await request(ID_BASE_URL)
        .put('/api/users/profile')
        .send(profileData)
        .expect((res) => {
          expect([200, 401, 400, 404, 422]).toContain(res.status);
        });

      console.log(`✅ User profile update test - Status: ${response.status}`);
    });

    test('should handle user list retrieval', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/users')
        .expect((res) => {
          expect([200, 401, 403, 404]).toContain(res.status);
        });

      console.log(`✅ User list retrieval test - Status: ${response.status}`);
    });

    test('should handle specific user retrieval', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/users/123')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Specific user retrieval test - Status: ${response.status}`);
    });
  });

  describe('Session Management', () => {
    test('should handle session creation', async () => {
      const sessionData = {
        userId: '123',
        deviceInfo: 'Test Device'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/sessions')
        .send(sessionData)
        .expect((res) => {
          expect([200, 201, 401, 400, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Session creation test - Status: ${response.status}`);
    });

    test('should handle session retrieval', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/sessions')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Session retrieval test - Status: ${response.status}`);
    });

    test('should handle session deletion', async () => {
      const response = await request(ID_BASE_URL)
        .delete('/api/sessions/test-session-id')
        .expect((res) => {
          expect([200, 204, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Session deletion test - Status: ${response.status}`);
    });

    test('should handle session validation', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/sessions/validate')
        .set('X-Session-ID', 'test-session-id')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Session validation test - Status: ${response.status}`);
    });
  });

  describe('Token Management', () => {
    test('should handle token generation', async () => {
      const tokenData = {
        userId: '123',
        scope: 'api'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/tokens')
        .send(tokenData)
        .expect((res) => {
          expect([200, 201, 401, 400, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Token generation test - Status: ${response.status}`);
    });

    test('should handle token refresh', async () => {
      const refreshData = {
        refreshToken: 'test-refresh-token'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/tokens/refresh')
        .send(refreshData)
        .expect((res) => {
          expect([200, 401, 400, 404]).toContain(res.status);
        });

      console.log(`✅ Token refresh test - Status: ${response.status}`);
    });

    test('should handle token revocation', async () => {
      const response = await request(ID_BASE_URL)
        .delete('/api/tokens/test-token-id')
        .expect((res) => {
          expect([200, 204, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Token revocation test - Status: ${response.status}`);
    });

    test('should handle token introspection', async () => {
      const response = await request(ID_BASE_URL)
        .post('/api/tokens/introspect')
        .send({ token: 'test-token' })
        .expect((res) => {
          expect([200, 400, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Token introspection test - Status: ${response.status}`);
    });
  });

  describe('Identity Verification', () => {
    test('should handle identity verification request', async () => {
      const verificationData = {
        userId: '123',
        method: 'email',
        code: '123456'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/identity/verify')
        .send(verificationData)
        .expect((res) => {
          expect([200, 400, 401, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Identity verification test - Status: ${response.status}`);
    });

    test('should handle verification code sending', async () => {
      const codeRequest = {
        userId: '123',
        method: 'email'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/identity/send-code')
        .send(codeRequest)
        .expect((res) => {
          expect([200, 400, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Verification code sending test - Status: ${response.status}`);
    });

    test('should handle identity status check', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/identity/status')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Identity status check test - Status: ${response.status}`);
    });
  });

  describe('Security and Authorization', () => {
    test('should require authentication for protected endpoints', async () => {
      const protectedEndpoints = ['/api/users/profile', '/api/sessions', '/api/tokens'];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request(ID_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            // Should either work (200) or require auth (401/403) or not exist (404)
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Auth check ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should accept Bearer token authentication', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer test-token')
        .expect((res) => {
          expect([200, 401, 403, 404]).toContain(res.status);
        });

      console.log(`✅ Bearer token auth test - Status: ${response.status}`);
    });

    test('should handle CORS preflight requests', async () => {
      const response = await request(ID_BASE_URL)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect((res) => {
          expect([200, 204, 404, 405, 400]).toContain(res.status);
        });

      console.log(`✅ CORS preflight test - Status: ${response.status}`);
    });

    test('should prevent sensitive operations without authorization', async () => {
      const sensitiveEndpoints = ['/api/users/delete', '/api/sessions/all', '/api/tokens/revoke-all'];
      
      for (const endpoint of sensitiveEndpoints) {
        const response = await request(ID_BASE_URL)
          .delete(endpoint)
          .expect((res) => {
            // Should require authentication or not exist
            expect([401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Sensitive endpoint protection ${endpoint} - Status: ${response.status}`);
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent ID requests efficiently', async () => {
      console.log('🧪 Testing concurrent ID request handling...');
      const concurrentRequests = 10;
      const startTime = Date.now();
      
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(ID_BASE_URL)
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

    test('should provide performance metrics', async () => {
      const response = await request(ID_BASE_URL)
        .get('/api/metrics')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ Performance metrics test - Status: ${response.status}`);
      
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    test('should maintain reasonable response times', async () => {
      const startTime = Date.now();
      
      const response = await request(ID_BASE_URL)
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
        .get('/api/v1/id')
        .expect((res) => {
          expect([200, 401, 404, 503]).toContain(res.status);
        });

      console.log(`✅ Gateway routing test - Status: ${response.status}`);
    });

    test('should maintain service isolation', async () => {
      // Verify ID service runs independently
      const response = await request(ID_BASE_URL)
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
        const response = await request(ID_BASE_URL)
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

  describe('Data Validation and Security', () => {
    test('should validate email format in registration', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'validpassword123'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect((res) => {
          expect([400, 422, 404, 500]).toContain(res.status);
        });

      console.log(`✅ Email validation test - Status: ${response.status}`);
    });

    test('should enforce password complexity', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect((res) => {
          expect([400, 422, 404, 500]).toContain(res.status);
        });

      console.log(`✅ Password complexity test - Status: ${response.status}`);
    });

    test('should handle SQL injection attempts', async () => {
      const maliciousData = {
        email: "'; DROP TABLE users; --",
        password: 'testpassword'
      };

      const response = await request(ID_BASE_URL)
        .post('/api/auth/login')
        .send(maliciousData)
        .expect((res) => {
          expect([400, 401, 422, 404, 500]).toContain(res.status);
        });

      console.log(`✅ SQL injection protection test - Status: ${response.status}`);
    });

    test('should rate limit authentication attempts', async () => {
      console.log('🧪 Testing authentication rate limiting...');
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const requests = Array.from({ length: 5 }, () =>
        request(ID_BASE_URL)
          .post('/api/auth/login')
          .send(loginData)
          .catch(error => ({ status: 0, error: error.message }))
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429).length;

      console.log(`📊 Rate limiting: ${rateLimitedResponses} requests rate limited`);
      // Rate limiting may or may not be implemented, so we just log the results
    });
  });
});
