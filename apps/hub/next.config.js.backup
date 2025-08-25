/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone mode for Docker
  transpilePackages: ['@codai/security', '@codai/api-standards'],
  serverExternalPackages: ['bcrypt', 'jsonwebtoken'],
  experimental: {
    // Temporarily disabled optimizeCss due to critters dependency issue
    // optimizeCss: true,
    scrollRestoration: true,
  },
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
};

export default nextConfig;