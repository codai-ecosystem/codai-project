import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Ensure ESLint errors fail the build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ensure TypeScript errors fail the build
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  experimental: {
    // Enable optimizeCss for better CSS optimization
    optimizeCss: true,
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-icons',
      'framer-motion',
    ],
    // Enable turbopack for faster builds (when stable)
    // turbo: true,
  },
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Bundle analyzer (conditional for development)
  ...(process.env['ANALYZE'] === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // PWA manifest and service worker
        source: '/(manifest.json|sw.js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
