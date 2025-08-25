/**
 * CODAI Testing Utils - Base Playwright Configuration
 * 
 * Provides standard e2e testing configuration for all CODAI packages.
 * Packages should extend this configuration with their specific needs.
 * 
 * Usage in package playwright.config.ts:
 * import { basePlaywrightConfig } from '@codai/testing-utils/configs/playwright.base.config'
 * export default defineConfig({
 *   ...basePlaywrightConfig,
 *   // package-specific overrides
 * })
 */

import { defineConfig, devices } from '@playwright/test'
import path from 'path'

export const basePlaywrightConfig = defineConfig({
    // Test directory
    testDir: './tests/e2e',

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : 4,

    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results.json' }],
        ['junit', { outputFile: 'junit.xml' }],
        process.env.CI ? ['github'] : ['list'],
    ],

    // Global test settings
    use: {
        // Base URL for tests
        baseURL: process.env.BASE_URL || 'http://localhost:3000',

        // Browser context options
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,

        // Screenshots and videos
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',

        // Network conditions
        launchOptions: {
            slowMo: process.env.SLOW_MO ? 1000 : 0,
        },

        // Action timeout
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },

    // Global setup
    globalSetup: require.resolve('./playwright.global-setup.ts'),
    globalTeardown: require.resolve('./playwright.global-teardown.ts'),

    // Test projects for different browsers
    projects: [
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

        // Mobile testing
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },

        // Microsoft Edge
        {
            name: 'Microsoft Edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
        },

        // Google Chrome
        {
            name: 'Google Chrome',
            use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
    ],

    // Web server configuration
    webServer: {
        command: process.env.WEB_SERVER_COMMAND || 'pnpm dev',
        url: process.env.BASE_URL || 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        stderr: 'pipe',
        stdout: 'pipe',
    },

    // Output directory
    outputDir: 'test-results/',

    // Test metadata
    metadata: {
        'test-type': 'e2e',
        'framework': 'playwright',
        'codai-ecosystem': 'true',
    },

    // Timeouts
    timeout: 60000,
    expect: {
        timeout: 15000,
    },
})

// Helper function to create app-specific config
export function createAppPlaywrightConfig(
    appName: string,
    port: number,
    customConfig?: Partial<typeof basePlaywrightConfig>
) {
    return defineConfig({
        ...basePlaywrightConfig,
        ...customConfig,
        use: {
            ...basePlaywrightConfig.use,
            baseURL: `http://localhost:${port}`,
            ...customConfig?.use,
        },
        webServer: {
            ...basePlaywrightConfig.webServer,
            command: `pnpm --filter ${appName} dev`,
            url: `http://localhost:${port}`,
            ...customConfig?.webServer,
        },
        metadata: {
            ...basePlaywrightConfig.metadata,
            'app-name': appName,
            'port': port.toString(),
            ...customConfig?.metadata,
        },
    })
}

export default basePlaywrightConfig