import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './specs',

    // Parallel execution for performance
    fullyParallel: true,

    // Fail fast on first failure in CI
    forbidOnly: !!process.env.CI,

    // Retry configuration
    retries: process.env.CI ? 2 : 1,

    // Worker configuration
    workers: process.env.CI ? 1 : undefined,

    // Reporter configuration
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/database-storage-results.json' }],
        ['junit', { outputFile: 'test-results/database-storage-results.xml' }]
    ],

    // Global configuration
    use: {
        baseURL: 'http://localhost:4000',  // API Gateway
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // HTTP Configuration
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },

        // Timeouts
        actionTimeout: 30 * 1000,
        navigationTimeout: 60 * 1000,
    },

    // Test configuration
    timeout: 120 * 1000, // 2 minutes per test
    expect: {
        timeout: 10 * 1000
    },

    // Projects for different test categories
    projects: [
        {
            name: 'memorai-operations',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/memorai-operations.spec.ts',
        },
        {
            name: 'file-operations',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/file-operations.spec.ts',
        },
        {
            name: 'cache-operations',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/cache-operations.spec.ts',
        },
        {
            name: 'realtime-sync',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/realtime-sync.spec.ts',
        },
        {
            name: 'performance-tests',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/performance.spec.ts',
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: '**/integration.spec.ts',
        },
        {
            name: 'mobile',
            use: { ...devices['Pixel 5'] },
            testMatch: '**/mobile-storage.spec.ts',
        }
    ],

    // Global setup and teardown
    globalSetup: require.resolve('./global-setup.ts'),
    globalTeardown: require.resolve('./global-teardown.ts'),

    // Web server configuration
    webServer: {
        command: 'npm run dev',
        port: 4000,
        reuseExistingServer: !process.env.CI,
    },
});
