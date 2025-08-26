/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output to fix Vercel deployment issues
  // output: 'standalone',
  // outputFileTracingRoot: require('path').join(__dirname, '../../'),
  experimental: {
    // Remove deprecated settings that cause warnings
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // Webpack configuration for better module resolution and stable versions
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure proper module resolution for stable versions
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    // Enable symlinks resolution for pnpm compatibility
    config.resolve.symlinks = false; // Disable symlinks to avoid pnpm global cache issues
    
    // Ensure proper node_modules resolution
    config.resolve.modules = [
      require('path').resolve(__dirname, 'node_modules'), // Local node_modules first
      'node_modules',
      '../../node_modules', // Root workspace node_modules
    ];
    
    // Fix absolute paths that cause build issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Remove problematic absolute path references
    };
    
    // Add optimization for stable builds
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ];
  }
};

module.exports = nextConfig;
