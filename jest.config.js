/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@codai/(.*)$': '<rootDir>/packages/$1/src'
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts,jsx,tsx}',
    '<rootDir>/apps/**/*.test.{js,ts,jsx,tsx}',
    '<rootDir>/services/**/*.test.{js,ts,jsx,tsx}',
    '<rootDir>/packages/**/*.test.{js,ts,jsx,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'apps/**/*.{js,ts,jsx,tsx}',
    'services/**/*.{js,ts,jsx,tsx}',
    'packages/**/*.{js,ts,jsx,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  testTimeout: 30000,
  maxWorkers: '50%',
  verbose: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
    '/build/',
    '/coverage/'
  ]
};
