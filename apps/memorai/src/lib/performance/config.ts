/**
 * Performance Optimization Configuration for METU Template
 * Next.js optimizations, caching, and performance monitoring
 */

// Webpack configuration interface
interface WebpackConfig {
  optimization?: {
    sideEffects?: boolean;
    usedExports?: boolean;
    concatenateModules?: boolean;
    splitChunks?: Record<string, unknown>;
  };
  plugins?: unknown[];
  resolve?: {
    alias?: Record<string, string>;
  };
  module?: {
    rules?: unknown[];
  };
  [key: string]: unknown;
}

// Performance metric interface
interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
}

// Image optimization options interface
interface ImageOptions {
  sizes?: string;
  priority?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

// Image loader parameters interface
interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

// Next.js Configuration Enhancements
export const performanceNextConfig = {
  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@metu/ui', '@metu/utils'],
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env['NODE_ENV'] === 'production',
    reactRemoveProperties:
      process.env['NODE_ENV'] === 'production'
        ? {
            properties: ['^data-testid$'],
          }
        : false,
  }, // Bundle optimization
  webpack: (
    config: WebpackConfig,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ): WebpackConfig => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[/\\]node_modules[/\\]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            ui: {
              test: /[/\\]packages[/\\]ui[/\\]/,
              name: 'ui',
              priority: 20,
              reuseExistingChunk: true,
            },
            utils: {
              test: /[/\\]packages[/\\]utils[/\\]/,
              name: 'utils',
              priority: 15,
              reuseExistingChunk: true,
            },
          },
        },
      };
    } // Bundle analysis plugin
    if (process.env['ANALYZE'] === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      if (!config.plugins) {
        config.plugins = [];
      }
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }

    return config;
  },

  // Headers for caching and security
  headers: () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
    {
      source: '/sw.js',
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
  ],
};

// Performance Monitoring Configuration
export const performanceConfig = {
  // Core Web Vitals thresholds
  webVitals: {
    fcp: { good: 1200, needs_improvement: 3000 }, // First Contentful Paint
    lcp: { good: 2500, needs_improvement: 4000 }, // Largest Contentful Paint
    fid: { good: 100, needs_improvement: 300 }, // First Input Delay
    cls: { good: 0.1, needs_improvement: 0.25 }, // Cumulative Layout Shift
    ttfb: { good: 800, needs_improvement: 1800 }, // Time to First Byte
    inp: { good: 200, needs_improvement: 500 }, // Interaction to Next Paint
  },

  // Bundle size budgets (in KB)
  budgets: {
    javascript: {
      initial: 250,
      total: 500,
    },
    css: {
      initial: 50,
      total: 100,
    },
    images: 1000,
    fonts: 100,
    total: 2000,
  },

  // Performance monitoring endpoints
  analytics: {
    endpoint: process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT'],
    apiKey: process.env['NEXT_PUBLIC_ANALYTICS_API_KEY'],
    enableInDevelopment: false,
  },
};

// Service Worker Configuration
export const serviceWorkerConfig = {
  // Workbox configuration
  workbox: {
    dest: 'public',
    sw: 'sw.js',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:woff|woff2|ttf|otf)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'fonts',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
    ],
    skipWaiting: true,
    clientsClaim: true,
  },
};

// Critical Resource Preloading
export const criticalResources = [
  {
    rel: 'preload',
    href: '/fonts/inter-var.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    href: '/icons/sprite.svg',
    as: 'image',
  },
  {
    rel: 'dns-prefetch',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'dns-prefetch',
    href: 'https://fonts.gstatic.com',
  },
];

// Lazy Loading Configuration
export const lazyLoadingConfig = {
  // Intersection Observer options
  intersectionObserver: {
    rootMargin: '50px',
    threshold: 0.1,
  },

  // Component lazy loading
  components: {
    loadingComponent: 'LoadingSpinner',
    errorBoundary: 'ErrorBoundary',
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Image lazy loading
  images: {
    placeholder: 'blur',
    blurDataURL:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVR...',
    loading: 'lazy',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
};

// Performance Utilities
export class PerformanceUtils {
  /**
   * Measure and report Web Vitals
   */
  static measureWebVitals(
    onReport?: (metric: {
      name: string;
      value: number;
      delta: number;
      id: string;
    }) => void
  ): void {
    if (typeof window === 'undefined') return;
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onReport ?? this.defaultReporter);
      onINP(onReport ?? this.defaultReporter);
      onFCP(onReport ?? this.defaultReporter);
      onLCP(onReport ?? this.defaultReporter);
      onTTFB(onReport ?? this.defaultReporter);
    });
  }

  /**
   * Create performance marks and measures
   */
  static createMark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  static measurePerformance(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      performance.measure(name, startMark, endMark);

      const measures = performance.getEntriesByName(name, 'measure');
      const lastMeasure = measures[measures.length - 1];

      return lastMeasure ? lastMeasure.duration : 0;
    }
    return 0;
  }

  /**
   * Monitor resource loading
   */
  static monitorResources() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (
          resourceEntry.transferSize != null &&
          resourceEntry.transferSize > 100000
        ) {
          // Resources larger than 100KB
          console.warn(
            `Large resource detected: ${entry.name} (${resourceEntry.transferSize} bytes)`
          );
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Check performance budget
   */
  static checkBudget(metrics: Record<string, number>) {
    const budget = performanceConfig.budgets;
    const violations: string[] = [];

    if (
      metrics['javascript'] &&
      metrics['javascript'] > budget.javascript.total
    ) {
      violations.push(
        `JavaScript bundle exceeds budget: ${metrics['javascript']}KB > ${budget.javascript.total}KB`
      );
    }

    if (metrics['css'] && metrics['css'] > budget.css.total) {
      violations.push(
        `CSS bundle exceeds budget: ${metrics['css']}KB > ${budget.css.total}KB`
      );
    }

    if (metrics['total'] && metrics['total'] > budget.total) {
      violations.push(
        `Total bundle size exceeds budget: ${metrics['total']}KB > ${budget.total}KB`
      );
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  private static defaultReporter(metric: PerformanceMetric) {
    console.log(
      `[Performance] ${metric.name}: ${metric.value}${metric.unit ?? 'ms'}`
    );

    // Send to analytics if configured
    if (performanceConfig.analytics.endpoint) {
      fetch(performanceConfig.analytics.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${performanceConfig.analytics.apiKey}`,
        },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          timestamp: Date.now(),
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }
}

// Image Optimization Utilities
export class ImageOptimization {
  /**
   * Generate responsive image props
   */
  static getResponsiveProps(
    src: string,
    alt: string,
    options: ImageOptions = {}
  ) {
    const defaultSizes =
      '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

    return {
      src,
      alt,
      sizes: options.sizes ?? defaultSizes,
      quality: options.quality ?? 85,
      priority: options.priority ?? false,
      placeholder: 'blur',
      blurDataURL: options.blurDataURL ?? lazyLoadingConfig.images.blurDataURL,
    };
  }

  /**
   * Create optimized image loader
   */
  static createImageLoader({ src, width, quality }: ImageLoaderParams) {
    const params = new URLSearchParams();
    params.set('url', src);
    params.set('w', width.toString());
    params.set('q', (quality || 75).toString());

    return `/_next/image?${params}`;
  }
}
