import { defineConfig, devices } from '@playwright/test';

/**
 * CODAI Ecosystem Integration Testing Configuration
 * Comprehensive end-to-end and system integration testing setup
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: false, // Sequential execution for integration tests
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 2 : 4,
    timeout: 120000, // 2 minutes per test
    expect: {
        timeout: 30000, // 30 seconds for assertions
    },
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/integration-results.json' }],
        ['junit', { outputFile: 'test-results/integration-junit.xml' }],
        ['line'],
        ['allure-playwright', { outputFolder: 'allure-results' }]
    ],
    outputDir: 'test-results/',

    use: {
        baseURL: 'http://localhost:4000', // API Gateway
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        actionTimeout: 15000,
        navigationTimeout: 30000,
        ignoreHTTPSErrors: true,
        extraHTTPHeaders: {
            'Accept': 'application/json, text/html',
            'User-Agent': 'CODAI Integration Test Suite'
        }
    },

    projects: [
        // Cross-Browser Integration Testing
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.(integration|cross-app|workflow)\.spec\.ts/
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: /.*\.(integration|cross-app|workflow)\.spec\.ts/
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testMatch: /.*\.(integration|cross-app|workflow)\.spec\.ts/
        },
        {
            name: 'edge',
            use: { ...devices['Desktop Edge'] },
            testMatch: /.*\.(integration|cross-app|workflow)\.spec\.ts/
        },

        // Mobile Integration Testing
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 7'] },
            testMatch: /.*\.mobile-integration\.spec\.ts/
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 14'] },
            testMatch: /.*\.mobile-integration\.spec\.ts/
        },

        // Specialized Integration Test Projects
        {
            name: 'e2e-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.e2e\.spec\.ts/,
            timeout: 300000, // 5 minutes for E2E tests
        },
        {
            name: 'service-communication',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.service-communication\.spec\.ts/,
            timeout: 180000, // 3 minutes for service tests
        },
        {
            name: 'load-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.load\.spec\.ts/,
            timeout: 600000, // 10 minutes for load tests
            workers: 1, // Single worker for load tests
        },
        {
            name: 'resilience-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.resilience\.spec\.ts/,
            timeout: 300000, // 5 minutes for resilience tests
        },
        {
            name: 'deployment-testing',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.deployment\.spec\.ts/,
            timeout: 600000, // 10 minutes for deployment tests
        }
    ],

    webServer: [
        {
            command: 'cd ../../ && npm run start:gateway',
            port: 4000,
            reuseExistingServer: !process.env.CI,
            timeout: 60000,
            env: {
                NODE_ENV: 'test',
                TEST_MODE: 'integration'
            }
        }
    ],

    globalSetup: './global-setup.ts',
    globalTeardown: './global-teardown.ts'
});
