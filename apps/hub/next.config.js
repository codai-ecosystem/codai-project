/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  typescript: {
    ignoreBuildErrors: false, // Enable strict TypeScript checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable strict ESLint checking
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