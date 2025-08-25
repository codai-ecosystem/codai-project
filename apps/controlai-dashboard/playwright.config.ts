import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }]
    ],
    use: {
        baseURL: 'http://localhost:3001',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            }
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 }
            }
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 }
            }
        },
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5']
            }
        },
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 12']
            }
        },
        {
            name: 'accessibility',
            testDir: './tests/accessibility',
            use: {
                ...devices['Desktop Chrome']
            }
        },
        {
            name: 'performance',
            testDir: './tests/performance',
            use: {
                ...devices['Desktop Chrome']
            }
        }
    ],
    webServer: {
        command: 'pnpm dev',
        port: 3001,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    }
});

import { devices } from '@playwright/test';