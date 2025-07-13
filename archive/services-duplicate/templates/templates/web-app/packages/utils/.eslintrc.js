module.exports = {
  extends: ['@metu/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Add any package-specific ESLint rules here
  },
};
