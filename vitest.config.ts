import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    environment: 'jsdom', // Default to jsdom for React components
    include: [
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/archive/**",
      "**/docs/historical/**"
    ],
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: true
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
