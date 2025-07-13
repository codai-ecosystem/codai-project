import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Base Vitest configuration for Codai ecosystem
const codaiVitestConfig = defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
    }) as any,
  ] as any,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'build',
      '.turbo',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/test/**',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@codai/core': resolve(process.cwd(), '../core/src'),
      '@codai/ui': resolve(process.cwd(), '../ui/src'),
      '@codai/api': resolve(process.cwd(), '../api/src'),
      '@codai/auth': resolve(process.cwd(), '../auth/src'),
      '@codai/config': resolve(process.cwd(), '../config/src'),
    },
  },
});

// App-specific Vitest configuration
const codaiAppVitestConfig = defineConfig({
  ...codaiVitestConfig,
  test: {
    ...codaiVitestConfig.test,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/test/**',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    } as any,
  },
});

export default codaiVitestConfig;

export { codaiVitestConfig, codaiAppVitestConfig };
