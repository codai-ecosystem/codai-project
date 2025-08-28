module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'docs',     // Documentation only changes
                'style',    // Code style changes (formatting, missing semi colons, etc)
                'refactor', // Code change that neither fixes a bug nor adds a feature
                'perf',     // Performance improvements
                'test',     // Adding missing tests or correcting existing tests
                'chore',    // Changes to build process or auxiliary tools
                'ci',       // Changes to CI configuration files and scripts
                'build',    // Changes that affect the build system
                'revert',   // Reverting previous commits
                'security', // Security fixes
                'deps',     // Dependency updates
                'ai',       // AI/ML model updates or improvements
                'cultural', // Romanian cultural intelligence updates
                'i18n',     // Internationalization updates
            ],
        ],
        'scope-enum': [
            2,
            'always',
            [
                'api',           // API changes
                'ui',            // User interface changes
                'auth',          // Authentication/authorization
                'db',            // Database changes
                'ml',            // Machine learning components
                'cultural',      // Romanian cultural intelligence
                'reasoning',     // AI reasoning engines
                'math',          // Mathematical engine
                'logical',       // Logical reasoning engine
                'romanian',      // Romanian language processing
                'security',      // Security related changes
                'performance',   // Performance improvements
                'testing',       // Testing infrastructure
                'ci-cd',         // CI/CD pipeline
                'deployment',    // Deployment configuration
                'monitoring',    // Monitoring and observability
                'docs',          // Documentation
                'config',        // Configuration changes
                'deps',          // Dependencies
                'types',         // TypeScript types
                'i18n',          // Internationalization
                'accessibility', // Accessibility improvements
            ],
        ],
        'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'header-max-length': [2, 'always', 100],
        'body-leading-blank': [2, 'always'],
        'footer-leading-blank': [2, 'always'],
    },
};