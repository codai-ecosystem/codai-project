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
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_OPENAI_API_KEY: 'test-key-mock',
      OPENAI_API_KEY: 'test-key-mock',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key-mock',
      NEXT_PUBLIC_PINECONE_API_KEY: 'test-pinecone-key',
      NEXT_PUBLIC_PINECONE_ENVIRONMENT: 'test-environment',
      PINECONE_API_KEY: 'test-pinecone-key',
      PINECONE_ENVIRONMENT: 'test-environment',
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
      '@': path.resolve(__dirname, './')
    }
  }
})
