import { test, expect } from '@playwright/test';

test.describe('Bancai Service - Codai Ecosystem Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the development server
    await page.goto('http://localhost:3003');
  });

  test('should display welcome page for unauthenticated users', async ({
    page,
  }) => {
    // Check that the welcome page loads
    await expect(page.locator('h1')).toContainText('Welcome to BancAI');
    await expect(
      page.locator('text=AI-Powered Financial Platform')
    ).toBeVisible();

    // Check demo environment indicator
    await expect(page.locator('text=Demo Environment')).toBeVisible();
    await expect(
      page.locator('button', { hasText: 'Demo Sign In' })
    ).toBeVisible();
  });

  test('should successfully authenticate demo user', async ({ page }) => {
    // Click demo sign in button
    await page.click('button:has-text("Demo Sign In")');

    // Wait for authentication to complete and dashboard to load
    await expect(page.locator('h1')).toContainText('BancAI Dashboard', {
      timeout: 10000,
    });

    // Check for dashboard elements
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Total Balance')).toBeVisible();
    await expect(page.locator('text=Service: bancai.ro')).toBeVisible();
  });

  test('should display financial data and AI insights', async ({ page }) => {
    // Sign in first
    await page.click('button:has-text("Demo Sign In")');
    await expect(page.locator('h1')).toContainText('BancAI Dashboard', {
      timeout: 10000,
    });

    // Check financial summary cards
    await expect(page.locator('text=Total Balance')).toBeVisible();
    await expect(page.locator('text=Monthly Income')).toBeVisible();
    await expect(page.locator('text=Monthly Expenses')).toBeVisible();
    await expect(page.locator('text=Savings Rate')).toBeVisible();

    // Check account summary
    await expect(page.locator('text=Account Summary')).toBeVisible();
    await expect(page.locator('text=Checking')).toBeVisible();
    await expect(page.locator('text=Savings')).toBeVisible();

    // Check AI insights section
    await expect(page.locator('text=AI Insights')).toBeVisible();
    await expect(page.locator('text=AI Recommendations')).toBeVisible();

    // Check spending categories
    await expect(page.locator('text=Spending by Category')).toBeVisible();

    // Check savings goals
    await expect(page.locator('text=Savings Goals')).toBeVisible();
  });

  test('should show Codai ecosystem integration status', async ({ page }) => {
    // Sign in first
    await page.click('button:has-text("Demo Sign In")');
    await expect(page.locator('h1')).toContainText('BancAI Dashboard', {
      timeout: 10000,
    });

    // Check ecosystem integration status
    await expect(
      page.locator('text=Codai Ecosystem Integration')
    ).toBeVisible();
    await expect(page.locator('text=MemorAI: Connected')).toBeVisible();
    await expect(page.locator('text=LogAI: Authenticated')).toBeVisible();
    await expect(page.locator('text=CodAI: Integrating')).toBeVisible();
  });

  test('should make successful API calls to all endpoints', async ({
    page,
  }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push(request.url());
      }
    });

    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Sign in and wait for dashboard
    await page.click('button:has-text("Demo Sign In")');
    await expect(page.locator('h1')).toContainText('BancAI Dashboard', {
      timeout: 10000,
    });

    // Wait a moment for all API calls to complete
    await page.waitForTimeout(2000);

    // Verify API endpoints were called
    const apiCalls = requests.filter(url => url.includes('/api/'));
    expect(apiCalls.some(url => url.includes('/api/auth/me'))).toBeTruthy();
    expect(apiCalls.some(url => url.includes('/api/dashboard'))).toBeTruthy();

    // Verify all API responses were successful
    const apiResponses = responses.filter(r => r.url.includes('/api/'));
    apiResponses.forEach(response => {
      expect(response.status).toBeLessThan(400);
    });
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with invalid authentication by going directly to dashboard
    await page.goto('http://localhost:3003/api/dashboard');

    // Should redirect or show appropriate error
    const response = await page.waitForResponse('**/api/dashboard');
    expect(response.status()).toBe(401);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Sign in
    await page.click('button:has-text("Demo Sign In")');
    await expect(page.locator('h1')).toContainText('BancAI Dashboard', {
      timeout: 10000,
    });

    // Check that content is still visible and properly formatted
    await expect(page.locator('text=Total Balance')).toBeVisible();
    await expect(page.locator('text=AI Insights')).toBeVisible();

    // Check header is responsive
    await expect(page.locator('header')).toBeVisible();
  });
});
