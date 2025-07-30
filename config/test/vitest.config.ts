import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'tests/e2e/**', // E2E tests run with Playwright
      'tests/performance/**', // Performance tests run with Playwright
      'tests/security/**' // Security tests run with Playwright
    ],
    projects: [
      // Tests configuration
      {
        test: {
          name: 'unit-tests',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node'
        }
      },
      {
        test: {
          name: 'integration-tests', 
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node'
        }
      },
      // Apps
      'apps/*/vitest.config.ts',
      // Packages  
      'packages/*/vitest.config.ts'
    ],
    reporters: [
      ['default', { summary: true }]
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'apps/**',
        'packages/**',
        'services/**'
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'dist/**',
        'build/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@codai': path.resolve(__dirname, './packages'),
      '@apps': path.resolve(__dirname, './apps'),
      '@services': path.resolve(__dirname, './services')
    }
  }
});