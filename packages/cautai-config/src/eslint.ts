/**
 * @fileoverview ESLint configuration for Cautai packages
 * @author Cautai Team
 * @version 1.0.0
 */

export const eslintConfig = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'eslint-config-prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  env: {
    node: true,
    es2022: true
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Import rules
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }],
    
    // General rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: ['dist', 'node_modules', '.next', 'storybook-static']
};

export const reactEslintConfig = {
  ...eslintConfig,
  extends: [
    ...eslintConfig.extends,
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [...eslintConfig.plugins, 'react', 'react-hooks'],
  env: {
    ...eslintConfig.env,
    browser: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    ...eslintConfig.rules,
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript instead
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};