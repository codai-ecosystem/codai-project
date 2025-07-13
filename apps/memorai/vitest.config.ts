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
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}']
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        minThreads: 1,
        maxThreads: 1
      }
    },
    deps: {
      inline: ['framer-motion', 'zustand', 'react', 'react-dom']
    },
    env: {
      NODE_ENV: 'test',
      MEMORY_API_KEY: 'test-api-key-12345678901234567890',
      MEMORY_EMBEDDING_API_KEY: 'test-embedding-api-key-12345678901234567890',
      MEMORY_OPENAI_API_KEY: 'test-openai-api-key-12345678901234567890',
      MEMORY_DATABASE_HOST: 'localhost',
      MEMORY_DATABASE_PORT: '6379',
      MEMORY_EMBEDDING_MODEL: 'text-embedding-ada-002',
      MEMORY_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/packages': path.resolve(__dirname, './packages'),
      '@/apps': path.resolve(__dirname, './apps'),
      '@/core': path.resolve(__dirname, './packages/core/src'),
      '@/sdk': path.resolve(__dirname, './packages/sdk/src')
    }
  },
  define: {
    global: 'globalThis'
  }
})
