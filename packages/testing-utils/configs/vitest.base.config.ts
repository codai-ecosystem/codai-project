/**
 * CODAI Testing Utils - Base Vitest Configuration
 * 
 * Provides standard testing configuration for all CODAI packages.
 * Packages should extend this configuration with their specific needs.
 * 
 * Usage in package vitest.config.ts:
 * import { baseVitestConfig } from '@codai/testing-utils/configs/vitest.base.config'
 * export default defineConfig({
 *   ...baseVitestConfig,
 *   test: {
 *     ...baseVitestConfig.test,
 *     // package-specific overrides
 *   }
 * })
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

export const baseVitestConfig = defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@codai/shared-ui': path.resolve(__dirname, '../shared-ui/src'),
            '@codai/shared-types': path.resolve(__dirname, '../shared-types/src'),
            '@codai/testing-utils': path.resolve(__dirname, '../testing-utils/src'),
        },
    },
    test: {
        // Test environment
        environment: 'jsdom',
        globals: true,

        // Setup files
        setupFiles: [
            './src/test-setup.ts',
            './src/test-mocks.ts',
        ],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                'build/',
                '**/*.d.ts',
                '**/*.config.{js,ts}',
                '**/*.test.{js,ts,jsx,tsx}',
                '**/*.spec.{js,ts,jsx,tsx}',
                '**/test-*',
                '**/__tests__/**',
                '**/__mocks__/**',
            ],
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 70,
                    statements: 70,
                },
            },
        },

        // Test files patterns
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        ],
        exclude: [
            'node_modules/',
            'dist/',
            '.git/',
            '.next/',
            'coverage/',
        ],

        // Test timeout
        testTimeout: 15000,

        // Reporter configuration
        reporters: ['verbose', 'json', 'html'],

        // Watch mode configuration
        watch: false,

        // Inline snapshots
        snapshotFormat: {
            printBasicPrototype: false,
        },

        // Mock options
        mockReset: true,
        clearMocks: true,
        restoreMocks: true,

        // Type checking
        typecheck: {
            enabled: true,
            include: ['src/**/*.{test,spec}.{ts,tsx}'],
        },

        // Pool options for better performance
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: false,
                minForks: 1,
                maxForks: 4,
            },
        },

        // Retry configuration for flaky tests
        retry: 2,

        // Concurrent tests configuration
        maxConcurrency: 5,

        // Browser configuration (if needed)
        browser: {
            enabled: false,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
        },

        // Workspace support
        workspace: './vitest.workspace.ts',
    },

    // Esbuild options
    esbuild: {
        target: 'node18',
    },

    // Define global variables
    define: {
        __TEST__: true,
        'process.env.NODE_ENV': '"test"',
    },
})

export default baseVitestConfig