export default [
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
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
            },
        },
        rules: {
            'no-console': 'off',
            'prefer-const': 'warn',
            'no-var': 'warn',
        },
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
