/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Remove experimental appDir - it's stable in Next.js 15
  // experimental: {
  //   appDir: true,
  // },

  // Ensure correct path resolution
  basePath: '',

  eslint: {
    // Enable strict ESLint checking
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable strict TypeScript checking
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost'],
  },

  // Override webpack config to fix module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure proper module resolution within this workspace
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];

    return config;
  },
};

module.exports = nextConfig;
