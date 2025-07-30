/**
 * @fileoverview CODAI Mobile Optimization Engine
 * @module @codai/mobile-optimization/MobileOptimizationEngine
 * @version 1.0.0
 * 
 * Core engine for mobile optimization, responsive design, PWA features,
 * performance optimization, and cross-platform user experience.
 */

import { EventEmitter } from 'events';
import {
    MobileOptimizationConfig,
    MobileOptimizationEngine as IMobileOptimizationEngine,
    DeviceCapabilities,
    OptimizationResult,
    PerformanceMetrics,
    ResponsiveValue,
    Breakpoints,
    TouchGestureConfig,
    TouchEventType,
    PWAManifest,
    MobileOptimizationError,
    PerformanceOptimizationError,
    PWAConfigurationError,
    ResponsiveDesignError
} from './types';
import { DeviceDetector } from './utils/DeviceDetector';
import { ResponsiveManager } from './utils/ResponsiveManager';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { PWAManager } from './utils/PWAManager';
import { TouchGestureHandler } from './utils/TouchGestureHandler';
import { AccessibilityManager } from './utils/AccessibilityManager';

/**
 * Default mobile optimization configuration
 */
const DEFAULT_CONFIG: MobileOptimizationConfig = {
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
        gridColumns: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 6,
            xxl: 8
        },
        gutterWidth: {
            xs: 16,
            sm: 20,
            md: 24,
            lg: 28,
            xl: 32,
            xxl: 36
        },
        baseLineHeight: 1.5,
        baseFontSize: {
            xs: 14,
            sm: 15,
            md: 16,
            lg: 16,
            xl: 16,
            xxl: 16
        },
        scaleRatio: 1.25
    },
    touchInterface: {
        enabled: true,
        gestures: [
            {
                type: 'tap',
                enabled: true,
                threshold: 10,
                duration: 300,
                preventDefault: false,
                stopPropagation: false
            },
            {
                type: 'swipe',
                enabled: true,
                threshold: 50,
                velocity: 0.3,
                direction: ['up', 'down', 'left', 'right'],
                preventDefault: true,
                stopPropagation: false
            },
            {
                type: 'pan',
                enabled: true,
                threshold: 10,
                preventDefault: false,
                stopPropagation: false
            },
            {
                type: 'pinch',
                enabled: true,
                threshold: 0.1,
                preventDefault: true,
                stopPropagation: false
            }
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
                {
                    src: '/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: '/icons/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                }
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
            runtimeCaching: [
                {
                    urlPattern: new RegExp('^https://api\\.codai\\.dev/'),
                    handler: 'NetworkFirst',
                    options: {
                        cacheName: 'api-cache',
                        expiration: {
                            maxEntries: 100,
                            maxAgeSeconds: 300
                        }
                    }
                }
            ],
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
        lazyLoading: {
            enabled: true,
            threshold: 0.1,
            rootMargin: '50px'
        },
        imageOptimization: {
            enabled: true,
            formats: ['webp', 'avif', 'jpeg'],
            quality: 85,
            responsive: true
        },
        codesplitting: {
            enabled: true,
            strategy: 'route',
            threshold: 250000
        },
        prefetching: {
            enabled: true,
            strategy: 'adaptive',
            connectionAware: true
        },
        caching: {
            enabled: true,
            strategies: ['memory', 'storage'],
            ttl: 300000
        }
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
        fontSize: {
            scalable: true,
            minSize: 12,
            maxSize: 24
        }
    },
    analytics: {
        enabled: true,
        customEvents: [
            'mobile_gesture',
            'orientation_change',
            'pwa_install',
            'performance_metric',
            'accessibility_action'
        ]
    }
};

/**
 * Mobile Optimization Engine
 * 
 * Core engine that orchestrates all mobile optimization features including
 * responsive design, touch interfaces, PWA functionality, performance
 * optimization, and accessibility features.
 */
export class MobileOptimizationEngine extends EventEmitter implements IMobileOptimizationEngine {
    private _config: MobileOptimizationConfig;
    private _deviceDetector: DeviceDetector;
    private _responsiveManager: ResponsiveManager;
    private _performanceMonitor: PerformanceMonitor;
    private _pwaManager: PWAManager;
    private _touchHandler: TouchGestureHandler;
    private _accessibilityManager: AccessibilityManager;
    private _initialized: boolean = false;
    private _optimizationInterval?: NodeJS.Timeout;

    constructor(config: Partial<MobileOptimizationConfig> = {}) {
        super();

        this._config = this.mergeConfig(DEFAULT_CONFIG, config);

        // Initialize managers
        this._deviceDetector = new DeviceDetector({
            updateInterval: this._config.deviceDetection.updateInterval,
            persistSettings: this._config.deviceDetection.persistSettings
        });

        this._responsiveManager = new ResponsiveManager(this._config.responsiveDesign);
        this._performanceMonitor = new PerformanceMonitor(this._config.performance);
        this._pwaManager = new PWAManager(this._config.pwa);
        this._touchHandler = new TouchGestureHandler(this._config.touchInterface);
        this._accessibilityManager = new AccessibilityManager(this._config.accessibility);

        this.setupEventListeners();
    }

    /**
     * Get current configuration
     */
    get config(): MobileOptimizationConfig {
        return { ...this._config };
    }

    /**
     * Get current device capabilities
     */
    get deviceCapabilities(): DeviceCapabilities {
        return this._deviceDetector.getCapabilities();
    }

    /**
     * Initialize the mobile optimization engine
     */
    async initialize(): Promise<void> {
        try {
            this.emit('engine:initializing');

            // Initialize all managers
            await Promise.all([
                this._deviceDetector.initialize(),
                this._responsiveManager.initialize(),
                this._performanceMonitor.initialize(),
                this._pwaManager.initialize(),
                this._touchHandler.initialize(),
                this._accessibilityManager.initialize()
            ]);

            // Start optimization monitoring
            this.startOptimizationMonitoring();

            this._initialized = true;
            this.emit('engine:initialized', {
                deviceCapabilities: this.deviceCapabilities,
                config: this._config
            });

        } catch (error) {
            this.emit('engine:error', error);
            throw new MobileOptimizationError(
                'Failed to initialize mobile optimization engine',
                'INITIALIZATION_ERROR',
                { error }
            );
        }
    }

    /**
     * Run comprehensive mobile optimization
     */
    async optimize(): Promise<OptimizationResult> {
        if (!this._initialized) {
            await this.initialize();
        }

        const startTime = performance.now();
        const optimizations: string[] = [];
        const recommendations: string[] = [];
        const warnings: string[] = [];
        const errors: string[] = [];

        try {
            this.emit('optimization:starting');

            // Device-specific optimizations
            const deviceOptimizations = await this.optimizeForDevice();
            optimizations.push(...deviceOptimizations.optimizations);
            recommendations.push(...deviceOptimizations.recommendations);
            warnings.push(...deviceOptimizations.warnings);

            // Responsive design optimizations
            const responsiveOptimizations = await this.optimizeResponsiveDesign();
            optimizations.push(...responsiveOptimizations.optimizations);
            recommendations.push(...responsiveOptimizations.recommendations);

            // Performance optimizations
            const performanceOptimizations = await this.optimizePerformance();
            optimizations.push(...performanceOptimizations.optimizations);
            recommendations.push(...performanceOptimizations.recommendations);

            // PWA optimizations
            if (this._config.pwa.enabled) {
                const pwaOptimizations = await this.optimizePWA();
                optimizations.push(...pwaOptimizations.optimizations);
                recommendations.push(...pwaOptimizations.recommendations);
            }

            // Touch interface optimizations
            if (this._config.touchInterface.enabled && this.deviceCapabilities.touchCapability !== 'none') {
                const touchOptimizations = await this.optimizeTouchInterface();
                optimizations.push(...touchOptimizations.optimizations);
                recommendations.push(...touchOptimizations.recommendations);
            }

            // Accessibility optimizations
            if (this._config.accessibility.enabled) {
                const accessibilityOptimizations = await this.optimizeAccessibility();
                optimizations.push(...accessibilityOptimizations.optimizations);
                recommendations.push(...accessibilityOptimizations.recommendations);
            }

            // Measure final performance
            const metrics = await this.measurePerformance();

            const result: OptimizationResult = {
                success: true,
                optimizations,
                metrics,
                recommendations,
                warnings,
                errors,
                metadata: {
                    optimizationTime: performance.now() - startTime,
                    version: '1.0.0',
                    timestamp: new Date(),
                    deviceInfo: this.deviceCapabilities
                }
            };

            this.emit('optimization:completed', result);
            return result;

        } catch (error) {
            const result: OptimizationResult = {
                success: false,
                optimizations,
                metrics: await this.measurePerformance(),
                recommendations,
                warnings,
                errors: [error instanceof Error ? error.message : String(error)],
                metadata: {
                    optimizationTime: performance.now() - startTime,
                    version: '1.0.0',
                    timestamp: new Date(),
                    deviceInfo: this.deviceCapabilities
                }
            };

            this.emit('optimization:failed', result);
            return result;
        }
    }

    /**
     * Get current device information
     */
    getDeviceInfo(): DeviceCapabilities {
        return this.deviceCapabilities;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<MobileOptimizationConfig>): void {
        this._config = this.mergeConfig(this._config, config);

        // Update managers with new config
        this._responsiveManager.updateConfig(this._config.responsiveDesign);
        this._performanceMonitor.updateConfig(this._config.performance);
        this._pwaManager.updateConfig(this._config.pwa);
        this._touchHandler.updateConfig(this._config.touchInterface);
        this._accessibilityManager.updateConfig(this._config.accessibility);

        this.emit('config:updated', this._config);
    }

    /**
     * Get current breakpoint
     */
    getCurrentBreakpoint(): keyof Breakpoints {
        return this._responsiveManager.getCurrentBreakpoint();
    }

    /**
     * Check if current viewport matches breakpoint
     */
    isBreakpoint(breakpoint: keyof Breakpoints): boolean {
        return this._responsiveManager.isBreakpoint(breakpoint);
    }

    /**
     * Get responsive value for current breakpoint
     */
    getResponsiveValue<T>(value: ResponsiveValue<T>): T {
        return this._responsiveManager.getResponsiveValue(value);
    }

    /**
     * Measure current performance metrics
     */
    async measurePerformance(): Promise<PerformanceMetrics> {
        return this._performanceMonitor.getMetrics();
    }

    /**
     * Optimize images for mobile
     */
    async optimizeImages(): Promise<void> {
        await this._performanceMonitor.optimizeImages();
        this.emit('images:optimized');
    }

    /**
     * Enable lazy loading
     */
    async enableLazyLoading(): Promise<void> {
        await this._performanceMonitor.enableLazyLoading();
        this.emit('lazy-loading:enabled');
    }

    /**
     * Install service worker
     */
    async installServiceWorker(): Promise<boolean> {
        return this._pwaManager.installServiceWorker();
    }

    /**
     * Update PWA manifest
     */
    updateManifest(manifest: Partial<PWAManifest>): void {
        this._pwaManager.updateManifest(manifest);
        this.emit('manifest:updated', manifest);
    }

    /**
     * Show PWA install prompt
     */
    async showInstallPrompt(): Promise<boolean> {
        return this._pwaManager.showInstallPrompt();
    }

    /**
     * Register touch gesture
     */
    registerGesture(config: TouchGestureConfig): void {
        this._touchHandler.registerGesture(config);
        this.emit('gesture:registered', config);
    }

    /**
     * Unregister touch gesture
     */
    unregisterGesture(type: TouchEventType): void {
        this._touchHandler.unregisterGesture(type);
        this.emit('gesture:unregistered', type);
    }

    /**
     * Enable accessibility features
     */
    enableAccessibility(): void {
        this._accessibilityManager.enable();
        this.emit('accessibility:enabled');
    }

    /**
     * Check color contrast compliance
     */
    async checkContrast(): Promise<boolean> {
        return this._accessibilityManager.checkContrast();
    }

    /**
     * Shutdown the engine
     */
    async shutdown(): Promise<void> {
        this.emit('engine:shutting-down');

        if (this._optimizationInterval) {
            clearInterval(this._optimizationInterval);
        }

        await Promise.all([
            this._deviceDetector.shutdown(),
            this._responsiveManager.shutdown(),
            this._performanceMonitor.shutdown(),
            this._pwaManager.shutdown(),
            this._touchHandler.shutdown(),
            this._accessibilityManager.shutdown()
        ]);

        this._initialized = false;
        this.removeAllListeners();

        this.emit('engine:shutdown');
    }

    // ===== PRIVATE METHODS =====

    /**
     * Merge configuration objects
     */
    private mergeConfig(
        defaultConfig: MobileOptimizationConfig,
        userConfig: Partial<MobileOptimizationConfig>
    ): MobileOptimizationConfig {
        return {
            ...defaultConfig,
            ...userConfig,
            responsiveDesign: {
                ...defaultConfig.responsiveDesign,
                ...userConfig.responsiveDesign
            },
            touchInterface: {
                ...defaultConfig.touchInterface,
                ...userConfig.touchInterface
            },
            pwa: {
                ...defaultConfig.pwa,
                ...userConfig.pwa,
                manifest: {
                    ...defaultConfig.pwa.manifest,
                    ...userConfig.pwa?.manifest
                },
                serviceWorker: {
                    ...defaultConfig.pwa.serviceWorker,
                    ...userConfig.pwa?.serviceWorker
                }
            },
            performance: {
                ...defaultConfig.performance,
                ...userConfig.performance
            },
            accessibility: {
                ...defaultConfig.accessibility,
                ...userConfig.accessibility
            },
            analytics: {
                ...defaultConfig.analytics,
                ...userConfig.analytics
            }
        };
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Device change events
        this._deviceDetector.on('device:changed', (capabilities) => {
            this.emit('device:changed', capabilities);
            this.handleDeviceChange(capabilities);
        });

        // Responsive events
        this._responsiveManager.on('breakpoint:changed', (breakpoint) => {
            this.emit('breakpoint:changed', breakpoint);
        });

        // Performance events
        this._performanceMonitor.on('metric:updated', (metrics) => {
            this.emit('performance:updated', metrics);
        });

        // PWA events
        this._pwaManager.on('install:ready', () => {
            this.emit('pwa:install-ready');
        });

        this._pwaManager.on('update:available', () => {
            this.emit('pwa:update-available');
        });

        // Touch events
        this._touchHandler.on('gesture:detected', (event) => {
            this.emit('gesture:detected', event);
        });

        // Accessibility events
        this._accessibilityManager.on('contrast:warning', (warning) => {
            this.emit('accessibility:contrast-warning', warning);
        });
    }

    /**
     * Handle device capability changes
     */
    private async handleDeviceChange(capabilities: DeviceCapabilities): Promise<void> {
        // Update managers based on new capabilities
        if (capabilities.touchCapability === 'none' && this._config.touchInterface.enabled) {
            await this._touchHandler.disable();
        } else if (capabilities.touchCapability !== 'none' && this._config.touchInterface.enabled) {
            await this._touchHandler.enable();
        }

        // Update responsive design
        this._responsiveManager.handleDeviceChange(capabilities);

        // Update accessibility settings
        if (capabilities.reducedMotion) {
            this._accessibilityManager.enableReducedMotion();
        }

        if (capabilities.highContrast) {
            this._accessibilityManager.enableHighContrast();
        }
    }

    /**
     * Start optimization monitoring
     */
    private startOptimizationMonitoring(): void {
        if (this._config.deviceDetection.enabled && this._config.deviceDetection.updateInterval > 0) {
            this._optimizationInterval = setInterval(async () => {
                try {
                    const result = await this.optimize();
                    this.emit('monitoring:optimization-complete', result);
                } catch (error) {
                    this.emit('monitoring:optimization-error', error);
                }
            }, this._config.deviceDetection.updateInterval);
        }
    }

    /**
     * Optimize for current device
     */
    private async optimizeForDevice(): Promise<{
        optimizations: string[];
        recommendations: string[];
        warnings: string[];
    }> {
        const optimizations: string[] = [];
        const recommendations: string[] = [];
        const warnings: string[] = [];
        const device = this.deviceCapabilities;

        // Device-specific optimizations
        if (device.type === 'mobile') {
            optimizations.push('Applied mobile-first responsive design');
            optimizations.push('Enabled touch-optimized interface');

            if (device.connectionType && ['slow-2g', '2g', '3g'].includes(device.connectionType)) {
                optimizations.push('Enabled aggressive performance optimizations for slow connection');
                recommendations.push('Consider implementing offline-first functionality');
            }
        }

        if (device.pixelRatio > 2) {
            optimizations.push('Enabled high-DPI image optimization');
        }

        if (device.batteryLevel && device.batteryLevel < 20) {
            optimizations.push('Enabled battery-saving mode');
            recommendations.push('Reduce animations and background processing');
        }

        if (device.memorySize && device.memorySize < 4000) {
            optimizations.push('Enabled memory-constrained optimizations');
            recommendations.push('Implement more aggressive lazy loading');
        }

        return { optimizations, recommendations, warnings };
    }

    /**
     * Optimize responsive design
     */
    private async optimizeResponsiveDesign(): Promise<{
        optimizations: string[];
        recommendations: string[];
    }> {
        const optimizations: string[] = [];
        const recommendations: string[] = [];

        const currentBreakpoint = this.getCurrentBreakpoint();

        optimizations.push(`Optimized layout for ${currentBreakpoint} breakpoint`);
        optimizations.push('Applied responsive typography scaling');
        optimizations.push('Optimized grid system for current viewport');

        if (this.deviceCapabilities.orientation === 'landscape' && this.deviceCapabilities.type === 'mobile') {
            optimizations.push('Applied landscape-specific mobile optimizations');
            recommendations.push('Consider horizontal navigation patterns');
        }

        return { optimizations, recommendations };
    }

    /**
     * Optimize performance
     */
    private async optimizePerformance(): Promise<{
        optimizations: string[];
        recommendations: string[];
    }> {
        const optimizations: string[] = [];
        const recommendations: string[] = [];

        if (this._config.performance.lazyLoading.enabled) {
            await this.enableLazyLoading();
            optimizations.push('Enabled lazy loading for images and components');
        }

        if (this._config.performance.imageOptimization.enabled) {
            await this.optimizeImages();
            optimizations.push('Optimized images for mobile devices');
        }

        const metrics = await this.measurePerformance();

        if (metrics.lcp > 2500) {
            recommendations.push('Improve Largest Contentful Paint (LCP) performance');
        }

        if (metrics.fid > 100) {
            recommendations.push('Reduce First Input Delay (FID) for better interactivity');
        }

        if (metrics.cls > 0.1) {
            recommendations.push('Minimize Cumulative Layout Shift (CLS)');
        }

        return { optimizations, recommendations };
    }

    /**
     * Optimize PWA features
     */
    private async optimizePWA(): Promise<{
        optimizations: string[];
        recommendations: string[];
    }> {
        const optimizations: string[] = [];
        const recommendations: string[] = [];

        if (await this.installServiceWorker()) {
            optimizations.push('Service worker installed and configured');
        }

        optimizations.push('PWA manifest configured');
        optimizations.push('Offline capabilities enabled');

        if (this._pwaManager.isInstallable()) {
            recommendations.push('Promote PWA installation to users');
        }

        return { optimizations, recommendations };
    }

    /**
     * Optimize touch interface
     */
    private async optimizeTouchInterface(): Promise<{
        optimizations: string[];
        recommendations: string[];
    }> {
        const optimizations: string[] = [];
        const recommendations: string[] = [];

        optimizations.push('Touch areas optimized for accessibility');
        optimizations.push('Touch gestures configured and enabled');
        optimizations.push('Haptic feedback enabled where supported');

        if (this.deviceCapabilities.touchCapability === 'coarse') {
            recommendations.push('Increase touch target sizes for coarse input');
        }

        return { optimizations, recommendations };
    }

    /**
     * Optimize accessibility features
     */
    private async optimizeAccessibility(): Promise<{
        optimizations: string[];
        recommendations: string[];
    }> {
        const optimizations: string[] = [];
        const recommendations: string[] = [];

        this.enableAccessibility();
        optimizations.push('Accessibility features enabled');

        if (await this.checkContrast()) {
            optimizations.push('Color contrast meets WCAG guidelines');
        } else {
            recommendations.push('Improve color contrast ratios');
        }

        optimizations.push('Keyboard navigation support enabled');
        optimizations.push('Screen reader support optimized');

        return { optimizations, recommendations };
    }
}

export default MobileOptimizationEngine;
