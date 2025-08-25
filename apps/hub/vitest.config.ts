/**
 * Vitest Configuration for Hub App
 * SELF-CONTAINED: Using self-contained configuration for reliable testing
 * 
 * This configuration avoids external dependencies that can cause "Cannot find module" errors
 * and provides a complete, self-contained testing setup.
 * 
 * Features:
 * - Standardized test environment (jsdom for React components)
 * - TypeScript support with proper path resolution
 * - Coverage reporting with appropriate thresholds
 * - React testing library globals
 * - Optimized performance settings
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    test: {
        name: 'app-hub',
        environment: 'jsdom',

        // Global test setup
        globals: true,

        // Performance optimizations
        pool: 'forks',
        poolOptions: {
            forks: {
                minForks: 1,
                maxForks: 4
            }
        },

        // Timeout settings
        testTimeout: 10000,
        hookTimeout: 10000,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'coverage/**',
                'dist/**',
                '**/node_modules/**',
                '**/tests/**',
                '**/*.d.ts',
                '**/*.config.*',
                '**/*.{test,spec}.*',
                '.next/',
                'public/',
                'middleware.*'
            ],
            thresholds: {
                global: {
                    branches: 75,
                    functions: 75,
                    lines: 80,
                    statements: 80
                }
            }
        },

        // Test file patterns
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            'node_modules/**',
            'dist/**',
            '.next/**',
            'coverage/**',
            'e2e/**',
            '**/*.e2e.{test,spec}.{js,ts}'
        ]
    },

    // Path resolution
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/tests': resolve(__dirname, './tests'),
            '@/components': resolve(__dirname, './src/components'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/app': resolve(__dirname, './src/app')
        }
    }
})
