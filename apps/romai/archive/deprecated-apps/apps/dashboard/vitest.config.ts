import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        watch: false,
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
            }
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                '.next/',
                'coverage/',
                '**/*.d.ts',
                '**/*.config.*',
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },
        env: {
            NEXT_PUBLIC_ROMAI_API_URL: 'http://localhost:3001',
            NEXT_PUBLIC_ROMAI_WS_URL: 'ws://localhost:3001',
            ROMAI_API_KEY: 'test-api-key',
            OPENAI_API_KEY: 'test-openai-key',
            NODE_ENV: 'test',
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/pages': resolve(__dirname, './src/pages'),
            '@/styles': resolve(__dirname, './src/styles'),
        },
    },
});
