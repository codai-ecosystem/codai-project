module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'next/core-web-vitals'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prefer-const': 'error',
        'no-var': 'error'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/'
    ]
};
