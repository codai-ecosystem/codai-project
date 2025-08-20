const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['.*.js', 'node_modules/', 'dist/', '.next/', '.turbo/'],
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/prefer-const': 'error',
        '@typescript-eslint/no-var-requires': 'off',
        'unused-imports/no-unused-imports': 'error',
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'no-unused-vars': 'off',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
  ],
};
