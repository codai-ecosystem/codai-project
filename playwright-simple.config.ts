/**
 * Simple Playwright Configuration for E2E Tests
 * Minimal configuration to avoid version conflicts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Test directory
    testDir: './tests/e2e',

    // Test patterns
    testMatch: ['**/simple-*.spec.ts'],

    // Global setup and teardown
    globalSetup: './tests/e2e/simple-global-setup.ts',
    globalTeardown: './tests/e2e/simple-global-teardown.ts',

    // Basic configuration
    timeout: 30000,
    expect: {
        timeout: 10000,
    },

    // Retry configuration
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    // Reporter configuration
    reporter: [
        ['list'],
        ['html', { outputFolder: 'test-results/simple-e2e-html-report', open: 'never' }]
    ],

    // Output directory
    outputDir: 'test-results/simple-e2e-artifacts',

    // Global test settings
    use: {
        baseURL: 'http://localhost:4006',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 15000,
    },

    // Browser projects
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});