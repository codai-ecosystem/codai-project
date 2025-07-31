/**
 * Advanced Jest Configuration for METU Template
 * Optimized for modern React/Next.js testing with comprehensive coverage
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // Test environment and setup
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/enhanced-setup.ts'],

  // Test file patterns with better organization
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],

  // Path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@metu/ui$': '<rootDir>/../../packages/ui/src',
    '^@metu/utils$': '<rootDir>/../../packages/utils/src',
    // Handle CSS/asset imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/**/index.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.config.{ts,js}',
    '!src/lib/firebase.ts', // Firebase config excluded from coverage
  ],

  // Enhanced coverage thresholds
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for critical modules
    './src/components/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/stores/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/lib/': {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },

  // Coverage reporting
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json-summary',
    'cobertura', // For CI/CD integration
  ],

  // Test file ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e-tests/',
    '<rootDir>/coverage/',
    '<rootDir>/storybook-static/',
  ],

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@firebase|firebase|@radix-ui|lucide-react))',
  ],

  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true,
    },
  },

  // Test timeout for async operations
  testTimeout: 3000, // 3 seconds for enhanced tests

  // Error reporting
  errorOnDeprecated: true,
  verbose: true,

  // Test result processors
  testResultsProcessor: '<rootDir>/tests/processors/test-results-processor.js',

  // Watch mode configuration
  watchman: true,
  watchPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/node_modules/',
  ],

  // Performance optimization
  maxWorkers: '50%',
  cacheDirectory: '<rootDir>/.jest-cache',

  // Custom test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};

module.exports = createJestConfig(customJestConfig);
