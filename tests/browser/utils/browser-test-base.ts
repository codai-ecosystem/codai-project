import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import { APP_URLS, TEST_CONFIG as PORT_CONFIG, waitForServices } from '../config/ports';

// Types for test fixtures
export interface PerformanceFixture {
  measurePageLoad: (page: Page) => Promise<PerformanceMetrics>;
  assertPerformance: (page: Page, thresholds?: PerformanceThresholds) => Promise<void>;
  startMeasurement: () => void;
  getMetrics: () => PerformanceMetrics;
}

export interface AccessibilityFixture {
  checkAccessibility: (page: Page) => Promise<string[]>;
  assertAccessibility: (page: Page) => Promise<void>;
  scanForViolations: () => Promise<AccessibilityViolation[]>;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  domContentLoaded: number;
}

export interface PerformanceThresholds {
  maxLoadTime: number;
  maxFirstContentfulPaint: number;
}

export interface AccessibilityViolation {
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  target: string;
}

// Test data and configuration
export const TEST_CONFIG = {
  baseUrls: {
    codai: 'http://localhost:3000',
    memorai: 'http://localhost:3001',
    logai: 'http://localhost:3002',
    bancai: 'http://localhost:3003',
    wallet: 'http://localhost:3004',
    fabricai: 'http://localhost:3005',
    publicai: 'http://localhost:3006',
    sociai: 'http://localhost:3007',
    studiai: 'http://localhost:3008',
    cumparai: 'http://localhost:3009',
    x: 'http://localhost:3010',
  },
  timeouts: {
    navigation: 30000,
    action: 10000,
    assertion: 5000,
  },
  performance: {
    maxLoadTime: 5000,
    maxFirstContentfulPaint: 3000,
  },
  viewports: {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  },
};

// Extended test fixtures
export const test = base.extend<{
  codaiPage: Page;
  memoraiPage: Page;
  logaiPage: Page;
  multiAppContext: BrowserContext;
  performanceUtils: PerformanceFixture;
  accessibilityUtils: AccessibilityFixture;
  performance: PerformanceFixture;
  accessibility: AccessibilityFixture;
}>({
  codaiPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(TEST_CONFIG.baseUrls.codai);
    await use(page);
    await context.close();
  },

  memoraiPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(TEST_CONFIG.baseUrls.memorai);
    await use(page);
    await context.close();
  },

  logaiPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(TEST_CONFIG.baseUrls.logai);
    await use(page);
    await context.close();
  },

  multiAppContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },

  performanceUtils: async ({ }, use) => {
    await use(new PerformanceUtils());
  },

  accessibilityUtils: async ({ }, use) => {
    await use(new AccessibilityUtils());
  },

  performance: async ({ }, use) => {
    await use(new PerformanceUtils());
  },

  accessibility: async ({ }, use) => {
    await use(new AccessibilityUtils());
  },
});

// Performance measurement utilities
export class PerformanceUtils implements PerformanceFixture {
  private startTime: number = 0;
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    firstContentfulPaint: 0,
    domContentLoaded: 0,
  };

  startMeasurement(): void {
    this.startTime = Date.now();
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  async measurePageLoad(page: Page): Promise<{
    loadTime: number;
    firstContentfulPaint: number;
    domContentLoaded: number;
  }> {
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        firstContentfulPaint: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      };
    });

    this.metrics = navigationTiming;
    return navigationTiming;
  }

  async assertPerformance(page: Page, thresholds = TEST_CONFIG.performance) {
    const metrics = await this.measurePageLoad(page);

    expect(metrics.loadTime, `Page load time should be under ${thresholds.maxLoadTime}ms`)
      .toBeLessThan(thresholds.maxLoadTime);

    expect(metrics.firstContentfulPaint, `First Contentful Paint should be under ${thresholds.maxFirstContentfulPaint}ms`)
      .toBeLessThan(thresholds.maxFirstContentfulPaint);
  }
}

// Accessibility utilities
export class AccessibilityUtils implements AccessibilityFixture {
  async scanForViolations(): Promise<AccessibilityViolation[]> {
    // Mock implementation for accessibility scanning
    // In a real implementation, this would use axe-core or similar tool
    const violations: AccessibilityViolation[] = [];

    // Example violations that could be detected
    // These would be replaced with actual axe-core integration

    return violations;
  }

  async checkAccessibility(page: Page) {
    // Check for basic accessibility attributes
    const accessibilityIssues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push(`Image ${index + 1} missing alt text`);
        }
      });

      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push(`Form input ${index + 1} missing accessible label`);
        }
      });

      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (index === 0 && level !== 1) {
          issues.push('Page should start with h1');
        }
        if (level > previousLevel + 1) {
          issues.push(`Heading level skipped: ${heading.tagName} after h${previousLevel}`);
        }
        previousLevel = level;
      });

      return issues;
    });

    return accessibilityIssues;
  }

  async assertAccessibility(page: Page): Promise<void> {
    const issues = await this.checkAccessibility(page);
    expect(issues, 'Page should not have accessibility issues').toHaveLength(0);
  }
}

// Page Object Base Class
export class PageObjectBase {
  constructor(protected page: Page) { }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }

  async assertNoConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any console errors to appear
    await this.page.waitForTimeout(1000);

    expect(errors, 'Page should not have console errors').toHaveLength(0);
  }
}

export { expect };
