/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove deprecated turbo config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    SERVICE_NAME: 'BancAI',
    SERVICE_PORT: '4033',
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

    // Handle ESM/CommonJS interop
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };

    return config;
  },
  // Reduce memory usage
  compress: true,
  poweredByHeader: false,
  // Fix module resolution
  transpilePackages: ['@codai/api-keys', '@codai/azure-openai', '@codai/logai-integration', '@codai/logai-sdk'],
};

module.exports = nextConfig;
