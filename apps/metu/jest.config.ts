const config = {
    displayName: 'METU Voice AI Tests',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    globals: {
        'ts-jest': {
            useESM: true,
            isolatedModules: true,
        },
    },
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/types/(.*)$': '<rootDir>/src/types/$1',
        '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
        '<rootDir>/src/**/*.test.(ts|tsx|js|jsx)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '\\.spec\\.(ts|tsx|js|jsx)$', // Exclude Playwright spec files
    ],
    collectCoverageFrom: [
        'src/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
        '!src/tests/**/*',
        '!src/**/*.stories.*',
        '!src/main/**/*', // Exclude Electron main process
        '!src/preload/**/*', // Exclude Electron preload
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    testTimeout: 10000,
    transformIgnorePatterns: [
        'node_modules/(?!(canvas)/)'
    ],
};

export default config;
