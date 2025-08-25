/**
 * Basic Playwright Configuration Test
 * Tests that E2E infrastructure is properly configured
 */

import { test, expect } from '@playwright/test';

test.describe('E2E Configuration Tests', () => {
    test.beforeAll(async () => {
        console.log('🧪 Starting E2E Configuration Validation...');
    });

    test.afterAll(async () => {
        console.log('✅ E2E Configuration Tests Completed');
    });

    test('should have proper Playwright configuration', async ({ page, browserName }) => {
        // Test basic Playwright functionality
        expect(page).toBeDefined();
        expect(browserName).toBeDefined();

        console.log(`🔧 Testing with browser: ${browserName}`);

        // Navigate to a simple page to test browser functionality
        await page.goto('data:text/html,<html><head><title>E2E Test</title></head><body><h1 id="test-heading">E2E Test Page</h1><p id="test-content">Configuration Test Successful</p></body></html>');

        // Test basic page interactions
        await expect(page.locator('#test-heading')).toHaveText('E2E Test Page');
        await expect(page.locator('#test-content')).toHaveText('Configuration Test Successful');

        // Test page title
        await expect(page).toHaveTitle('E2E Test');

        console.log('✅ Basic Playwright functionality validated');
    });

    test('should support viewport and device emulation', async ({ page }) => {
        // Test viewport configuration
        await page.setViewportSize({ width: 1280, height: 720 });

        await page.goto('data:text/html,<html><body><div id="viewport-test" style="width: 100vw; height: 100vh; background: #f0f0f0;"><p>Viewport Test</p></div></body></html>');

        const viewportSize = page.viewportSize();
        expect(viewportSize?.width).toBe(1280);
        expect(viewportSize?.height).toBe(720);

        console.log('✅ Viewport configuration validated');
    });

    test('should support screenshots and visual testing', async ({ page }) => {
        await page.goto('data:text/html,<html><body style="margin:0;padding:20px;font-family:Arial,sans-serif;"><h1 style="color:#333;">Screenshot Test</h1><div style="width:200px;height:100px;background:linear-gradient(45deg,#ff6b6b,#4ecdc4);border-radius:8px;"></div></body></html>');

        // Take a screenshot to test visual capabilities
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false
        });

        expect(screenshot).toBeDefined();
        expect(screenshot.length).toBeGreaterThan(1000); // Should have reasonable file size

        console.log('✅ Screenshot functionality validated');
    });

    test('should support network interception', async ({ page }) => {
        let interceptedRequests = 0;

        // Set up request interception
        await page.route('**/*', route => {
            interceptedRequests++;
            route.continue();
        });

        await page.goto('data:text/html,<html><body><p>Network Test</p><script>fetch("data:text/plain,test").catch(()=>{});</script></body></html>');

        // Wait for any potential requests
        await page.waitForTimeout(100);

        expect(interceptedRequests).toBeGreaterThan(0);

        console.log('✅ Network interception validated');
    });

    test('should support accessibility testing', async ({ page }) => {
        await page.goto('data:text/html,<html lang="en"><head><title>Accessibility Test</title></head><body><main><h1>Accessibility Test</h1><button aria-label="Test Button">Click Me</button><input type="text" aria-label="Test Input" placeholder="Enter text"/></main></body></html>');

        // Test accessibility features
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Accessibility Test');

        const button = page.locator('button[aria-label="Test Button"]');
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();

        const input = page.locator('input[aria-label="Test Input"]');
        await expect(input).toBeVisible();
        await expect(input).toBeEnabled();

        console.log('✅ Accessibility testing features validated');
    });

    test('should support JavaScript execution', async ({ page }) => {
        await page.goto('data:text/html,<html><body><div id="js-test"></div></body></html>');

        // Execute JavaScript in the browser context
        const result = await page.evaluate(() => {
            const div = document.getElementById('js-test');
            if (div) {
                div.textContent = 'JavaScript Executed Successfully';
                return div.textContent;
            }
            return 'Failed';
        });

        expect(result).toBe('JavaScript Executed Successfully');

        // Verify the change in the DOM
        await expect(page.locator('#js-test')).toHaveText('JavaScript Executed Successfully');

        console.log('✅ JavaScript execution validated');
    });
});