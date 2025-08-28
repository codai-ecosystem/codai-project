const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Simple Jest config that avoids all canvas issues
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.node.setup.js'], // Use node-specific setup
    testEnvironment: 'node',  // Use node environment to completely avoid canvas issues
    testEnvironmentOptions: {
        customExportConditions: [''],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // Mock all potentially problematic modules
        '^canvas$': '<rootDir>/__mocks__/canvas.js',
        '^three$': '<rootDir>/__mocks__/three.js',
        '^framer-motion$': '<rootDir>/__mocks__/framer-motion.js',
        '^@/components/3d/(.*)$': '<rootDir>/__mocks__/3d-components.js',
        '^@/components/optimized/OptimizedParticleSystem$': '<rootDir>/__mocks__/particle-system.js',
        // Mock DOM elements for node environment
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/layout.tsx',
        '!src/**/_app.tsx',
        '!src/**/_document.tsx',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/components/3d/**/*', // Exclude all 3D components from coverage
        '!src/components/optimized/OptimizedParticleSystem.tsx', // Exclude particle system
    ],
    testPathIgnorePatterns: [
        '<rootDir>/.next/', 
        '<rootDir>/node_modules/', 
        '<rootDir>/__tests__/mocks/',
        '<rootDir>/e2e/',
        '<rootDir>/__tests__/e2e/'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
    testTimeout: 10000,
    transformIgnorePatterns: [
        'node_modules/(?!(react|react-dom|@testing-library|framer-motion|@framer-motion|react-i18next|i18next|@heroicons|lucide-react)/)',
        'node_modules/canvas/',
        'node_modules/three/',
        'node_modules/jsdom/',
    ],
    
    // Handle canvas and other problematic modules
    moduleDirectories: ['node_modules', '<rootDir>/'],
    setupFiles: [
        '<rootDir>/__mocks__/canvas.js'
    ],
    
    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    
    // Verbose output for debugging
    verbose: false,
    
    // Match only relevant test files (exclude Playwright e2e tests)
    testMatch: [
        '**/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
        '!**/__tests__/e2e/**',
        '!**/e2e/**',
        '!**/__tests__/**/*3d*', // Exclude any 3D-related tests
        '!**/__tests__/**/*canvas*', // Exclude any canvas-related tests
    ],
    
    // Globals for node environment testing
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    
    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
            presets: [
                ['next/babel', { 'preset-react': { runtime: 'automatic' } }]
            ]
        }]
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)