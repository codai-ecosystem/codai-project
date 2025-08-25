import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'CODAI Performance Tests',
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    testTimeout: 120000, // 2 minutes for load tests
    hookTimeout: 30000,  // 30 seconds for setup/teardown
    maxConcurrency: 1,   // Run performance tests sequentially
    reporter: ['verbose', 'json'],
    outputFile: 'performance-results.json',
    pool: 'forks',
    setupFiles: ['./vitest.setup.ts']
  }
});
