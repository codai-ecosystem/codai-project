/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./jest.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/test-utils.ts',
        '**/types.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'apps/**/__tests__/**/*.{js,ts,jsx,tsx}',
      'apps/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      '**/node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      'apps/*/node_modules/**',
      'apps/*/*/node_modules/**'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/apps': resolve(__dirname, './apps'),
      '@/tests': resolve(__dirname, './tests')
    }
  }
})