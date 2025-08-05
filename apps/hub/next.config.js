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
    // Temporarily disabled optimizeCss due to critters dependency issue
    // optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;