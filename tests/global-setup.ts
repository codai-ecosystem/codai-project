import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('🚀 Setting up CODAI Ecosystem Test Environment...');

    // Start browser for authentication and setup
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // Wait for services to be available
        console.log('⏳ Waiting for core services to start...');

        const services = [
            { name: 'Local Dev Server', url: 'http://localhost:3000/health', fallback: 'http://localhost:3000' },
            { name: 'API Gateway', url: 'http://localhost:4000/api/gateway/health', fallback: 'http://localhost:4000' }
        ];

        for (const service of services) {
            let retries = 10;
            let serviceReady = false;

            while (retries > 0 && !serviceReady) {
                try {
                    await page.goto(service.url, { timeout: 3000 });
                    serviceReady = true;
                    console.log(`✅ ${service.name} is ready`);
                } catch {
                    try {
                        // Try fallback URL
                        await page.goto(service.fallback, { timeout: 3000 });
                        serviceReady = true;
                        console.log(`✅ ${service.name} is ready (fallback)`);
                    } catch {
                        retries--;
                        if (retries > 0) {
                            console.log(`⏳ Waiting for ${service.name}... (${retries} retries left)`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                }
            }

            if (!serviceReady) {
                console.log(`⚠️  ${service.name} not available - some tests may be skipped`);
            }
        }

        console.log('✅ CODAI Ecosystem Test Environment setup completed');
    } catch (error) {
        console.log('⚠️  Warning: Setup error (continuing anyway):', (error as Error).message);
    } finally {
        await browser.close();
    }
}

export default globalSetup;
