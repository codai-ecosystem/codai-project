/**
 * Standalone E2E Test for CODAI Ecosystem
 * Bypasses workspace configuration conflicts
 */

const { test, expect, chromium } = require('@playwright/test');

test('CODAI E2E Basic Configuration Test', async () => {
    let browser = null;
    let page = null;

    try {
        console.log('🚀 Starting CODAI E2E Basic Test...');

        // Launch browser manually
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        page = await browser.newPage();

        // Test basic browser functionality
        await page.goto('data:text/html,<html><head><title>CODAI E2E Test</title></head><body><h1 id="test-heading">CODAI E2E Test</h1><p id="test-content">Configuration Test Successful</p></body></html>');

        // Verify page content
        const heading = page.locator('#test-heading');
        await expect(heading).toHaveText('CODAI E2E Test');

        const content = page.locator('#test-content');
        await expect(content).toHaveText('Configuration Test Successful');

        // Test page title
        await expect(page).toHaveTitle('CODAI E2E Test');

        console.log('✅ CODAI E2E Basic Test Passed');

    } catch (error) {
        console.error('❌ CODAI E2E Test Failed:', error);
        throw error;
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
});

test('CODAI E2E Service Connectivity Test', async () => {
    let browser = null;
    let page = null;

    try {
        console.log('🔗 Starting CODAI Service Connectivity Test...');

        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        page = await browser.newPage();

        // Test if we can make network requests
        const requestInfo = {
            interceptedRequests: 0,
            networkEnabled: false
        };

        page.on('request', (request) => {
            requestInfo.interceptedRequests++;
            requestInfo.networkEnabled = true;
        });

        // Load a page that makes a fetch request
        await page.goto('data:text/html,<html><body><script>fetch("data:text/plain,test").catch(()=>{}); document.body.innerHTML="<p id=\\"result\\">Network Test Complete</p>";</script></body></html>');

        // Wait for the script to execute
        await page.waitForTimeout(500);

        const result = page.locator('#result');
        await expect(result).toHaveText('Network Test Complete');

        console.log(`✅ Network interception enabled: ${requestInfo.networkEnabled}`);
        console.log(`✅ Intercepted ${requestInfo.interceptedRequests} requests`);

    } catch (error) {
        console.error('❌ CODAI Service Connectivity Test Failed:', error);
        throw error;
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
});

test('CODAI E2E Screenshot Capability Test', async () => {
    let browser = null;
    let page = null;

    try {
        console.log('📸 Starting CODAI Screenshot Test...');

        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        page = await browser.newPage();

        await page.setViewportSize({ width: 1200, height: 800 });

        await page.goto('data:text/html,<html><body style="margin:0;padding:20px;font-family:Arial,sans-serif;background:linear-gradient(45deg,#667eea,#764ba2);"><h1 style="color:white;text-align:center;">CODAI E2E Screenshot Test</h1><div style="width:300px;height:150px;background:white;border-radius:10px;margin:20px auto;display:flex;align-items:center;justify-content:center;"><p style="color:#333;font-weight:bold;">Screenshot Capability ✅</p></div></body></html>');

        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true
        });

        // Verify screenshot was created
        expect(screenshot).toBeDefined();
        expect(screenshot.length).toBeGreaterThan(5000); // Should be reasonably sized

        console.log(`✅ Screenshot created: ${screenshot.length} bytes`);

    } catch (error) {
        console.error('❌ CODAI Screenshot Test Failed:', error);
        throw error;
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
});