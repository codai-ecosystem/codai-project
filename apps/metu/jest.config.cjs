module.exports = {
    displayName: 'METU Voice AI Tests',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        'canvas': '<rootDir>/__mocks__/canvas.js',
    },
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['<rootDir>/src/**/*.test.(ts|tsx|js|jsx)'],
    testPathIgnorePatterns: ['/node_modules/', '\\.spec\\.(ts|tsx|js|jsx)$'],
    testTimeout: 10000,
};
