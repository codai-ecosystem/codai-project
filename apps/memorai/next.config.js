/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set app directory
  experimental: {
    appDir: true,
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_NAME: 'MEMORAI',
    APP_DESCRIPTION: 'AI Memory & Database Core',
    APP_PORT: '4031',
  },
  webpack: (config, { isServer }) => {
    // Fix module resolution issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Reduce memory usage
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig;