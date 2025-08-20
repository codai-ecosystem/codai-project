/**
 * Comprehensive Testing Configuration for CODAI Ecosystem
 * Supports unit tests, integration tests, and E2E tests across all applications
 */

import { defineConfig } from '@playwright/test'
import { devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/test-results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        // Desktop browsers
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

        // Mobile devices
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] }
        },

        // Tablet devices
        {
            name: 'iPad',
            use: { ...devices['iPad Pro'] }
        }
    ],

    webServer: [
        {
            command: 'pnpm dev',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000
        }
    ]
})

// App-specific test configurations
export const APP_TEST_CONFIGS = {
    memorai: {
        baseURL: 'http://localhost:4006',
        testDir: './apps/memorai/tests',
        features: ['database', 'ai', 'search', 'analytics']
    },
    bancai: {
        baseURL: 'http://localhost:4005',
        testDir: './apps/bancai/tests',
        features: ['banking', 'transactions', 'security', 'compliance']
    },
    romai: {
        baseURL: 'http://localhost:3001',
        testDir: './apps/romai/tests',
        features: ['ai-models', 'romanian-processing', 'consciousness']
    },
    aide: {
        baseURL: 'http://localhost:3002',
        testDir: './apps/aide/tests',
        features: ['development', 'ai-assistance', 'code-generation']
    },
    gateway: {
        baseURL: 'http://localhost:4000',
        testDir: './apps/gateway/tests',
        features: ['routing', 'authentication', 'service-discovery']
    }
}

// Accessibility testing configuration
export const ACCESSIBILITY_CONFIG = {
    standards: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'section508'],
    rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        'semantic-markup': { enabled: true },
        'alt-text': { enabled: true },
        'aria-labels': { enabled: true }
    }
}

// Performance testing thresholds
export const PERFORMANCE_THRESHOLDS = {
    'first-contentful-paint': 1500,
    'largest-contentful-paint': 2500,
    'first-input-delay': 100,
    'cumulative-layout-shift': 0.1,
    'time-to-interactive': 3000,
    'speed-index': 3000
}

// Security testing configuration
export const SECURITY_CONFIG = {
    headers: [
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy'
    ],
    vulnerabilities: [
        'xss',
        'csrf',
        'sql-injection',
        'clickjacking',
        'insecure-transmission'
    ]
}

export { devices }
