module.exports = {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": [
    "**/__tests__/**/*.{test,spec}.{js,ts}",
    "**/*.{test,spec}.{js,ts}"
  ],
  "collectCoverageFrom": [
    "src/**/*.{js,ts}",
    "services/**/*.{js,ts}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  "moduleFileExtensions": [
    "ts",
    "js",
    "json"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "testPathIgnorePatterns": [
    "node_modules",
    "dist",
    "build"
  ],
  "passWithNoTests": true
};