import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for more stable runs
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'tests/e2e-results/html-report' }],
    ['junit', { outputFile: 'tests/e2e-results/junit-results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for the application
    baseURL: process.env.ROMAI_E2E_URL || 'http://localhost:6100',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // AGI operations may take longer
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Romanian locale for proper language testing
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    // Mobile testing for Romanian users
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 14'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    // Tablet testing
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['Galaxy Tab S4'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'pnpm dev',
      url: 'http://localhost:6100',
      reuseExistingServer: !process.env.CI,
      timeout: 120000, // 2 minutes for full AGI system startup
    },
    {
      command: 'python src/ml/serving/model_server.py',
      url: 'http://localhost:6101/health',
      cwd: './apps/romai',
      reuseExistingServer: !process.env.CI,
      timeout: 180000, // 3 minutes for AGI model loading
      env: {
        PYTHONPATH: './src',
        ROMAI_AGI_HOST: '0.0.0.0',
        ROMAI_AGI_PORT: '6101',
        ROMAI_LOG_LEVEL: 'INFO'
      }
    }
  ],

  // Global test timeout - AGI operations need more time
  timeout: 60000,

  // Expect timeout for individual assertions
  expect: {
    timeout: 10000,
  },

  // Output directory for test artifacts
  outputDir: 'tests/e2e-results/test-artifacts',
})