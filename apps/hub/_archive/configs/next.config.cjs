/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Removed serverExternalPackages to fix Next.js warning
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
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
};

module.exports = nextConfig;
