module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        tabWidth: 2,
        useTabs: false,
        printWidth: 80
      }
    }
  ]
}
