import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./setup.js'],
        testTimeout: 30000,
        hookTimeout: 45000,
        reporters: ['verbose', 'json'],
        outputFile: './results/test-results.json',
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'results/',
                'setup.js',
                '**/*.test.js'
            ]
        },
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true
            }
        }
    },
    esbuild: {
        target: 'node18'
    }
});
