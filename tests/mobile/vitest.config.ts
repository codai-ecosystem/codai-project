import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        name: 'CODAI Mobile Tests',
        environment: 'node',
        testTimeout: 50000,
        hookTimeout: 10000,
        teardownTimeout: 5000,
        isolate: false,
        sequence: {
            concurrent: false, // Mobile tests should run sequentially
            shuffle: false
        },
        reporters: ['verbose', 'json'],
        outputFile: {
            json: './mobile-results.json'
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'dist/**',
                '**/*.d.ts',
                'coverage/**'
            ]
        },
        globals: true,
        include: [
            '**/*.test.ts',
            '**/*.spec.ts'
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**'
        ]
    },
    esbuild: {
        target: 'node18'
    }
});