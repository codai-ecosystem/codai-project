import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/__tests__/**',
      ],
      include: [
        'src/**/*.{js,ts}',
      ],
    },
    include: [
      'src/**/__tests__/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
    ],
    globals: true,
    testTimeout: 10000,
    reporters: ['verbose'],
  },
});