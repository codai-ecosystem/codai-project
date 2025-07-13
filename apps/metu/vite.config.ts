import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // Path resolution
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/components': resolve(__dirname, './src/components'),
            '@/voice': resolve(__dirname, './src/voice'),
            '@/types': resolve(__dirname, './src/types'),
            '@/utils': resolve(__dirname, './src/utils')
        }
    },

    // Development server
    server: {
        port: 6388,
        strictPort: true,
        host: true,
        hmr: {
            port: 6389
        }
    },

    // Build configuration
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2020',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    },

    // Electron specific optimizations
    base: './',

    // Define environment variables
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // CSS configuration
    css: {
        postcss: './postcss.config.js'
    },

    // Optimizations
    optimizeDeps: {
        exclude: ['electron']
    }
})
