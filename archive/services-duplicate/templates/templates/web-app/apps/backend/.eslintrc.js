module.exports = {
  root: true,
  extends: ['@metu/eslint-config'],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'no-console': 'off', // Allow console in backend
    '@typescript-eslint/no-console': 'off',
  },
  ignorePatterns: ['dist', 'node_modules', '*.js'],
};
