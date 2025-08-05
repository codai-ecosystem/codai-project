import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results.json' }],
        ['list']
    ],
    use: {
        baseURL: 'http://localhost',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        // Desktop Browsers
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'edge',
            use: { ...devices['Desktop Edge'] },
        },

        // Mobile Browsers
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
        },

        // Tablet Browsers
        {
            name: 'tablet-chrome',
            use: { ...devices['iPad Pro'] },
        },
        {
            name: 'tablet-safari',
            use: { ...devices['iPad Pro'] },
        },
    ],

    // Note: Services should already be running, so we skip webServer configuration
    // webServer: [
    //   {
    //     command: 'echo "Services should already be running"',
    //     url: 'http://localhost:4003/health',
    //     reuseExistingServer: true,
    //     timeout: 5000,
    //   },
    // ],
});
