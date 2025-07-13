/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Configure pages directory location
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Transpile workspace packages
  transpilePackages: ['@codai/shared-ui'],

  // Custom webpack configuration for shared components
  webpack: (config, { isServer }) => {
    // Handle workspace packages properly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@codai/shared-ui': require('path').resolve(__dirname, '../../packages/shared-ui/src'),
    };

    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'METU_VOICE_AI',
    NEXT_TELEMETRY_DISABLED: '1',
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Output configuration for deployment
  output: 'standalone',

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // TypeScript configuration
  typescript: {
    // Type checking is handled by separate command
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // ESLint is handled by separate command
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
