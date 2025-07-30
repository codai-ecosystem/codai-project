import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Unit tests configuration
  {
    test: {
      name: 'unit-tests',
      include: ['tests/unit/**/*.test.{ts,tsx}'],
      environment: 'node',
      globals: true,
      setupFiles: ['./jest.setup.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'coverage/**',
          'dist/**',
          '**/node_modules/**',
          '**/build/**',
          '**/*.d.ts',
          '**/*.config.*'
        ]
      }
    }
  },
  
  // Integration Tests
  {
    test: {
      name: 'integration-tests',
      include: ['tests/integration/**/*.test.{ts,tsx}'],
      environment: 'node',
      globals: true,
      setupFiles: ['./jest.setup.js'],
      testTimeout: 30000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json']
      }
    }
  },
  
  // Main application tests
  {
    test: {
      name: 'app-tests',
      environment: 'jsdom',
      include: ['apps/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts']
    }
  },
  
  // Package tests
  {
    test: {
      name: 'package-tests',
      environment: 'node',
      include: ['packages/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts']
    }
  },
  
  // E2E tests
  {
    test: {
      name: 'e2e-tests',
      environment: 'node',
      include: ['tests/e2e/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts']
    }
  },
  
  // Performance tests
  {
    test: {
      name: 'performance-tests',
      environment: 'node',
      include: ['tests/performance/**/*.test.{ts,tsx}'],
      setupFiles: ['tests/performance/vitest.setup.ts'],
      testTimeout: 60000
    }
  },
  
  // Security tests
  {
    test: {
      name: 'security-tests',
      environment: 'node',
      include: ['tests/security/**/*.test.{ts,tsx}'],
      setupFiles: ['tests/security/vitest.setup.ts'],
      testTimeout: 60000
    }
  },
  
  // Automation & CI/CD tests
  {
    test: {
      name: 'automation-tests',
      environment: 'node',
      include: ['tests/automation/**/*.test.{ts,tsx}'],
      setupFiles: ['tests/automation/vitest.setup.ts'],
      testTimeout: 120000
    }
  }
])