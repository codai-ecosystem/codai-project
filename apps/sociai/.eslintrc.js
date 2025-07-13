module.exports = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/"
  ]
};
