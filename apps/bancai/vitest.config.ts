/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    watch: false, // Prevent watch mode by default
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_OPENAI_API_KEY: 'test-key-mock',
      OPENAI_API_KEY: 'test-key-mock',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key-mock',
      NEXT_PUBLIC_BANCAI_API_URL: 'https://test-bancai-api.com',
      NEXT_PUBLIC_BANCAI_WS_URL: 'wss://test-bancai-ws.com',
      BANCAI_SECRET_KEY: 'test-secret-key',
      LOGAI_API_KEY: 'test-logai-key',
      LOGAI_API_URL: 'https://test-logai.com',
      MEMORAI_MCP_URL: 'http://localhost:3001',
      MCP_SERVER_URL: 'http://localhost:3001',
      TEST_MODE: 'true'
    },
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
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      },
      all: true,
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}']
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        minThreads: 1,
        maxThreads: 1
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})