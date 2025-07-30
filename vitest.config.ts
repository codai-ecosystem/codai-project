import { defineConfig } from 'vitest/config';

export default defineConfig({
  "test": {
    "globals": true,
    "environment": "node",
    "include": [
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"
    ],
    "exclude": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**"
    ],
    "coverage": {
      "reporter": [
        "text",
        "json",
        "html",
        "lcov"
      ],
      "exclude": [
        "coverage/**",
        "dist/**",
        "packages/*/test/**",
        "**/*.d.ts",
        "cypress/**",
        "test/**",
        "tests/**",
        "**/*.test.*",
        "**/*.spec.*"
      ],
      "thresholds": {
        "global": {
          "branches": 80,
          "functions": 80,
          "lines": 80,
          "statements": 80
        }
      }
    },
    "pool": "threads",
    "poolOptions": {
      "threads": {
        "singleThread": false,
        "isolate": false
      }
    },
    "testTimeout": 10000,
    "hookTimeout": 10000
  }
});
