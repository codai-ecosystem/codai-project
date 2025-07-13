import type { CompilerOptions } from 'typescript';

// Base TypeScript configuration for Codai ecosystem
const codaiTypeScriptConfig: any = {
  // Target and Module
  target: 'ES2022',
  module: 'ESNext',
  moduleResolution: 'bundler',

  // Strict Type Checking
  strict: true,
  noImplicitAny: true,
  strictNullChecks: true,
  strictFunctionTypes: true,
  strictBindCallApply: true,
  strictPropertyInitialization: true,
  noImplicitThis: true,
  alwaysStrict: true,
  exactOptionalPropertyTypes: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,

  // Module Resolution
  allowImportingTsExtensions: true,
  allowArbitraryExtensions: true,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,

  // Emit
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  outDir: './dist',
  removeComments: false,
  noEmit: true,

  // JavaScript Support
  allowJs: false,
  checkJs: false,

  // Interop Constraints
  verbatimModuleSyntax: false, // Disabled for broader compatibility

  // Advanced
  skipLibCheck: true,
  resolveJsonModule: true,

  // Type Roots
  typeRoots: ['./node_modules/@types'],

  // JSX
  jsx: 'react-jsx' as any,
  jsxImportSource: 'react',

  // Experimental
  experimentalDecorators: true,
  emitDecoratorMetadata: true,

  // Paths for monorepo
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*'],
    '@codai/core': ['../core/src'],
    '@codai/ui': ['../ui/src'],
    '@codai/api': ['../api/src'],
    '@codai/auth': ['../auth/src'],
    '@codai/config': ['../config/src'],
  },
};

// App-specific TypeScript configuration
const codaiAppTypeScriptConfig: any = {
  ...codaiTypeScriptConfig,
  noEmit: true,
  incremental: true,
  tsBuildInfoFile: './.next/cache/tsbuildinfo',
  plugins: [
    {
      name: 'next',
    },
  ],
  paths: {
    ...codaiTypeScriptConfig.paths,
    '@/*': ['./src/*'],
    '@/components/*': ['./src/components/*'],
    '@/lib/*': ['./src/lib/*'],
    '@/utils/*': ['./src/utils/*'],
    '@/hooks/*': ['./src/hooks/*'],
    '@/types/*': ['./src/types/*'],
  },
};

// Package-specific TypeScript configuration  
const codaiPackageTypeScriptConfig: any = {
  ...codaiTypeScriptConfig,
  noEmit: false,
  declaration: true,
  declarationMap: true,
  emitDeclarationOnly: false,
  outDir: './dist',
  rootDir: './src',
};

export default codaiTypeScriptConfig;

// Export all configurations
export {
  codaiTypeScriptConfig as codaiTsConfig,
  codaiAppTypeScriptConfig as codaiAppTsConfig,
  codaiPackageTypeScriptConfig as codaiPackageTsConfig
};
