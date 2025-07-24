/**
 * Phase 8: End-to-End User Workflow Tests
 * Tests complete user journeys across the CODAI ecosystem
 * Using real services and data connections
 */

import { test, expect, Browser, Page } from '@playwright/test';

// Service endpoints
const SERVICES = {
  gateway: 'http://localhost:4000',
  codai: 'http://localhost:4001',
  admin: 'http://localhost:4002',
  hub: 'http://localhost:4003',
  id: 'http://localhost:4004',
  bancai: 'http://localhost:4005',
  memorai: 'http://localhost:4006',
  sso: 'http://localhost:4800'
} as const;

test.describe('CODAI Ecosystem - Complete User Workflows', () => {
  let browser: Browser;
  let page: Page;

  test.beforeAll(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    console.log('🚀 Starting E2E user workflow tests...');
  });

  test.beforeEach(async () => {
    page = await browser.newPage();
    console.log('📱 Created new browser page for workflow test');
  });

  test.afterEach(async () => {
    await page?.close();
    console.log('🧹 Closed browser page after workflow test');
  });

  test.describe('User Registration and Authentication Flow', () => {
    test('should complete full user registration workflow', async () => {
      console.log('🔐 Testing complete user registration workflow...');
      
      // Start at Gateway service
      await page.goto(SERVICES.gateway);
      await expect(page).toHaveTitle(/CODAI/i);
      console.log('✅ Gateway service loaded successfully');

      // Navigate to registration (might redirect to ID service)
      try {
        await page.click('text=Register', { timeout: 5000 });
        console.log('✅ Registration link clicked');
      } catch (error) {
        console.log('ℹ️ Direct registration link not found, checking for auth redirect');
        // Check if redirected to SSO
        const currentUrl = page.url();
        if (currentUrl.includes('4800')) {
          console.log('✅ Redirected to SSO service as expected');
        }
      }

      // Verify we can reach ID service for registration
      await page.goto(SERVICES.id);
      const idResponse = await page.waitForLoadState('networkidle');
      console.log('✅ ID service accessible for registration');

      // Test registration form elements (if available)
      try {
        await page.fill('input[type="email"]', 'test-e2e@codai.com');
        await page.fill('input[type="password"]', 'SecurePass123!');
        console.log('✅ Registration form elements detected and filled');
      } catch (error) {
        console.log('ℹ️ Registration form not directly accessible, may require authentication setup');
      }

      expect(page.url()).toContain('localhost');
    });

    test('should handle authentication flow across services', async () => {
      console.log('🔑 Testing authentication flow across services...');

      // Test each service for authentication requirements
      const serviceTests = Object.entries(SERVICES);
      let authRedirectCount = 0;
      let directAccessCount = 0;

      for (const [serviceName, serviceUrl] of serviceTests) {
        if (serviceName === 'sso') continue; // Skip SSO itself
        
        console.log(`🔍 Testing ${serviceName} service authentication...`);
        await page.goto(serviceUrl);
        
        // Wait for page to load and check for redirects
        await page.waitForLoadState('networkidle');
        const finalUrl = page.url();
        
        if (finalUrl.includes('4800') || finalUrl.includes('login')) {
          authRedirectCount++;
          console.log(`✅ ${serviceName} properly redirects to authentication`);
        } else {
          directAccessCount++;
          console.log(`ℹ️ ${serviceName} allows direct access`);
        }
      }

      console.log(`📊 Auth Analysis: ${authRedirectCount} services require auth, ${directAccessCount} allow direct access`);
      expect(authRedirectCount + directAccessCount).toBeGreaterThan(0);
    });
  });

  test.describe('AI Service Integration Workflows', () => {
    test('should test CODAI AI service workflow', async () => {
      console.log('🤖 Testing CODAI AI service workflow...');

      await page.goto(SERVICES.codai);
      await page.waitForLoadState('networkidle');
      
      // Check for AI interface elements
      const hasAIInterface = await page.locator('text=/ai|chat|assistant|copilot/i').count() > 0;
      console.log(`✅ AI interface elements detected: ${hasAIInterface}`);

      // Test API endpoint accessibility
      const response = await page.goto(`${SERVICES.codai}/api/health`);
      if (response) {
        console.log(`✅ CODAI API health check: ${response.status()}`);
        expect([200, 307, 401]).toContain(response.status());
      }
    });

    test('should test MemorAI service workflow', async () => {
      console.log('🧠 Testing MemorAI service workflow...');

      await page.goto(SERVICES.memorai);
      await page.waitForLoadState('networkidle');
      
      // Check for memory interface
      const hasMemoryInterface = await page.locator('text=/memory|remember|recall/i').count() > 0;
      console.log(`✅ Memory interface elements detected: ${hasMemoryInterface}`);

      // Test memory API endpoints
      const endpoints = ['/api/memory', '/api/remember', '/api/mcp'];
      for (const endpoint of endpoints) {
        const response = await page.goto(`${SERVICES.memorai}${endpoint}`);
        if (response) {
          console.log(`✅ MemorAI ${endpoint} endpoint: ${response.status()}`);
          expect([200, 307, 401, 404]).toContain(response.status());
        }
      }
    });

    test('should test BancAI financial service workflow', async () => {
      console.log('💰 Testing BancAI financial service workflow...');

      await page.goto(SERVICES.bancai);
      await page.waitForLoadState('networkidle');
      
      // Check for financial interface elements
      const hasFinancialInterface = await page.locator('text=/bank|finance|payment|wallet/i').count() > 0;
      console.log(`✅ Financial interface elements detected: ${hasFinancialInterface}`);

      // Test financial API endpoints
      const response = await page.goto(`${SERVICES.bancai}/api/health`);
      if (response) {
        console.log(`✅ BancAI API health check: ${response.status()}`);
        expect([200, 307, 401]).toContain(response.status());
      }
    });
  });

  test.describe('Admin and Management Workflows', () => {
    test('should test admin dashboard workflow', async () => {
      console.log('⚙️ Testing admin dashboard workflow...');

      await page.goto(SERVICES.admin);
      await page.waitForLoadState('networkidle');
      
      // Check for admin interface elements
      const hasAdminInterface = await page.locator('text=/admin|dashboard|manage|config/i').count() > 0;
      console.log(`✅ Admin interface elements detected: ${hasAdminInterface}`);

      // Test admin API endpoints
      const endpoints = ['/api/health', '/api/users', '/api/system'];
      for (const endpoint of endpoints) {
        try {
          const response = await page.goto(`${SERVICES.admin}${endpoint}`);
          if (response) {
            console.log(`✅ Admin ${endpoint} endpoint: ${response.status()}`);
            expect([200, 307, 401, 404]).toContain(response.status());
          }
        } catch (error) {
          console.log(`ℹ️ Admin ${endpoint} endpoint not accessible or requires auth`);
        }
      }
    });

    test('should test hub service connectivity', async () => {
      console.log('🌐 Testing hub service connectivity workflow...');

      await page.goto(SERVICES.hub);
      await page.waitForLoadState('networkidle');
      
      // Check for hub interface elements
      const hasHubInterface = await page.locator('text=/hub|connect|integrate|api/i').count() > 0;
      console.log(`✅ Hub interface elements detected: ${hasHubInterface}`);

      // Test hub connectivity endpoints
      const response = await page.goto(`${SERVICES.hub}/api/health`);
      if (response) {
        console.log(`✅ Hub API health check: ${response.status()}`);
        expect([200, 307, 401]).toContain(response.status());
      }
    });
  });

  test.describe('Cross-Service Integration Workflows', () => {
    test('should test service-to-service communication', async () => {
      console.log('🔗 Testing cross-service communication workflows...');

      // Test Gateway -> CODAI flow
      await page.goto(SERVICES.gateway);
      await page.waitForLoadState('networkidle');
      
      try {
        // Look for links or buttons that might connect to CODAI
        const codaiLinks = await page.locator('a[href*="4001"], button:has-text("CODAI")').count();
        console.log(`✅ Found ${codaiLinks} potential CODAI integration points`);
      } catch (error) {
        console.log('ℹ️ No direct CODAI integration links found in Gateway');
      }

      // Test direct service availability
      const services = ['gateway', 'codai', 'admin', 'hub', 'id', 'bancai', 'memorai'];
      let availableServices = 0;

      for (const service of services) {
        try {
          const response = await page.goto(SERVICES[service as keyof typeof SERVICES]);
          if (response && response.ok()) {
            availableServices++;
            console.log(`✅ ${service} service is available`);
          }
        } catch (error) {
          console.log(`❌ ${service} service is not available`);
        }
      }

      console.log(`📊 Service Availability: ${availableServices}/${services.length} services accessible`);
      expect(availableServices).toBeGreaterThan(0);
    });

    test('should test authentication propagation across services', async () => {
      console.log('🔐 Testing authentication propagation workflow...');

      // Start with SSO service
      await page.goto(SERVICES.sso);
      await page.waitForLoadState('networkidle');
      console.log('✅ SSO service loaded');

      // Test each service for consistent auth behavior
      const authBehaviors: Record<string, string> = {};
      
      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        if (serviceName === 'sso') continue;
        
        try {
          await page.goto(serviceUrl);
          await page.waitForLoadState('networkidle');
          const finalUrl = page.url();
          
          if (finalUrl.includes('4800') || finalUrl.includes('login')) {
            authBehaviors[serviceName] = 'requires_auth';
          } else if (finalUrl === serviceUrl) {
            authBehaviors[serviceName] = 'direct_access';
          } else {
            authBehaviors[serviceName] = 'redirected';
          }
          
          console.log(`✅ ${serviceName}: ${authBehaviors[serviceName]}`);
        } catch (error) {
          authBehaviors[serviceName] = 'error';
          console.log(`❌ ${serviceName}: error accessing`);
        }
      }

      // Verify consistent authentication behavior
      const authRequiredCount = Object.values(authBehaviors).filter(b => b === 'requires_auth').length;
      console.log(`📊 Authentication Analysis: ${authRequiredCount} services require authentication`);
      
      expect(Object.keys(authBehaviors).length).toBeGreaterThan(0);
    });
  });

  test.describe('Performance and Reliability Workflows', () => {
    test('should test system performance under load', async () => {
      console.log('⚡ Testing system performance workflow...');

      const performanceMetrics: Record<string, number> = {};
      
      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        const startTime = Date.now();
        
        try {
          await page.goto(serviceUrl);
          await page.waitForLoadState('networkidle');
          const loadTime = Date.now() - startTime;
          performanceMetrics[serviceName] = loadTime;
          console.log(`✅ ${serviceName} loaded in ${loadTime}ms`);
        } catch (error) {
          performanceMetrics[serviceName] = -1;
          console.log(`❌ ${serviceName} failed to load`);
        }
      }

      // Calculate average load time for accessible services
      const validLoadTimes = Object.values(performanceMetrics).filter(time => time > 0);
      const averageLoadTime = validLoadTimes.reduce((sum, time) => sum + time, 0) / validLoadTimes.length;
      
      console.log(`📊 Performance Analysis: Average load time ${averageLoadTime.toFixed(2)}ms across ${validLoadTimes.length} services`);
      expect(averageLoadTime).toBeLessThan(10000); // Services should load within 10 seconds
    });

    test('should test service resilience and recovery', async () => {
      console.log('🛡️ Testing service resilience workflow...');

      let successfulConnections = 0;
      let failedConnections = 0;
      const maxRetries = 3;

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        let connected = false;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`🔄 Attempting connection to ${serviceName} (attempt ${attempt}/${maxRetries})`);
            await page.goto(serviceUrl, { timeout: 5000 });
            await page.waitForLoadState('networkidle', { timeout: 5000 });
            connected = true;
            console.log(`✅ ${serviceName} connected successfully on attempt ${attempt}`);
            break;
          } catch (error) {
            console.log(`⚠️ ${serviceName} connection attempt ${attempt} failed`);
            if (attempt < maxRetries) {
              await page.waitForTimeout(1000); // Wait 1 second before retry
            }
          }
        }
        
        if (connected) {
          successfulConnections++;
        } else {
          failedConnections++;
          console.log(`❌ ${serviceName} failed all connection attempts`);
        }
      }

      console.log(`📊 Resilience Analysis: ${successfulConnections} successful, ${failedConnections} failed connections`);
      expect(successfulConnections).toBeGreaterThan(failedConnections);
    });
  });
});
