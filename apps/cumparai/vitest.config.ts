/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    watch: false, // Prevent watch mode by default
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.minimal.ts'], // Use minimal setup without testing-library imports
    css: true,
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
      '@': path.resolve(__dirname, './'),
      // Add aliases for React and JSX runtime to bypass missing files
      'react': path.resolve(__dirname, './vitest.react-mock.js'),
      'react-dom': path.resolve(__dirname, './vitest.react-dom-mock.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './vitest.jsx-runtime-mock.js'),
      'react/jsx-runtime': path.resolve(__dirname, './vitest.jsx-runtime-mock.js'),
    },
  }
})
