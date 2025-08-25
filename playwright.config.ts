import { defineConfig, devices } from '@playwright/test';

/**
 * 🎭 Playwright Configuration for CODAI Ecosystem E2E Testing
 * 
 * Comprehensive end-to-end testing configuration for all CODAI applications
 * with multiple browser support, parallel execution, and detailed reporting.
 */

export default defineConfig({
    // Test directory
    testDir: './tests/e2e',

    // Global test timeout
    timeout: 60000,

    // Expect timeout for assertions
    expect: {
        timeout: 15000,
    },

    // Test execution settings
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : 2, // Limited workers for local development

    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'test-results/e2e-html-report' }],
        ['json', { outputFile: 'test-results/e2e-results.json' }],
        ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
        ['line'],
        ['allure-playwright', { outputFolder: 'test-results/allure-results' }]
    ],

    // Global test output directory
    outputDir: 'test-results/e2e-artifacts',

    // Global test configuration
    use: {
        // Base URL for relative navigation
        baseURL: 'http://localhost:4006', // Default to MemorAI

        // Browser settings
        headless: process.env.CI ? true : false,
        viewport: { width: 1280, height: 720 },

        // Interaction settings
        actionTimeout: 15000,
        navigationTimeout: 30000,

        // Recording and debugging
        trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
        screenshot: 'only-on-failure',
        video: process.env.CI ? 'retain-on-failure' : 'on-first-retry',

        // Network settings
        ignoreHTTPSErrors: true,

        // Test identification
        testIdAttribute: 'data-testid',

        // Locale and timezone
        locale: 'en-US',
        timezoneId: 'America/New_York',

        // Extra HTTP headers
        extraHTTPHeaders: {
            'X-Test-Suite': 'E2E-Comprehensive',
            'X-Test-Framework': 'Playwright',
            'X-Test-Environment': 'Development'
        }
    },

    // Browser projects
    projects: [
        // Chromium-based browsers
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Chromium-specific settings
                launchOptions: {
                    args: [
                        '--disable-web-security',
                        '--disable-features=TranslateUI',
                        '--disable-ipc-flooding-protection'
                    ]
                }
            },
        },

        // Firefox
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                // Firefox-specific settings
                launchOptions: {
                    firefoxUserPrefs: {
                        'dom.webnotifications.enabled': false,
                        'media.navigator.permission.disabled': true
                    }
                }
            },
        },

        // WebKit (Safari)
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                // WebKit-specific settings
            },
        },

        // Mobile browsers (commented out for performance in CI)
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        // Microsoft Edge
        {
            name: 'Microsoft Edge',
            use: {
                ...devices['Desktop Edge'],
                channel: 'msedge'
            },
        },
    ],

    // Development server configuration - disabled due to ES module conflicts
    // Expects applications to be running manually before E2E tests
    webServer: undefined, // process.env.CI ? undefined : [
    /*
      // MemorAI Service
      {
        command: 'pnpm dev',
        cwd: './apps/memorai',
        port: 4006,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          NODE_ENV: 'test',
          NODE_OPTIONS: '--max-old-space-size=2048'
        }
      },
      // BancAI Service  
      {
        command: 'pnpm dev',
        cwd: './apps/bancai',
        port: 4005,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          NODE_ENV: 'test',
          PORT: '4005'
        }
      },
      // Hub Service
      {
        command: 'pnpm dev', 
        cwd: './apps/hub',
        port: 4004,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          NODE_ENV: 'test',
          PORT: '4004'
        }
      },
      // ID Service
      {
        command: 'pnpm dev',
        cwd: './apps/id', 
        port: 4003,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          NODE_ENV: 'test',
          PORT: '4003'
        }
      }
    ],
    */

    // Global setup and teardown
    globalSetup: './tests/e2e/global-setup.ts',
    globalTeardown: './tests/e2e/global-teardown.ts',

    // Test metadata
    metadata: {
        testSuite: 'CODAI Ecosystem E2E Tests',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        applications: [
            'MemorAI (4006)',
            'BancAI (4005)',
            'Dashboard (4007)',
            'ControlAI (4008)',
            'Hub (4004)',
            'ID (4003)'
        ]
    }
});