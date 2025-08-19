/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      jsxRuntime: 'automatic',
      fastRefresh: false, // Disable for testing
      include: '**/*.{jsx,tsx}',
    })
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    name: 'codai-tests',
    globals: true,
    environment: 'jsdom', // Temporarily switch back to jsdom to debug
    setupFiles: ['__tests__/setup.ts'],
    testTimeout: 15000,
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
  }
})