import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for demo deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors for demo deployment
    ignoreBuildErrors: true,
  },
  // Override distDir to point to apps/web/.next
  distDir: 'apps/web/.next',
  // Fix Firebase/gRPC compatibility issues
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Exclude Node.js specific modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Ignore gRPC modules that cause issues with Next.js
    config.externals = config.externals || [];
    config.externals.push({
      '@grpc/grpc-js': 'commonjs @grpc/grpc-js',
      '@grpc/proto-loader': 'commonjs @grpc/proto-loader',
    });

    return config;
  },
  // Performance optimizations
  experimental: {
    // Disable optimizeCss for compatibility
    // optimizeCss: true,
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
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
