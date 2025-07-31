/**
 * Enhanced Playwright Configuration for METU Template
 * Optimized for comprehensive E2E testing with visual regression and accessibility
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests', // Enhanced parallelism and reliability with fast failure
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0, // Reduced retries for faster feedback
  workers: process.env['CI']
    ? 2
    : process.env['TEST_WORKERS']
      ? Number(process.env['TEST_WORKERS'])
      : 2, // Reduced workers to prevent hanging// Enhanced reporting
  reporter: process.env['CI']
    ? [
        ['html'],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [
        ['html'],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
      ],

  // Global test settings
  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 8000, // Reduced from 10000ms for faster failure
    actionTimeout: 3000, // Reduced from 5000ms for faster failure// Enhanced debugging
    launchOptions: {
      slowMo: process.env['CI'] ? 0 : 50,
    },
  }, // Test timeout configuration - aggressive fast failure
  timeout: 10000, // Reduced from 15000ms for faster failure
  expect: {
    timeout: 2000, // Reduced from 3000ms for faster failure
    toHaveScreenshot: {
      threshold: 0.3,
    },
    toMatchSnapshot: {
      threshold: 0.3,
    },
  },

  // Global test suite timeout to prevent complete hanging
  globalTimeout: 120000, // 2 minutes total for all tests

  // Fast failure on first test failure in CI
  ...(process.env['CI'] && { maxFailures: 3 }),

  // Enhanced project configuration
  projects: [
    // Setup project for authentication and global state
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    // Smoke tests - critical user journeys
    {
      name: 'smoke-chromium',
      testMatch: /.*smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // Unit-style component tests
    {
      name: 'component-tests',
      testMatch: /.*component\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // Main browser testing
    {
      name: 'chromium',
      testIgnore: [/.*smoke\.spec\.ts/, /.*component\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      testIgnore: [/.*smoke\.spec\.ts/, /.*component\.spec\.ts/],
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      testIgnore: [/.*smoke\.spec\.ts/, /.*component\.spec\.ts/],
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // Mobile testing
    {
      name: 'mobile-chrome',
      testMatch: [/.*responsive\.spec\.ts/, /.*mobile\.spec\.ts/],
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },

    {
      name: 'mobile-safari',
      testMatch: [/.*responsive\.spec\.ts/, /.*mobile\.spec\.ts/],
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },

    // Accessibility testing
    {
      name: 'accessibility',
      testMatch: [/.*a11y\.spec\.ts/, /.*accessibility\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // Performance testing
    {
      name: 'performance',
      testMatch: [/.*performance\.spec\.ts/, /.*perf\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // Visual regression testing
    {
      name: 'visual',
      testMatch: [/.*visual\.spec\.ts/, /.*screenshot\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // API testing
    {
      name: 'api',
      testMatch: /.*api\.spec\.ts/,
      use: {
        baseURL: process.env['API_BASE_URL'] || 'http://localhost:3001',
      },
    },
  ], // Development server configuration
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env['CI'],
      timeout: 30000, // Reduced from 120000ms
      stdout: 'pipe',
      stderr: 'pipe',
    }, // {
    //     command: 'npm run dev:backend',
    //     url: 'http://localhost:3001/health',
    //     reuseExistingServer: !process.env['CI'],
    //     timeout: 60000,
    //     stdout: 'pipe',
    //     stderr: 'pipe',
    // },
  ],

  // Output directories
  outputDir: 'test-results',
});
