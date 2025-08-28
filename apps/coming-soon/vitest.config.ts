/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Switch back to jsdom for better compatibility
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    // Exclude Playwright E2E tests from Vitest
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**', // Exclude all E2E test directories
      '**/*.spec.ts', // Exclude Playwright spec files
      'e2e/**', // Additional E2E exclusion
      '__tests__/e2e/**', // Exclude E2E tests in __tests__
      '**/*.e2e.test.*', // Exclude E2E test files
      'playwright.config.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        'coverage/',
        'public/',
        'src/components/3d/', // Exclude 3D components with canvas dependencies
        '**/__tests__/**',
        '**/types/**',
        '**/*.d.ts',
        '**/e2e/**', // Exclude E2E from coverage
        '__tests__/e2e/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/design-system': path.resolve(__dirname, './src/design-system')
    }
  }
})