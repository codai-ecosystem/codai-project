/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['../../jest.setup.ts'],
        include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
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
