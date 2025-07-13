// Base tsup configuration for Codai ecosystem
const codaiTsupConfig = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'] as const,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  platform: 'neutral' as const,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'next',
    '@next/font',
    'tailwindcss',
    '@tailwindcss/typography',
    '@tailwindcss/forms',
    '@tailwindcss/aspect-ratio',
  ],
  esbuildOptions: (options: any) => {
    options.banner = {
      js: '"use client";',
    };
    options.jsx = 'automatic';
    options.jsxImportSource = 'react';
  },
};

// Library-specific tsup configuration
const codaiLibraryTsupConfig = {
  ...codaiTsupConfig,
  format: ['cjs', 'esm', 'iife'] as const,
  globalName: 'CodaiLibrary',
  platform: 'browser' as const,
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
  ],
};

// Node.js-specific tsup configuration
const codaiNodeTsupConfig = {
  ...codaiTsupConfig,
  format: ['cjs', 'esm'] as const,
  platform: 'node' as const,
  external: [
    ...codaiTsupConfig.external,
    'fs',
    'path',
    'os',
    'crypto',
    'http',
    'https',
    'url',
    'stream',
    'util',
    'events',
    'buffer',
    'child_process',
  ],
  esbuildOptions: (options: any) => {
    options.jsx = 'automatic';
    options.jsxImportSource = 'react';
    // Remove client banner for Node.js packages
    delete options.banner;
  },
};

export default codaiTsupConfig;

export { codaiTsupConfig, codaiLibraryTsupConfig, codaiNodeTsupConfig };
