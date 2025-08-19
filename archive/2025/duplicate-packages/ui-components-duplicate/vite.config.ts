/**
 * @fileoverview Vite Configuration for CODAI UI Components Library
 * @version 1.0.0
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.json'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/types': resolve(__dirname, './src/types')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'CODAIUIComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@radix-ui/react-slot',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-toast',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-switch',
        '@radix-ui/react-slider',
        '@radix-ui/react-progress',
        '@radix-ui/react-tabs',
        '@radix-ui/react-accordion',
        '@radix-ui/react-avatar',
        'framer-motion',
        'lucide-react',
        '@heroicons/react',
        'clsx',
        'class-variance-authority',
        'tailwind-merge'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          'framer-motion': 'FramerMotion',
          'lucide-react': 'LucideReact',
          '@heroicons/react': 'HeroiconsReact',
          clsx: 'clsx',
          'class-variance-authority': 'ClassVarianceAuthority',
          'tailwind-merge': 'TailwindMerge'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles.css';
          return assetInfo.name as string;
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true,
    target: 'esnext',
    minify: 'esbuild'
  },
  css: {
    modules: false,
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    },
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'esnext'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'clsx',
      'class-variance-authority'
    ]
  }
});
