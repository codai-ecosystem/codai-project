import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'pkg-cli',
    globals: true,
    environment: 'node', // Change from jsdom to node for CLI package
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
      '@codai/sdk': path.resolve(__dirname, '../sdk/src'),
      '@codai/logai-sdk': path.resolve(__dirname, '../logai-sdk/src'),
      '@codai/core': path.resolve(__dirname, '../core/src'),
    },
  },
});