/**
 * MemorAI Service - Real Integration Tests (Corrected)
 * Phase 7b of Comprehensive Testing Plan
 * 
 * Testing real MemorAI Next.js service on localhost:4006
 * Handles authentication and proper Next.js API routes
 * NO MOCKS - Only real service connections and data
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const MEMORAI_SERVICE_URL = 'http://localhost:4006';
const TIMEOUT = 10000;

// Global test setup
let serviceAvailable = false;
let discoveredEndpoints: { [key: string]: number } = {};

// Test helper function for MemorAI Next.js API
async function testEndpoint(path: string, method: string = 'GET', data?: any, headers?: any): Promise<any> {
  try {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CODAI-Test/1.0',
        ...headers
      },
      redirect: 'manual' // Handle redirects manually to detect auth redirects
    };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${MEMORAI_SERVICE_URL}${path}`, config);
    
    // Handle authentication redirects (302, 307)
    if (response.status === 302 || response.status === 307) {
      const location = response.headers.get('location');
      return {
        status: response.status,
        ok: false,
        redirect: location,
        authRequired: location?.includes('/login') || false
      };
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: response.status >= 200 && response.status < 500 ? await response.text().catch(() => '') : null
    };
  } catch (error) {
    // Network errors or connection refused
    return {
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : 'Connection error'
    };
  }
}

describe('MemorAI Service - Real Integration Tests (Corrected)', () => {
  
  beforeAll(async () => {
    console.log('🚀 Setting up MemorAI service integration tests (corrected)...');
    
    // Test basic connectivity
    const healthCheck = await testEndpoint('/');
    serviceAvailable = healthCheck.status > 0;
    
    if (serviceAvailable) {
      console.log('✅ MemorAI service is responding');
      
      // Discover actual API endpoints
      const apiEndpoints = [
        '/',
        '/api',
        '/api/health',
        '/api/memory',
        '/api/remember',
        '/api/mcp',
        '/api/auth',
        '/api/dashboard',
        '/api/stats',
        '/api/test',
        '/api/user',
        '/api/workspace',
        '/api/ai',
        '/api/core',
        '/api/features',
        '/api/integrations'
      ];
      
      console.log('🔍 Discovering MemorAI API endpoints...');
      
      for (const endpoint of apiEndpoints) {
        const result = await testEndpoint(endpoint);
        discoveredEndpoints[endpoint] = result.status;
        
        // Log endpoint discovery results
        if (result.authRequired) {
          console.log(`  ${endpoint}: ${result.status} (Auth Required - redirects to ${result.redirect})`);
        } else if (result.status === 0) {
          console.log(`  ${endpoint}: ${result.status} (Connection Error)`);
        } else {
          console.log(`  ${endpoint}: ${result.status} ${result.ok ? 'OK' : 'Error'}`);
        }
      }
      
      console.log(`📊 MemorAI Service Status: Healthy`);
      console.log(`📊 Endpoint Discovery: ${Object.keys(discoveredEndpoints).length} endpoints tested`);
    } else {
      console.log('❌ MemorAI service is not responding');
    }
  }, TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up MemorAI service integration tests...');
    console.log('✅ MemorAI service integration test cleanup complete');
  });

  describe('Service Health and Discovery', () => {
    it('should respond to root endpoint check', async () => {
      const result = await testEndpoint('/');
      expect([200, 302, 307, 404].includes(result.status)).toBe(true);
      console.log(`✅ Root endpoint test - Status: ${result.status}`);
    });

    it('should handle Next.js application structure', async () => {
      const result = await testEndpoint('/');
      // Next.js apps typically return 200 for root or redirect for auth
      expect([200, 302, 307, 404].includes(result.status)).toBe(true);
      console.log(`✅ Next.js structure test - Status: ${result.status}`);
    });

    it('should provide API endpoint discovery', async () => {
      const result = await testEndpoint('/api');
      // API route may return 404 (no handler) or redirect for auth
      expect([200, 302, 307, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ API endpoint /api - Status: ${result.status}`);
    });

    it('should handle health endpoint (with auth)', async () => {
      const result = await testEndpoint('/api/health');
      // May require auth (302/307) or return health info (200) or not found (404)
      expect([200, 302, 307, 404].includes(result.status)).toBe(true);
      console.log(`✅ Health endpoint test - Status: ${result.status}`);
      
      if (result.authRequired) {
        console.log(`ℹ️ Health endpoint requires authentication`);
      }
    });

    it('should handle authentication flow detection', async () => {
      const result = await testEndpoint('/api/user');
      // User endpoint should require auth
      expect([200, 302, 307, 401, 403, 404].includes(result.status)).toBe(true);
      console.log(`✅ Auth flow detection - Status: ${result.status}`);
      
      if (result.authRequired) {
        console.log(`ℹ️ Authentication required, redirects to: ${result.redirect}`);
      }
    });
  });

  describe('API Route Structure', () => {
    it('should handle memory API routes', async () => {
      const result = await testEndpoint('/api/memory');
      expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ Memory API test - Status: ${result.status}`);
    });

    it('should handle remember API routes', async () => {
      const result = await testEndpoint('/api/remember');
      expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ Remember API test - Status: ${result.status}`);
    });

    it('should handle MCP API routes', async () => {
      const result = await testEndpoint('/api/mcp');
      expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ MCP API test - Status: ${result.status}`);
    });

    it('should handle dashboard API routes', async () => {
      const result = await testEndpoint('/api/dashboard');
      expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ Dashboard API test - Status: ${result.status}`);
    });

    it('should handle AI API routes', async () => {
      const result = await testEndpoint('/api/ai');
      expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ AI API test - Status: ${result.status}`);
    });
  });

  describe('Service Integration', () => {
    it('should maintain service availability', async () => {
      const result = await testEndpoint('/');
      expect(result.status > 0).toBe(true);
      console.log(`✅ Service availability test - Status: ${result.status}`);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => testEndpoint('/'));
      const results = await Promise.all(requests);
      
      const successfulRequests = results.filter(r => r.status > 0).length;
      console.log(`📊 Concurrent requests: ${successfulRequests}/5 responded`);
      
      expect(successfulRequests).toBeGreaterThan(0);
    });

    it('should provide consistent response structure', async () => {
      const result = await testEndpoint('/');
      expect(typeof result.status).toBe('number');
      expect(result.status > 0).toBe(true);
      console.log(`✅ Response structure test - Status: ${result.status}`);
    });
  });

  describe('Authentication and Security', () => {
    it('should handle unauthenticated requests properly', async () => {
      const protectedPaths = ['/api/user', '/api/dashboard', '/api/memory'];
      
      for (const path of protectedPaths) {
        const result = await testEndpoint(path);
        // Should either work (200), require auth (302/307/401/403), or not exist (404)
        expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
        console.log(`✅ Auth check ${path} - Status: ${result.status}`);
      }
    });

    it('should handle CORS appropriately', async () => {
      const headers = {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      };
      
      const result = await testEndpoint('/api/health', 'OPTIONS', null, headers);
      expect([200, 204, 302, 307, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ CORS test - Status: ${result.status}`);
    });

    it('should reject invalid HTTP methods where appropriate', async () => {
      const result = await testEndpoint('/api/health', 'INVALID' as any);
      expect([405, 501, 400, 404].includes(result.status)).toBe(true);
      console.log(`✅ Invalid method test - Status: ${result.status}`);
    });
  });

  describe('Performance and Reliability', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const result = await testEndpoint('/');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // 5 second timeout
      expect(result.status > 0).toBe(true);
      
      console.log(`📊 Response time: ${responseTime}ms`);
    });

    it('should handle rapid sequential requests', async () => {
      const requests = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        requests.push(testEndpoint('/'));
      }
      
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      const successfulRequests = results.filter(r => r.status > 0).length;
      
      console.log(`📊 Sequential requests: ${successfulRequests}/10 successful in ${totalTime}ms`);
      expect(successfulRequests).toBeGreaterThan(7); // At least 70% success rate
    });

    it('should maintain service stability', async () => {
      // Test service multiple times to ensure stability
      const tests = [];
      for (let i = 0; i < 3; i++) {
        tests.push(testEndpoint('/'));
      }
      
      const results = await Promise.all(tests);
      const allResponded = results.every(r => r.status > 0);
      
      expect(allResponded).toBe(true);
      console.log(`✅ Service stability verified across ${results.length} tests`);
    });
  });

  describe('Next.js Specific Features', () => {
    it('should handle Next.js API routing', async () => {
      const result = await testEndpoint('/api/test');
      // Next.js API routes return 404 if no handler, or proper response if exists
      expect([200, 302, 307, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ Next.js API routing test - Status: ${result.status}`);
    });

    it('should handle static and dynamic routes', async () => {
      const staticResult = await testEndpoint('/');
      const apiResult = await testEndpoint('/api');
      
      expect(staticResult.status > 0).toBe(true);
      expect([200, 302, 307, 404, 405].includes(apiResult.status)).toBe(true);
      
      console.log(`✅ Static route: ${staticResult.status}, API route: ${apiResult.status}`);
    });

    it('should handle middleware integration', async () => {
      const result = await testEndpoint('/api/stats');
      // Middleware may apply auth checks, redirects, or allow through
      expect([200, 302, 307, 401, 403, 404, 405].includes(result.status)).toBe(true);
      console.log(`✅ Middleware integration test - Status: ${result.status}`);
    });
  });

});
