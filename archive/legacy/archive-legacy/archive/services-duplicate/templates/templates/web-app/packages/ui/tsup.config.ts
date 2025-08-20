import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  injectStyle: false,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
  tsconfig: './tsconfig.json',
});
