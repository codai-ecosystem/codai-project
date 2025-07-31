import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'pkg-analytics',
    globals: true,
    environment: 'node', // Use node environment for analytics package
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@codai/realtime': path.resolve(__dirname, '../realtime/src'),
      '@codai/core': path.resolve(__dirname, '../core/src'),
      '@codai/logai-sdk': path.resolve(__dirname, '../logai-sdk/src'),
    },
  },
});