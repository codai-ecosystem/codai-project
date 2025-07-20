export default {
  parser: '@typescript-eslint/parser',
  extends: ['next/core-web-vitals'],
  plugins: [
    '@typescript-eslint',
    'react',
    'jsx-a11y',
    'import',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
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
    // Very permissive rules for now
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'off',
    'import/order': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'react/no-unescaped-entities': 'off',
  },
};
