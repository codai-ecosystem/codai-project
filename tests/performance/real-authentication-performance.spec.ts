import { test, expect } from '@playwright/test';

const GATEWAY_BASE_URL = 'http://localhost:4000';
const JWT_SECRET = 'your-secret-key'; // Default from gateway config

// Test configuration
const services = [
  { id: 'gateway', url: `${GATEWAY_BASE_URL}/api/gateway/health`, requiresAuth: false, name: 'Gateway Health' },
  { id: 'root', url: `${GATEWAY_BASE_URL}/health`, requiresAuth: false, name: 'Root Health' },
  { id: 'admin', url: `${GATEWAY_BASE_URL}/api/v1/admin`, requiresAuth: true, name: 'Admin Service' },
  { id: 'codai', url: `${GATEWAY_BASE_URL}/api/v1/codai`, requiresAuth: true, name: 'CODAI Service' },
  { id: 'hub', url: `${GATEWAY_BASE_URL}/api/v1/hub`, requiresAuth: true, name: 'Hub Service' },
  { id: 'id', url: `${GATEWAY_BASE_URL}/api/v1/id`, requiresAuth: true, name: 'ID Service' },
  { id: 'bancai', url: `${GATEWAY_BASE_URL}/api/v1/bancai`, requiresAuth: true, name: 'BancAI Service' },
  { id: 'memorai', url: `${GATEWAY_BASE_URL}/api/v1/memorai`, requiresAuth: true, name: 'MemorAI Service' }
];

// Helper function to test endpoint with proper authentication expectations
async function testServiceEndpoint(
  page: any, 
  service: { id: string; url: string; requiresAuth: boolean; name: string }
): Promise<{ success: boolean; responseTime: number; statusCode: number; errorDetails?: string }> {
  console.log(`🔍 Testing ${service.name} (Auth: ${service.requiresAuth ? 'Required' : 'Public'})...`);
  
  const startTime = Date.now();
  
  try {
    const response = await page.request.get(service.url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CODAI-Performance-Test/1.0'
      }
    });
    
    const responseTime = Date.now() - startTime;
    const statusCode = response.status();
    
    console.log(`   Status: ${statusCode}, Response Time: ${responseTime}ms`);
    
    // Determine success based on authentication requirements
    let success = false;
    let errorDetails = '';
    
    if (service.requiresAuth) {
      // Protected endpoints should return 401 Unauthorized without token
      if (statusCode === 401) {
        success = true; // This is the correct behavior for protected endpoints
        console.log(`   ✅ Correctly returned 401 for protected endpoint`);
      } else {
        success = false;
        errorDetails = `Expected 401 for protected endpoint, got ${statusCode}`;
        console.log(`   ❌ ${errorDetails}`);
      }
    } else {
      // Public endpoints should return 200 or acceptable status codes
      if ([200, 201, 202, 204].includes(statusCode)) {
        success = true;
        console.log(`   ✅ Public endpoint accessible`);
      } else {
        success = false;
        errorDetails = `Expected 2xx for public endpoint, got ${statusCode}`;
        console.log(`   ❌ ${errorDetails}`);
      }
    }
    
    return { success, responseTime, statusCode, errorDetails };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`   ❌ Request failed: ${error}`);
    return { 
      success: false, 
      responseTime, 
      statusCode: 0, 
      errorDetails: `Network error: ${error}` 
    };
  }
}

// Helper function for concurrent load testing
async function performConcurrentLoad(
  page: any, 
  service: { id: string; url: string; requiresAuth: boolean; name: string }, 
  concurrency: number = 5
): Promise<{ successRate: number; avgResponseTime: number; throughput: number }> {
  console.log(`⚡ Load testing ${service.name} with ${concurrency} concurrent requests...`);
  
  const startTime = Date.now();
  const promises = Array.from({ length: concurrency }, () => testServiceEndpoint(page, service));
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / results.length) * 100;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const throughput = (results.length / totalTime) * 1000; // requests per second
  
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`   Throughput: ${throughput.toFixed(1)} req/s`);
  
  return { successRate, avgResponseTime, throughput };
}

test.describe('CODAI Ecosystem - Real Authentication Performance Testing', () => {
  
  test('should validate public vs protected endpoint authentication correctly', async ({ page }) => {
    console.log('🔍 Validating authentication behavior for all endpoints...');
    
    for (const service of services) {
      const result = await testServiceEndpoint(page, service);
      
      // Authentication-aware validation
      if (service.requiresAuth) {
        // Protected endpoints should return 401 without auth
        expect(result.statusCode).toBe(401);
        expect(result.success).toBe(true); // Success means correct auth behavior
      } else {
        // Public endpoints should be accessible
        expect(result.success).toBe(true);
        expect([200, 201, 202, 204].includes(result.statusCode)).toBeTruthy();
      }
      
      expect(result.responseTime).toBeLessThan(2000); // Under 2s response time
      expect(result.statusCode).toBeGreaterThan(0); // Must get a response
    }
    
    console.log('✅ All endpoints show correct authentication behavior');
  });

  test('should handle concurrent load with proper authentication expectations', async ({ page }) => {
    console.log('🚀 Testing concurrent load with authentication-aware expectations...');
    
    for (const service of services) {
      const { successRate, avgResponseTime, throughput } = await performConcurrentLoad(page, service);
      
      // Authentication-aware performance expectations
      expect(successRate).toBeGreaterThan(80); // At least 80% should behave correctly
      expect(avgResponseTime).toBeLessThan(1500); // Under 1.5s average response time
      expect(throughput).toBeGreaterThan(1); // At least 1 req/s throughput
    }
    
    console.log('✅ All services handle concurrent load correctly');
  });

  test('should measure authentication-aware response consistency', async ({ page }) => {
    console.log('📏 Measuring authentication-aware response consistency...');
    
    for (const service of services) {
      console.log(`📊 Measuring ${service.name} consistency over 10 requests...`);
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = await testServiceEndpoint(page, service);
        results.push(result);
        
        // Brief pause between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const successCount = results.filter(r => r.success).length;
      const successRate = (successCount / results.length) * 100;
      const responseTimes = results.map(r => r.responseTime);
      const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      
      console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
      console.log(`   Avg/Min/Max Response: ${avgResponseTime.toFixed(0)}/${minResponseTime}/${maxResponseTime}ms`);
      
      // Authentication-aware consistency expectations
      expect(successRate).toBeGreaterThan(90); // High consistency success rate
      expect(avgResponseTime).toBeLessThan(800); // Reasonable average response time
      expect(maxResponseTime - minResponseTime).toBeLessThan(1000); // Response time variance under 1s
    }
    
    console.log('✅ All services show consistent authentication behavior');
  });

  test('should validate service availability under sustained load with auth awareness', async ({ page }) => {
    console.log('⏱️ Testing service availability under sustained load with authentication awareness...');
    
    for (const service of services.slice(0, 3)) { // Test first 3 services to avoid overwhelming
      console.log(`⚡ Sustained load testing ${service.name} for 10s...`);
      
      const duration = 10000; // 10 seconds
      const requestInterval = 500; // Request every 500ms
      const startTime = Date.now();
      const results = [];
      
      while (Date.now() - startTime < duration) {
        const result = await testServiceEndpoint(page, service);
        results.push(result);
        
        console.log(`${results.length} requests | Recent success: ${result.success ? '✅' : '❌'}`);
        
        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }
      
      const totalRequests = results.length;
      const successfulRequests = results.filter(r => r.success);
      const sustainedSuccessRate = (successfulRequests.length / totalRequests) * 100;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      
      console.log(`✅ ${service.name} sustained load results:`);
      console.log(`   Total requests: ${totalRequests}`);
      console.log(`   Success rate: ${sustainedSuccessRate.toFixed(1)}%`);
      console.log(`   Average response time: ${avgResponseTime.toFixed(0)}ms`);
      
      // Authentication-aware sustained availability expectations
      expect(sustainedSuccessRate).toBeGreaterThan(85); // Maintain 85%+ success rate
      expect(avgResponseTime).toBeLessThan(1000); // Stay under 1s average
      expect(totalRequests).toBeGreaterThan(15); // Should complete at least 15 requests
    }
    
    console.log('✅ All tested services maintain availability under sustained load');
  });

});
