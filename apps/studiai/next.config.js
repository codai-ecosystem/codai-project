/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable ESLint and TypeScript checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Move turbo config to turbopack as new format
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Fix Windows temp directory permissions
    config.cache = {
      type: 'filesystem',
      cacheDirectory: 'E:/GitHub/codai-project/temp/studiai/.next/cache',
    };

    return config;
  },
  transpilePackages: ['@codai/ui', '@codai/core', '@codai/auth'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  distDir: '.next',
  generateBuildId: async () => {
    // Use a simple build ID to avoid path issues
    return 'codai-studiai-build'
  },
};

export default nextConfig;
