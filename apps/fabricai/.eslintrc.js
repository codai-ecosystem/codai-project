module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended"
  ],
  rules: {
    "no-unused-vars": "warn",
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
