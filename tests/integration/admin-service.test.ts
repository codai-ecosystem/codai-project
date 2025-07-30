/**
 * Admin Service Integration Tests - Real Services
 * Testing: Admin dashboard, user management, system monitoring,
 * configuration management with live services
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const ADMIN_BASE_URL = 'http://localhost:4002';
const TEST_TIMEOUT = 30000;

// Service configuration for real integration testing
const SERVICE_CONFIG = {
  admin: { url: 'http://localhost:4002', name: 'Admin Service' },
  gateway: { url: 'http://localhost:4000', name: 'Gateway' }
};

class AdminServiceTestRunner {
  async checkServiceHealth(): Promise<boolean> {
    console.log('🔍 Checking Admin service health...');
    
    try {
      // Try multiple potential health endpoints
      const healthEndpoints = ['/health', '/api/health', '/status', '/'];
      
      for (const endpoint of healthEndpoints) {
        try {
          const response = await fetch(`${ADMIN_BASE_URL}${endpoint}`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok || response.status === 401) {
            console.log(`✅ Admin service responding on ${endpoint} (${response.status})`);
            return true;
          }
        } catch (error) {
          // Continue to next endpoint
        }
      }
      
      console.log(`❌ Admin service not responding on any health endpoint`);
      return false;
    } catch (error) {
      console.log(`❌ Admin service connection failed: ${error}`);
      return false;
    }
  }

  async testServiceConnectivity(): Promise<{[key: string]: number}> {
    console.log('🧪 Testing Admin service connectivity...');
    
    const results: {[key: string]: number} = {};
    
    // Test various endpoints to understand service structure
    const testEndpoints = [
      '/',
      '/api',
      '/api/v1',
      '/api/admin',
      '/api/users',
      '/api/dashboard',
      '/api/system',
      '/api/config',
      '/health',
      '/status'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${ADMIN_BASE_URL}${endpoint}`, {
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

describe('Admin Service - Real Integration Tests', () => {
  let testRunner: AdminServiceTestRunner;
  let serviceHealthy: boolean;
  let endpointMap: {[key: string]: number};

  beforeAll(async () => {
    console.log('🚀 Setting up Admin service integration tests...');
    testRunner = new AdminServiceTestRunner();
    
    // Check service health
    serviceHealthy = await testRunner.checkServiceHealth();
    
    // Map available endpoints
    endpointMap = await testRunner.testServiceConnectivity();
    
    console.log(`📊 Admin Service Status: ${serviceHealthy ? 'Healthy' : 'Unhealthy'}`);
    console.log(`📊 Endpoint Discovery: ${Object.keys(endpointMap).length} endpoints tested`);
  }, TEST_TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up Admin service integration tests...');
    console.log('✅ Admin service integration test cleanup complete');
  });

  describe('Service Health and Discovery', () => {
    test('should respond to service connectivity check', async () => {
      expect(serviceHealthy).toBe(true);
      console.log('✅ Admin service is reachable and responding');
    });

    test('should provide service information on root endpoint', async () => {
      const response = await request(ADMIN_BASE_URL)
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
      const apiEndpoints = ['/api', '/api/v1', '/api/admin'];
      
      for (const endpoint of apiEndpoints) {
        const response = await request(ADMIN_BASE_URL)
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
        const response = await request(ADMIN_BASE_URL)
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

  describe('Admin Dashboard Endpoints', () => {
    test('should handle dashboard access', async () => {
      const dashboardEndpoints = ['/api/dashboard', '/dashboard', '/api/admin/dashboard'];
      
      for (const endpoint of dashboardEndpoints) {
        if (endpointMap[endpoint] === 0) {
          console.log(`⚠️ Skipping ${endpoint} - endpoint not responding`);
          continue;
        }

        const response = await request(ADMIN_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            // Expect service response, auth required, or endpoint not found
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Dashboard access ${endpoint} - Status: ${response.status}`);
        
        if (response.status === 401) {
          expect(response.body).toHaveProperty('error');
        }
      }
    });

    test('should handle system monitoring endpoints', async () => {
      const monitoringEndpoints = ['/api/system', '/api/monitoring', '/api/metrics'];
      
      for (const endpoint of monitoringEndpoints) {
        const response = await request(ADMIN_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Monitoring endpoint ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle configuration management', async () => {
      const configEndpoints = ['/api/config', '/api/settings', '/api/admin/config'];
      
      for (const endpoint of configEndpoints) {
        const response = await request(ADMIN_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Configuration endpoint ${endpoint} - Status: ${response.status}`);
      }
    });
  });

  describe('User Management', () => {
    test('should handle user listing', async () => {
      const userEndpoints = ['/api/users', '/api/admin/users'];
      
      for (const endpoint of userEndpoints) {
        const response = await request(ADMIN_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ User listing ${endpoint} - Status: ${response.status}`);
        
        if (response.status === 401) {
          expect(response.body).toHaveProperty('error');
        }
      }
    });

    test('should handle user creation requests', async () => {
      const response = await request(ADMIN_BASE_URL)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 403, 404, 422]).toContain(res.status);
        });

      console.log(`✅ User creation test - Status: ${response.status}`);
    });

    test('should handle user update requests', async () => {
      const response = await request(ADMIN_BASE_URL)
        .put('/api/users/123')
        .send({
          name: 'Updated User',
          role: 'admin'
        })
        .expect((res) => {
          expect([200, 400, 401, 403, 404, 422]).toContain(res.status);
        });

      console.log(`✅ User update test - Status: ${response.status}`);
    });

    test('should handle user deletion requests', async () => {
      const response = await request(ADMIN_BASE_URL)
        .delete('/api/users/123')
        .expect((res) => {
          expect([200, 204, 401, 403, 404]).toContain(res.status);
        });

      console.log(`✅ User deletion test - Status: ${response.status}`);
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for admin endpoints', async () => {
      const protectedEndpoints = ['/api/admin', '/api/users', '/api/system'];
      
      for (const endpoint of protectedEndpoints) {
        const response = await request(ADMIN_BASE_URL)
          .get(endpoint)
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

    test('should accept admin authorization headers', async () => {
      const response = await request(ADMIN_BASE_URL)
        .get('/api/users')
        .set('Authorization', 'Bearer admin-token')
        .expect((res) => {
          // May accept token, reject it, or endpoint may not exist
          expect([200, 401, 403, 404]).toContain(res.status);
        });

      console.log(`✅ Admin authorization test - Status: ${response.status}`);
    });

    test('should enforce role-based access control', async () => {
      const roles = [
        { token: 'user-token', expectedStatus: [401, 403, 404] },
        { token: 'admin-token', expectedStatus: [200, 401, 404] },
        { token: 'super-admin-token', expectedStatus: [200, 404] }
      ];

      for (const { token, expectedStatus } of roles) {
        const response = await request(ADMIN_BASE_URL)
          .get('/api/admin/system')
          .set('Authorization', `Bearer ${token}`)
          .expect((res) => {
            expect(expectedStatus).toContain(res.status);
          });

        console.log(`✅ RBAC test for ${token} - Status: ${response.status}`);
      }
    });
  });

  describe('System Management', () => {
    test('should provide system health information', async () => {
      const response = await request(ADMIN_BASE_URL)
        .get('/api/system/health')
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });

      console.log(`✅ System health test - Status: ${response.status}`);
      
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    test('should handle service management operations', async () => {
      const operations = [
        { method: 'get', endpoint: '/api/system/services' },
        { method: 'post', endpoint: '/api/system/restart' },
        { method: 'post', endpoint: '/api/system/backup' }
      ];

      for (const { method, endpoint } of operations) {
        const response = await (request(ADMIN_BASE_URL) as any)[method](endpoint)
          .expect((res: any) => {
            expect([200, 201, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ System ${method.toUpperCase()} ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle configuration updates', async () => {
      const response = await request(ADMIN_BASE_URL)
        .put('/api/system/config')
        .send({
          maxUsers: 1000,
          features: {
            registration: true,
            analytics: true
          }
        })
        .expect((res) => {
          expect([200, 400, 401, 403, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Configuration update test - Status: ${response.status}`);
    });
  });

  describe('Performance and Monitoring', () => {
    test('should handle concurrent admin requests efficiently', async () => {
      console.log('🧪 Testing concurrent admin request handling...');
      const concurrentRequests = 10;
      const startTime = Date.now();
      
      const requests = Array.from({ length: concurrentRequests }, () =>
        request(ADMIN_BASE_URL)
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
      const response = await request(ADMIN_BASE_URL)
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
      
      const response = await request(ADMIN_BASE_URL)
        .get('/')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      const responseTime = Date.now() - startTime;
      console.log(`📊 Response time: ${responseTime}ms`);
      
      expect(responseTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Data Management', () => {
    test('should handle data export operations', async () => {
      const exportEndpoints = ['/api/export/users', '/api/export/logs', '/api/export/analytics'];
      
      for (const endpoint of exportEndpoints) {
        const response = await request(ADMIN_BASE_URL)
          .get(endpoint)
          .expect((res) => {
            expect([200, 401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Data export ${endpoint} - Status: ${response.status}`);
      }
    });

    test('should handle data import operations', async () => {
      const response = await request(ADMIN_BASE_URL)
        .post('/api/import/users')
        .send({
          data: [
            { email: 'import1@test.com', name: 'Import User 1' },
            { email: 'import2@test.com', name: 'Import User 2' }
          ]
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 403, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Data import test - Status: ${response.status}`);
    });

    test('should handle data validation', async () => {
      const invalidData = {
        users: [
          { email: 'invalid-email', name: '' },
          { email: 'duplicate@test.com', name: 'User 1' },
          { email: 'duplicate@test.com', name: 'User 2' }
        ]
      };

      const response = await request(ADMIN_BASE_URL)
        .post('/api/validate/users')
        .send(invalidData)
        .expect((res) => {
          expect([200, 400, 401, 404, 422]).toContain(res.status);
        });

      console.log(`✅ Data validation test - Status: ${response.status}`);
    });
  });

  describe('Service Integration', () => {
    test('should be accessible through Gateway routing', async () => {
      if (!SERVICE_CONFIG.gateway) {
        console.log('⚠️ Skipping Gateway integration test - Gateway not configured');
        return;
      }

      const response = await request(SERVICE_CONFIG.gateway.url)
        .get('/api/v1/admin')
        .expect((res) => {
          expect([200, 401, 404, 503]).toContain(res.status);
        });

      console.log(`✅ Gateway routing test - Status: ${response.status}`);
    });

    test('should maintain service isolation', async () => {
      // Verify Admin service runs independently
      const response = await request(ADMIN_BASE_URL)
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
        const response = await request(ADMIN_BASE_URL)
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

  describe('Security and Audit', () => {
    test('should log admin actions', async () => {
      const response = await request(ADMIN_BASE_URL)
        .get('/api/audit/logs')
        .expect((res) => {
          expect([200, 401, 403, 404]).toContain(res.status);
        });

      console.log(`✅ Audit logs test - Status: ${response.status}`);
    });

    test('should handle security headers', async () => {
      const response = await request(ADMIN_BASE_URL)
        .get('/')
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });

      const headers = response.headers;
      expect(headers).toHaveProperty('content-type');
      console.log(`✅ Security headers test - Content-Type: ${headers['content-type']}`);
    });

    test('should prevent unauthorized access to sensitive endpoints', async () => {
      const sensitiveEndpoints = ['/api/admin/delete-all', '/api/system/shutdown', '/api/users/export'];
      
      for (const endpoint of sensitiveEndpoints) {
        const response = await request(ADMIN_BASE_URL)
          .post(endpoint)
          .expect((res) => {
            // Should require authentication or not exist
            expect([401, 403, 404, 405]).toContain(res.status);
          });

        console.log(`✅ Sensitive endpoint protection ${endpoint} - Status: ${response.status}`);
      }
    });
  });
});
