// Security-focused ESLint configuration
module.exports = {
    extends: [
        './.eslintrc.js',
        'plugin:security/recommended',
        'plugin:react-hooks/recommended'
    ],
    plugins: ['security', 'react-hooks'],
    rules: {
        // Security rules
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-regexp': 'error',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'error',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-eval-with-expression': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'security/detect-non-literal-require': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'security/detect-pseudoRandomBytes': 'error',

        // React security
        'react/no-danger': 'error',
        'react/no-danger-with-children': 'error',
        'react/jsx-no-script-url': 'error',
        'react/jsx-no-target-blank': 'error',

        // Additional security checks
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error'
    }
};