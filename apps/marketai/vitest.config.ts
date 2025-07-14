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
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      OPENAI_API_KEY: 'test-key',
      AZURE_OPENAI_API_KEY: 'test-azure-key',
      AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com',
      AZURE_OPENAI_DEPLOYMENT_NAME: 'test-deployment',
      PINECONE_API_KEY: 'test-pinecone-key',
      PINECONE_ENVIRONMENT: 'test-env',
      PINECONE_INDEX_NAME: 'test-index',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-supabase-key',
      LOGAI_API_KEY: 'test-logai-key',
      LOGAI_ENDPOINT: 'https://test-logai.com'
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
