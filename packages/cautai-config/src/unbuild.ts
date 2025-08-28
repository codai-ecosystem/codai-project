/**
 * @fileoverview Unbuild configuration for Cautai packages
 * @author Cautai Team
 * @version 1.0.0
 */

export const unbuildConfig = {
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
  externals: [
    'react',
    'react-dom',
    'next',
    'vscode',
    '@modelcontextprotocol/sdk',
  ],
};

export const unbuildReactConfig = {
  ...unbuildConfig,
  externals: [
    ...unbuildConfig.externals,
    'react',
    'react-dom',
    '@radix-ui/react-*',
    'framer-motion',
    'lucide-react',
  ],
};

export const unbuildVSCodeConfig = {
  ...unbuildConfig,
  entries: ['src/extension'],
  externals: [
    'vscode',
  ],
  rollup: {
    ...unbuildConfig.rollup,
    inlineDependencies: true,
  },
};