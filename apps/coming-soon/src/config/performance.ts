// Performance optimization configuration for CODAI Coming Soon page
// Implements Microsoft best practices for Core Web Vitals and 60fps animations

export const PERFORMANCE_CONFIG = {
    // Animation optimization
    ANIMATION: {
        TARGET_FPS: 60,
        FRAME_BUDGET_MS: 16.67, // 1000ms / 60fps
        THROTTLE_DELAY_MS: 16,
        ANIMATION_DURATION_MAX_MS: 800,
        STAGGER_DELAY_MS: 50,
        REDUCED_MOTION_THRESHOLD: 0.3,
        // Use transform properties for GPU acceleration
        GPU_ACCELERATED_PROPERTIES: [
            'transform',
            'opacity',
            'filter',
            'backdrop-filter',
            'scale',
            'rotate',
            'translate'
        ],
        // Avoid these properties for smooth animations
        AVOID_PROPERTIES: [
            'width',
            'height',
            'top',
            'left',
            'margin',
            'padding',
            'border'
        ]
    },

    // Bundle optimization
    BUNDLE: {
        // Lazy load components after initial render
        LAZY_LOAD_THRESHOLD: 1000, // ms after initial load
        // Split bundles for better loading
        CHUNK_SIZE_TARGET_KB: 244, // Google's recommendation
        // Preload critical resources
        CRITICAL_RESOURCES: [
            'fonts',
            'hero-images',
            'critical-css'
        ]
    },

    // Memory management
    MEMORY: {
        // Cleanup intervals
        PARTICLE_CLEANUP_INTERVAL_MS: 5000,
        ANIMATION_CACHE_MAX_SIZE: 100,
        // Object pooling for frequently created objects
        PARTICLE_POOL_SIZE: 200,
        CONNECTION_POOL_SIZE: 50
    },

    // Intersection Observer optimization
    INTERSECTION: {
        ROOT_MARGIN: '100px 0px 100px 0px', // Load content before it's visible
        THRESHOLD: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        // Debounce intersection callbacks
        DEBOUNCE_MS: 100
    },

    // Core Web Vitals targets
    CORE_WEB_VITALS: {
        // Largest Contentful Paint
        LCP_TARGET_MS: 2500,
        LCP_GOOD_MS: 2500,
        // First Input Delay
        FID_TARGET_MS: 100,
        FID_GOOD_MS: 100,
        // Cumulative Layout Shift
        CLS_TARGET: 0.1,
        CLS_GOOD: 0.1,
        // First Contentful Paint
        FCP_TARGET_MS: 1800,
        // Time to Interactive
        TTI_TARGET_MS: 3800
    },

    // Resource loading
    RESOURCES: {
        // Image optimization
        IMAGE_LAZY_LOADING: true,
        IMAGE_FORMATS: ['webp', 'avif', 'jpg', 'png'],
        IMAGE_SIZES: [480, 768, 1024, 1280, 1536, 1920],

        // Font optimization
        FONT_DISPLAY: 'swap',
        FONT_PRELOAD: ['Inter-Regular', 'Inter-Bold'],

        // Prefetch optimization
        PREFETCH_DELAY_MS: 2000,
        DNS_PREFETCH_DOMAINS: [
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ]
    },

    // Device-specific optimizations
    DEVICE: {
        // Mobile optimizations
        MOBILE_BREAKPOINT: 768,
        MOBILE_PARTICLE_REDUCTION: 0.5, // Reduce particles by 50% on mobile
        MOBILE_ANIMATION_REDUCTION: 0.7, // Reduce animation complexity by 30%

        // Low-end device detection
        LOW_END_DEVICE_MEMORY_GB: 4,
        LOW_END_DEVICE_CORES: 4,
        LOW_END_OPTIMIZATIONS: {
            REDUCE_PARTICLES: 0.3,
            DISABLE_COMPLEX_SHADERS: true,
            REDUCE_ANIMATION_DETAILS: true,
            LOWER_CANVAS_RESOLUTION: true
        }
    },

    // Network optimization
    NETWORK: {
        // Service Worker caching
        CACHE_STRATEGY: 'stale-while-revalidate',
        CACHE_MAX_AGE_HOURS: 24,

        // Resource hints
        PRECONNECT_ORIGINS: [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ],

        // Critical resource inlining
        INLINE_CSS_MAX_KB: 14, // Google's recommendation
        INLINE_JS_MAX_KB: 10
    }
} as const;

// Performance monitoring utilities
export const PerformanceMonitor = {
    // Measure frame rate
    measureFPS: () => {
        let frames = 0;
        let startTime = performance.now();

        const measure = () => {
            frames++;
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;

            if (elapsed >= 1000) {
                const fps = Math.round((frames * 1000) / elapsed);
                console.log(`Current FPS: ${fps}`);
                frames = 0;
                startTime = currentTime;
            }

            requestAnimationFrame(measure);
        };

        requestAnimationFrame(measure);
    },

    // Measure Core Web Vitals
    measureCoreWebVitals: () => {
        // LCP measurement
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID measurement
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // CLS measurement
        let clsValue = 0;
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    console.log('CLS:', clsValue);
                }
            });
        }).observe({ entryTypes: ['layout-shift'] });
    },

    // Device capability detection
    detectDeviceCapabilities: () => {
        return {
            memory: (navigator as any).deviceMemory || 8,
            cores: navigator.hardwareConcurrency || 4,
            connection: (navigator as any).connection?.effectiveType || '4g',
            reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            touch: 'ontouchstart' in window,
            webgl: !!document.createElement('canvas').getContext('webgl2'),
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window
        };
    }
};

// Animation performance helpers
export const AnimationHelpers = {
    // Optimized requestAnimationFrame wrapper
    createAnimationLoop: (callback: (deltaTime: number) => void) => {
        let lastTime = 0;
        let animationId: number;

        const loop = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;

            // Skip frame if we're running too fast
            if (deltaTime >= PERFORMANCE_CONFIG.ANIMATION.FRAME_BUDGET_MS) {
                callback(deltaTime);
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(loop);
        };

        animationId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animationId);
    },

    // Throttled scroll handler
    createThrottledScrollHandler: (handler: (scrollY: number) => void) => {
        let ticking = false;

        return () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handler(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };
    },

    // Object pool for frequent allocations
    createObjectPool: <T>(factory: () => T, resetFn: (obj: T) => void, size: number = 50) => {
        const pool: T[] = [];

        for (let i = 0; i < size; i++) {
            pool.push(factory());
        }

        return {
            get: (): T => {
                return pool.pop() || factory();
            },
            release: (obj: T): void => {
                resetFn(obj);
                if (pool.length < size) {
                    pool.push(obj);
                }
            }
        };
    }
};

// CSS-in-JS optimization
export const OptimizedStyles = {
    // GPU-accelerated transform utilities
    gpuAccelerated: {
        willChange: 'transform',
        transform: 'translateZ(0)', // Force GPU layer
        backfaceVisibility: 'hidden' as const,
        perspective: 1000
    },

    // Optimized transitions
    smoothTransition: (property: string, duration: number = 300) => ({
        transition: `${property} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: property
    }),

    // Layout optimization
    preventLayoutShift: {
        contain: 'layout style paint' as const,
        isolation: 'isolate' as const
    }
};

export default PERFORMANCE_CONFIG;