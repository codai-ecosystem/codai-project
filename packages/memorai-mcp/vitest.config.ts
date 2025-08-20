import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/tools/**/*.{test,spec}.{ts,js}', 'src/integration/**/*.{test,spec}.{ts,js}', 'src/test/**/*.{test,spec}.{ts,js}', 'tests/**/*.{test,spec}.{ts,js}'],
    exclude: [
      'node_modules/',
      'dist/',
      'src/e2e/',
      '**/*.d.ts',
      '**/*.config.*',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        'src/e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'src/legacy-server.ts', // Exclude legacy files
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80],
        lines: [50, 80]
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});