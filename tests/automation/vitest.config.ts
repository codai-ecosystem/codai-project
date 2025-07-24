import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'automation-tests',
    environment: 'node',
    testTimeout: 120000, // 2 minutes for CI/CD simulation
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vitest.setup.ts'
      ]
    }
  }
});
