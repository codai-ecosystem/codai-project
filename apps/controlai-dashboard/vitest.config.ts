/**
 * Vitest Configuration for ControlAI Dashboard
 * Modern testing setup with React support, accessibility testing, and comprehensive coverage
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],

    test: {
        name: 'controlai-dashboard',
        globals: true,
        environment: 'jsdom',
        // setupFiles: ['./tests/setup.ts'], // Commented out for reliability - using direct imports in test files

        include: [
            'components/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'lib/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],

        exclude: [
            'node_modules/**/*',
            'dist/**/*',
            '.next/**/*',
            'coverage/**/*',
            'tests/e2e/**/*',
            'tests/accessibility/**/*',
            'tests/performance/**/*'
        ],

        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'dist/',
                '.next/',
                'public/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/coverage/**',
                '**/*.test.*',
                '**/*.spec.*',
                'middleware.*',
                'tailwind.config.*',
                'next.config.*'
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

        testTimeout: 10000,
        hookTimeout: 10000
    },

    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            '@/components': resolve(__dirname, './components'),
            '@/lib': resolve(__dirname, './lib'),
            '@/app': resolve(__dirname, './app'),
            '@/tests': resolve(__dirname, './tests')
        }
    }
});
