import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Unit tests for each application
  'apps/*/vitest.config.{js,ts,mjs,mts}',
  'packages/*/vitest.config.{js,ts,mjs,mts}',
  'libs/*/vitest.config.{js,ts,mjs,mts}',

  // Global workspace configuration
  {
    test: {
      name: 'codai-ecosystem-tests',
      root: './tests',
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        exclude: [
          'coverage/**',
          'dist/**',
          '**/node_modules/**',
          '**/test-results/**',
          '**/*.d.ts',
          '**/*.config.*',
          '**/playwright.config.*',
          '**/build/**',
          '**/.next/**'
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      },
      testTimeout: 60000,
      hookTimeout: 60000
    }
  },

  // Integration tests
  {
    test: {
      name: 'integration-tests',
      root: './tests/integration',
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      testTimeout: 120000,
      hookTimeout: 120000,
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true // For database tests
        }
      }
    }
  },

  // API tests
  {
    test: {
      name: 'api-tests',
      root: './tests/api-sdk-cli',
      environment: 'node',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      testTimeout: 120000,
      hookTimeout: 120000
    }
  }
])