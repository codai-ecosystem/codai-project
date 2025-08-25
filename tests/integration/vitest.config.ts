/**
 * 🧪 Integration Tests Configuration
 * 
 * Vitest configuration specifically for API integration testing
 * with real HTTP requests and extended timeouts for network operations.
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        // Test environment configuration
        name: 'CODAI API Integration Tests',
        environment: 'node',

        // Timeout configuration for network requests
        testTimeout: 30000,
        hookTimeout: 15000,

        // Test file patterns
        include: [
            'tests/integration/**/*.test.{js,ts}',
            'tests/integration/**/*.spec.{js,ts}'
        ],

        // Exclude patterns
        exclude: [
            'node_modules',
            'dist',
            '.git',
            '**/*.d.ts'
        ],

        // Global setup and teardown
        globalSetup: './tests/integration/setup.ts',

        // Reporter configuration
        reporter: ['verbose', 'json'],

        // Coverage configuration (optional for integration tests)
        coverage: {
            enabled: false, // Integration tests focus on API behavior, not code coverage
            provider: 'v8'
        },

        // Retry configuration for flaky network tests
        retry: 2,

        // Concurrent test execution
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                maxThreads: 4
            }
        },

        // Environment variables for tests
        env: {
            NODE_ENV: 'test',
            INTEGRATION_TEST: 'true'
        }
    },

    // Resolve configuration
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
            '@codai': path.resolve(__dirname, 'packages')
        }
    },

    // Define configuration for test globals
    define: {
        'import.meta.vitest': 'undefined'
    }
});