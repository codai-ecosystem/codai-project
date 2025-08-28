/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Minimal configuration to prevent build hanging
  experimental: {
    // No experimental features to avoid conflicts
  },
  
  // Allow builds to continue with TypeScript/ESLint errors for now
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
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
    
    // Prevent build hanging by disabling certain optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: false,
        sideEffects: false,
        concatenateModules: false,
      };
      
      // Reduce memory usage
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Custom chunk for large dependencies
          vendor: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

module.exports = nextConfig;