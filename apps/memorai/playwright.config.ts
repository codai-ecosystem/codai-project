import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration - 2025 Best Practices
 * Cross-browser testing with modern features
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : '50%',
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ...(process.env['CI'] ? [['github'] as const] : [['list'] as const])
  ],
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 2025 Best Practice: Enable modern web features testing
    permissions: ['clipboard-read', 'clipboard-write'],
    // Improved accessibility testing
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Locale testing
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },
  // Test against modern browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Modern Chrome features
        launchOptions: {
          args: ['--enable-features=VaapiVideoDecoder']
        }
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile browsers - 2025 mobile-first approach
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // Tablet testing
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
    // High DPI testing
    {
      name: 'Desktop Chrome HiDPI',
      use: { 
        ...devices['Desktop Chrome HiDPI']
      },
    },
    // 2025 Best Practice: Accessibility testing browser
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        // High contrast for a11y testing
        colorScheme: 'dark',
      },
    },
  ],
  // Development server setup
  ...(process.env['CI'] ? {} : {
    webServer: {
      command: 'pnpm dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env['CI'],
      timeout: 120000,
    }
  }),
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  // Test output configuration
  outputDir: 'test-results/',
  // 2025 Best Practice: Modern test configuration
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
    },
  },
})