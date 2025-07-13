import { test, expect } from '@playwright/test';

test.describe('AIDE Performance Tests', () => {
  test('Core Web Vitals - First Contentful Paint', async ({ page }) => {
    await page.goto('/');

    // Measure FCP using Performance API
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    // FCP should be under 1.5 seconds (1500ms)
    expect(fcp).toBeLessThan(1500);
  });

  test('Core Web Vitals - Largest Contentful Paint', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be under 2.5 seconds (2500ms)
    expect(lcp).toBeLessThan(2500);
  });

  test('Bundle size analysis', async ({ page }) => {
    await page.goto('/');

    // Measure total resources loaded
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
    });

    // Total bundle size should be reasonable (under 2MB)
    expect(resourceSizes).toBeLessThan(2 * 1024 * 1024);
  });

  test('Memory usage stability', async ({ page }) => {
    await page.goto('/');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate through the app
    await page.goto('/chat');
    await page.goBack();
    await page.goto('/chat');

    // Check memory hasn't grown excessively
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory growth should be reasonable (less than 50MB increase)
    const memoryGrowth = finalMemory - initialMemory;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });

  test('API response times', async ({ page }) => {
    await page.goto('/');

    // Test API endpoints
    const apiTests = [
      { endpoint: '/api/status', maxTime: 500 },
      { endpoint: '/api/projects', maxTime: 1000 },
    ];

    for (const { endpoint, maxTime } of apiTests) {
      const startTime = Date.now();
      const response = await page.request.get(endpoint);
      const responseTime = Date.now() - startTime;

      expect(response.ok()).toBe(true);
      expect(responseTime).toBeLessThan(maxTime);
    }
  });

  test('Concurrent user simulation', async ({ browser }) => {
    // Create multiple browser contexts to simulate concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // All users navigate simultaneously
    const startTime = Date.now();
    await Promise.all(
      pages.map(page => page.goto('/'))
    );
    const loadTime = Date.now() - startTime;

    // All pages should load within reasonable time even with concurrent users
    expect(loadTime).toBeLessThan(5000);

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });

  test('Network conditions simulation', async ({ page, context }) => {
    // Simulate slow 3G connection
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Add 100ms delay
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should still load reasonably fast even on slow connection
    expect(loadTime).toBeLessThan(10000);
  });
});
