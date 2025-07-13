import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disable DTS generation temporarily due to cross-package imports
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['fastify'],
});
