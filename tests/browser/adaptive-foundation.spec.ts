import { test, expect } from '@playwright/test';

test.describe('Adaptive Foundation Tests', () => {
    test('should load Codai dashboard and verify basic functionality', async ({ page }) => {
        // Navigate to the service
        await page.goto('/');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Verify page title
        await expect(page).toHaveTitle(/Codai/);

        // Look for any heading on the page
        const headings = page.locator('h1, h2, h3');
        const headingCount = await headings.count();
        console.log(`Found ${headingCount} headings on the page`);

        if (headingCount > 0) {
            const firstHeading = headings.first();
            await expect(firstHeading).toBeVisible();
            const headingText = await firstHeading.textContent();
            console.log('First heading text:', headingText);
        }

        // Look for navigation elements
        const navElements = page.locator('nav, [role="navigation"], [role="tablist"]');
        const navCount = await navElements.count();
        console.log(`Found ${navCount} navigation elements`);

        // Look for any interactive elements
        const buttons = page.locator('button');
        const links = page.locator('a');
        const buttonCount = await buttons.count();
        const linkCount = await links.count();
        console.log(`Found ${buttonCount} buttons and ${linkCount} links`);

        // Verify page is interactive (has some clickable elements)
        expect(buttonCount + linkCount).toBeGreaterThan(0);

        // Take a screenshot for manual review
        await page.screenshot({
            path: 'test-results/adaptive-foundation-test.png',
            fullPage: true
        });
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Navigate to the service
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify page still loads properly on mobile
        await expect(page).toHaveTitle(/Codai/);

        // Take a screenshot for mobile view
        await page.screenshot({
            path: 'test-results/mobile-foundation-test.png',
            fullPage: true
        });
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        // Navigate to the service
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify page still loads properly on tablet
        await expect(page).toHaveTitle(/Codai/);

        // Take a screenshot for tablet view
        await page.screenshot({
            path: 'test-results/tablet-foundation-test.png',
            fullPage: true
        });
    });
});
