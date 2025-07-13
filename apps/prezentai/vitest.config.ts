/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        watch: false, // Prevent watch mode by default
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}', '__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        exclude: ['node_modules/**', 'dist/**', '.next/**']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@/components': path.resolve(__dirname, './components'),
            '@/app': path.resolve(__dirname, './app')
        }
    }
})

