import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    }),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AdvancedUX',
      formats: ['es', 'umd'],
      fileName: (format) => `advanced-ux.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'framer-motion',
        'react-spring',
        '@use-gesture/react',
        'focus-trap',
        'react-focus-lock',
        'react-aria-live',
        'react-intersection-observer',
        'react-resize-detector',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'framer-motion': 'FramerMotion',
          'react-spring': 'ReactSpring',
          '@use-gesture/react': 'ReactUseGesture',
          'focus-trap': 'FocusTrap',
          'react-focus-lock': 'ReactFocusLock',
          'react-aria-live': 'ReactAriaLive',
          'react-intersection-observer': 'ReactIntersectionObserver',
          'react-resize-detector': 'ReactResizeDetector',
        },
        // Preserve module structure for better tree shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: ({ name: fileName }) => {
          return `${fileName}.js`;
        },
      },
    },
    target: 'es2015',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/patterns': resolve(__dirname, 'src/patterns'),
      '@/interactions': resolve(__dirname, 'src/interactions'),
      '@/accessibility': resolve(__dirname, 'src/accessibility'),
      '@/analytics': resolve(__dirname, 'src/analytics'),
      '@/personalization': resolve(__dirname, 'src/personalization'),
      '@/performance': resolve(__dirname, 'src/performance'),
      '@/testing': resolve(__dirname, 'src/testing'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/test-setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/testing/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
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
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'react-spring',
      '@use-gesture/react',
    ],
  },
  define: {
    // Replace process.env.NODE_ENV in production builds
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
