/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration to prevent build hanging
  experimental: {
    // No experimental features to avoid conflicts
  },
  
  // Allow builds to continue with TypeScript/ESLint errors for now
  typescript: {
    ignoreBuildErrors: false // Set to true only if needed
  },
  eslint: {
    ignoreDuringBuilds: false // Set to true only if needed
  },
  
  // Simple webpack config without complex optimizations
  webpack: (config, { dev, isServer }) => {
    // Only essential webpack modifications
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    // Disable symlinks to avoid pnpm issues
    config.resolve.symlinks = false;
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

module.exports = nextConfig;