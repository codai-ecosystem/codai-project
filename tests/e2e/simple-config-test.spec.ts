/**
 * Simplified E2E Configuration Test
 * Tests E2E infrastructure without complex setup
 */

import { test, expect } from '@playwright/test';

test('E2E Basic Configuration Test', async ({ page, browserName }) => {
    // Test basic Playwright functionality
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

test('E2E Viewport Test', async ({ page }) => {
    // Test viewport configuration
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto('data:text/html,<html><body><div id="viewport-test" style="width: 100vw; height: 100vh; background: #f0f0f0;"><p>Viewport Test</p></div></body></html>');

    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(1280);
    expect(viewportSize?.height).toBe(720);

    console.log('✅ Viewport configuration validated');
});

test('E2E Screenshot Test', async ({ page }) => {
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

test('E2E Network Interception Test', async ({ page }) => {
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

test('E2E JavaScript Execution Test', async ({ page }) => {
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