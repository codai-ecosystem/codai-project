import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Look for test files in the "src/e2e" directory
  testDir: './src/e2e',
  
  // Timeout for each test
  timeout: 30000,
  
  // Timeout for expectations
  expect: {
    timeout: 5000
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:4950',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure'
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.e2e.test.ts',
      use: {
        // API testing doesn't need a browser
      }
    }
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:4950/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    }
  ],
});