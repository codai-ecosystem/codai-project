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
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
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
