module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "security"],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Security rules
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",

    // General rules
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",

    // Anti-mock data rules
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Literal[value=/mock|fake|placeholder|dummy|test|sample|lorem|temp|todo|fixme/i]",
        "message": "Mock, fake, placeholder, or temporary data is not allowed. Use real data sources only."
      },
      {
        "selector": "Identifier[name=/mock|fake|placeholder|dummy|test|sample|lorem|temp/i]",
        "message": "Mock, fake, placeholder, or temporary variable names are not allowed."
      }
    ],
    "no-restricted-patterns": [
      {
        "pattern": "\\b(mock|fake|placeholder|dummy|test|sample|lorem|temp)\\b",
        "message": "Mock or placeholder patterns detected. Use real data only."
      }
    ]
  },
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  }
}
