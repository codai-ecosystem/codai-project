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
        ['json', { outputFile: 'test-results/api-sdk-cli-results.json' }],
        ['junit', { outputFile: 'test-results/api-sdk-cli-results.xml' }],
        ['list']
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
        actionTimeout: 45 * 1000,  // 45 seconds for API calls
        navigationTimeout: 60 * 1000,
    },

    // Test configuration
    timeout: 180 * 1000, // 3 minutes per test for load testing
    expect: {
        timeout: 15 * 1000  // 15 seconds for assertions
    },

    // Projects for different test categories
    projects: [
        {
            name: 'sdk-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/sdk-*.spec.ts',
        },
        {
            name: 'cli-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/cli-*.spec.ts',
        },
        {
            name: 'api-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/api-*.spec.ts',
        },
        {
            name: 'load-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/load-*.spec.ts',
            timeout: 300 * 1000, // 5 minutes for load tests
        },
        {
            name: 'security-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/security-*.spec.ts',
        },
        {
            name: 'integration-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/integration-*.spec.ts',
        },
        {
            name: 'firefox-compatibility',
            use: { ...devices['Desktop Firefox'] },
            testMatch: '**/compatibility-*.spec.ts',
        },
        {
            name: 'mobile-api',
            use: { ...devices['Pixel 5'] },
            testMatch: '**/mobile-api-*.spec.ts',
        }
    ],

    // Global setup and teardown
    globalSetup: require.resolve('./global-setup.ts'),
    globalTeardown: require.resolve('./global-teardown.ts'),

    // Web server configuration (if needed for sample apps)
    webServer: [
        {
            command: 'npm run dev',
            port: 4000,
            reuseExistingServer: !process.env.CI,
        }
    ],
});
