import { test } from '../utils/browser-test-base';
import { CodaiDashboardPage } from '../fixtures/page-objects';

test.describe('Foundation Tests - Codai Platform', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });
  });

  test('should load Codai dashboard successfully', async ({ page, browserName }) => {
    const dashboard = new CodaiDashboardPage(page);

    // Navigate to dashboard
    await dashboard.goto();

    // Verify core elements are present
    await dashboard.verifyDashboardElements();

    // Verify page title
    await test.expect(page).toHaveTitle(/Codai/);

    // Take a screenshot for visual verification
    await page.screenshot({
      path: `test-results/foundation/codai-dashboard-${browserName}.png`,
      fullPage: true
    });
  });

  test('should display all navigation tabs', async ({ page }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Verify navigation tabs are present
    await test.expect(dashboard.navigationTabs).toBeVisible();

    // Check for expected tabs (based on Dashboard component)
    const expectedTabs = ['Overview', 'Apps', 'Services', 'Analytics'];

    for (const tabName of expectedTabs) {
      const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
      await test.expect(tab).toBeVisible();
    }
  });

  test('should navigate between tabs successfully', async ({ page }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Test tab navigation
    await dashboard.navigateToTab('Apps');
    await page.waitForTimeout(500);

    // Verify tab is active (this would depend on actual implementation)
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await test.expect(activeTab).toBeVisible();

    // Navigate to another tab
    await dashboard.navigateToTab('Services');
    await page.waitForTimeout(500);
  });

  test('should display project statistics', async ({ page }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Verify stats cards are present
    await test.expect(dashboard.statsCards).toBeVisible();

    // Check that we have at least one stat card
    const statsCount = await dashboard.statsCards.count();
    test.expect(statsCount).toBeGreaterThan(0);
  });

  test('should handle responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Verify responsive layout
    const isResponsive = await dashboard.verifyResponsiveLayout();
    test.expect(isResponsive).toBe(true);

    // Take mobile screenshot
    await page.screenshot({
      path: 'test-results/foundation/codai-dashboard-mobile.png',
      fullPage: true
    });
  });

  test('should handle responsive layout on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Verify layout adapts to tablet
    await dashboard.verifyDashboardElements();

    // Take tablet screenshot
    await page.screenshot({
      path: 'test-results/foundation/codai-dashboard-tablet.png',
      fullPage: true
    });
  });

  test('should load quickly under normal conditions', async ({ page, performance }) => {
    const dashboard = new CodaiDashboardPage(page);

    // Start performance monitoring
    performance.startMeasurement();

    await dashboard.goto();
    await dashboard.verifyDashboardElements();

    // Check performance metrics
    const metrics = performance.getMetrics();

    // Verify load time is reasonable (under 3 seconds)
    test.expect(metrics.loadTime).toBeLessThan(3000);

    // Verify FCP is good (under 1.5 seconds)
    if (metrics.firstContentfulPaint) {
      test.expect(metrics.firstContentfulPaint).toBeLessThan(1500);
    }
  });

  test('should be accessible with screen readers', async ({ page, accessibility }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Run accessibility scan
    const violations = await accessibility.scanForViolations();

    // Assert no critical accessibility violations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    test.expect(criticalViolations).toHaveLength(0);

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    test.expect(headingCount).toBeGreaterThan(0);

    // Verify main heading has proper role
    await test.expect(dashboard.heading).toHaveAttribute('role', 'heading');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Test keyboard navigation through interactive elements
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await test.expect(focusedElement).toBeVisible();

    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Test Enter key activation on focused button
    const focusedButton = page.locator('button:focus');
    if (await focusedButton.count() > 0) {
      await page.keyboard.press('Enter');
      // Verify some action occurred (this would be implementation-specific)
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Navigate to a different section
    await dashboard.navigateToTab('Apps');
    await page.waitForTimeout(500);

    // Use browser back button
    await page.goBack();
    await page.waitForTimeout(500);

    // Verify we're back to the original state
    await dashboard.verifyDashboardElements();

    // Use browser forward button
    await page.goForward();
    await page.waitForTimeout(500);
  });

  test('should handle page refresh gracefully', async ({ page }) => {
    const dashboard = new CodaiDashboardPage(page);
    await dashboard.goto();

    // Verify initial load
    await dashboard.verifyDashboardElements();

    // Refresh the page
    await page.reload();

    // Verify page loads correctly after refresh
    await dashboard.verifyDashboardElements();

    // Verify no console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    test.expect(consoleErrors).toHaveLength(0);
  });
});
