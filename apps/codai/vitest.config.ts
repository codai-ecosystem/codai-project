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
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      '__tests__/node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      '**/node_modules/**',
      '**/*.d.ts'
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
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/app': path.resolve(__dirname, './src/app'),
    },
  },
})