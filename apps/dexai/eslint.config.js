import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                exports: 'writable',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                window: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                crypto: 'readonly',
                React: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react': reactPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            'no-console': 'off',
            'prefer-const': 'warn',
            'no-var': 'warn',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn', // Allow any but warn
            'no-undef': 'off', // TypeScript handles this
        },
        settings: {
            react: {
                version: 'detect'
            }
        }
    },
    {
        ignores: [
            'node_modules/',
            'dist/',
            '.next/',
            '.turbo/',
            'coverage/',
        ],
    },
];
