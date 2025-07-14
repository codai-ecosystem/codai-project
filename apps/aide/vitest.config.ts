/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    watch: false, // Prevent watch mode by default
    globals: true,
    environment: 'node', // Use node environment for Azure OpenAI tests
    setupFiles: ['./test-setup.ts'],
    css: false,
    include: ['**/__tests__/**/*.test.ts'], // Only include TypeScript tests
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/*.test.tsx', // Exclude React component tests for now
      '**/*.spec.*',
      '**/e2e/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
      all: true,
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}']
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib')
    }
  }
})
