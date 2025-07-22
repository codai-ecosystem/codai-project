import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', '*.{js,jsx,ts,tsx}'], // Only lint files included in tsconfig
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        RequestInit: 'readonly',
        Response: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // Use @typescript-eslint version
      'no-constant-binary-expression': 'warn',
      'no-useless-escape': 'warn',
      'no-empty-function': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '.turbo/**',
      // Align with tsconfig excludes - these directories are excluded from TypeScript
      'app/**/*',
      'components/**/*',
      'lib/**/*',
      'pages/**/*',
      'src-disabled/**/*',
      'src-backup/**/*',
      'test-app/**/*',
      '__tests__/**/*',
      'tests/**/*'
    ],
  },
];
