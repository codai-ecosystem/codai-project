import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Base Vite configuration for Codai ecosystem
const codaiViteConfig = defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
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
  build: {
    target: 'es2022',
    lib: {
      entry: resolve(process.cwd(), 'src/index.ts'),
      name: 'CodaiPackage',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});

// App-specific Vite configuration
const codaiAppViteConfig = defineConfig({
  ...codaiViteConfig,
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@codai/ui'],
          utils: ['@codai/core'],
        },
      },
    },
  },
});

export default codaiViteConfig;

export { codaiViteConfig, codaiAppViteConfig };
