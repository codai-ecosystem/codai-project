import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    alias: {
      '@codai/core': path.resolve(__dirname, '../core/src'),
      '@codai/cli': path.resolve(__dirname, '../cli/src'),
      '@codai/logai-sdk': path.resolve(__dirname, '../logai-sdk/src'),
      '@codai/ai': path.resolve(__dirname, '../ai/src'),
      '@codai/analytics': path.resolve(__dirname, '../analytics/src'),
      '@codai/api': path.resolve(__dirname, '../api/src'),
    }
  }
});
