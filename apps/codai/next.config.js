/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['systeminformation', 'osx-temperature-sensor'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'osx-temperature-sensor': false,
        'fs': false,
        'net': false,
        'tls': false,
        'systeminformation': false
      }
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
};

module.exports = nextConfig;
