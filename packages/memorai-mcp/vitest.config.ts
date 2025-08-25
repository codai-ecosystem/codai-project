import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Clean test organization with proper naming + comprehensive test suites
    include: [
      'src/__tests__/enhanced-memory-store.test.ts',
      'src/__tests__/mcp-server.core.test.ts',
      'src/__tests__/mcp-server.unit.test.ts',
      'src/__tests__/mcp-server.integration.test.ts',
      'src/__tests__/mcp-server.coverage.test.ts',
      'src/__tests__/mcp-server.final-coverage.test.ts',
      'src/__tests__/mcp-server.startup.integration.test.ts',
      'src/__tests__/ai-integration.test.ts',
      'src/__tests__/memory-tools.test.ts',
      // Comprehensive test suites for 100% coverage
      'src/__tests__/security.comprehensive.test.ts',
      'src/__tests__/romai-agi-integration.comprehensive.test.ts',
      'src/__tests__/error-handling.comprehensive.test.ts',
      'src/__tests__/microsoft-mcp-compliance.test.ts'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'archive/**',
      'memorai-mcp-backup/**',
      'memorai-backups/**',
      'phase8/**',
      'tests/**', // Exclude old tests directory
      'src/test/**', // Exclude old test directory
      'src/e2e/',
      'src/integration/',
      '**/*.d.ts',
      '**/*.config.*',
      // Exclude ALL problematic test files and legacy servers
      'src/advanced-mcp-server.ts', // Legacy server
      'src/server.ts', // Legacy server
      'src/modern-server.ts', // Legacy server
      'src/advanced-server.ts', // Legacy server
      'src/advanced-ai-integration.ts', // Legacy AI integration
      'src/test/production-integration.test.ts', // Exclude due to Python issues
      'src/test/test-config.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/test/', // Exclude old test directory
        'src/e2e/',
        'src/integration/',
        'archive/**',
        'memorai-mcp-backup/**',
        'memorai-backups/**',
        'phase8/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        // Exclude legacy server files
        'src/advanced-mcp-server.ts',
        'src/server.ts',
        'src/modern-server.ts',
        'src/advanced-server.ts',
        'src/advanced-ai-integration.ts',
        '*.cjs', // Exclude all CommonJS files
        '*.js', // Exclude JS files (we want TypeScript coverage)
        'src/legacy-server.ts'
      ],
      include: [
        'src/mcp-server.ts',
        'src/ai-integration.ts'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80],
        lines: [50, 80]
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});