const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',

    // Module mapping for standard Next.js components
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',

        // Mock Next.js modules
        '^next/image$': '<rootDir>/__mocks__/next-image.js',
        '^next/link$': '<rootDir>/__mocks__/next-link.js',
        '^next/router$': '<rootDir>/__mocks__/next-router.js',

        // Mock Framer Motion for simpler testing
        '^framer-motion$': '<rootDir>/__mocks__/framer-motion.js',
    },

    // Coverage collection from all components now that canvas is removed
    collectCoverageFrom: [
        'src/components/**/*.{js,jsx,ts,tsx}',
        'src/design-system/**/*.{js,jsx,ts,tsx}',
        'src/data/**/*.{js,jsx,ts,tsx}',
        'src/contexts/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/components/optimized/OptimizedParticleSystem.tsx', // Legacy component
    ],

    // Test paths
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/__tests__/mocks/',
        '<rootDir>/e2e/',
        '<rootDir>/__tests__/e2e/'
    ],

    // Test matching - now include all component tests
    testMatch: [
        '**/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
        '!**/__tests__/e2e/**',
        '!**/e2e/**',
    ],

    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
            presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]]
        }]
    },

    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    // Timeout
    testTimeout: 10000,

    // Coverage configuration
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Verbose output
    verbose: false,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)