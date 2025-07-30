module.exports = {
  "env": {
    "browser": true,
    "es2022": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": [
      "./tsconfig.json",
      "./apps/*/tsconfig.json",
      "./libs/*/tsconfig.json"
    ]
  },
  "plugins": [
    "@typescript-eslint",
    "import",
    "security",
    "sonarjs",
    "unicorn"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-unresolved": "error",
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "sonarjs/cognitive-complexity": [
      "error",
      20
    ],
    "sonarjs/no-duplicate-string": [
      "error",
      5
    ],
    "sonarjs/no-identical-functions": "error",
    "unicorn/filename-case": [
      "error",
      {
        "case": "kebabCase"
      }
    ],
    "unicorn/no-null": "error",
    "unicorn/prefer-module": "error",
    "unicorn/prefer-node-protocol": "error",
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "overrides": [
    {
      "files": [
        "*.test.{js,ts}",
        "*.spec.{js,ts}"
      ],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "no-console": "off"
      }
    },
    {
      "files": [
        "*.config.{js,ts}",
        "*.setup.{js,ts}"
      ],
      "rules": {
        "import/no-default-export": "off"
      }
    }
  ],
  "ignorePatterns": [
    "dist/",
    "build/",
    "node_modules/",
    "*.min.js",
    "coverage/",
    ".next/",
    ".nuxt/"
  ]
};
