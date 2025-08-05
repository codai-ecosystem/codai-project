import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            thresholds: {
                global: {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90
                }
            },
            exclude: [
                'node_modules/',
                'tests/',
                '.next/',
                'coverage/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/middleware.*'
            ]
        },
        alias: {
            '@': resolve(__dirname, './src'),
            '@/tests': resolve(__dirname, './tests'),
            '@/components': resolve(__dirname, './src/components'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/pages': resolve(__dirname, './src/pages'),
            '@/app': resolve(__dirname, './src/app')
        },
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 5000,
        globals: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/tests': resolve(__dirname, './tests'),
            'next-auth/react': resolve(__dirname, './__mocks__/next-auth/react.ts')
        }
    }
})
