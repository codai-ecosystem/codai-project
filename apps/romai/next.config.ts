import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }

    return config
  },
  // Exclude API directory from Next.js compilation
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  reactStrictMode: false, // Temporarily disable strict mode
};

nextConfig;

export default nextConfig;

