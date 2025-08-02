import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
  },
  {
    entry: ['src/server.ts'],
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    treeshake: true,
    minify: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
