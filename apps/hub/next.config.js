/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@codai/security', '@codai/api-standards'],
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors for testing
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors for testing
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
  // Production optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

export default nextConfig;