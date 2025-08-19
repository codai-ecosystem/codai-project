import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'bancai-tests',
    environment: 'jsdom',  // Changed to jsdom for React testing
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    include: [
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'packages/**/node_modules/**',
      '**/node_modules/**',
      'dist/**',
      '.next/**',
      'packages/**/*.test.*',
      'packages/**/*.spec.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      crypto: 'crypto-browserify' // Fix crypto import for browser environment
    },
  },
});