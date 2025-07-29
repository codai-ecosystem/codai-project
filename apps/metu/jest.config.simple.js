/** @type {import('jest').Config} */
const config = {
    displayName: 'METU Voice AI Tests',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
        }],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/src/**/*.test.(ts|tsx|js|jsx)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '\\.spec\\.(ts|tsx|js|jsx)$', // Exclude Playwright spec files
    ],
    collectCoverageFrom: [
        'src/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
        '!src/tests/**/*.spec.*',
        '!src/**/*.stories.*',
    ],
    testTimeout: 10000,
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    preset: 'ts-jest/presets/default-esm',
};

module.exports = config;
