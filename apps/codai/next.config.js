/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@codai/shared-ui', '@codai/memorai', '@codai/auth'],
  // Enable strict type and lint checking
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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

    return config;
  },
}

module.exports = nextConfig
