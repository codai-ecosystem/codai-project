module.exports = {
  contextSeparator: '_',
  // Key separator used in your translation keys
  keySeparator: '.',
  // Namespace separator used in your translation keys
  nsSeparator: ':',

  // Plural separator used in your translation keys
  pluralSeparator: '_',

  // The namespace to use by default when a key's namespace is not provided
  defaultNamespace: 'common',
  
  // An array of the namespaces to use
  namespaces: ['common'],

  // The function to use to extract keys
  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],

    default: ['JavascriptLexer']
  },

  lineEnding: 'auto',

  locales: ['en', 'ro'],

  // Location of the default locale
  defaultValue: (locale, namespace, key) => {
    const keyAsDefaultValue = process.env.I18NEXT_PARSER_KEY_AS_DEFAULT_VALUE || false
    if (keyAsDefaultValue) {
      const separator = process.env.I18NEXT_PARSER_KEY_SEPARATOR || '.'
      return key.split(separator).pop()
    }
    return '__STRING_NOT_TRANSLATED__'
  },

  // The output directory for the translation files
  output: 'locales/$LOCALE/$NAMESPACE.json',

  // Paths to scan for translation keys
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**'
  ],

  sort: true,
  verbose: true,
  failOnWarnings: false,
  failOnUpdate: false,

  customValueTemplate: null,

  resetDefaultValueLocale: null,

  i18nextOptions: null,

  yamlOptions: null
}
