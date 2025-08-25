/**
 * Vitest Configuration for RomAI - 2025 Modern Testing Setup
 * Follows the established MemorAI pattern for consistency across CODAI ecosystem
 * Optimized for AGI component testing with React Testing Library and user-behavior focus
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    name: 'romai-agi-tests',
    globals: true, // Enable globals for expect, vi, etc.
    environment: 'jsdom',
    setupFiles: [
      './tests/setup.ts', // RomAI-specific setup only
    ],

    // Coverage configuration - workspace-consistent location
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: '../../coverage/romai',
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'public/',
        'middleware.*',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/tests/**',
        '**/__tests__/**'
      ],
      // AGI testing requires high coverage due to critical AI functionality
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.next/',
      'e2e/**',
      '**/*.e2e.{test,spec}.{js,ts}'
    ],

    // AGI tests may need longer timeouts for complex model operations
    testTimeout: 15000,
    hookTimeout: 10000,

    // Optimized for CI/CD performance
    maxConcurrency: 4,
    maxWorkers: 4,
    minWorkers: 1,

    // Enhanced reporting for AGI component testing
    reporter: process.env.CI ? ['junit', 'github-actions'] : ['verbose'],
    outputFile: process.env.CI ? {
      junit: '../../test-results/romai/junit.xml'
    } : undefined,

    // Improved error handling for complex AGI interactions
    retry: process.env.CI ? 2 : 0,
    bail: process.env.CI ? 5 : 0,
  },

  // Path resolution for RomAI components
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/tests': resolve(__dirname, './tests'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/app': resolve(__dirname, './src/app'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
    }
  }
})
