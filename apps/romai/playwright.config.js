import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Romanian locale settings */
    locale: 'ro-RO',
    timezoneId: 'Europe/Bucharest',
    
    /* Accept Romanian characters and UTF-8 encoding */
    extraHTTPHeaders: {
      'Accept-Charset': 'utf-8',
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8'
    },
    
    /* Ignore HTTPS certificate errors in development */
    ignoreHTTPSErrors: true,
    
    /* Default navigation timeout */
    navigationTimeout: 30000,
    
    /* Default action timeout */
    actionTimeout: 10000
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 7'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 14'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    /* Test against tablet viewports. */
    {
      name: 'tablet-chrome',
      use: { 
        ...devices['iPad Pro'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    },

    /* Romanian-specific accessibility testing */
    {
      name: 'accessibility-chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest',
        // High contrast mode for accessibility testing
        colorScheme: 'dark',
        reducedMotion: 'reduce'
      },
    },

    /* High-DPI testing for Romanian diacritics rendering */
    {
      name: 'high-dpi-chromium',
      use: {
        ...devices['Desktop Chrome HiDPI'],
        locale: 'ro-RO',
        timezoneId: 'Europe/Bucharest'
      },
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_TEST_MODE: 'true',
        // Romanian localization in test mode
        NEXT_PUBLIC_DEFAULT_LOCALE: 'ro',
        NEXT_PUBLIC_SUPPORTED_LOCALES: 'ro,en'
      }
    },
    // Also start the ROMAI AGI server for E2E tests
    {
      command: 'python -m uvicorn ml.serving.model_server:app --host 0.0.0.0 --port 6101',
      port: 6101,
      cwd: './src',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        PYTHONPATH: './src',
        ROMAI_ENV: 'test',
        ROMAI_LOG_LEVEL: 'ERROR', // Reduce noise in test output
        MODEL_CACHE_DIR: './.cache/test-models',
        PYTORCH_CUDA_ALLOC_CONF: 'max_split_size_mb:512'
      },
      timeout: 120000 // 2 minutes for model loading
    }
  ],

  /* Global test configuration for Romanian content */
  globalSetup: require.resolve('./tests/global-e2e-setup.js'),
  globalTeardown: require.resolve('./tests/global-e2e-teardown.js'),

  /* Test output directory */
  outputDir: 'test-results/',
  
  /* Test timeout */
  timeout: 60000, // 1 minute per test (Romanian AGI responses can be slow)
  
  /* Global expect timeout */
  expect: {
    timeout: 10000, // 10 seconds for assertions
    
    // Custom Romanian text matchers
    toMatchRomanianText: async (received, expected) => {
      const hasRomanianChars = /[ăâîșț]/i.test(received)
      const pass = hasRomanianChars && received.includes(expected)
      
      return {
        message: () => pass 
          ? `Expected "${received}" not to match Romanian text "${expected}"`
          : `Expected "${received}" to match Romanian text "${expected}" and contain diacritics`,
        pass
      }
    },
    
    // Custom cultural content matcher
    toContainRomanianCulture: async (received, culturalElement) => {
      const culturalKeywords = {
        'mihai_eminescu': ['poet', 'național', 'român', 'literatura'],
        'martisor': ['martie', 'primăvar', 'tradiție', 'România'],
        'bran_castle': ['Dracula', 'Transilvania', 'castel', 'istoric'],
        'traditional_expression': ['expresie', 'românească', 'popular', 'înțeles']
      }
      
      const keywords = culturalKeywords[culturalElement] || [culturalElement]
      const hasKeywords = keywords.some(keyword => 
        received.toLowerCase().includes(keyword.toLowerCase())
      )
      
      const hasRomanianChars = /[ăâîșț]/i.test(received)
      const pass = hasKeywords && hasRomanianChars
      
      return {
        message: () => pass
          ? `Expected "${received}" not to contain Romanian cultural element "${culturalElement}"`
          : `Expected "${received}" to contain Romanian cultural element "${culturalElement}" with proper diacritics`,
        pass
      }
    }
  }
})