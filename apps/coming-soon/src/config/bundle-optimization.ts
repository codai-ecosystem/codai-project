/**
 * Bundle optimization configuration for CODAI Coming Soon page
 * Implements Microsoft best practices for performance and Core Web Vitals
 */

// Dynamic imports for performance-critical components
export const lazyComponentImports = {
    // 3D Components (largest bundle impact)
    HeroSection3D: () => import('@/components/3d/HeroSection3D').then(mod => ({ default: mod.HeroSection3D })),
    ParticleSystem: () => import('@/components/3d/ParticleSystem'),
    DynamicCursor: () => import('@/components/3d/DynamicCursor'),
    AnimatedBackground: () => import('@/components/3d/AnimatedBackground'),
    ProjectCard3D: () => import('@/components/3d/ProjectCard3D'),
    EcosystemVisualizer: () => import('@/components/3d/EcosystemVisualizer'),
    ConnectionMap: () => import('@/components/3d/ConnectionMap'),
    InteractiveNodes: () => import('@/components/3d/InteractiveNodes'),

    // Animation Components (medium bundle impact)
    ProjectBentoGrid: () => import('@/components/3d/ProjectBentoGrid').then(mod => ({ default: mod.ProjectShowcase3D })),
    EcosystemOverviewAnimated: () => import('@/components/sections/EcosystemOverviewAnimated'),

    // Optimized Components (small bundle impact)
    CSSParticleSystem: () => import('@/components/effects/CSSParticleSystem'),
    LazyWrapper: () => import('@/components/optimized/LazyWrapper'),
};

// Resource preloading configuration
export const preloadConfig = {
    // Critical fonts (preload immediately)
    criticalFonts: [
        {
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
            as: 'style',
            crossOrigin: 'anonymous'
        }
    ],

    // Critical images (preload for LCP)
    criticalImages: [
        // Add hero background or logo images here
    ],

    // DNS prefetch domains
    dnsPrefetch: [
        'fonts.googleapis.com',
        'fonts.gstatic.com'
    ],

    // Preconnect to performance-critical origins
    preconnect: [
        {
            href: 'https://fonts.googleapis.com',
            crossOrigin: 'anonymous'
        },
        {
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'anonymous'
        }
    ]
};

// Webpack bundle optimization (for Next.js webpack config)
export const webpackOptimizations = {
    splitChunks: {
        chunks: 'all',
        cacheGroups: {
            // Vendor libraries
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                reuseExistingChunk: true
            },

            // 3D components bundle
            threeDComponents: {
                test: /[\\/]components[\\/]3d[\\/]/,
                name: 'three-d-components',
                chunks: 'all',
                priority: 20,
                minSize: 20000,
                maxSize: 244000 // Google's recommendation
            },

            // Animation components bundle  
            animations: {
                test: /[\\/]components[\\/]animations[\\/]/,
                name: 'animations',
                chunks: 'all',
                priority: 15,
                minSize: 10000,
                maxSize: 244000
            },

            // Optimized components bundle
            optimized: {
                test: /[\\/]components[\\/]optimized[\\/]/,
                name: 'optimized',
                chunks: 'all',
                priority: 25,
                minSize: 15000
            },

            // Common utilities
            common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
                maxSize: 100000
            }
        }
    },

    // Module optimization
    optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: {
            name: 'runtime'
        },
        usedExports: true,
        sideEffects: false,

        // Tree shaking configuration
        innerGraph: true,

        // Minimize configuration
        minimize: true,
        minimizer: [
            // TerserPlugin with optimized settings
            {
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log', 'console.info', 'console.debug'],
                        passes: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            }
        ]
    }
};

// Performance monitoring configuration
export const performanceMonitoring = {
    // Core Web Vitals thresholds
    thresholds: {
        LCP: 2500, // Largest Contentful Paint
        FID: 100,  // First Input Delay
        CLS: 0.1,  // Cumulative Layout Shift
        FCP: 1800, // First Contentful Paint
        TTI: 3800  // Time to Interactive
    },

    // Performance observer configuration
    observerConfig: {
        // Observe all performance entry types
        entryTypes: [
            'largest-contentful-paint',
            'first-input',
            'layout-shift',
            'paint',
            'navigation',
            'resource'
        ],

        // Buffer size for performance entries
        buffered: true
    },

    // Error tracking for performance issues
    errorTracking: {
        enableConsoleErrors: process.env.NODE_ENV === 'development',
        enablePerformanceWarnings: true,
        enableBundleSizeWarnings: true
    }
};

// Service Worker configuration for caching
export const serviceWorkerConfig = {
    // Cache strategies
    strategies: {
        // Static assets - Cache First
        staticAssets: {
            urlPattern: /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-assets-v1',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                }
            }
        },

        // API calls - Network First
        apiCalls: {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache-v1',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60 // 5 minutes
                }
            }
        },

        // Documents - Stale While Revalidate
        documents: {
            urlPattern: /\/$/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'documents-v1',
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 24 * 60 * 60 // 1 day
                }
            }
        }
    },

    // Precache configuration
    precache: {
        // Include critical assets in precache
        include: [
            '/manifest.json',
            '/offline.html'
        ],
        exclude: [
            /\.map$/,
            /^\/api\//,
            /\/admin\//
        ]
    }
};

// Image optimization configuration
export const imageOptimization = {
    // Next.js Image component optimization
    formats: ['image/webp', 'image/avif'],

    // Device-specific image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Quality settings
    quality: {
        default: 75,
        thumbnails: 60,
        hero: 85,
        gallery: 70
    },

    // Lazy loading configuration
    lazyLoading: {
        rootMargin: '50px 0px 50px 0px',
        threshold: 0.1,
        enableBlurPlaceholder: true
    }
};

// CSS optimization configuration
export const cssOptimization = {
    // Critical CSS extraction
    criticalCSS: {
        // Inline critical CSS for above-the-fold content
        inlineThreshold: 14 * 1024, // 14KB as recommended by Google
        aboveFoldContent: [
            'header',
            '.hero-section',
            '.navigation',
            '.scroll-indicator'
        ]
    },

    // PurgeCSS configuration
    purgeCSS: {
        content: [
            './src/**/*.{js,ts,jsx,tsx}',
            './src/**/*.{html,vue}'
        ],
        safelist: [
            /^animate-/,
            /^transition-/,
            /^duration-/,
            /^ease-/,
            /^transform/,
            /^gpu-accelerated/,
            /^performance-/
        ]
    },

    // PostCSS optimizations
    postCSS: {
        plugins: [
            'autoprefixer',
            'cssnano',
            'postcss-combine-duplicated-selectors',
            'postcss-merge-rules'
        ]
    }
};

// Development performance tools
export const developmentTools = {
    // Bundle analyzer
    bundleAnalyzer: {
        enabled: process.env.ANALYZE === 'true',
        openAnalyzer: false,
        analyzerMode: 'static',
        reportFilename: 'bundle-analysis.html'
    },

    // Performance profiling
    profiling: {
        enabled: process.env.NODE_ENV === 'development',
        reportPath: './performance-reports/',
        metrics: [
            'bundle-size',
            'render-time',
            'memory-usage',
            'fps-counter'
        ]
    },

    // Development server optimization
    devServer: {
        compress: true,
        hot: true,
        overlay: {
            warnings: false,
            errors: true
        }
    }
};

// Runtime performance configuration
export const runtimeConfig = {
    // React optimization
    react: {
        // Strict mode for development
        strictMode: process.env.NODE_ENV === 'development',

        // Profiler for performance monitoring
        profilerEnabled: process.env.NODE_ENV === 'development',

        // Concurrent features
        enableConcurrentFeatures: true
    },

    // Memory management
    memory: {
        // Garbage collection hints
        enableGCHints: true,

        // Object pooling for frequently created objects
        objectPooling: {
            particles: 200,
            animations: 50,
            events: 100
        },

        // Cleanup intervals
        cleanupIntervals: {
            particles: 5000,   // 5 seconds
            animations: 10000, // 10 seconds
            cache: 30000       // 30 seconds
        }
    }
};

export default {
    lazyComponentImports,
    preloadConfig,
    webpackOptimizations,
    performanceMonitoring,
    serviceWorkerConfig,
    imageOptimization,
    cssOptimization,
    developmentTools,
    runtimeConfig
};