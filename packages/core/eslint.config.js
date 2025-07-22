const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '.turbo/**',
            'coverage/**',
            '**/*.d.ts'
        ]
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                screen: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                btoa: 'readonly',
                atob: 'readonly',
                console: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',

                // Node.js globals
                process: 'readonly',
                global: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                NodeJS: 'readonly',

                // React globals
                React: 'readonly',
                JSX: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-require-imports': 'warn',
            'prefer-const': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-unreachable': 'warn',
            'no-redeclare': 'off',
            '@typescript-eslint/no-redeclare': 'error',
            'no-useless-escape': 'warn',
            'no-undef': 'off', // TypeScript handles this
            '@typescript-eslint/no-empty-object-type': 'warn',
        },
    },
    {
        files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    },
];
