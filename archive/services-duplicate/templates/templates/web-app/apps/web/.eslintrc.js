const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['next/core-web-vitals'],
  plugins: [
    '@typescript-eslint',
    'react',
    'jsx-a11y',
    'import',
    'unused-imports',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
    react: {
      version: 'detect',
      runtime: 'automatic',
    },
  },
  ignorePatterns: [
    '.*.js',
    'node_modules/',
    'dist/',
    '.next/',
    '.turbo/',
    'coverage/',
    'src/lib/test-utils.tsx',
  ],
  rules: {
    // Relaxed TypeScript rules for Next.js development
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Import rules
    'unused-imports/no-unused-imports': 'error',
    'import/order': [
      'warn', // Changed from 'error' to 'warn'
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
      },
    ],

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      files: [
        '**/lib/env*.ts',
        '**/lib/error-reporting.ts',
        '**/lib/performance/**/*.ts',
        '**/examples/**/*.tsx',
      ],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
