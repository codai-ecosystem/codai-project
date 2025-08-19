import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'app-romai',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 60000, // 60 seconds for real integration tests
    hookTimeout: 60000, // 60 seconds for hooks
    teardownTimeout: 10000, // 10 seconds for cleanup
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'archive/**',
      'backup_naming_cleanup/**',
      '.next/**',
      'e2e/**',
      '**/*.e2e.{test,spec}.{js,ts}',
      '**/playwright/**',
      '**/*ultimate-server*.{test,spec}.{js,ts}',
      '**/*ultimateservertest*.{test,spec}.{js,ts}',
      '**/packages/romai-mcp/tests/**/*.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'archive/**',
        'backup_naming_cleanup/**',
        '.next/**',
        'e2e/**',
        'playwright-report/**',
        'test-results/**',
        'dist/**',
        'public/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/test-*',
        '**/mock*',
        '**/__tests__/**'
      ],
      thresholds: {
        global: {
          branches: 70, // Reduced thresholds for real integration tests
          functions: 70,
          lines: 70,
          statements: 70
        }
      },
      all: true,
      clean: true
    },
    // Real integration test configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    // Retry failed tests once (for network-related flakiness)
    retry: 1,
    // Slow test threshold
    slowTestThreshold: 30000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});