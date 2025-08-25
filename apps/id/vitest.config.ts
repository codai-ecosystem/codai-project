/**
 * Self-Contained Vitest Configuration for ID App
 * Following proven pattern from successful Hub, Admin, ControlAI Dashboard testing
 * Avoids external dependencies that cause "Cannot find module" errors
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        name: 'app-id',
        environment: 'jsdom',
        globals: true,

        // Self-contained setup - no external files
        setupFiles: [],

        // Comprehensive test patterns
        include: [
            'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            'node_modules',
            'dist',
            '.next',
            'coverage',
            'e2e/**',
            '**/*.e2e.{test,spec}.{js,ts}'
        ],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'dist/',
                '.next/',
                'coverage/',
                '**/*.config.*',
                '**/*.setup.*',
                'public/',
                'middleware.*',
                '**/*.d.ts'
            ],
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 70,
                    statements: 70
                }
            }
        },

        // Performance optimizations
        maxWorkers: 4,
        minWorkers: 1,
        pool: 'forks',
        isolate: true,
        retry: 2,
        testTimeout: 10000,
        hookTimeout: 10000
    },

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
