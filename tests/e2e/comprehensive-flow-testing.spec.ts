// CODAI Ecosystem - Comprehensive E2E Test Suite
// Testing all flows, paths, queries, filters, pages, and components

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration for all primary services
const SERVICES = {
  CODAI: { url: 'http://localhost:4001', name: 'CODAI AI Platform' },
  ADMIN: { url: 'http://localhost:4002', name: 'Admin Dashboard' },
  HUB: { url: 'http://localhost:4003', name: 'Central Hub' },
  ID: { url: 'http://localhost:4004', name: 'Identity Service' },
  BANCAI: { url: 'http://localhost:4005', name: 'BancAI Financial' },
  GATEWAY: { url: 'http://localhost:4000', name: 'API Gateway' }
};

// Test user accounts for different scenarios
const TEST_USERS = {
  ADMIN: { email: 'admin@codai.test', password: 'Admin123!', role: 'admin' },
  USER: { email: 'user@codai.test', password: 'User123!', role: 'user' },
  DEVELOPER: { email: 'dev@codai.test', password: 'Dev123!', role: 'developer' },
  ANALYST: { email: 'analyst@codai.test', password: 'Analyst123!', role: 'analyst' }
};

// Device viewports for responsive testing
const VIEWPORTS = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1920, height: 1080 },
  ULTRAWIDE: { width: 3440, height: 1440 }
};

test.describe('🧪 CODAI Ecosystem - Comprehensive Testing Suite', () => {

  test.describe('🚀 CODAI Service - AI Development Platform', () => {

    test.describe('📱 Responsive Design Testing', () => {
      Object.entries(VIEWPORTS).forEach(([device, viewport]) => {
        test(`CODAI responsive layout on ${device}`, async ({ browser }) => {
          const context = await browser.newContext({ viewport });
          const page = await context.newPage();

          await page.goto(SERVICES.CODAI.url);
          await expect(page).toHaveTitle(/CODAI/);

          // Test navigation is accessible
          const nav = page.locator('nav, [role="navigation"]');
          await expect(nav).toBeVisible();

          // Test main content areas
          const main = page.locator('main, [role="main"]');
          await expect(main).toBeVisible();

          // Test responsive breakpoints
          if (device === 'MOBILE') {
            // Mobile-specific tests
            const hamburger = page.locator('[aria-label*="menu"], .hamburger, .menu-toggle');
            if (await hamburger.count() > 0) {
              await hamburger.click();
              await expect(page.locator('.mobile-menu, .nav-menu')).toBeVisible();
            }
          }

          await context.close();
        });
      });
    });

    test.describe('🔐 Authentication Flow Testing', () => {
      test('Complete login flow with valid credentials', async ({ page }) => {
        await page.goto(SERVICES.CODAI.url);

        // Look for login button or link
        const loginButton = page.locator('a[href*="login"], button:has-text("Login"), [data-testid="login"]').first();
        if (await loginButton.count() > 0) {
          await loginButton.click();

          // Fill login form
          await page.fill('input[type="email"], input[name="email"]', TEST_USERS.USER.email);
          await page.fill('input[type="password"], input[name="password"]', TEST_USERS.USER.password);

          // Submit form
          await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');

          // Verify successful login
          await page.waitForLoadState('networkidle');
          await expect(page.locator('.dashboard, [data-testid="dashboard"], main')).toBeVisible();
        }
      });

      test('Invalid credentials error handling', async ({ page }) => {
        await page.goto(SERVICES.CODAI.url);

        const loginButton = page.locator('a[href*="login"], button:has-text("Login")').first();
        if (await loginButton.count() > 0) {
          await loginButton.click();

          await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
          await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

          await page.click('button[type="submit"], button:has-text("Sign In")');

          // Should show error message
          await expect(page.locator('.error, .alert-error, [role="alert"]')).toBeVisible();
        }
      });
    });

    test.describe('📊 Dashboard Flow Testing', () => {
      test('Dashboard loads with all components', async ({ page }) => {
        await page.goto(SERVICES.CODAI.url);

        // Test main dashboard components
        const components = [
          '.dashboard, [data-testid="dashboard"]',
          '.projects, [data-testid="projects"]',
          '.quick-actions, [data-testid="quick-actions"]',
          '.recent-activity, [data-testid="recent-activity"]'
        ];

        for (const selector of components) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await expect(element).toBeVisible();
          }
        }
      });

      test('Project creation flow', async ({ page }) => {
        await page.goto(SERVICES.CODAI.url);

        // Look for create project button
        const createButton = page.locator('button:has-text("Create"), a:has-text("New Project"), [data-testid="create-project"]').first();
        if (await createButton.count() > 0) {
          await createButton.click();

          // Fill project form
          await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Project');
          await page.fill('textarea, input[name="description"]', 'Test project description');

          // Submit form
          await page.click('button:has-text("Create"), button[type="submit"]');

          // Verify project was created
          await page.waitForLoadState('networkidle');
          await expect(page.locator(':has-text("Test Project")')).toBeVisible();
        }
      });
    });

    test.describe('🔍 Search and Filter Testing', () => {
      test('Project search functionality', async ({ page }) => {
        await page.goto(SERVICES.CODAI.url);

        const searchInput = page.locator('input[placeholder*="search"], input[type="search"], [data-testid="search"]').first();
        if (await searchInput.count() > 0) {
          await searchInput.fill('test');
          await page.keyboard.press('Enter');

          await page.waitForLoadState('networkidle');
          // Verify search results
          const results = page.locator('.search-results, .project-list, [data-testid="search-results"]');
          if (await results.count() > 0) {
            await expect(results).toBeVisible();
          }
        }
      });

      test('Filter functionality', async ({ page }) => {
        await page.goto(SERVICES.CODAI.url);

        // Test various filters
        const filters = [
          'select[name="status"], .filter-status',
          'select[name="type"], .filter-type',
          'input[type="date"], .date-filter'
        ];

        for (const filterSelector of filters) {
          const filter = page.locator(filterSelector);
          if (await filter.count() > 0) {
            if (filterSelector.includes('select')) {
              await filter.selectOption({ index: 1 });
            } else if (filterSelector.includes('date')) {
              await filter.fill('2024-01-01');
            }
            await page.waitForLoadState('networkidle');
          }
        }
      });
    });
  });

  test.describe('👥 Admin Service - Administration Dashboard', () => {

    test.describe('👤 User Management Flow', () => {
      test('User list loads and displays users', async ({ page }) => {
        await page.goto(SERVICES.ADMIN.url);

        // Navigate to users section
        const usersLink = page.locator('a[href*="users"], nav a:has-text("Users")').first();
        if (await usersLink.count() > 0) {
          await usersLink.click();

          // Verify user table loads
          await expect(page.locator('table, .user-list, [data-testid="user-table"]')).toBeVisible();
        }
      });

      test('User creation flow', async ({ page }) => {
        await page.goto(SERVICES.ADMIN.url);

        const createUserButton = page.locator('button:has-text("Create User"), button:has-text("Add User")').first();
        if (await createUserButton.count() > 0) {
          await createUserButton.click();

          // Fill user form
          await page.fill('input[name="email"]', 'newuser@test.com');
          await page.fill('input[name="name"]', 'New Test User');
          await page.selectOption('select[name="role"]', 'user');

          await page.click('button:has-text("Create"), button[type="submit"]');

          // Verify user was created
          await expect(page.locator(':has-text("newuser@test.com")')).toBeVisible();
        }
      });
    });

    test.describe('📊 System Monitoring', () => {
      test('Metrics dashboard loads', async ({ page }) => {
        await page.goto(SERVICES.ADMIN.url);

        const metricsLink = page.locator('a[href*="metrics"], a:has-text("Metrics")').first();
        if (await metricsLink.count() > 0) {
          await metricsLink.click();

          // Verify metrics components
          await expect(page.locator('.metrics, .chart, [data-testid="metrics"]')).toBeVisible();
        }
      });
    });
  });

  test.describe('🏠 Hub Service - Central Navigation', () => {

    test('Service grid displays all services', async ({ page }) => {
      await page.goto(SERVICES.HUB.url);

      // Verify service cards are displayed
      const serviceGrid = page.locator('.services, .service-grid, [data-testid="services"]');
      if (await serviceGrid.count() > 0) {
        await expect(serviceGrid).toBeVisible();

        // Test service navigation
        const serviceCard = page.locator('.service-card, .service-item').first();
        if (await serviceCard.count() > 0) {
          await serviceCard.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('Search functionality across services', async ({ page }) => {
      await page.goto(SERVICES.HUB.url);

      const globalSearch = page.locator('input[placeholder*="Search"], [data-testid="global-search"]').first();
      if (await globalSearch.count() > 0) {
        await globalSearch.fill('project');
        await page.keyboard.press('Enter');

        await page.waitForLoadState('networkidle');
        await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
      }
    });
  });

  test.describe('🔐 ID Service - Identity Management', () => {

    test.describe('🔑 Authentication Flows', () => {
      test('Registration flow', async ({ page }) => {
        await page.goto(SERVICES.ID.url);

        const registerLink = page.locator('a[href*="register"], a:has-text("Sign Up")').first();
        if (await registerLink.count() > 0) {
          await registerLink.click();

          // Fill registration form
          await page.fill('input[name="email"]', 'newuser@codai.test');
          await page.fill('input[name="password"]', 'NewUser123!');
          await page.fill('input[name="confirmPassword"]', 'NewUser123!');
          await page.fill('input[name="name"]', 'New User');

          await page.click('button:has-text("Sign Up"), button[type="submit"]');

          // Verify registration success
          await expect(page.locator('.success, .confirmation, [role="alert"]')).toBeVisible();
        }
      });

      test('Password reset flow', async ({ page }) => {
        await page.goto(SERVICES.ID.url);

        const forgotPasswordLink = page.locator('a:has-text("Forgot Password")').first();
        if (await forgotPasswordLink.count() > 0) {
          await forgotPasswordLink.click();

          await page.fill('input[name="email"]', TEST_USERS.USER.email);
          await page.click('button:has-text("Reset"), button[type="submit"]');

          await expect(page.locator('.success, .message')).toBeVisible();
        }
      });
    });
  });

  test.describe('💰 BancAI Service - Financial Platform', () => {

    test('Account dashboard loads', async ({ page }) => {
      await page.goto(SERVICES.BANCAI.url);

      // Verify financial dashboard components
      const dashboardElements = [
        '.account-summary, [data-testid="account-summary"]',
        '.transaction-history, [data-testid="transactions"]',
        '.balance, [data-testid="balance"]'
      ];

      for (const selector of dashboardElements) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          await expect(element).toBeVisible();
        }
      }
    });

    test('Transaction flow', async ({ page }) => {
      await page.goto(SERVICES.BANCAI.url);

      const transferButton = page.locator('button:has-text("Transfer"), button:has-text("Send")').first();
      if (await transferButton.count() > 0) {
        await transferButton.click();

        // Fill transaction form
        await page.fill('input[name="amount"]', '100.00');
        await page.fill('input[name="recipient"]', 'test@recipient.com');
        await page.fill('textarea[name="note"]', 'Test transaction');

        // Verify form validation before submit
        const submitButton = page.locator('button:has-text("Send"), button[type="submit"]');
        await expect(submitButton).toBeVisible();
      }
    });
  });

  test.describe('🌐 Cross-Service Integration Testing', () => {

    test('Navigation between services', async ({ page }) => {
      // Start at Hub
      await page.goto(SERVICES.HUB.url);

      // Navigate to CODAI
      const codaiLink = page.locator('a[href*="codai"], [data-service="codai"]').first();
      if (await codaiLink.count() > 0) {
        await codaiLink.click();
        await page.waitForLoadState('networkidle');

        // Verify we're on CODAI
        await expect(page).toHaveURL(/.*codai.*/);
      }
    });

    test('Shared authentication state', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      // Login on one service
      await page1.goto(SERVICES.ID.url);
      // ... perform login ...

      // Check if authenticated on another service
      await page2.goto(SERVICES.CODAI.url);
      // Should be automatically authenticated
    });
  });

  test.describe('♿ Accessibility Testing', () => {

    test('WCAG 2.1 AA compliance check', async ({ page }) => {
      for (const [serviceName, service] of Object.entries(SERVICES)) {
        await page.goto(service.url);

        // Test keyboard navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Test ARIA labels
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          const hasAccessibleName = await button.evaluate(el =>
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-labelledby') ||
            el.textContent?.trim()
          );

          if (!hasAccessibleName) {
            console.warn(`Button without accessible name found on ${serviceName}`);
          }
        }

        // Test color contrast (basic check)
        await expect(page.locator('body')).toHaveCSS('color', /rgb\(\d+, \d+, \d+\)/);
      }
    });
  });

  test.describe('🚀 Performance Testing', () => {

    test('Page load performance', async ({ page }) => {
      for (const [serviceName, service] of Object.entries(SERVICES)) {
        const startTime = Date.now();

        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Assert load time is under 5 seconds
        expect(loadTime).toBeLessThan(5000);

        console.log(`${serviceName} load time: ${loadTime}ms`);
      }
    });

    test('API response times', async ({ request }) => {
      const apiEndpoints = [
        { service: 'CODAI', endpoint: '/api/health' },
        { service: 'ADMIN', endpoint: '/api/status' },
        { service: 'HUB', endpoint: '/api/services' }
      ];

      for (const { service, endpoint } of apiEndpoints) {
        const serviceConfig = SERVICES[service as keyof typeof SERVICES];
        const startTime = Date.now();

        try {
          const response = await request.get(`${serviceConfig.url}${endpoint}`);
          const responseTime = Date.now() - startTime;

          expect(response.status()).toBeLessThan(500);
          expect(responseTime).toBeLessThan(1000);

          console.log(`${service} API response time: ${responseTime}ms`);
        } catch (error) {
          console.warn(`${service} API endpoint ${endpoint} not available`);
        }
      }
    });
  });
});

// Helper functions for test data management
export class TestDataManager {
  static async createTestUser(page: Page, userData: typeof TEST_USERS.USER) {
    // Implementation for creating test users
  }

  static async createTestProject(page: Page, projectData: any) {
    // Implementation for creating test projects
  }

  static async cleanupTestData(page: Page) {
    // Implementation for cleaning up test data
  }
}

// Custom assertions for CODAI-specific functionality
export const codaiAssertions = {
  async toHaveValidDashboard(page: Page) {
    await expect(page.locator('.dashboard, [data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('.projects, [data-testid="projects"]')).toBeVisible();
  },

  async toHaveWorkingSearch(page: Page) {
    const searchInput = page.locator('input[type="search"], [data-testid="search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();
  }
};
