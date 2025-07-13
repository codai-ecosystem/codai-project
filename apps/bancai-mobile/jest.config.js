module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        '!app/**/*.d.ts',
        '!app/_layout.tsx',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$': 'identity-obj-proxy',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@expo|expo|react-native-reanimated|expo-router|@expo/vector-icons|expo-linear-gradient|react-native-safe-area-context)/)',
    ],
};
