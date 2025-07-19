/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['systeminformation', 'osx-temperature-sensor'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'osx-temperature-sensor': false,
        'fs': false,
        'net': false,
        'tls': false,
        'crypto': false,
        'systeminformation': false
      }
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
