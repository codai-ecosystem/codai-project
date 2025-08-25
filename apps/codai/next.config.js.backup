/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@codai/memorai', '@codai/auth'],
  // Enable strict type and lint checking
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fix webpack module resolution for pnpm workspaces
  webpack: (config, { dev, isServer }) => {
    // Prevent webpack from resolving modules from global pnpm cache
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };

    // Force webpack to resolve modules from workspace node_modules
    config.resolve.modules = [
      'node_modules',
      '../../node_modules', // workspace root
      ...config.resolve.modules
    ];

    // Exclude ONNX Runtime and heavy ML dependencies from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'onnxruntime-node': false,
        '@xenova/transformers': false,
        'onnxruntime-web': false,
      };

      config.externals = config.externals || [];
      config.externals.push({
        'onnxruntime-node': 'onnxruntime-node',
        '@xenova/transformers': '@xenova/transformers',
      });
    }

    return config;
  },
}

module.exports = nextConfig
