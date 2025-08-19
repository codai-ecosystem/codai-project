import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting AIDE Landing Page Test Suite');

    // Ensure test environment is ready
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // Health check for the application
        await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
        await page.waitForSelector('header', { timeout: 30000 });
        console.log('✅ Application is ready for testing');
    } catch (error) {
        console.error('❌ Application health check failed:', error);
        throw error;
    } finally {
        await browser.close();
    }

    // Set up test data or authentication if needed
    console.log('🔧 Test environment setup complete');
}

export default globalSetup;
