import type { BuildConfig } from 'unbuild';

/**
 * Advanced bundle optimization configuration for production builds
 * Includes tree-shaking, code splitting, compression, and performance optimizations
 */

// Bundle size thresholds (in bytes)
const BUNDLE_SIZE_THRESHOLDS = {
  warning: 500 * 1024,    // 500KB
  error: 1 * 1024 * 1024, // 1MB
  gzip_target: 100 * 1024 // 100KB gzipped
};

// Production build configuration with advanced optimizations
export const productionBuildConfig: BuildConfig = {
  entries: [
    // Main entry points
    './src/index.ts',
    './src/server.ts',
    './src/client.ts',
    
    // Separate chunks for large dependencies
    {
      input: './src/performance/index.ts',
      name: 'performance'
    },
    {
      input: './src/search/index.ts', 
      name: 'search'
    }
  ],
  
  declaration: true,
  clean: true,
  sourcemap: false, // Disable in production for smaller bundles
  
  rollup: {
    // Advanced optimizations - note: treeshake moved to root level in newer versions
    esbuild: {
      minify: true,
      target: 'node18'
    }
  }
};

// Development build configuration with faster rebuilds
export const developmentBuildConfig: BuildConfig = {
  entries: ['./src/index.ts'],
  declaration: true,
  clean: false,
  sourcemap: true,
  
  rollup: {
    esbuild: {
      target: 'node18'
    }
  },
  
  externals: [
    'fs', 'path', 'crypto', 'events', 'stream', 'util', 'os',
    '@modelcontextprotocol/sdk'
  ]
};

// Next.js optimization configuration
export const nextjsOptimizationConfig = {
  // Webpack configuration
  webpack: (config: any, { buildId, dev, isServer, defaultLoaders, webpack }: any) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      
      // Enable advanced tree-shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Advanced code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
        cacheGroups: {
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          
          // Large libraries
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              
              // Separate large packages
              if (['cheerio', 'lru-cache', 'framer-motion'].includes(packageName)) {
                return `lib.${packageName}`;
              }
              
              return 'lib.common';
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          },
          
          // Common chunks
          commons: {
            name: 'commons',
            minChunks: 2,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
      
      // Bundle analyzer
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './analyze/client.html'
          })
        );
      }
    }
    
    // Optimize imports
    if (!dev) {
      // Tree-shake unused lodash functions
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es'
      };
    }
    
    return config;
  },
  
  // Experimental optimizations
  experimental: {
    // Modern bundling
    esmExternals: true,
    
    // Advanced optimizations
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      '@heroicons/react'
    ]
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    
    // React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    
    // Enable SWC minification
    styledComponents: true
  },
  
  // Image optimization
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    
    // Responsive image configuration
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Build performance
  output: 'standalone'
};

// Bundle size monitoring
export const bundleSizeConfig = {
  thresholds: BUNDLE_SIZE_THRESHOLDS,
  
  // Analysis tools
  analyzer: {
    enabled: process.env.ANALYZE === 'true',
    output: './analyze'
  },
  
  // Size tracking
  sizeTracking: {
    enabled: true,
    outputFile: './bundle-sizes.json',
    warnOnIncrease: 0.1, // 10% increase
    errorOnIncrease: 0.2  // 20% increase
  }
};

// Performance optimization utilities
export class BundleOptimizer {
  /**
   * Analyze bundle composition and suggest optimizations
   */
  static analyzeBundles(stats: any): {
    suggestions: string[];
    warnings: string[];
    errors: string[];
  } {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check bundle sizes
    if (stats.assets) {
      for (const asset of stats.assets) {
        if (asset.size > BUNDLE_SIZE_THRESHOLDS.warning) {
          warnings.push(`Large bundle detected: ${asset.name} (${(asset.size / 1024).toFixed(2)}KB)`);
          
          if (asset.name.includes('vendor')) {
            suggestions.push('Consider splitting vendor bundle further or using external CDNs');
          }
        }
        
        if (asset.size > BUNDLE_SIZE_THRESHOLDS.error) {
          errors.push(`Bundle too large: ${asset.name} (${(asset.size / 1024).toFixed(2)}KB)`);
        }
      }
    }
    
    // Check for common optimization opportunities
    if (stats.modules) {
      const lodashModules = stats.modules.filter((m: any) => m.name?.includes('lodash'));
      if (lodashModules.length > 5) {
        suggestions.push('Consider using lodash-es or individual lodash imports to reduce bundle size');
      }
      
      const momentModules = stats.modules.filter((m: any) => m.name?.includes('moment'));
      if (momentModules.length > 0) {
        suggestions.push('Consider replacing Moment.js with day.js or date-fns for smaller bundle size');
      }
    }
    
    return { suggestions, warnings, errors };
  }
  
  /**
   * Generate optimization report
   */
  static generateOptimizationReport(before: any, after: any): {
    sizeDifference: number;
    percentChange: number;
    recommendations: string[];
  } {
    const beforeSize = before.assets?.reduce((sum: number, asset: any) => sum + asset.size, 0) || 0;
    const afterSize = after.assets?.reduce((sum: number, asset: any) => sum + asset.size, 0) || 0;
    
    const sizeDifference = afterSize - beforeSize;
    const percentChange = beforeSize > 0 ? (sizeDifference / beforeSize) * 100 : 0;
    
    const recommendations: string[] = [];
    
    if (percentChange > 10) {
      recommendations.push('Bundle size increased significantly - review recent changes');
    } else if (percentChange < -10) {
      recommendations.push('Great optimization! Bundle size reduced significantly');
    }
    
    return {
      sizeDifference,
      percentChange,
      recommendations
    };
  }
}