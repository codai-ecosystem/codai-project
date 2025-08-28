/**
 * @fileoverview Prettier configuration for Cautai packages
 * @author Cautai Team
 * @version 1.0.0
 */

export const prettierConfig = {
  semi: true,
  trailingComma: 'es5' as const,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid' as const,
  endOfLine: 'lf' as const,
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always' as const,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        singleQuote: false,
      },
    },
  ],
};