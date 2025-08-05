import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000, // 10 second timeout for individual tests
    hookTimeout: 10000, // 10 second timeout for setup/teardown hooks
    teardownTimeout: 5000, // 5 second timeout for cleanup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 95,
          functions: 98,
          lines: 98,
          statements: 98
        }
      }
    }
  }
})
