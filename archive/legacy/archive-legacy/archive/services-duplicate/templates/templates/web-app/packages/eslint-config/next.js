const { resolve } = require('node:path');

// Find the correct tsconfig.json path - look in current directory first, then parent
const findProject = () => {
  const currentDir = resolve(process.cwd(), 'tsconfig.json');
  const parentDir = resolve(process.cwd(), '..', 'tsconfig.json');

  try {
    require('fs').accessSync(currentDir);
    return currentDir;
  } catch {
    try {
      require('fs').accessSync(parentDir);
      return parentDir;
    } catch {
      return currentDir; // fallback
    }
  }
};

const project = findProject();

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals', // This includes import plugin
    'plugin:promise/recommended',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'unused-imports',
    'promise',
    'optimize-regex',
    'sonarjs',
    'unicorn',
    'react-perf',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project,
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
  ignorePatterns: ['.*.js', 'node_modules/', 'dist/', '.next/', '.turbo/'],
  rules: {
    // TypeScript rules - Ultra strict
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/consistent-type-exports': [
      'error',
      { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Import rules - Enhanced (handled by next/core-web-vitals)
    'unused-imports/no-unused-imports': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['type'],
      },
    ],
    'import/no-duplicates': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-default-export': 'off', // Allow default exports for Next.js pages
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/jsx-key': 'error',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-pascal-case': 'error',
    'react/self-closing-comp': 'warn',
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/jsx-boolean-value': ['error', 'never'],

    // React hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Performance rules
    'react-perf/jsx-no-new-object-as-prop': 'warn',
    'react-perf/jsx-no-new-array-as-prop': 'warn',
    'react-perf/jsx-no-new-function-as-prop': 'warn',

    // A11y rules
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',

    // General rules - Enhanced
    'no-unused-vars': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-implicit-coercion': 'error',
    'no-unused-expressions': 'error',
    'no-useless-return': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/cognitive-complexity': ['warn', 10],
    'optimize-regex/optimize-regex': 'warn',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-module': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/prefer-array-some': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Promise rules
    'promise/param-names': 'error',
    'promise/no-nesting': 'warn',
    'promise/prefer-await-to-then': 'warn',
    'promise/prefer-await-to-callbacks': 'warn',

    // Next.js rules
    'import/no-default-export': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'warn',
  },
};
