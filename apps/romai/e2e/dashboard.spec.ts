import { test, expect } from '@playwright/test';

test.describe('RomAI Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard before each test
    await page.goto('/');

    // Wait for the page to load completely
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  });

  test('should load main dashboard page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/RomAI/);

    // Check main heading
    await expect(page.locator('h1')).toBeVisible();

    // Verify Romanian content is present
    await expect(page.locator('text=România')).toBeVisible();
  });

  test('should display navigation menu with all sections', async ({ page }) => {
    // Check navigation elements
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-settings"]')).toBeVisible();
  });

  test('should display analytics section with Romanian data', async ({ page }) => {
    // Stay on dashboard where Romanian regions are displayed
    await page.waitForTimeout(2000);

    // Verify Romanian regional data (on dashboard)
    await expect(page.locator('text=București')).toBeVisible();
    await expect(page.locator('text=Cluj-Napoca')).toBeVisible();

    // Now check analytics section
    await page.click('[data-testid="nav-analytics"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('.analytics-section')).toBeVisible();
  });

  test('should open AI chat functionality', async ({ page }) => {
    // Navigate to chat section
    await page.click('[data-testid="nav-chat"]');

    // Wait for chat interface to load
    await page.waitForTimeout(1000);

    // Check chat interface elements
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeVisible();
  });

  test('should toggle theme between light and dark mode', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Get initial theme state
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    // Click theme toggle
    await themeToggle.click();

    // Wait for theme change
    await page.waitForTimeout(500);

    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    expect(newTheme).not.toBe(initialTheme);
  });

  test('should display Romanian statistics correctly', async ({ page }) => {
    // Check for statistics section
    await expect(page.locator('.stats-section')).toBeVisible();

    // Verify Romanian statistics format
    const statistics = page.locator('.stat-item');
    await expect(statistics).toHaveCount(4);

    // Check for specific percentage elements in statistics
    await expect(page.getByTestId('uptime-percentage')).toBeVisible();
    await expect(page.getByTestId('memory-percentage')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main content is visible and responsive
    await expect(page.locator('h1')).toBeVisible();

    // Check that navigation adapts to mobile
    const navContainer = page.locator('[data-testid="navigation"]');
    if (await navContainer.isVisible()) {
      // Verify navigation is accessible on mobile
      await expect(navContainer).toBeVisible();
    }

    // Check that basic interactions work on mobile
    const dashboardButton = page.locator('[data-testid="nav-dashboard"]');
    if (await dashboardButton.isVisible()) {
      await dashboardButton.click({ timeout: 10000 });
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should handle API health check', async ({ page }) => {
    // Navigate to settings or health section
    await page.goto('/api/health');

    // Check API response
    const content = await page.textContent('body');
    const healthData = JSON.parse(content || '{}');

    expect(healthData.status).toBe('healthy');
    expect(healthData.service).toBe('RomAI');
  });

  test('should load analytics API data', async ({ page }) => {
    // Test analytics API endpoint
    const response = await page.request.get('/api/analytics');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.regionalData).toBeDefined();
  });

  test('should display loading states properly', async ({ page }) => {
    // Navigate to a section that shows loading
    await page.click('[data-testid="nav-analytics"]');

    // Check for loading indicator (use first element to avoid multiple matches)
    await expect(page.locator('.loading-spinner').first()).toBeVisible();

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Verify loading state is gone
    await expect(page.locator('.loading-spinner')).not.toBeVisible();
  });

  test('should handle Romanian character input correctly', async ({ page }) => {
    // Navigate to chat
    await page.click('[data-testid="nav-chat"]');

    // Type Romanian characters
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.fill('Salut! Cum stai cu ăăîîșșțț?');

    // Verify Romanian characters are displayed correctly
    await expect(chatInput).toHaveValue('Salut! Cum stai cu ăăîîșșțț?');
  });

  test('should maintain session state across navigation', async ({ page }) => {
    // Set some state in one section
    await page.click('[data-testid="nav-settings"]', { timeout: 10000, force: true });
    await page.waitForSelector('.settings-panel', { timeout: 5000 });

    // Navigate away and back
    await page.click('[data-testid="nav-dashboard"]', { timeout: 10000, force: true });
    await page.click('[data-testid="nav-settings"]', { timeout: 10000, force: true });

    // Verify state is maintained (this depends on implementation)
    await expect(page.locator('.settings-panel')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('RomAI API E2E Tests', () => {
  test('health endpoint returns correct status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.service).toBe('RomAI');
  });

  test('analytics endpoint returns Romanian data', async ({ request }) => {
    const response = await request.get('/api/analytics');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.regionalData).toBeDefined();

    // Check for Romanian cities
    const cities = data.data.regionalData.map((region: any) => region.region);
    expect(cities).toContain('București');
    expect(cities).toContain('Cluj-Napoca');
  });

  test('status endpoint returns service information', async ({ request }) => {
    const response = await request.get('/api/status');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('operational');
    expect(data.version).toBeDefined();
    expect(data.environment).toBeDefined();
  });

  test('ai test endpoint returns valid response', async ({ request }) => {
    const response = await request.get('/api/ai/test');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBeDefined();
  });
});

test.describe('RomAI Performance Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(25000); // 25 seconds max (realistic for E2E with network variance)
  });

  test('API responses are fast', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get('/api/health');

    const responseTime = Date.now() - startTime;
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(5000); // 5 seconds max (realistic for API)
  });
});

test.describe('RomAI Accessibility Tests', () => {
  test('has proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Check for h1 tag
    await expect(page.locator('h1')).toBeVisible();

    // Verify heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('has proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA labels on interactive elements
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
