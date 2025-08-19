/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
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