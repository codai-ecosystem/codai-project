// Strategic Testing Configuration
// This file is maintained for backward compatibility
// Current testing framework: Vitest (configured in vitest.config.ts)

export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.{test,spec}.{js,ts}',
    '**/__tests__/**/*.{test,spec}.{js,ts}',
  ],
  testPathIgnorePatterns: [
    'node_modules',
    'dist',
    'build',
    'packages/',
    'apps/',
    'services/',
    'tests/e2e/',
    'tests/browser/',
    '.spec.ts',
  ],
  collectCoverageFrom: [
    'tests/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  passWithNoTests: true,
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
