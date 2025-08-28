/**
 * Vitest Configuration for CODAI - Real Functional Testing
 * Self-contained configuration that works reliably without problematic dependencies
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    test: {
        name: 'codai-real-tests',
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'], // Enable proper React test setup
        globals: true,

        // Coverage settings for world-class standards
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                '.next/',
                'public/',
                'coverage/',
                '**/*.d.ts',
                '**/*.config.*',
                'middleware.*'
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        },

        // Performance optimizations
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                maxThreads: 4
            }
        },

        // Test patterns
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            'node_modules/',
            '.next/',
            'e2e/**'
        ],

        // Timeouts and retries for stability
        testTimeout: 15000,
        hookTimeout: 10000,
        retry: 2
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
