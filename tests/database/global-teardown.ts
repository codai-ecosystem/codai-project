import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('🧹 Starting Database/Storage Testing Global Teardown');

    try {
        // Calculate test session duration
        const startTime = parseInt(process.env.TEST_START_TIME || '0');
        const duration = startTime ? Date.now() - startTime : 0;

        console.log(`📊 Test session duration: ${(duration / 1000).toFixed(1)} seconds`);

        // Clean up any remaining test data (optional)
        console.log('🧹 Cleaning up test artifacts...');

        // Remove test environment variables
        delete process.env.TEST_MODE;
        delete process.env.TEST_START_TIME;

        console.log('✅ Global teardown completed successfully');

    } catch (error: any) {
        console.error('❌ Global teardown encountered issues:', error.message);
        // Don't throw error in teardown as it might mask test results
    }
}

export default globalTeardown;
