#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all services and apps
const servicesDir = path.join(__dirname, '..', 'services');
const appsDir = path.join(__dirname, '..', 'apps');

const serviceNames = fs
  .readdirSync(servicesDir)
  .filter(name => fs.statSync(path.join(servicesDir, name)).isDirectory());

const appNames = fs
  .readdirSync(appsDir)
  .filter(name => fs.statSync(path.join(appsDir, name)).isDirectory());

console.log(
  `🧪 Generating comprehensive test suites for ${serviceNames.length} services and ${appNames.length} apps...`
);

// Test templates
const unitTestTemplate =
  serviceName => `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/lib/database';
import { redis } from '../src/lib/redis';

describe('${serviceName.toUpperCase()} Service - Unit Tests', () => {
  beforeEach(async () => {
    // Clear database and redis before each test
    if (db) {
      await db.migrate.latest();
      await db.seed.run();
    }
    if (redis) {
      await redis.flushall();
    }
  });

  afterEach(async () => {
    // Clean up after each test
    if (db) {
      await db.migrate.rollback();
    }
    if (redis) {
      await redis.flushall();
    }
  });

  describe('Health Checks', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: '${serviceName}',
        timestamp: expect.any(String),
        version: expect.any(String)
      });
    });

    it('should return 200 for readiness endpoint', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ready',
        service: '${serviceName}',
        dependencies: expect.any(Object)
      });
    });

    it('should return metrics endpoint', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('# HELP');
      expect(response.headers['content-type']).toContain('text/plain');
    });
  });

  describe('API Endpoints', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .expect(200);

      expect(response.body).toMatchObject({
        service: '${serviceName}',
        version: expect.any(String),
        environment: expect.any(String)
      });
    });

    it('should handle 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/unknown-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: expect.any(String)
      });
    });

    it('should validate request headers', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .set('User-Agent', 'Test Agent')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock a server error
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const response = await request(app)
        .post('/api/v1/test-error')
        .send({ trigger: 'error' });

      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/v1/validate')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        details: expect.any(Array)
      });
    });
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/protected')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Unauthorized',
        message: expect.any(String)
      });
    });

    it('should accept requests with valid authentication', async () => {
      const token = 'test-valid-token'; // Mock token
      
      const response = await request(app)
        .get('/api/v1/protected')
        .set('Authorization', \`Bearer \${token}\`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const endpoint = '/api/v1/rate-limited';
      
      // Make multiple requests quickly
      const requests = Array(10).fill().map(() => 
        request(app).get(endpoint)
      );
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Database Operations', () => {
    it('should connect to database successfully', async () => {
      if (db) {
        const result = await db.raw('SELECT 1 as test');
        expect(result.rows[0].test).toBe(1);
      }
    });

    it('should handle database errors gracefully', async () => {
      if (db) {
        try {
          await db.raw('SELECT * FROM non_existent_table');
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Cache Operations', () => {
    it('should connect to Redis successfully', async () => {
      if (redis) {
        await redis.set('test-key', 'test-value');
        const value = await redis.get('test-key');
        expect(value).toBe('test-value');
      }
    });

    it('should handle cache misses gracefully', async () => {
      if (redis) {
        const value = await redis.get('non-existent-key');
        expect(value).toBeNull();
      }
    });
  });

  describe('Performance', () => {
    it('should respond to health checks quickly', async () => {
      const start = Date.now();
      await request(app).get('/health').expect(200);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 5;
      const requests = Array(concurrentRequests).fill().map(() => 
        request(app).get('/health')
      );
      
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
`;

const integrationTestTemplate =
  serviceName => `import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/lib/database';
import { redis } from '../src/lib/redis';
import { setupTestEnvironment, teardownTestEnvironment } from './helpers/test-setup';

describe('${serviceName.toUpperCase()} Service - Integration Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    // Reset state before each test
    if (db) {
      await db.migrate.latest();
      await db.seed.run();
    }
    if (redis) {
      await redis.flushall();
    }
  });

  afterEach(async () => {
    // Clean up after each test
    if (db) {
      await db.migrate.rollback();
    }
  });

  describe('End-to-End Workflows', () => {
    it('should complete a full user workflow', async () => {
      // Step 1: Create a user session
      const authResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect(200);

      const { token } = authResponse.body;
      expect(token).toBeDefined();

      // Step 2: Use authenticated endpoint
      const userResponse = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', \`Bearer \${token}\`)
        .expect(200);

      expect(userResponse.body).toMatchObject({
        id: expect.any(String),
        email: 'test@example.com'
      });

      // Step 3: Perform business logic operation
      const operationResponse = await request(app)
        .post('/api/v1/operations')
        .set('Authorization', \`Bearer \${token}\`)
        .send({
          type: 'test-operation',
          data: { test: true }
        })
        .expect(201);

      expect(operationResponse.body).toMatchObject({
        id: expect.any(String),
        status: 'completed'
      });

      // Step 4: Verify operation was recorded
      const historyResponse = await request(app)
        .get('/api/v1/user/operations')
        .set('Authorization', \`Bearer \${token}\`)
        .expect(200);

      expect(historyResponse.body.operations).toHaveLength(1);
      expect(historyResponse.body.operations[0]).toMatchObject({
        type: 'test-operation',
        status: 'completed'
      });
    });

    it('should handle complex data workflows', async () => {
      // Test data processing pipeline
      const data = {
        input: 'test data',
        options: {
          process: true,
          validate: true
        }
      };

      const response = await request(app)
        .post('/api/v1/process')
        .send(data)
        .expect(200);

      expect(response.body).toMatchObject({
        processed: true,
        validated: true,
        output: expect.any(String)
      });
    });
  });

  describe('Service Integration', () => {
    it('should integrate with external services', async () => {
      // Mock external service call
      const externalResponse = await request(app)
        .post('/api/v1/external/sync')
        .send({ action: 'sync' })
        .expect(200);

      expect(externalResponse.body).toMatchObject({
        synced: true,
        timestamp: expect.any(String)
      });
    });

    it('should handle service failures gracefully', async () => {
      // Test circuit breaker pattern
      const response = await request(app)
        .post('/api/v1/external/failing-service')
        .send({ test: true })
        .expect(503);

      expect(response.body).toMatchObject({
        error: 'Service Unavailable',
        retry_after: expect.any(Number)
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Test transaction handling
      const data = {
        operations: [
          { type: 'create', entity: 'user', data: { name: 'Test User' } },
          { type: 'create', entity: 'profile', data: { userId: 'user-id' } }
        ]
      };

      const response = await request(app)
        .post('/api/v1/batch-operations')
        .send(data)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        operations_completed: 2
      });

      // Verify both entities were created
      const userResponse = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(userResponse.body.users).toHaveLength(1);
    });

    it('should rollback failed transactions', async () => {
      // Test transaction rollback
      const data = {
        operations: [
          { type: 'create', entity: 'user', data: { name: 'Test User' } },
          { type: 'create', entity: 'invalid', data: { invalid: true } } // This should fail
        ]
      };

      const response = await request(app)
        .post('/api/v1/batch-operations')
        .send(data)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Transaction Failed',
        operations_completed: 0
      });

      // Verify no entities were created
      const userResponse = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(userResponse.body.users).toHaveLength(0);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high throughput', async () => {
      const concurrentRequests = 20;
      const requests = Array(concurrentRequests).fill().map((_, index) => 
        request(app)
          .post('/api/v1/load-test')
          .send({ request_id: index })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.request_id).toBe(index);
      });
    });

    it('should maintain response times under load', async () => {
      const start = Date.now();
      
      const requests = Array(10).fill().map(() => 
        request(app).get('/api/v1/heavy-operation')
      );

      await Promise.all(requests);
      
      const duration = Date.now() - start;
      const averageResponseTime = duration / 10;
      
      expect(averageResponseTime).toBeLessThan(2000); // Average response time should be under 2 seconds
    });
  });

  describe('Security Integration', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get(\`/api/v1/search?q=\${encodeURIComponent(maliciousInput)}\`)
        .expect(200);

      // Should return normal search results, not cause database errors
      expect(response.body).toHaveProperty('results');
    });

    it('should prevent XSS attacks', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/v1/content')
        .send({ content: maliciousInput })
        .expect(201);

      // Content should be sanitized
      expect(response.body.content).not.toContain('<script>');
    });

    it('should enforce CORS policies', async () => {
      const response = await request(app)
        .options('/api/v1/info')
        .set('Origin', 'https://malicious-site.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
    });
  });

  describe('Monitoring Integration', () => {
    it('should expose prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('http_request_duration_seconds');
      expect(response.text).toContain('process_cpu_seconds_total');
    });

    it('should log structured events', async () => {
      // Test that important events are logged
      const response = await request(app)
        .post('/api/v1/important-operation')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        logged: true
      });
    });
  });
});
`;

const e2eTestTemplate =
  serviceName => `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import { setupTestEnvironment, teardownTestEnvironment } from './helpers/test-setup';

describe('${serviceName.toUpperCase()} Service - E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

  beforeAll(async () => {
    await setupTestEnvironment();
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.CI === 'true' ? 0 : 100
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser?.close();
    await teardownTestEnvironment();
  });

  describe('Application Loading', () => {
    it('should load the main page successfully', async () => {
      await page.goto(baseUrl);
      await expect(page).toHaveTitle(/\${serviceName}/i);
      
      // Check for essential elements
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });

    it('should load without JavaScript errors', async () => {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      
      expect(errors).toHaveLength(0);
    });

    it('should be responsive on mobile devices', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(baseUrl);
      
      // Check mobile navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await expect(page.locator('[data-testid="navigation"]')).toBeVisible();
      }
    });
  });

  describe('User Authentication Flow', () => {
    it('should handle user login flow', async () => {
      await page.goto(\`\${baseUrl}/login\`);
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'testpassword');
      await page.click('[data-testid="login-button"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL(/dashboard/);
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    });

    it('should handle logout flow', async () => {
      // Assume user is logged in
      await page.goto(\`\${baseUrl}/dashboard\`);
      
      // Click logout
      await page.click('[data-testid="logout-button"]');
      
      // Should redirect to login page
      await page.waitForURL(/login/);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });

    it('should validate form inputs', async () => {
      await page.goto(\`\${baseUrl}/login\`);
      
      // Try to submit empty form
      await page.click('[data-testid="login-button"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });
  });

  describe('Core Functionality', () => {
    it('should perform main business operations', async () => {
      await page.goto(\`\${baseUrl}/dashboard\`);
      
      // Perform main operation specific to this service
      await page.click('[data-testid="new-operation-button"]');
      await page.fill('[data-testid="operation-input"]', 'Test Operation');
      await page.click('[data-testid="submit-operation"]');
      
      // Verify operation was created
      await expect(page.locator('[data-testid="operation-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="operations-list"]')).toContainText('Test Operation');
    });

    it('should handle data persistence', async () => {
      await page.goto(\`\${baseUrl}/dashboard\`);
      
      // Create some data
      await page.click('[data-testid="create-data-button"]');
      await page.fill('[data-testid="data-name"]', 'Test Data');
      await page.click('[data-testid="save-data"]');
      
      // Refresh page and verify data persists
      await page.reload();
      await expect(page.locator('[data-testid="data-list"]')).toContainText('Test Data');
    });

    it('should handle real-time updates', async () => {
      // Open two pages to test real-time functionality
      const page2 = await browser.newPage();
      
      await page.goto(\`\${baseUrl}/dashboard\`);
      await page2.goto(\`\${baseUrl}/dashboard\`);
      
      // Make change on first page
      await page.click('[data-testid="send-update-button"]');
      await page.fill('[data-testid="update-message"]', 'Real-time test');
      await page.click('[data-testid="send-button"]');
      
      // Verify update appears on second page
      await expect(page2.locator('[data-testid="updates-list"]')).toContainText('Real-time test');
      
      await page2.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network failure
      await page.route('**/api/**', (route) => route.abort());
      
      await page.goto(\`\${baseUrl}/dashboard\`);
      await page.click('[data-testid="network-dependent-action"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    it('should handle 404 errors', async () => {
      await page.goto(\`\${baseUrl}/non-existent-page\`);
      
      // Should show 404 page
      await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="home-link"]')).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load in less than 5 seconds
    });

    it('should have good Core Web Vitals', async () => {
      await page.goto(baseUrl);
      
      // Measure Largest Contentful Paint (LCP)
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        });
      });
      
      expect(lcp).toBeLessThan(2500); // Good LCP is under 2.5 seconds
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      await page.goto(baseUrl);
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const firstFocusable = await page.locator(':focus');
      expect(await firstFocusable.isVisible()).toBe(true);
      
      // Test that we can navigate through all interactive elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.locator(':focus');
        expect(await focused.isVisible()).toBe(true);
      }
    });

    it('should have proper ARIA labels', async () => {
      await page.goto(baseUrl);
      
      // Check for essential ARIA attributes
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const innerText = await button.innerText();
        
        // Button should have either aria-label or visible text
        expect(ariaLabel || innerText).toBeTruthy();
      }
    });

    it('should have proper color contrast', async () => {
      await page.goto(baseUrl);
      
      // Check that text has sufficient contrast
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span');
      const count = await textElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Basic check that text is not invisible (same color as background)
        expect(styles.color).not.toBe(styles.backgroundColor);
      }
    });
  });
});
`;

const testHelpersTemplate = () => `import { db } from '../../src/lib/database';
import { redis } from '../../src/lib/redis';

export async function setupTestEnvironment() {
  console.log('🧪 Setting up test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
  process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';
  
  // Setup database
  if (db) {
    try {
      await db.migrate.latest();
      await db.seed.run();
      console.log('✅ Database setup complete');
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  }
  
  // Setup Redis
  if (redis) {
    try {
      await redis.ping();
      await redis.flushall();
      console.log('✅ Redis setup complete');
    } catch (error) {
      console.error('❌ Redis setup failed:', error);
      throw error;
    }
  }
  
  console.log('✅ Test environment setup complete');
}

export async function teardownTestEnvironment() {
  console.log('🧹 Tearing down test environment...');
  
  // Cleanup database
  if (db) {
    try {
      await db.migrate.rollback();
      await db.destroy();
      console.log('✅ Database cleanup complete');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  }
  
  // Cleanup Redis
  if (redis) {
    try {
      await redis.flushall();
      await redis.quit();
      console.log('✅ Redis cleanup complete');
    } catch (error) {
      console.error('❌ Redis cleanup failed:', error);
    }
  }
  
  console.log('✅ Test environment teardown complete');
}

export function createMockData(type: string, overrides: any = {}) {
  const mockData = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    },
    operation: {
      id: 'op-123',
      type: 'test-operation',
      status: 'pending',
      data: { test: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    }
  };
  
  return mockData[type] || {};
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout = 5000,
  interval = 100
) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await delay(interval);
  }
  
  throw new Error(\`Condition not met within \${timeout}ms\`);
}

export function createTestServer(port = 0) {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // Basic test endpoints
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
  });
  
  app.get('/ready', (req, res) => {
    res.json({ status: 'ready' });
  });
  
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('# HELP test_metric Test metric\\ntest_metric 1\\n');
  });
  
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve({
        app,
        server,
        port: server.address().port,
        close: () => server.close()
      });
    });
  });
}
`;

const vitestConfigTemplate =
  serviceName => `import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: '${serviceName}',
    root: '.',
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    isolate: true,
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
        maxThreads: 4,
        minThreads: 1
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  },
  esbuild: {
    target: 'node18'
  }
});
`;

const packageJsonTestScript = serviceName => ({
  test: 'vitest run',
  'test:watch': 'vitest',
  'test:ui': 'vitest --ui',
  'test:coverage': 'vitest run --coverage',
  'test:unit': 'vitest run tests/unit',
  'test:integration': 'vitest run tests/integration',
  'test:e2e': 'vitest run tests/e2e',
  'test:debug': 'vitest --inspect-brk --no-timeout',
});

// Generate test files for all services and apps
let generated = 0;
let skipped = 0;

[...serviceNames, ...appNames].forEach(serviceName => {
  const isApp = appNames.includes(serviceName);
  const serviceDir = path.join(isApp ? appsDir : servicesDir, serviceName);
  const testsDir = path.join(serviceDir, 'tests');

  console.log(
    `🧪 Generating tests for ${serviceName} (${isApp ? 'app' : 'service'})...`
  );

  // Create tests directory structure
  const dirs = [
    testsDir,
    path.join(testsDir, 'unit'),
    path.join(testsDir, 'integration'),
    path.join(testsDir, 'e2e'),
    path.join(testsDir, 'helpers'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate test files
  const testFiles = [
    {
      path: path.join(testsDir, 'unit', `${serviceName}.test.ts`),
      content: unitTestTemplate(serviceName),
    },
    {
      path: path.join(
        testsDir,
        'integration',
        `${serviceName}.integration.test.ts`
      ),
      content: integrationTestTemplate(serviceName),
    },
    {
      path: path.join(testsDir, 'e2e', `${serviceName}.e2e.test.ts`),
      content: e2eTestTemplate(serviceName),
    },
    {
      path: path.join(testsDir, 'helpers', 'test-setup.ts'),
      content: testHelpersTemplate(),
    },
  ];

  testFiles.forEach(({ path: filePath, content }) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
    }
  });

  // Generate vitest config
  const vitestConfigPath = path.join(serviceDir, 'vitest.config.ts');
  if (!fs.existsSync(vitestConfigPath)) {
    fs.writeFileSync(vitestConfigPath, vitestConfigTemplate(serviceName));
  }

  // Update package.json with test scripts
  const packageJsonPath = path.join(serviceDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts = {
        ...packageJson.scripts,
        ...packageJsonTestScript(serviceName),
      };

      // Add test dependencies
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        vitest: '^1.6.0',
        supertest: '^6.3.4',
        playwright: '^1.44.0',
        '@types/supertest': '^6.0.2',
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      console.warn(
        `⚠️  Could not update package.json for ${serviceName}:`,
        error.message
      );
    }
  }

  generated++;
  console.log(`✅ Generated comprehensive test suite for ${serviceName}`);
});

console.log(`\\n🎉 Test generation complete!`);
console.log(`📊 Summary:`);
console.log(`   - Generated: ${generated} test suites`);
console.log(`   - Services: ${serviceNames.length}`);
console.log(`   - Apps: ${appNames.length}`);
console.log(`   - Total: ${serviceNames.length + appNames.length}`);

console.log(`\\n📁 Test structure generated:`);
console.log(`   - Unit tests: tests/unit/`);
console.log(`   - Integration tests: tests/integration/`);
console.log(`   - E2E tests: tests/e2e/`);
console.log(`   - Test helpers: tests/helpers/`);
console.log(`   - Vitest config: vitest.config.ts`);

console.log(`\\n🔧 Next steps:`);
console.log(`   1. Install test dependencies: pnpm install`);
console.log(`   2. Run all tests: pnpm test`);
console.log(`   3. Run with coverage: pnpm test:coverage`);
console.log(
  `   4. Run specific test type: pnpm test:unit | test:integration | test:e2e`
);
console.log(`   5. Watch mode: pnpm test:watch`);
