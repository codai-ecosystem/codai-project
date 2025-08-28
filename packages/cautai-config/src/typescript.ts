/**
 * @fileoverview TypeScript configuration for Cautai packages
 * @author Cautai Team
 * @version 1.0.0
 */

export const typescriptConfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    incremental: true,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    composite: true
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist']
};

export const reactTypescriptConfig = {
  ...typescriptConfig,
  compilerOptions: {
    ...typescriptConfig.compilerOptions,
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    jsx: 'react-jsx'
  }
};

export const nextTypescriptConfig = {
  ...reactTypescriptConfig,
  compilerOptions: {
    ...reactTypescriptConfig.compilerOptions,
    lib: ['DOM', 'DOM.Iterable', 'ES6'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [
      {
        name: 'next'
      }
    ]
  },
  include: [
    'next-env.d.ts',
    '**/*.ts',
    '**/*.tsx',
    '.next/types/**/*.ts'
  ]
};