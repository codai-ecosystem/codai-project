import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

// Base Rollup configuration for Codai packages
const codaiRollupConfig: RollupOptions[] = [
  // Main build (ESM + CJS)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
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
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
      }),
      terser(),
    ],
  },
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
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
    plugins: [dts()],
  },
];

// Library-specific Rollup configuration
const codaiLibraryRollupConfig: RollupOptions[] = [
  // Main build (ESM + CJS + UMD)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'CodaiLibrary',
        sourcemap: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    ],
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    plugins: [
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: true,
      }),
      terser(),
    ],
  },
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    plugins: [dts()],
  },
];

export default codaiRollupConfig;

export { codaiRollupConfig, codaiLibraryRollupConfig };
