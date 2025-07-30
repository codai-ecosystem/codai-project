/**
 * @fileoverview CODAI Device Detector
 * @module @codai/mobile-optimization/utils/DeviceDetector
 * @version 1.0.0
 * 
 * Advanced device detection and capability analysis for mobile optimization.
 */

import { EventEmitter } from 'events';
import {
    DeviceCapabilities,
    DeviceType,
    ScreenOrientation,
    TouchCapability,
    MobileOptimizationError
} from '../types';

/**
 * Device Detector Configuration
 */
interface DeviceDetectorConfig {
    updateInterval: number;
    persistSettings: boolean;
    enableNetworkInfo?: boolean;
    enableBatteryInfo?: boolean;
    enableMemoryInfo?: boolean;
}

/**
 * Device Detector
 * 
 * Detects and monitors device capabilities including screen size, orientation,
 * touch support, network conditions, battery status, and hardware capabilities.
 */
export class DeviceDetector extends EventEmitter {
    private _config: DeviceDetectorConfig;
    private _capabilities: DeviceCapabilities;
    private _updateInterval?: NodeJS.Timeout;
    private _orientationChangeListener?: () => void;
    private _visibilityChangeListener?: () => void;
    private _networkChangeListener?: () => void;
    private _initialized: boolean = false;

    constructor(config: DeviceDetectorConfig) {
        super();
        this._config = { ...config };
        this._capabilities = this.getInitialCapabilities();
    }

    /**
     * Initialize device detector
     */
    async initialize(): Promise<void> {
        if (typeof window === 'undefined') {
            throw new MobileOptimizationError(
                'DeviceDetector requires browser environment',
                'BROWSER_REQUIRED'
            );
        }

        try {
            // Get initial capabilities
            this._capabilities = await this.detectCapabilities();

            // Setup event listeners
            this.setupEventListeners();

            // Start monitoring if enabled
            if (this._config.updateInterval > 0) {
                this.startMonitoring();
            }

            // Persist settings if enabled
            if (this._config.persistSettings) {
                this.saveCapabilities();
            }

            this._initialized = true;
            this.emit('device:initialized', this._capabilities);

        } catch (error) {
            throw new MobileOptimizationError(
                'Failed to initialize device detector',
                'INITIALIZATION_ERROR',
                { error }
            );
        }
    }

    /**
     * Get current device capabilities
     */
    getCapabilities(): DeviceCapabilities {
        return { ...this._capabilities };
    }

    /**
     * Update device capabilities
     */
    async updateCapabilities(): Promise<DeviceCapabilities> {
        const previousCapabilities = { ...this._capabilities };
        this._capabilities = await this.detectCapabilities();

        // Check for changes
        if (this.hasCapabilitiesChanged(previousCapabilities, this._capabilities)) {
            this.emit('device:changed', this._capabilities);

            if (this._config.persistSettings) {
                this.saveCapabilities();
            }
        }

        return this._capabilities;
    }

    /**
     * Check if device is mobile
     */
    isMobile(): boolean {
        return this._capabilities.type === 'mobile';
    }

    /**
     * Check if device is tablet
     */
    isTablet(): boolean {
        return this._capabilities.type === 'tablet';
    }

    /**
     * Check if device is desktop
     */
    isDesktop(): boolean {
        return this._capabilities.type === 'desktop';
    }

    /**
     * Check if device has touch capability
     */
    hasTouch(): boolean {
        return this._capabilities.touchCapability !== 'none';
    }

    /**
     * Check if device supports hover
     */
    hasHover(): boolean {
        return this._capabilities.hasHover;
    }

    /**
     * Check if device is in portrait orientation
     */
    isPortrait(): boolean {
        return this._capabilities.orientation === 'portrait';
    }

    /**
     * Check if device is in landscape orientation
     */
    isLandscape(): boolean {
        return this._capabilities.orientation === 'landscape';
    }

    /**
     * Check if user prefers reduced motion
     */
    prefersReducedMotion(): boolean {
        return this._capabilities.reducedMotion;
    }

    /**
     * Check if user prefers high contrast
     */
    prefersHighContrast(): boolean {
        return this._capabilities.highContrast;
    }

    /**
     * Get network information
     */
    getNetworkInfo(): {
        type?: string;
        speed?: string;
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
    } {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            return {
                type: connection.type,
                speed: this._capabilities.connectionSpeed,
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            };
        }
        return {};
    }

    /**
     * Get battery information
     */
    async getBatteryInfo(): Promise<{
        level?: number;
        charging?: boolean;
        chargingTime?: number;
        dischargingTime?: number;
    }> {
        try {
            if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
                const battery = await (navigator as any).getBattery();
                return {
                    level: battery.level * 100,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }
        } catch (error) {
            // Battery API might not be available
        }

        return {
            level: this._capabilities.batteryLevel,
            charging: this._capabilities.isCharging
        };
    }

    /**
     * Get memory information
     */
    getMemoryInfo(): {
        deviceMemory?: number;
        usedJSHeapSize?: number;
        totalJSHeapSize?: number;
        jsHeapSizeLimit?: number;
    } {
        const info: any = {};

        // Device memory (if available)
        if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
            info.deviceMemory = (navigator as any).deviceMemory;
        }

        // JavaScript heap size (if available)
        if (typeof performance !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory;
            info.usedJSHeapSize = memory.usedJSHeapSize;
            info.totalJSHeapSize = memory.totalJSHeapSize;
            info.jsHeapSizeLimit = memory.jsHeapSizeLimit;
        }

        return info;
    }

    /**
     * Shutdown device detector
     */
    async shutdown(): Promise<void> {
        // Stop monitoring
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }

        // Remove event listeners
        this.removeEventListeners();

        this._initialized = false;
        this.emit('device:shutdown');
    }

    // ===== PRIVATE METHODS =====

    /**
     * Get initial capabilities (synchronous)
     */
    private getInitialCapabilities(): DeviceCapabilities {
        if (typeof window === 'undefined') {
            return {
                type: 'desktop',
                screenWidth: 1920,
                screenHeight: 1080,
                viewportWidth: 1920,
                viewportHeight: 1080,
                pixelRatio: 1,
                orientation: 'landscape',
                touchCapability: 'none',
                hasHover: true,
                hasCursor: true,
                reducedMotion: false,
                highContrast: false,
                colorScheme: 'light'
            };
        }

        return {
            type: this.detectDeviceType(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: this.detectOrientation(),
            touchCapability: this.detectTouchCapability(),
            hasHover: this.detectHoverCapability(),
            hasCursor: this.detectCursorCapability(),
            reducedMotion: this.detectReducedMotion(),
            highContrast: this.detectHighContrast(),
            colorScheme: this.detectColorScheme()
        };
    }

    /**
     * Detect comprehensive device capabilities
     */
    private async detectCapabilities(): Promise<DeviceCapabilities> {
        const capabilities = this.getInitialCapabilities();

        // Enhanced detection
        capabilities.connectionType = this.detectConnectionType();
        capabilities.connectionSpeed = this.detectConnectionSpeed();

        // Battery info (if available and enabled)
        if (this._config.enableBatteryInfo) {
            const batteryInfo = await this.getBatteryInfo();
            capabilities.batteryLevel = batteryInfo.level;
            capabilities.isCharging = batteryInfo.charging;
        }

        // Memory info (if available and enabled)
        if (this._config.enableMemoryInfo) {
            const memoryInfo = this.getMemoryInfo();
            capabilities.memorySize = memoryInfo.deviceMemory;
        }

        // Hardware concurrency
        if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
            capabilities.hardwareConcurrency = navigator.hardwareConcurrency;
        }

        return capabilities;
    }

    /**
     * Detect device type
     */
    private detectDeviceType(): DeviceType {
        if (typeof window === 'undefined') return 'desktop';

        const userAgent = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;

        // Check user agent patterns
        if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            return 'mobile';
        }

        if (/tablet|ipad|android(?!.*mobile)/i.test(userAgent)) {
            return 'tablet';
        }

        // Check screen size
        if (width <= 768) {
            return 'mobile';
        } else if (width <= 1024) {
            return 'tablet';
        }

        // Check for TV indicators
        if (/tv|smarttv|googletv|appletv|hbbtv|netcast/i.test(userAgent)) {
            return 'tv';
        }

        return 'desktop';
    }

    /**
     * Detect screen orientation
     */
    private detectOrientation(): ScreenOrientation {
        if (typeof window === 'undefined') return 'landscape';

        if (window.innerHeight > window.innerWidth) {
            return 'portrait';
        }

        return 'landscape';
    }

    /**
     * Detect touch capability
     */
    private detectTouchCapability(): TouchCapability {
        if (typeof window === 'undefined') return 'none';

        // Check for touch events support
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            // Determine precision
            if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
                return 'coarse';
            } else if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
                return 'fine';
            }

            // Default to coarse for touch devices
            return 'coarse';
        }

        return 'none';
    }

    /**
     * Detect hover capability
     */
    private detectHoverCapability(): boolean {
        if (typeof window === 'undefined') return true;

        if (window.matchMedia) {
            return window.matchMedia('(hover: hover)').matches;
        }

        // Fallback: assume no hover for touch devices
        return this.detectTouchCapability() === 'none';
    }

    /**
     * Detect cursor capability
     */
    private detectCursorCapability(): boolean {
        if (typeof window === 'undefined') return true;

        if (window.matchMedia) {
            return window.matchMedia('(pointer: fine)').matches;
        }

        return true;
    }

    /**
     * Detect reduced motion preference
     */
    private detectReducedMotion(): boolean {
        if (typeof window === 'undefined') return false;

        if (window.matchMedia) {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        return false;
    }

    /**
     * Detect high contrast preference
     */
    private detectHighContrast(): boolean {
        if (typeof window === 'undefined') return false;

        if (window.matchMedia) {
            return window.matchMedia('(prefers-contrast: high)').matches;
        }

        return false;
    }

    /**
     * Detect color scheme preference
     */
    private detectColorScheme(): 'light' | 'dark' | 'auto' {
        if (typeof window === 'undefined') return 'light';

        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }

        return 'light';
    }

    /**
     * Detect connection type
     */
    private detectConnectionType(): string | undefined {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            return connection.effectiveType || connection.type;
        }

        return undefined;
    }

    /**
     * Detect connection speed
     */
    private detectConnectionSpeed(): 'slow' | 'medium' | 'fast' | undefined {
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            const effectiveType = connection.effectiveType;

            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                return 'slow';
            } else if (effectiveType === '3g') {
                return 'medium';
            } else if (effectiveType === '4g' || effectiveType === '5g') {
                return 'fast';
            }
        }

        return undefined;
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        if (typeof window === 'undefined') return;

        // Orientation change
        this._orientationChangeListener = () => {
            setTimeout(() => this.updateCapabilities(), 100);
        };
        window.addEventListener('orientationchange', this._orientationChangeListener);
        window.addEventListener('resize', this._orientationChangeListener);

        // Visibility change
        this._visibilityChangeListener = () => {
            this.emit('device:visibility-changed', document.hidden);
        };
        document.addEventListener('visibilitychange', this._visibilityChangeListener);

        // Network change
        if ('connection' in navigator) {
            this._networkChangeListener = () => {
                this.updateCapabilities();
            };
            (navigator as any).connection.addEventListener('change', this._networkChangeListener);
        }
    }

    /**
     * Remove event listeners
     */
    private removeEventListeners(): void {
        if (typeof window === 'undefined') return;

        if (this._orientationChangeListener) {
            window.removeEventListener('orientationchange', this._orientationChangeListener);
            window.removeEventListener('resize', this._orientationChangeListener);
        }

        if (this._visibilityChangeListener) {
            document.removeEventListener('visibilitychange', this._visibilityChangeListener);
        }

        if (this._networkChangeListener && 'connection' in navigator) {
            (navigator as any).connection.removeEventListener('change', this._networkChangeListener);
        }
    }

    /**
     * Start capability monitoring
     */
    private startMonitoring(): void {
        this._updateInterval = setInterval(async () => {
            try {
                await this.updateCapabilities();
            } catch (error) {
                this.emit('device:error', error);
            }
        }, this._config.updateInterval);
    }

    /**
     * Check if capabilities have changed
     */
    private hasCapabilitiesChanged(
        previous: DeviceCapabilities,
        current: DeviceCapabilities
    ): boolean {
        const significantChanges = [
            'type', 'viewportWidth', 'viewportHeight', 'orientation',
            'touchCapability', 'connectionType', 'batteryLevel'
        ];

        return significantChanges.some(key =>
            previous[key as keyof DeviceCapabilities] !== current[key as keyof DeviceCapabilities]
        );
    }

    /**
     * Save capabilities to storage
     */
    private saveCapabilities(): void {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('codai-device-capabilities', JSON.stringify(this._capabilities));
            } catch (error) {
                // Storage might be disabled
            }
        }
    }

    /**
     * Load capabilities from storage
     */
    private loadCapabilities(): DeviceCapabilities | null {
        if (typeof localStorage !== 'undefined') {
            try {
                const stored = localStorage.getItem('codai-device-capabilities');
                return stored ? JSON.parse(stored) : null;
            } catch (error) {
                // Invalid data or storage disabled
            }
        }

        return null;
    }
}

export default DeviceDetector;
