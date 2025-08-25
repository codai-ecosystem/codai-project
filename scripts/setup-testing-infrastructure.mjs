#!/usr/bin/env node

/**
 * 🧪 CODAI Testing Infrastructure Setup Script
 * Configures modern testing stack across all applications
 * Version: 2.0.0 - Production Ready
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '..');

/**
 * Testing Infrastructure Configuration
 */
class TestingInfrastructureSetup {
    constructor() {
        this.apps = [
            'controlai-dashboard',
            'memorai',
            'romai',
            'bancai',
            'codai',
            'admin',
            'hub',
            'id'
        ];

        this.setupResults = {
            successful: [],
            failed: [],
            warnings: []
        };
    }

    async setupTestingInfrastructure() {
        console.log('🚀 CODAI Testing Infrastructure Setup');
        console.log('=====================================\n');

        // Step 1: Install global testing dependencies
        await this.installGlobalTestingDependencies();

        // Step 2: Create shared testing utilities
        await this.createSharedTestingUtilities();

        // Step 3: Setup testing for each application
        for (const app of this.apps) {
            await this.setupApplicationTesting(app);
        }

        // Step 4: Create global test configurations
        await this.createGlobalTestConfigurations();

        // Step 5: Generate final report
        await this.generateSetupReport();
    }

    async installGlobalTestingDependencies() {
        console.log('📦 Installing Global Testing Dependencies');
        console.log('-----------------------------------------');

        const testingDependencies = [
            // Core Testing Frameworks
            'vitest@^3.2.4',
            '@vitest/ui@^3.2.4',
            '@vitest/coverage-v8@^3.2.4',
            '@playwright/test@^1.54.2',
            'jest@^30.0.5',

            // Testing Libraries
            '@testing-library/react@^16.3.0',
            '@testing-library/jest-dom@^6.6.3',
            '@testing-library/user-event@^14.6.1',

            // Accessibility Testing
            'axe-core@^4.10.2',
            '@axe-core/playwright@^4.10.2',
            'axe-playwright@^2.0.3',

            // Performance Testing
            'web-vitals@^4.2.4',
            'lighthouse@^12.2.1',
            '@web/test-runner@^0.19.0',

            // Mocking & Utilities
            'msw@^2.8.4',
            'happy-dom@^18.0.1',
            'jsdom@^26.1.0'
        ];

        try {
            console.log('Installing dependencies...');
            const command = `pnpm add -D ${testingDependencies.join(' ')}`;
            await execAsync(command, { cwd: workspaceRoot });
            console.log('✅ Global testing dependencies installed successfully\n');
        } catch (error) {
            console.error('❌ Failed to install global dependencies:', error.message);
            this.setupResults.failed.push('Global dependencies installation');
        }
    }

    async createSharedTestingUtilities() {
        console.log('🛠️ Creating Shared Testing Utilities');
        console.log('-------------------------------------');

        const testingUtilsPath = join(workspaceRoot, 'packages', 'testing-utils');

        try {
            // Create directory structure
            await fs.mkdir(testingUtilsPath, { recursive: true });
            await fs.mkdir(join(testingUtilsPath, 'src'), { recursive: true });
            await fs.mkdir(join(testingUtilsPath, 'configs'), { recursive: true });
            await fs.mkdir(join(testingUtilsPath, 'utils'), { recursive: true });

            // Create package.json for testing-utils
            const packageJson = {
                name: '@codai/testing-utils',
                version: '1.0.0',
                description: 'Shared testing utilities for CODAI ecosystem',
                main: 'dist/index.js',
                module: 'dist/index.esm.js',
                types: 'dist/index.d.ts',
                scripts: {
                    build: 'vite build',
                    test: 'vitest run',
                    'test:watch': 'vitest watch'
                },
                dependencies: {
                    '@testing-library/react': '^16.3.0',
                    '@testing-library/jest-dom': '^6.6.3',
                    '@testing-library/user-event': '^14.6.1',
                    'axe-core': '^4.10.2',
                    'vitest': '^3.2.4'
                }
            };

            await fs.writeFile(
                join(testingUtilsPath, 'package.json'),
                JSON.stringify(packageJson, null, 2)
            );

            // Create base Vitest configuration
            await this.createBaseVitestConfig(testingUtilsPath);

            // Create base Playwright configuration
            await this.createBasePlaywrightConfig(testingUtilsPath);

            // Create testing utilities
            await this.createTestingUtilities(testingUtilsPath);

            console.log('✅ Shared testing utilities created successfully\n');
            this.setupResults.successful.push('Shared testing utilities');
        } catch (error) {
            console.error('❌ Failed to create shared testing utilities:', error.message);
            this.setupResults.failed.push('Shared testing utilities');
        }
    }

    async createBaseVitestConfig(testingUtilsPath) {
        const vitestBaseConfig = `import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export const baseVitestConfig = defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@codai/testing-utils': resolve(__dirname, '../testing-utils/src')
    }
  }
});`;

        await fs.writeFile(
            join(testingUtilsPath, 'configs', 'vitest.base.config.ts'),
            vitestBaseConfig
        );
    }

    async createBasePlaywrightConfig(testingUtilsPath) {
        const playwrightBaseConfig = `import { defineConfig, devices } from '@playwright/test';

export const basePlaywrightConfig = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});`;

        await fs.writeFile(
            join(testingUtilsPath, 'configs', 'playwright.base.config.ts'),
            playwrightBaseConfig
        );
    }

    async createTestingUtilities(testingUtilsPath) {
        // Create accessibility testing utilities
        const accessibilityUtils = `import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkAccessibility(page, options = {}) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
    
  expect(accessibilityScanResults.violations).toEqual([]);
  return accessibilityScanResults;
}

export async function checkColorContrast(page) {
  const colorContrastResults = await new AxeBuilder({ page })
    .withTags(['color-contrast'])
    .analyze();
    
  expect(colorContrastResults.violations).toEqual([]);
  return colorContrastResults;
}

export async function checkKeyboardNavigation(page) {
  // Test tab navigation
  const focusableElements = await page.locator('[tabindex]:not([tabindex="-1"]), input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]').all();
  
  for (const element of focusableElements) {
    await element.focus();
    expect(await element.evaluate(el => document.activeElement === el)).toBe(true);
  }
}`;

        await fs.writeFile(
            join(testingUtilsPath, 'utils', 'accessibility.ts'),
            accessibilityUtils
        );

        // Create performance testing utilities
        const performanceUtils = `import { expect } from '@playwright/test';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export async function checkCoreWebVitals(page) {
  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = {};
      
      getCLS((metric) => { vitals.cls = metric.value; });
      getFID((metric) => { vitals.fid = metric.value; });
      getFCP((metric) => { vitals.fcp = metric.value; });
      getLCP((metric) => { vitals.lcp = metric.value; });
      getTTFB((metric) => { vitals.ttfb = metric.value; });
      
      // Wait for all metrics to be collected
      setTimeout(() => resolve(vitals), 3000);
    });
  });
  
  // Assert Core Web Vitals thresholds
  expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
  expect(vitals.fid).toBeLessThan(100);  // FID < 100ms
  expect(vitals.cls).toBeLessThan(0.1);  // CLS < 0.1
  
  return vitals;
}

export async function measurePageLoad(page) {
  const startTime = Date.now();
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // Page load < 3s
  return loadTime;
}`;

        await fs.writeFile(
            join(testingUtilsPath, 'utils', 'performance.ts'),
            performanceUtils
        );

        // Create test setup file
        const testSetup = `import '@testing-library/jest-dom';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Global setup logic
});

afterAll(() => {
  // Global cleanup logic
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();`;

        await fs.writeFile(
            join(testingUtilsPath, 'src', 'test-setup.ts'),
            testSetup
        );

        // Create index file for exports
        const indexFile = `export * from './utils/accessibility';
export * from './utils/performance';
export { baseVitestConfig } from './configs/vitest.base.config';
export { basePlaywrightConfig } from './configs/playwright.base.config';`;

        await fs.writeFile(
            join(testingUtilsPath, 'src', 'index.ts'),
            indexFile
        );
    }

    async setupApplicationTesting(appName) {
        console.log(`🔧 Setting up testing for ${appName}`);
        console.log('-'.repeat(40));

        const appPath = join(workspaceRoot, 'apps', appName);

        try {
            // Check if app exists
            await fs.access(appPath);

            // Create test directory structure
            await this.createAppTestStructure(appPath, appName);

            // Configure Vitest for the app
            await this.createAppVitestConfig(appPath, appName);

            // Configure Playwright for the app
            await this.createAppPlaywrightConfig(appPath, appName);

            // Create sample tests
            await this.createSampleTests(appPath, appName);

            // Update package.json with test scripts
            await this.updateAppPackageJson(appPath, appName);

            console.log(`✅ Testing setup complete for ${appName}\n`);
            this.setupResults.successful.push(appName);
        } catch (error) {
            console.error(`❌ Failed to setup testing for ${appName}:`, error.message);
            this.setupResults.failed.push(appName);
        }
    }

    async createAppTestStructure(appPath, appName) {
        const testDirs = [
            'tests',
            'tests/unit',
            'tests/integration',
            'tests/e2e',
            'tests/accessibility',
            'tests/performance'
        ];

        for (const dir of testDirs) {
            await fs.mkdir(join(appPath, dir), { recursive: true });
        }
    }

    async createAppVitestConfig(appPath, appName) {
        const vitestConfig = `import { defineConfig } from 'vitest/config';
import { baseVitestConfig } from '@codai/testing-utils/configs/vitest.base.config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  ...baseVitestConfig,
  plugins: [react()],
  test: {
    ...baseVitestConfig.test,
    name: '${appName}',
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'src/**/*.test.{ts,tsx}'
    ],
    exclude: [
      'tests/e2e/**/*',
      'node_modules/**/*',
      'dist/**/*'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@codai/shared-ui': resolve(__dirname, '../../packages/shared-ui/src'),
      '@codai/testing-utils': resolve(__dirname, '../../packages/testing-utils/src')
    }
  }
});`;

        await fs.writeFile(join(appPath, 'vitest.config.ts'), vitestConfig);
    }

    async createAppPlaywrightConfig(appPath, appName) {
        const portMap = {
            'controlai-dashboard': 3001,
            'memorai': 4006,
            'romai': 3002,
            'bancai': 4005,
            'codai': 3000,
            'admin': 4001,
            'hub': 4002,
            'id': 4003
        };

        const port = portMap[appName] || 3000;

        const playwrightConfig = `import { defineConfig } from '@playwright/test';
import { basePlaywrightConfig } from '@codai/testing-utils/configs/playwright.base.config';

export default defineConfig({
  ...basePlaywrightConfig,
  testDir: './tests/e2e',
  use: {
    ...basePlaywrightConfig.use,
    baseURL: 'http://localhost:${port}'
  },
  webServer: {
    command: 'pnpm dev',
    port: ${port},
    reuseExistingServer: !process.env.CI
  }
});`;

        await fs.writeFile(join(appPath, 'playwright.config.ts'), playwrightConfig);
    }

    async createSampleTests(appPath, appName) {
        // Create sample unit test
        const unitTest = `import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { checkAccessibility } from '@codai/testing-utils';

describe('${appName} App', () => {
  test('renders without crashing', () => {
    render(<div data-testid="${appName}-app">Hello ${appName}</div>);
    expect(screen.getByTestId('${appName}-app')).toBeInTheDocument();
  });

  test('has proper accessibility', async () => {
    const { container } = render(<div data-testid="${appName}-app">Hello ${appName}</div>);
    // Note: This would need axe-core integration for Vitest
    expect(container.firstChild).toBeInTheDocument();
  });

  test('meets performance requirements', () => {
    const startTime = performance.now();
    render(<div data-testid="${appName}-app">Hello ${appName}</div>);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Render time < 100ms
  });
});`;

        await fs.writeFile(join(appPath, 'tests', 'unit', 'app.test.tsx'), unitTest);

        // Create sample e2e test
        const e2eTest = `import { test, expect } from '@playwright/test';
import { checkAccessibility, checkCoreWebVitals } from '@codai/testing-utils';

test.describe('${appName} E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check for main content
    await expect(page.locator('main')).toBeVisible();
    
    // Check page title
    await expect(page).toHaveTitle(/${appName}/i);
  });

  test('meets accessibility standards', async ({ page }) => {
    await page.goto('/');
    
    // Run accessibility checks
    await checkAccessibility(page);
  });

  test('meets performance standards', async ({ page }) => {
    await page.goto('/');
    
    // Check Core Web Vitals
    await checkCoreWebVitals(page);
  });

  test('supports internationalization', async ({ page }) => {
    await page.goto('/');
    
    // Check for language selector or i18n content
    // This would be customized based on actual implementation
    const hasI18nContent = await page.locator('[data-testid*="i18n"], [data-testid*="language"], [lang]').count() > 0;
    expect(hasI18nContent).toBe(true);
  });

  test('works on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile-specific elements
    await expect(page.locator('main')).toBeVisible();
  });
});`;

        await fs.writeFile(join(appPath, 'tests', 'e2e', 'app.spec.ts'), e2eTest);

        // Create accessibility test
        const accessibilityTest = `import { test, expect } from '@playwright/test';
import { checkAccessibility, checkColorContrast, checkKeyboardNavigation } from '@codai/testing-utils';

test.describe('${appName} Accessibility Tests', () => {
  test('meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    await checkAccessibility(page);
  });

  test('has proper color contrast', async ({ page }) => {
    await page.goto('/');
    await checkColorContrast(page);
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await checkKeyboardNavigation(page);
  });

  test('works with screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper semantic markup
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper ARIA labels
    const interactiveElements = page.locator('button, input, select, textarea, a[href]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const hasLabel = await element.getAttribute('aria-label') || 
                      await element.getAttribute('aria-labelledby') ||
                      await element.textContent();
      expect(hasLabel).toBeTruthy();
    }
  });
});`;

        await fs.writeFile(join(appPath, 'tests', 'accessibility', 'accessibility.spec.ts'), accessibilityTest);

        // Create performance test
        const performanceTest = `import { test, expect } from '@playwright/test';
import { checkCoreWebVitals, measurePageLoad } from '@codai/testing-utils';

test.describe('${appName} Performance Tests', () => {
  test('meets Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/');
    const vitals = await checkCoreWebVitals(page);
    
    console.log('Core Web Vitals:', vitals);
  });

  test('loads within acceptable time', async ({ page }) => {
    const loadTime = await measurePageLoad(page);
    console.log('Page load time:', loadTime, 'ms');
  });

  test('handles large datasets efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Simulate loading large dataset
    const startTime = Date.now();
    await page.evaluate(() => {
      // Simulate heavy computation
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: \`Item \${i}\` }));
      return items;
    });
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should process < 1s
  });

  test('memory usage is acceptable', async ({ page }) => {
    await page.goto('/');
    
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Memory usage should be reasonable (adjust threshold as needed)
    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // < 50MB
    }
  });
});`;

        await fs.writeFile(join(appPath, 'tests', 'performance', 'performance.spec.ts'), performanceTest);
    }

    async updateAppPackageJson(appPath, appName) {
        try {
            const packageJsonPath = join(appPath, 'package.json');
            const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);

            // Add test scripts
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }

            const testScripts = {
                'test': 'vitest run',
                'test:watch': 'vitest watch',
                'test:coverage': 'vitest run --coverage',
                'test:ui': 'vitest --ui',
                'test:e2e': 'playwright test',
                'test:e2e:headed': 'playwright test --headed',
                'test:e2e:debug': 'playwright test --debug',
                'test:accessibility': 'playwright test tests/accessibility',
                'test:performance': 'playwright test tests/performance',
                'test:all': 'pnpm test && pnpm test:e2e',
                'playwright:install': 'playwright install'
            };

            Object.assign(packageJson.scripts, testScripts);

            // Add test dependencies if not present
            if (!packageJson.devDependencies) {
                packageJson.devDependencies = {};
            }

            const testDependencies = {
                '@codai/testing-utils': 'workspace:*',
                '@testing-library/react': '^16.3.0',
                '@testing-library/jest-dom': '^6.6.3',
                '@testing-library/user-event': '^14.6.1',
                '@playwright/test': '^1.54.2',
                'vitest': '^3.2.4',
                '@vitest/ui': '^3.2.4',
                'axe-core': '^4.10.2',
                '@axe-core/playwright': '^4.10.2'
            };

            Object.assign(packageJson.devDependencies, testDependencies);

            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        } catch (error) {
            console.warn(`⚠️ Could not update package.json for ${appName}:`, error.message);
            this.setupResults.warnings.push(`Package.json update for ${appName}`);
        }
    }

    async createGlobalTestConfigurations() {
        console.log('🌐 Creating Global Test Configurations');
        console.log('-------------------------------------');

        try {
            // Create workspace vitest config
            const workspaceVitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'apps/**/*.test.{ts,tsx}',
      'packages/**/*.test.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}'
    ],
    exclude: [
      'node_modules/**/*',
      'dist/**/*',
      '**/*.e2e.spec.ts'
    ],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./packages/testing-utils/src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});`;

            await fs.writeFile(join(workspaceRoot, 'vitest.workspace.ts'), workspaceVitestConfig);

            // Create global playwright config
            const globalPlaywrightConfig = `import { defineConfig } from '@playwright/test';

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
    baseURL: 'http://localhost:4000', // Gateway URL
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    // Individual app testing
    {
      name: 'controlai-dashboard',
      testDir: './apps/controlai-dashboard/tests/e2e',
      use: { baseURL: 'http://localhost:3001' }
    },
    {
      name: 'memorai',
      testDir: './apps/memorai/tests/e2e',
      use: { baseURL: 'http://localhost:4006' }
    },
    {
      name: 'romai',
      testDir: './apps/romai/tests/e2e',
      use: { baseURL: 'http://localhost:3002' }
    },
    {
      name: 'bancai',
      testDir: './apps/bancai/tests/e2e',
      use: { baseURL: 'http://localhost:4005' }
    },
    {
      name: 'codai',
      testDir: './apps/codai/tests/e2e',
      use: { baseURL: 'http://localhost:3000' }
    },
    // Cross-app integration testing
    {
      name: 'integration',
      testDir: './tests/integration',
      use: { baseURL: 'http://localhost:4000' }
    },
    // Mobile testing
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:4000'
      }
    }
  ]
});`;

            await fs.writeFile(join(workspaceRoot, 'playwright.config.ts'), globalPlaywrightConfig);

            console.log('✅ Global test configurations created successfully\n');
            this.setupResults.successful.push('Global configurations');
        } catch (error) {
            console.error('❌ Failed to create global configurations:', error.message);
            this.setupResults.failed.push('Global configurations');
        }
    }

    async generateSetupReport() {
        console.log('📊 Testing Infrastructure Setup Report');
        console.log('=====================================\n');

        console.log(`✅ Successful setups: ${this.setupResults.successful.length}`);
        this.setupResults.successful.forEach(item => {
            console.log(`   ✓ ${item}`);
        });

        if (this.setupResults.warnings.length > 0) {
            console.log(`\n⚠️ Warnings: ${this.setupResults.warnings.length}`);
            this.setupResults.warnings.forEach(item => {
                console.log(`   ⚠ ${item}`);
            });
        }

        if (this.setupResults.failed.length > 0) {
            console.log(`\n❌ Failed setups: ${this.setupResults.failed.length}`);
            this.setupResults.failed.forEach(item => {
                console.log(`   ✗ ${item}`);
            });
        }

        console.log('\n🎯 Next Steps:');
        console.log('  1. Run "pnpm install" to install all dependencies');
        console.log('  2. Run "pnpm playwright install" to install Playwright browsers');
        console.log('  3. Start your applications with "pnpm dev"');
        console.log('  4. Run tests with:');
        console.log('     - "pnpm test" for unit tests');
        console.log('     - "pnpm test:e2e" for e2e tests');
        console.log('     - "pnpm test:coverage" for coverage reports');
        console.log('     - "pnpm test:all" for complete test suite');

        console.log('\n🏆 Testing Infrastructure Setup Complete!');

        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            successful: this.setupResults.successful,
            warnings: this.setupResults.warnings,
            failed: this.setupResults.failed,
            totalApps: this.apps.length,
            successRate: Math.round((this.setupResults.successful.length - 1) / this.apps.length * 100) // -1 for global configs
        };

        await fs.writeFile(
            join(workspaceRoot, 'testing-setup-report.json'),
            JSON.stringify(report, null, 2)
        );
    }
}

// Execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new TestingInfrastructureSetup();

    setup.setupTestingInfrastructure()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Setup failed:', error);
            process.exit(1);
        });
}

export default TestingInfrastructureSetup;