import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
    forceSwcTransforms: true,
  },

  // Move deprecated options to correct locations (Next.js 15 compatibility)
  skipTrailingSlashRedirect: true,

  // External packages that should not be bundled in server components
  serverExternalPackages: ['vector-operations'],

  // Performance and security optimizations
  compress: true,
  trailingSlash: false,
  poweredByHeader: false,
  generateEtags: false,

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 300,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/((?!api).*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'memorai-optimized',
    CACHE_ENABLED: 'true',
    COMPRESSION_ENABLED: 'true',
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Re-enable type checking and linting for better code quality
  // Note: These were temporarily disabled - now enabling for better development experience
  typescript: {
    // Enable type checking in builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint checking during builds
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
