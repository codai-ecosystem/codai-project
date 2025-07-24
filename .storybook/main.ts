import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: [
    '../packages/shared-ui/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  typescript: {
    check: true,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  staticDirs: ['../public'],
  async viteFinal(config) {
    return {
      ...config,
      define: {
        ...config.define,
        global: 'globalThis',
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
          crypto: 'crypto-browserify',
          stream: 'stream-browserify',
          util: 'util',
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: ['crypto-browserify', 'stream-browserify', 'util'],
      },
    };
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
