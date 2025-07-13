import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/__tests__/**/*.test.{ts,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            '@/app': resolve(__dirname, './app'),
            '@/components': resolve(__dirname, './components'),
            '@/lib': resolve(__dirname, './lib'),
        },
    },
});
