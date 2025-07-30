/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly configure src directory usage
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Use src directory for App Router
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable for development
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable for development
  },
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.symlinks = false;
    return config;
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
  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

export default nextConfig;