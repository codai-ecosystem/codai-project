/**
 * Next.js Performance Optimization Configuration
 * Comprehensive settings for maximum performance
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core Performance Settings
  experimental: {
    // Enable advanced optimizations
    optimizeCss: true,
    optimizePackageImports: ['@codai/shared-ui', 'lucide-react', 'framer-motion'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compression and Optimization
  compress: true,
  poweredByHeader: false,

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle Optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Performance optimizations
    if (!dev && !isServer) {
      // Bundle splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Bundle analyzer (development only)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  // Output optimization
  output: 'standalone',

  // Header optimization for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300'
          }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          }
        ],
      }
    ];
  },

  // Redirects optimization
  async redirects() {
    return [
      // Add performance-optimized redirects here if needed
    ];
  },

  // Enable gzip compression
  compress: true,

  // Optimize build output
  distDir: '.next',

  // Runtime configuration
  publicRuntimeConfig: {
    // Only public config here
  },

  serverRuntimeConfig: {
    // Server-only config here
  },

  // TypeScript configuration
  typescript: {
    // Type checking optimization
    tsconfigPath: './tsconfig.json',
  },

  // ESLint configuration
  eslint: {
    // Optimize ESLint for builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // Environment variables optimization
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
};

module.exports = nextConfig;
