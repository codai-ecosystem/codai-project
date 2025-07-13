import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
    watch: false, // Prevent watch mode by default
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.{ts,tsx}',
                'src/**/*.spec.{ts,tsx}'
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
            '@': resolve(__dirname, 'src'),
            '@/components': resolve(__dirname, 'src/renderer/components'),
            '@/hooks': resolve(__dirname, 'src/renderer/hooks'),
            '@/stores': resolve(__dirname, 'src/renderer/stores'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/voice': resolve(__dirname, 'src/voice'),
            '@/ai': resolve(__dirname, 'src/ai')
        }
    }
})

