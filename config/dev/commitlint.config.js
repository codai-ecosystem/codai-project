/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD changes
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Revert previous commit
        'wip',      // Work in progress
        'ai',       // AI-related changes
        'deps',     // Dependency updates
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'core',
        'ui',
        'api',
        'auth',
        'config',
        'testing',
        'docs',
        'ci',
        'deps',
        'apps',
        'services',
        'packages',
        'tools',
        'scripts',
        'ai',
        'memorai',
        'logai',
        'bancai',
        'fabricai',
        'studiai',
        'sociai',
        'cumparai',
        'wallet',
        'publicai',
        'x',
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
