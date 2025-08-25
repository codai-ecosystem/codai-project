import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      resolveAlias: {
        canvas: './empty-module.js',
      },
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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

export default nextConfig;

