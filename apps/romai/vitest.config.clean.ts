import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    include: [
      // Include only current, relevant test files
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      // Exclude all archived, old, and backup test files
      '**/archived_tests/**',
      '**/archived/**',
      '**/backup/**',
      '**/legacy/**',
      '**/old/**',
      '**/deprecated/**',
      '**/*.backup.*',
      '**/*.old.*',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/archived_tests/**',
        '**/backup/**',
        '**/legacy/**'
      ]
    },
    timeout: 30000,
    testTimeout: 30000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src')
    }
  }
})
