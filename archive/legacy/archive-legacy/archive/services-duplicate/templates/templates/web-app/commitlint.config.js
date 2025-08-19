module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type validation
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, missing semicolons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or external dependencies
        'ci', // CI/CD configuration changes
        'chore', // Other changes that don't modify src or test files
        'revert', // Revert previous commit
        'security', // Security fixes
        'deps', // Dependency updates
        'config', // Configuration changes
        'wip', // Work in progress (for development branches only)
      ],
    ],

    // Subject and body rules
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],
    'subject-min-length': [2, 'always', 10],

    // Body rules
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // Footer rules
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],

    // Header rules
    'header-max-length': [2, 'always', 100],
    'header-min-length': [2, 'always', 15],

    // Scope rules
    'scope-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      [
        // Apps
        'web',
        'backend',
        'api',

        // Packages
        'ui',
        'utils',
        'eslint-config',
        'typescript-config',

        // Areas
        'auth',
        'database',
        'firebase',
        'components',
        'hooks',
        'services',
        'types',
        'styles',
        'tests',
        'e2e',
        'config',
        'docs',
        'ci',
        'deploy',
        'security',
        'performance',
        'accessibility',
        'seo',

        // Tools
        'tools',
        'scripts',
        'lint',
        'format',
        'build',
        'dev',

        // Dependencies
        'deps',
        'devdeps',
        'peerdeps',

        // Release
        'release',
        'changeset',
        'version',
      ],
    ],
  },

  // Custom plugins for enhanced validation
  plugins: [
    {
      rules: {
        'breaking-change-indicator': parsed => {
          const { subject, body, footer } = parsed;
          const hasBreakingChange =
            subject.includes('!') ||
            (body && body.includes('BREAKING CHANGE:')) ||
            (footer && footer.includes('BREAKING CHANGE:'));

          if (hasBreakingChange) {
            return [true, 'Breaking changes must include detailed explanation in body or footer'];
          }

          return [true];
        },

        'ticket-reference': parsed => {
          const { subject, body, footer } = parsed;
          const ticketPattern = /(closes?|fixes?|resolves?)\s+(#\d+|[A-Z]+-\d+)/i;

          const hasTicketRef =
            ticketPattern.test(subject) ||
            (body && ticketPattern.test(body)) ||
            (footer && ticketPattern.test(footer));

          // Only require for feat and fix types
          if (['feat', 'fix'].includes(parsed.type) && !hasTicketRef) {
            return [false, 'Feature and fix commits should reference an issue or ticket'];
          }

          return [true];
        },
      },
    },
  ],

  // Ignore patterns
  ignores: [
    commit => commit.includes('WIP'),
    commit => commit.includes('[skip ci]'),
    commit => commit.includes('[ci skip]'),
  ],

  // Default values
  defaultIgnores: true,
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',

  // Prompt configuration for interactive commits
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: 'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
          security: {
            description: 'Security improvements or fixes',
            title: 'Security',
            emoji: '🔒',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (e.g. component or file name)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
