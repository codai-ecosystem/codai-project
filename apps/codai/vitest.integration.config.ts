import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        name: 'codai-integration-tests',
        environment: 'jsdom',
        setupFiles: ['./integration-test-setup.ts'],
        include: ['**/__tests__/integration/**/*.test.{ts,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        globals: true,
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.test.*',
                '**/*.config.*',
                '**/coverage/**'
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
        testTimeout: 30000, // Extended timeout for integration tests
        hookTimeout: 10000,
        teardownTimeout: 10000,
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                maxThreads: 4,
                minThreads: 1
            }
        },
        retry: 2, // Retry failed tests twice
        bail: 0, // Continue running tests even if some fail
        reporters: ['verbose', 'json'],
        outputFile: {
            json: './integration-test-results.json'
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@/components': path.resolve(__dirname, './components'),
            '@/lib': path.resolve(__dirname, './lib'),
            '@/utils': path.resolve(__dirname, './utils')
        }
    },
    define: {
        'process.env.NODE_ENV': '"test"',
        'process.env.TEST_ENV': '"integration"'
    }
})
