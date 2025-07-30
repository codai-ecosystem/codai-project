import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from multiple sources
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig(({ mode = 'test' }) => {
  // Load environment variables from the root .env file
  const env = loadEnv(mode, '../../', '');

  return {
    plugins: [react({
      jsxImportSource: 'react',
      jsxRuntime: 'automatic'
    })],
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      target: 'es2020'
    },
    test: {
      name: 'metu-tests',
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      globals: true,
      css: true,
      // Use the test-specific TypeScript config
      typecheck: {
        tsconfig: './tsconfig.test.json'
      },
      env: {
        // Load real Azure OpenAI credentials from root .env file
        AZURE_OPENAI_ENDPOINT: env.AZURE_OPENAI_ENDPOINT || "https://your-region.api.cognitive.microsoft.com/",
        AZURE_OPENAI_KEY: env.AZURE_OPENAI_KEY || "your-azure-ai-key-here",
        AZURE_OPENAI_API_VERSION: env.AZURE_OPENAI_API_VERSION || "2024-10-01-preview",
        AZURE_OPENAI_GPT4O_DEPLOYMENT: env.AZURE_OPENAI_GPT4O_DEPLOYMENT || "gpt-4o-realtime",
        // Next.js public environment variables for client-side code
        NEXT_PUBLIC_AZURE_OPENAI_API_KEY: env.AZURE_OPENAI_KEY || "your-azure-ai-key-here",
        NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: env.AZURE_OPENAI_ENDPOINT || "https://your-region.api.cognitive.microsoft.com",
        NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT: env.AZURE_OPENAI_GPT4O_DEPLOYMENT || "gpt-4o-realtime",
        NEXT_PUBLIC_AZURE_OPENAI_API_VERSION: env.AZURE_OPENAI_API_VERSION || "2024-10-01-preview",
        NODE_ENV: "test"
      },
      include: [
        // Only include Vitest test files (exclude Playwright .spec.ts files)
        'src/tests/**/*.test.{js,ts,jsx,tsx}',
        'tests/**/*.test.{js,ts,jsx,tsx}',
        // Explicit paths to avoid node_modules and Playwright tests
        './src/**/*.test.{js,ts,jsx,tsx}',
        './tests/**/*.test.{js,ts,jsx,tsx}'
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        // Explicitly exclude Playwright test files
        '**/*.spec.ts',
        '**/*.spec.js',
        'src/tests/**/*.spec.ts',
        'tests/**/*.spec.ts',
        // Explicitly exclude common problematic paths
        '../../node_modules/**',
        '../node_modules/**'
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json'],
        reportsDirectory: './coverage',
        exclude: [
          // Exclude Node.js modules and build artifacts
          'node_modules/**',
          '.next/**',
          'dist/**',
          'out/**',
          'build/**',
          'coverage/**',
          'server/dist/**',

          // Exclude test files themselves
          'tests/**',
          'src/tests/**',
          '**/*.test.{js,ts,jsx,tsx}',
          '**/*.spec.{js,ts,jsx,tsx}',

          // Exclude configuration files
          '**/*.config.*',
          '**/*.d.ts',
          '**/jest.*',
          '**/vitest.*',

          // Exclude mock files
          '**/__mocks__/**',
          '**/*.mock.*',

          // Exclude build and development files
          'dev-electron-manual.js',
          'empty-module.js',
          'jest-*',
          'middleware.ts'
        ],
        include: [
          // Only include source files
          'src/**/*.{js,ts,jsx,tsx}',
          // Exclude specific non-production files in src
          '!src/tests/**',
          '!src/**/*.test.*',
          '!src/**/*.spec.*',
          '!src/**/*.d.ts'
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  }
});