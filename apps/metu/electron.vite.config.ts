import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: 'dist/main'
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@/types': resolve(__dirname, 'src/types'),
                '@/utils': resolve(__dirname, 'src/utils'),
                '@/voice': resolve(__dirname, 'src/voice'),
                '@/ai': resolve(__dirname, 'src/ai')
            }
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: 'dist/preload'
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@/types': resolve(__dirname, 'src/types')
            }
        }
    },
    renderer: {
        root: 'src/renderer',
        build: {
            outDir: 'dist/renderer',
            rollupOptions: {
                input: 'src/renderer/index.html',
                external: ['react', 'react-dom', 'react/jsx-runtime']
            }
        },
        server: {
            port: 6388,
            strictPort: true,
            host: true,
            hmr: {
                port: 6389
            }
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@/components': resolve(__dirname, 'src/components'),
                '@/voice': resolve(__dirname, 'src/voice'),
                '@/types': resolve(__dirname, 'src/types'),
                '@/utils': resolve(__dirname, 'src/utils')
            }
        },
        plugins: [react()],
        css: {
            postcss: './postcss.config.js'
        }
    }
})
