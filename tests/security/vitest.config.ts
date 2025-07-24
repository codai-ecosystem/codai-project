import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'security-tests',
    environment: 'node',
    testTimeout: 60000, // 60 seconds for security scans
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
