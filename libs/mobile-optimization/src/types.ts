/**
 * @fileoverview CODAI Mobile Optimization Types
 * @module @codai/mobile-optimization/types
 * @version 1.0.0
 * 
 * Comprehensive TypeScript type definitions for mobile optimization,
 * responsive design, PWA features, and cross-platform user experience.
 */

import { ReactNode, CSSProperties, ComponentType } from 'react';

// ===== DEVICE & VIEWPORT TYPES =====

/**
 * Device type classification
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable';

/**
 * Screen orientation
 */
export type ScreenOrientation = 'portrait' | 'landscape';

/**
 * Touch capability
 */
export type TouchCapability = 'none' | 'coarse' | 'fine';

/**
 * Device capabilities and characteristics
 */
export interface DeviceCapabilities {
    type: DeviceType;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    pixelRatio: number;
    orientation: ScreenOrientation;
    touchCapability: TouchCapability;
    hasHover: boolean;
    hasCursor: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    colorScheme: 'light' | 'dark' | 'auto';
    connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'wifi' | 'ethernet';
    connectionSpeed?: 'slow' | 'medium' | 'fast';
    batteryLevel?: number;
    isCharging?: boolean;
    memorySize?: number;
    hardwareConcurrency?: number;
}

/**
 * Viewport configuration
 */
export interface ViewportConfig {
    width: string | number;
    height: string | number;
    initialScale: number;
    minimumScale: number;
    maximumScale: number;
    userScalable: boolean;
    viewportFit: 'auto' | 'contain' | 'cover';
    shrinkToFit: boolean;
}

// ===== RESPONSIVE DESIGN TYPES =====

/**
 * Breakpoint definitions
 */
export interface Breakpoints {
    xs: number; // Extra small devices (phones)
    sm: number; // Small devices (tablets)  
    md: number; // Medium devices (small laptops)
    lg: number; // Large devices (desktops)
    xl: number; // Extra large devices (large desktops)
    xxl: number; // Extra extra large devices (ultra-wide)
}

/**
 * Responsive value that can vary by breakpoint
 */
export type ResponsiveValue<T> = T | {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    xxl?: T;
    base?: T;
};

/**
 * Responsive style properties
 */
export interface ResponsiveStyles {
    display?: ResponsiveValue<CSSProperties['display']>;
    flexDirection?: ResponsiveValue<CSSProperties['flexDirection']>;
    justifyContent?: ResponsiveValue<CSSProperties['justifyContent']>;
    alignItems?: ResponsiveValue<CSSProperties['alignItems']>;
    gridTemplateColumns?: ResponsiveValue<CSSProperties['gridTemplateColumns']>;
    gridTemplateRows?: ResponsiveValue<CSSProperties['gridTemplateRows']>;
    gap?: ResponsiveValue<CSSProperties['gap']>;
    padding?: ResponsiveValue<CSSProperties['padding']>;
    margin?: ResponsiveValue<CSSProperties['margin']>;
    fontSize?: ResponsiveValue<CSSProperties['fontSize']>;
    lineHeight?: ResponsiveValue<CSSProperties['lineHeight']>;
    width?: ResponsiveValue<CSSProperties['width']>;
    height?: ResponsiveValue<CSSProperties['height']>;
    minWidth?: ResponsiveValue<CSSProperties['minWidth']>;
    minHeight?: ResponsiveValue<CSSProperties['minHeight']>;
    maxWidth?: ResponsiveValue<CSSProperties['maxWidth']>;
    maxHeight?: ResponsiveValue<CSSProperties['maxHeight']>;
}

/**
 * Layout configuration for responsive design
 */
export interface ResponsiveLayout {
    breakpoints: Breakpoints;
    containerMaxWidths: Partial<Breakpoints>;
    gridColumns: ResponsiveValue<number>;
    gutterWidth: ResponsiveValue<number>;
    baseLineHeight: number;
    baseFontSize: ResponsiveValue<number>;
    scaleRatio: number;
}

// ===== TOUCH & GESTURE TYPES =====

/**
 * Touch event types
 */
export type TouchEventType = 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pan' | 'pinch' | 'rotate';

/**
 * Swipe direction
 */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Touch gesture configuration
 */
export interface TouchGestureConfig {
    type: TouchEventType;
    enabled: boolean;
    threshold?: number;
    velocity?: number;
    distance?: number;
    duration?: number;
    direction?: SwipeDirection | SwipeDirection[];
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

/**
 * Touch gesture event data
 */
export interface TouchGestureEvent {
    type: TouchEventType;
    direction?: SwipeDirection;
    distance?: number;
    velocity?: number;
    duration?: number;
    deltaX?: number;
    deltaY?: number;
    scale?: number;
    rotation?: number;
    center?: { x: number; y: number };
    target: EventTarget;
    originalEvent: TouchEvent | MouseEvent | PointerEvent;
}

/**
 * Touch area configuration
 */
export interface TouchArea {
    minWidth: number;
    minHeight: number;
    padding: number;
    margin: number;
    accessible: boolean;
    hapticFeedback?: boolean;
}

// ===== PWA TYPES =====

/**
 * PWA manifest configuration
 */
export interface PWAManifest {
    name: string;
    shortName: string;
    description: string;
    startUrl: string;
    display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
    orientation: 'portrait' | 'landscape' | 'any';
    themeColor: string;
    backgroundColor: string;
    categories: string[];
    icons: PWAIcon[];
    screenshots?: PWAScreenshot[];
    shortcuts?: PWAShortcut[];
    relatedApplications?: PWARelatedApp[];
    preferRelatedApplications?: boolean;
    scope?: string;
    lang?: string;
    dir?: 'ltr' | 'rtl' | 'auto';
}

/**
 * PWA icon configuration
 */
export interface PWAIcon {
    src: string;
    sizes: string;
    type: string;
    purpose?: 'maskable' | 'any' | 'monochrome';
}

/**
 * PWA screenshot for app stores
 */
export interface PWAScreenshot {
    src: string;
    sizes: string;
    type: string;
    platform?: 'narrow' | 'wide';
    label?: string;
}

/**
 * PWA shortcut configuration
 */
export interface PWAShortcut {
    name: string;
    shortName?: string;
    description?: string;
    url: string;
    icons?: PWAIcon[];
}

/**
 * Related native app configuration
 */
export interface PWARelatedApp {
    platform: 'play' | 'itunes' | 'windows' | 'chrome_web_store';
    url: string;
    id?: string;
}

/**
 * Service Worker configuration
 */
export interface ServiceWorkerConfig {
    enabled: boolean;
    scriptUrl: string;
    scope?: string;
    updateViaCache: 'imports' | 'all' | 'none';
    skipWaiting: boolean;
    clientsClaim: boolean;
    precacheManifest: string[];
    runtimeCaching: RuntimeCacheConfig[];
    backgroundSync: BackgroundSyncConfig[];
    pushNotifications: PushNotificationConfig;
}

/**
 * Runtime caching strategy
 */
export interface RuntimeCacheConfig {
    urlPattern: string | RegExp;
    handler: 'CacheFirst' | 'NetworkFirst' | 'CacheOnly' | 'NetworkOnly' | 'StaleWhileRevalidate';
    options?: {
        cacheName?: string;
        expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
        };
        cacheKeyWillBeUsed?: string;
        plugins?: any[];
    };
}

/**
 * Background sync configuration
 */
export interface BackgroundSyncConfig {
    name: string;
    options?: {
        maxRetentionTime?: number;
    };
}

/**
 * Push notification configuration
 */
export interface PushNotificationConfig {
    enabled: boolean;
    vapidKeys?: {
        publicKey: string;
        privateKey: string;
    };
    gcmApiKey?: string;
    defaultOptions: NotificationOptions;
}

// ===== PERFORMANCE TYPES =====

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    // Core Web Vitals
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte

    // Additional metrics
    domContentLoaded: number;
    windowLoaded: number;
    firstPaint: number;
    timeToInteractive: number;
    totalBlockingTime: number;

    // Custom metrics
    appLoadTime: number;
    routeChangeTime: number;
    apiResponseTime: number;
    renderTime: number;

    // Memory metrics
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
}

/**
 * Performance optimization configuration
 */
export interface PerformanceConfig {
    lazyLoading: {
        enabled: boolean;
        threshold: number;
        rootMargin: string;
    };
    imageOptimization: {
        enabled: boolean;
        formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
        quality: number;
        responsive: boolean;
    };
    codesplitting: {
        enabled: boolean;
        strategy: 'route' | 'component' | 'vendor';
        threshold: number;
    };
    prefetching: {
        enabled: boolean;
        strategy: 'aggressive' | 'conservative' | 'adaptive';
        connectionAware: boolean;
    };
    caching: {
        enabled: boolean;
        strategies: ('memory' | 'storage' | 'network')[];
        ttl: number;
    };
}

// ===== ACCESSIBILITY TYPES =====

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
    enabled: boolean;
    level: 'A' | 'AA' | 'AAA';
    skipLinks: boolean;
    focusManagement: boolean;
    screenReaderSupport: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    keyboardNavigation: boolean;
    ariaLabels: boolean;
    colorContrastRatio: number;
    fontSize: {
        scalable: boolean;
        minSize: number;
        maxSize: number;
    };
}

/**
 * Focus management configuration
 */
export interface FocusConfig {
    trapFocus: boolean;
    restoreFocus: boolean;
    autoFocus: boolean;
    skipToContent: boolean;
    focusVisible: boolean;
    customFocusStyles: boolean;
}

// ===== COMPONENT TYPES =====

/**
 * Mobile-optimized component props
 */
export interface MobileComponentProps {
    responsive?: ResponsiveStyles;
    touchOptimized?: boolean;
    touchArea?: Partial<TouchArea>;
    gestures?: TouchGestureConfig[];
    accessibility?: Partial<AccessibilityConfig>;
    performance?: Partial<PerformanceConfig>;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}

/**
 * Responsive container props
 */
export interface ResponsiveContainerProps extends MobileComponentProps {
    maxWidth?: ResponsiveValue<string | number>;
    padding?: ResponsiveValue<string | number>;
    margin?: ResponsiveValue<string | number>;
    center?: boolean;
    fluid?: boolean;
}

/**
 * Mobile navigation props
 */
export interface MobileNavigationProps extends MobileComponentProps {
    items: NavigationItem[];
    orientation?: 'horizontal' | 'vertical';
    variant?: 'tabs' | 'drawer' | 'bottom' | 'top';
    collapsible?: boolean;
    swipeable?: boolean;
    activeIndex?: number;
    onItemSelect?: (item: NavigationItem, index: number) => void;
}

/**
 * Navigation item configuration
 */
export interface NavigationItem {
    id: string;
    label: string;
    icon?: string | ComponentType;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
    children?: NavigationItem[];
}

/**
 * Mobile modal props
 */
export interface MobileModalProps extends MobileComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: ResponsiveValue<'small' | 'medium' | 'large' | 'full'>;
    position?: 'center' | 'bottom' | 'top' | 'full';
    overlay?: boolean;
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
    swipeToClose?: boolean;
    animation?: 'slide' | 'fade' | 'scale' | 'none';
}

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
    enabled: boolean;
    itemHeight: number | ((index: number) => number);
    overscan: number;
    threshold: number;
    estimatedItemHeight?: number;
    scrollingResetTimeInterval?: number;
}

// ===== OPTIMIZATION ENGINE TYPES =====

/**
 * Mobile optimization engine configuration
 */
export interface MobileOptimizationConfig {
    deviceDetection: {
        enabled: boolean;
        updateInterval: number;
        persistSettings: boolean;
    };
    responsiveDesign: ResponsiveLayout;
    touchInterface: {
        enabled: boolean;
        gestures: TouchGestureConfig[];
        touchAreas: TouchArea;
    };
    pwa: {
        enabled: boolean;
        manifest: PWAManifest;
        serviceWorker: ServiceWorkerConfig;
    };
    performance: PerformanceConfig;
    accessibility: AccessibilityConfig;
    analytics: {
        enabled: boolean;
        trackingId?: string;
        customEvents: string[];
    };
}

/**
 * Optimization result
 */
export interface OptimizationResult {
    success: boolean;
    optimizations: string[];
    metrics: PerformanceMetrics;
    recommendations: string[];
    warnings: string[];
    errors: string[];
    metadata: {
        optimizationTime: number;
        version: string;
        timestamp: Date;
        deviceInfo: DeviceCapabilities;
    };
}

/**
 * Mobile optimization engine
 */
export interface MobileOptimizationEngine {
    config: MobileOptimizationConfig;
    deviceCapabilities: DeviceCapabilities;

    // Core methods
    initialize(): Promise<void>;
    optimize(): Promise<OptimizationResult>;
    getDeviceInfo(): DeviceCapabilities;
    updateConfig(config: Partial<MobileOptimizationConfig>): void;

    // Responsive design methods
    getCurrentBreakpoint(): keyof Breakpoints;
    isBreakpoint(breakpoint: keyof Breakpoints): boolean;
    getResponsiveValue<T>(value: ResponsiveValue<T>): T;

    // Performance methods
    measurePerformance(): Promise<PerformanceMetrics>;
    optimizeImages(): Promise<void>;
    enableLazyLoading(): Promise<void>;

    // PWA methods
    installServiceWorker(): Promise<boolean>;
    updateManifest(manifest: Partial<PWAManifest>): void;
    showInstallPrompt(): Promise<boolean>;

    // Touch methods
    registerGesture(config: TouchGestureConfig): void;
    unregisterGesture(type: TouchEventType): void;

    // Accessibility methods
    enableAccessibility(): void;
    checkContrast(): Promise<boolean>;

    // Events
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
}

// ===== HOOKS TYPES =====

/**
 * Device detection hook result
 */
export interface UseDeviceResult {
    device: DeviceCapabilities;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    orientation: ScreenOrientation;
    breakpoint: keyof Breakpoints;
    isTouch: boolean;
}

/**
 * Responsive value hook result
 */
export interface UseResponsiveResult<T> {
    value: T;
    breakpoint: keyof Breakpoints;
    isLoading: boolean;
}

/**
 * Performance hook result
 */
export interface UsePerformanceResult {
    metrics: PerformanceMetrics | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => void;
}

/**
 * PWA hook result
 */
export interface UsePWAResult {
    isInstallable: boolean;
    isInstalled: boolean;
    isOffline: boolean;
    install: () => Promise<boolean>;
    update: () => Promise<boolean>;
}

// ===== UTILITY TYPES =====

/**
 * Media query configuration
 */
export interface MediaQuery {
    query: string;
    matches: boolean;
}

/**
 * Viewport observer configuration
 */
export interface ViewportObserverConfig {
    threshold: number | number[];
    rootMargin: string;
    root?: Element | null;
}

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    lazy?: boolean;
    responsive?: boolean;
    placeholder?: 'blur' | 'empty';
    priority?: boolean;
}

/**
 * Bundle analysis result
 */
export interface BundleAnalysis {
    totalSize: number;
    gzippedSize: number;
    chunks: ChunkInfo[];
    dependencies: DependencyInfo[];
    suggestions: string[];
}

/**
 * Chunk information
 */
export interface ChunkInfo {
    name: string;
    size: number;
    gzippedSize: number;
    modules: string[];
}

/**
 * Dependency information
 */
export interface DependencyInfo {
    name: string;
    version: string;
    size: number;
    usage: number;
    redundant: boolean;
}

// ===== ERROR TYPES =====

/**
 * Mobile optimization error
 */
export class MobileOptimizationError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: any
    ) {
        super(message);
        this.name = 'MobileOptimizationError';
    }
}

/**
 * Performance optimization error
 */
export class PerformanceOptimizationError extends MobileOptimizationError {
    constructor(message: string, context?: any) {
        super(message, 'PERFORMANCE_ERROR', context);
        this.name = 'PerformanceOptimizationError';
    }
}

/**
 * PWA configuration error
 */
export class PWAConfigurationError extends MobileOptimizationError {
    constructor(message: string, context?: any) {
        super(message, 'PWA_ERROR', context);
        this.name = 'PWAConfigurationError';
    }
}

/**
 * Responsive design error
 */
export class ResponsiveDesignError extends MobileOptimizationError {
    constructor(message: string, context?: any) {
        super(message, 'RESPONSIVE_ERROR', context);
        this.name = 'ResponsiveDesignError';
    }
}

// ===== EXPORT TYPES =====

export * from './components';
export * from './hooks';
export * from './utils';
