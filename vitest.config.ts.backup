import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    testTimeout: 30000,
    pool: 'forks',
    maxConcurrency: 2,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        // System and build directories
        'node_modules/**',
        'dist/**',
        '.next/**',
        'coverage/**',

        // Archived and legacy directories for coverage exclusion
        '**/archive/**',
        '**/archived/**',
        '**/archived_tests/**',
        'apps/romai/archive/**',
        'apps/romai/src/archived_tests/**',
        '**/old/**',
        '**/deprecated/**',
        '**/backup/**',
        '**/*.old.*',
        '**/*.backup.*',
        '**/*.archive.*',

        // Config and setup files
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/test-setup.ts',
        '**/vitest.config.ts',
      ]
    },
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    exclude: [
      // System and build directories
      '**/node_modules/**',
      '**/dist/**',
      '**/.{git,cache,output,temp}/**',

      // Historical and documentation directories
      '**/docs/historical/**',
      '**/docs/archived/**',
      'docs/historical/**',

      // Archived and legacy directories - PROJECT SPECIFIC
      '**/archive/**',
      '**/archived/**',
      '**/archived_tests/**',
      'apps/romai/archive/**',
      'apps/romai/src/archived_tests/**',

      // Old and backup directories  
      '**/old/**',
      '**/deprecated/**',
      '**/legacy/**',
      '**/backup/**',
      '**/*.old.*',
      '**/*.backup.*',
      '**/*.archive.*',
      '**/_old/**',
      '**/bak/**',
      '**/orig/**',
      '**/copy/**',
      '**/test-old/**',
      '**/tests-old/**',
      '**/temp/**',
      '**/fake/**',
      '**/fake-tests*/**',
      '**/old-tests*/**',

      // Node modules test directories (exclude all dependency tests)
      '**/node_modules/**/test/**',
      '**/node_modules/**/tests/**',
      '**/node_modules/**/__tests__/**',
      '**/node_modules/**/*.test.*',
      '**/node_modules/**/*.spec.*',
      '**/node_modules/**/src/**/test/**',
      '**/node_modules/**/src/**/tests/**',
      '**/node_modules/**/src/**/__tests__/**',
      '**/node_modules/**/dist/**/test/**',
      '**/node_modules/**/lib/**/test/**',
      '**/node_modules/**/.ignored/**',
      '**/node_modules/**/.pnpm/**',

      // Firebase SDK test directories (major exclusion pattern)
      '**/node_modules/@firebase/**/test/**',
      '**/node_modules/@firebase/**/src/test/**',
      '**/node_modules/@firebase/**/dist/test/**',
      '**/node_modules/@firebase/**/**/test/**',

      // Third-party library test directories
      '**/node_modules/zod/**/tests/**',
      '**/node_modules/@reduxjs/**/tests/**',
      '**/node_modules/@testing-library/**/tests/**',
      '**/node_modules/next/**/test/**',
      '**/node_modules/@apollo/**/tests/**',
      '**/node_modules/@jest/**/tests/**',
      '**/node_modules/@sinonjs/**/test/**',
      '**/node_modules/@bcoe/**/test/**',
      '**/node_modules/json-schema-traverse/spec/**',
      '**/node_modules/gensync/test/**',
      '**/node_modules/tsconfig-paths/**/test/**',
      '**/node_modules/express-useragent/test/**',

      // Version-specific archived content
      '**/2023/**',
      '**/2024/**',
      '**/*-2023-*/**',
      '**/*-2024-*/**',
    ]
  }
})
