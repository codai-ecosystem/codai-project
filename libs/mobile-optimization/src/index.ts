/**
 * @fileoverview CODAI Mobile Optimization Package Index
 * @module @codai/mobile-optimization
 * @version 1.0.0
 * 
 * Main entry point for the CODAI Mobile Optimization package.
 * Exports all components, hooks, utilities, and types.
 */

// ===== CORE ENGINE =====
export { MobileOptimizationEngine } from './MobileOptimizationEngine';
export { default as MobileOptimizationEngine } from './MobileOptimizationEngine';

// ===== UTILITIES =====
export { DeviceDetector } from './utils/DeviceDetector';
export { ResponsiveManager } from './utils/ResponsiveManager';

// ===== TYPES =====
export * from './types';

// ===== UTILITIES & HELPERS =====

/**
 * Default mobile optimization configuration
 */
export const DEFAULT_MOBILE_CONFIG = {
    deviceDetection: {
        enabled: true,
        updateInterval: 5000,
        persistSettings: true
    },
    responsiveDesign: {
        breakpoints: {
            xs: 320,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        },
        containerMaxWidths: {
            sm: 540,
            md: 720,
            lg: 960,
            xl: 1140,
            xxl: 1320
        },
        gridColumns: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 8 },
        gutterWidth: { xs: 16, sm: 20, md: 24, lg: 28, xl: 32, xxl: 36 },
        baseLineHeight: 1.5,
        baseFontSize: { xs: 14, sm: 15, md: 16, lg: 16, xl: 16, xxl: 16 },
        scaleRatio: 1.25
    },
    touchInterface: {
        enabled: true,
        gestures: [
            { type: 'tap', enabled: true, threshold: 10, duration: 300 },
            { type: 'swipe', enabled: true, threshold: 50, velocity: 0.3 },
            { type: 'pan', enabled: true, threshold: 10 },
            { type: 'pinch', enabled: true, threshold: 0.1 }
        ],
        touchAreas: {
            minWidth: 44,
            minHeight: 44,
            padding: 8,
            margin: 4,
            accessible: true,
            hapticFeedback: true
        }
    },
    pwa: {
        enabled: true,
        manifest: {
            name: 'CODAI Mobile',
            shortName: 'CODAI',
            description: 'AI-powered development platform optimized for mobile',
            startUrl: '/',
            display: 'standalone',
            orientation: 'any',
            themeColor: '#007acc',
            backgroundColor: '#ffffff',
            categories: ['productivity', 'developer-tools'],
            icons: [
                { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        },
        serviceWorker: {
            enabled: true,
            scriptUrl: '/sw.js',
            scope: '/',
            updateViaCache: 'none',
            skipWaiting: true,
            clientsClaim: true,
            precacheManifest: [],
            runtimeCaching: [],
            backgroundSync: [],
            pushNotifications: {
                enabled: false,
                defaultOptions: {
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    vibrate: [100, 50, 100],
                    requireInteraction: false
                }
            }
        }
    },
    performance: {
        lazyLoading: { enabled: true, threshold: 0.1, rootMargin: '50px' },
        imageOptimization: { enabled: true, formats: ['webp', 'avif', 'jpeg'], quality: 85, responsive: true },
        codesplitting: { enabled: true, strategy: 'route', threshold: 250000 },
        prefetching: { enabled: true, strategy: 'adaptive', connectionAware: true },
        caching: { enabled: true, strategies: ['memory', 'storage'], ttl: 300000 }
    },
    accessibility: {
        enabled: true,
        level: 'AA',
        skipLinks: true,
        focusManagement: true,
        screenReaderSupport: true,
        highContrast: false,
        reducedMotion: false,
        keyboardNavigation: true,
        ariaLabels: true,
        colorContrastRatio: 4.5,
        fontSize: { scalable: true, minSize: 12, maxSize: 24 }
    },
    analytics: {
        enabled: true,
        customEvents: ['mobile_gesture', 'orientation_change', 'pwa_install', 'performance_metric', 'accessibility_action']
    }
} as const;

/**
 * Common breakpoint definitions
 */
export const BREAKPOINTS = {
    xs: 320,   // Extra small devices (phones)
    sm: 576,   // Small devices (tablets)
    md: 768,   // Medium devices (small laptops)
    lg: 992,   // Large devices (desktops)
    xl: 1200,  // Extra large devices (large desktops)
    xxl: 1400  // Extra extra large devices (ultra-wide)
} as const;

/**
 * Touch area guidelines (following Apple HIG and Material Design)
 */
export const TOUCH_AREAS = {
    minWidth: 44,    // Minimum touch target width (iOS)
    minHeight: 44,   // Minimum touch target height (iOS)
    material: 48,    // Material Design minimum (Android)
    comfortable: 56, // Comfortable touch target size
    large: 64        // Large touch target size
} as const;

/**
 * Common media queries
 */
export const MEDIA_QUERIES = {
    mobile: `@media (max-width: ${BREAKPOINTS.md - 1}px)`,
    tablet: `@media (min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
    desktop: `@media (min-width: ${BREAKPOINTS.lg}px)`,
    touch: '@media (hover: none) and (pointer: coarse)',
    hover: '@media (hover: hover) and (pointer: fine)',
    reducedMotion: '@media (prefers-reduced-motion: reduce)',
    highContrast: '@media (prefers-contrast: high)',
    darkMode: '@media (prefers-color-scheme: dark)',
    lightMode: '@media (prefers-color-scheme: light)'
} as const;

/**
 * Performance thresholds based on Core Web Vitals
 */
export const PERFORMANCE_THRESHOLDS = {
    lcp: { good: 2500, needsImprovement: 4000 },      // Largest Contentful Paint (ms)
    fid: { good: 100, needsImprovement: 300 },        // First Input Delay (ms)
    cls: { good: 0.1, needsImprovement: 0.25 },       // Cumulative Layout Shift
    fcp: { good: 1800, needsImprovement: 3000 },      // First Contentful Paint (ms)
    ttfb: { good: 800, needsImprovement: 1800 }       // Time to First Byte (ms)
} as const;

/**
 * PWA installation criteria
 */
export const PWA_CRITERIA = {
    https: true,
    manifest: true,
    serviceWorker: true,
    responsive: true,
    offline: true
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Check if device is mobile based on user agent and screen size
 */
export function isMobileDevice(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
        return false;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isMobileSize = window.innerWidth <= BREAKPOINTS.md;

    return isMobileUA || isMobileSize;
}

/**
 * Check if device is tablet
 */
export function isTabletDevice(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
        return false;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isTabletUA = /tablet|ipad|android(?!.*mobile)/i.test(userAgent);
    const isTabletSize = window.innerWidth > BREAKPOINTS.md && window.innerWidth <= BREAKPOINTS.lg;

    return isTabletUA || isTabletSize;
}

/**
 * Check if device has touch capability
 */
export function hasTouch(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if device supports hover
 */
export function hasHover(): boolean {
    if (typeof window === 'undefined') {
        return true;
    }

    if (window.matchMedia) {
        return window.matchMedia('(hover: hover)').matches;
    }

    return !hasTouch();
}

/**
 * Get device pixel ratio
 */
export function getPixelRatio(): number {
    if (typeof window === 'undefined') {
        return 1;
    }

    return window.devicePixelRatio || 1;
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
    if (typeof window === 'undefined') {
        return { width: 1920, height: 1080 };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

/**
 * Get screen orientation
 */
export function getScreenOrientation(): 'portrait' | 'landscape' {
    const { width, height } = getViewportDimensions();
    return height > width ? 'portrait' : 'landscape';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    if (window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    return false;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
}

/**
 * Get connection information
 */
export function getConnectionInfo(): {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
} {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        return {
            type: connection.type,
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
        };
    }

    return {};
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(): boolean {
    const connection = getConnectionInfo();

    if (connection.effectiveType) {
        return ['slow-2g', '2g'].includes(connection.effectiveType);
    }

    if (connection.downlink) {
        return connection.downlink < 1.5; // Less than 1.5 Mbps
    }

    return false;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `codai-mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert responsive value to CSS custom properties
 */
export function responsiveValueToCSS<T>(
    value: T | Record<string, T>,
    property: string
): Record<string, T> {
    if (typeof value !== 'object' || value === null) {
        return { [property]: value };
    }

    const responsiveValue = value as Record<string, T>;
    const result: Record<string, T> = {};

    Object.entries(responsiveValue).forEach(([breakpoint, val]) => {
        if (breakpoint === 'base') {
            result[property] = val;
        } else {
            result[`${property}-${breakpoint}`] = val;
        }
    });

    return result;
}

/**
 * Create optimized image URL with WebP/AVIF support
 */
export function createOptimizedImageUrl(
    src: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'webp' | 'avif' | 'jpeg' | 'png';
    } = {}
): string {
    if (!src) return src;

    const params = new URLSearchParams();

    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}${params.toString()}`;
}

/**
 * Check if PWA install prompt is available
 */
export function isPWAInstallable(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return 'BeforeInstallPromptEvent' in window;
}

/**
 * Get safe area insets for devices with notches
 */
export function getSafeAreaInsets(): {
    top: string;
    right: string;
    bottom: string;
    left: string;
} {
    if (typeof window === 'undefined' || !CSS.supports('padding', 'env(safe-area-inset-top)')) {
        return { top: '0px', right: '0px', bottom: '0px', left: '0px' };
    }

    return {
        top: 'env(safe-area-inset-top)',
        right: 'env(safe-area-inset-right)',
        bottom: 'env(safe-area-inset-bottom)',
        left: 'env(safe-area-inset-left)'
    };
}

// ===== DEFAULT EXPORT =====
export default MobileOptimizationEngine;
