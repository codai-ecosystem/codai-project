import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'codai-tests',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    testTimeout: 15000, // Increased timeout for interactive tests
    hookTimeout: 10000,
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'tests/',
        'coverage/',
        '.next/',
        'dist/',
        '*.config.*',
        '*.d.ts',
      ],
      include: ['app/**', 'components/**', 'lib/**', 'utils/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/utils': path.resolve(__dirname, 'utils'),
      '@/app': path.resolve(__dirname, 'app'),
    },
  },
})