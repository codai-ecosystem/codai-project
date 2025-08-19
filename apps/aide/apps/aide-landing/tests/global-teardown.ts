import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('🧹 Cleaning up test environment');

    // Clean up test data, close connections, etc.
    // This runs after all tests are complete

    console.log('✅ Test cleanup complete');
}

export default globalTeardown;
