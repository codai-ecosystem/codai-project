/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        watch: false, // Prevent watch mode by default
        globals: true,
        environment: 'jsdom',
        include: ['**/*.test.ts', '**/*.test.tsx'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e-tests/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/.next/**',
                '**/e2e-tests/**',
                '**/coverage/**',
                '**/*.config.*',
                '**/*.test.*'
            ],
            include: [
                'src/**/*.ts',
                'src/**/*.tsx',
                'app/**/*.ts',
                'app/**/*.tsx'
            ],
            thresholds: {
                global: {
                    branches: 50,
                    functions: 50,
                    lines: 50,
                    statements: 50
                }
            }
        },
        testTimeout: 30000,
        setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/app': resolve(__dirname, './app'),
            '@/components': resolve(__dirname, './src/components'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/services': resolve(__dirname, './src/services'),
            '@/hooks': resolve(__dirname, './src/hooks'),
            '@/types': resolve(__dirname, './src/types'),
        },
    },
});

