const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for CODAI Mobile
 * https://facebook.github.io/metro/docs/configuration
 */
module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  // Enable experimental features
  config.resolver.platforms = ['ios', 'android', 'web'];

  // Support for monorepo
  config.watchFolders = [
    // Add any additional watch folders if needed
  ];

  return config;
})();
