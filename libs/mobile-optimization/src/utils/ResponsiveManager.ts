/**
 * @fileoverview CODAI Responsive Manager
 * @module @codai/mobile-optimization/utils/ResponsiveManager
 * @version 1.0.0
 * 
 * Advanced responsive design management with breakpoint detection,
 * responsive value computation, and adaptive layout optimization.
 */

import { EventEmitter } from 'events';
import {
    ResponsiveLayout,
    ResponsiveValue,
    Breakpoints,
    DeviceCapabilities,
    ResponsiveDesignError
} from '../types';

/**
 * Responsive Manager
 * 
 * Manages responsive design features including breakpoint detection,
 * responsive value computation, and adaptive layouts.
 */
export class ResponsiveManager extends EventEmitter {
    private _config: ResponsiveLayout;
    private _currentBreakpoint: keyof Breakpoints;
    private _mediaQueries: Map<keyof Breakpoints, MediaQueryList> = new Map();
    private _containerSizes: Map<string, number> = new Map();
    private _initialized: boolean = false;

    constructor(config: ResponsiveLayout) {
        super();
        this._config = { ...config };
        this._currentBreakpoint = 'md';

        if (typeof window !== 'undefined') {
            this.setupMediaQueries();
        }
    }

    /**
     * Initialize the responsive manager
     */
    async initialize(): Promise<void> {
        if (typeof window === 'undefined') {
            throw new ResponsiveDesignError('ResponsiveManager requires browser environment');
        }

        try {
            this.detectCurrentBreakpoint();
            this.setupResizeListener();
            this.calculateContainerSizes();

            this._initialized = true;
            this.emit('responsive:initialized', {
                currentBreakpoint: this._currentBreakpoint,
                breakpoints: this._config.breakpoints
            });

        } catch (error) {
            throw new ResponsiveDesignError(
                'Failed to initialize responsive manager',
                { error }
            );
        }
    }

    /**
     * Update configuration
     */
    updateConfig(config: ResponsiveLayout): void {
        this._config = { ...config };

        if (this._initialized) {
            this.setupMediaQueries();
            this.detectCurrentBreakpoint();
            this.calculateContainerSizes();
        }

        this.emit('responsive:config-updated', config);
    }

    /**
     * Get current breakpoint
     */
    getCurrentBreakpoint(): keyof Breakpoints {
        return this._currentBreakpoint;
    }

    /**
     * Check if current viewport matches breakpoint
     */
    isBreakpoint(breakpoint: keyof Breakpoints): boolean {
        return this._currentBreakpoint === breakpoint;
    }

    /**
     * Check if viewport is at or above breakpoint
     */
    isBreakpointUp(breakpoint: keyof Breakpoints): boolean {
        const currentValue = this._config.breakpoints[this._currentBreakpoint];
        const targetValue = this._config.breakpoints[breakpoint];
        return currentValue >= targetValue;
    }

    /**
     * Check if viewport is below breakpoint
     */
    isBreakpointDown(breakpoint: keyof Breakpoints): boolean {
        const currentValue = this._config.breakpoints[this._currentBreakpoint];
        const targetValue = this._config.breakpoints[breakpoint];
        return currentValue < targetValue;
    }

    /**
     * Get responsive value for current breakpoint
     */
    getResponsiveValue<T>(value: ResponsiveValue<T>): T {
        if (typeof value !== 'object' || value === null) {
            return value as T;
        }

        const responsiveValue = value as Record<string, T>;

        // Check for exact breakpoint match
        if (responsiveValue[this._currentBreakpoint] !== undefined) {
            return responsiveValue[this._currentBreakpoint];
        }

        // Check for base value
        if (responsiveValue.base !== undefined) {
            return responsiveValue.base;
        }

        // Find the closest breakpoint value (mobile-first approach)
        const breakpointOrder: (keyof Breakpoints)[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const currentIndex = breakpointOrder.indexOf(this._currentBreakpoint);

        // Look for value in smaller breakpoints first
        for (let i = currentIndex; i >= 0; i--) {
            const breakpoint = breakpointOrder[i];
            if (responsiveValue[breakpoint] !== undefined) {
                return responsiveValue[breakpoint];
            }
        }

        // If no smaller breakpoint found, look in larger ones
        for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
            const breakpoint = breakpointOrder[i];
            if (responsiveValue[breakpoint] !== undefined) {
                return responsiveValue[breakpoint];
            }
        }

        // Fallback to first available value
        const firstKey = Object.keys(responsiveValue)[0];
        return responsiveValue[firstKey];
    }

    /**
     * Get container max width for current breakpoint
     */
    getContainerMaxWidth(): number | undefined {
        return this._config.containerMaxWidths[this._currentBreakpoint];
    }

    /**
     * Get grid columns for current breakpoint
     */
    getGridColumns(): number {
        return this.getResponsiveValue(this._config.gridColumns);
    }

    /**
     * Get gutter width for current breakpoint
     */
    getGutterWidth(): number {
        return this.getResponsiveValue(this._config.gutterWidth);
    }

    /**
     * Get base font size for current breakpoint
     */
    getBaseFontSize(): number {
        return this.getResponsiveValue(this._config.baseFontSize);
    }

    /**
     * Calculate fluid typography scale
     */
    getFluidFontSize(level: number = 0): string {
        const baseFontSize = this.getBaseFontSize();
        const scaledSize = baseFontSize * Math.pow(this._config.scaleRatio, level);

        // Create fluid typography between breakpoints
        const minBreakpoint = this._config.breakpoints.xs;
        const maxBreakpoint = this._config.breakpoints.xl;
        const minSize = baseFontSize * Math.pow(this._config.scaleRatio * 0.8, level);
        const maxSize = scaledSize;

        const slope = (maxSize - minSize) / (maxBreakpoint - minBreakpoint);
        const yIntercept = minSize - slope * minBreakpoint;

        return `clamp(${minSize}px, ${yIntercept}px + ${slope * 100}vw, ${maxSize}px)`;
    }

    /**
     * Generate responsive CSS media queries
     */
    generateMediaQueries(): Record<string, string> {
        const queries: Record<string, string> = {};

        Object.entries(this._config.breakpoints).forEach(([breakpoint, width]) => {
            queries[`${breakpoint}Up`] = `@media (min-width: ${width}px)`;
            queries[`${breakpoint}Down`] = `@media (max-width: ${width - 1}px)`;
            queries[`${breakpoint}Only`] = this.generateOnlyQuery(breakpoint as keyof Breakpoints);
        });

        return queries;
    }

    /**
     * Handle device change
     */
    handleDeviceChange(capabilities: DeviceCapabilities): void {
        // Update breakpoint based on new device capabilities
        this.detectCurrentBreakpoint();

        // Emit orientation change event
        this.emit('responsive:orientation-changed', {
            orientation: capabilities.orientation,
            breakpoint: this._currentBreakpoint
        });
    }

    /**
     * Get responsive grid configuration
     */
    getGridConfig(): {
        columns: number;
        gutter: number;
        maxWidth: number | undefined;
        columnWidth: string;
    } {
        const columns = this.getGridColumns();
        const gutter = this.getGutterWidth();
        const maxWidth = this.getContainerMaxWidth();

        const columnWidth = maxWidth
            ? `calc((${maxWidth}px - ${(columns - 1) * gutter}px) / ${columns})`
            : `calc((100% - ${(columns - 1) * gutter}px) / ${columns})`;

        return {
            columns,
            gutter,
            maxWidth,
            columnWidth
        };
    }

    /**
     * Create responsive utility classes
     */
    generateUtilityClasses(): Record<string, any> {
        const classes: Record<string, any> = {};

        // Generate responsive display classes
        const displayValues = ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'];
        displayValues.forEach(display => {
            Object.keys(this._config.breakpoints).forEach(breakpoint => {
                classes[`d-${breakpoint}-${display}`] = {
                    [`@media (min-width: ${this._config.breakpoints[breakpoint as keyof Breakpoints]}px)`]: {
                        display
                    }
                };
            });
        });

        // Generate responsive spacing classes
        const spacingValues = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48];
        const spacingProperties = ['margin', 'padding'];
        const spacingDirections = ['', 't', 'r', 'b', 'l', 'x', 'y'];

        spacingProperties.forEach(property => {
            spacingDirections.forEach(direction => {
                spacingValues.forEach(value => {
                    Object.keys(this._config.breakpoints).forEach(breakpoint => {
                        const className = `${property.charAt(0)}${direction}-${breakpoint}-${value}`;
                        classes[className] = {
                            [`@media (min-width: ${this._config.breakpoints[breakpoint as keyof Breakpoints]}px)`]:
                                this.generateSpacingStyles(property, direction, value)
                        };
                    });
                });
            });
        });

        return classes;
    }

    /**
     * Shutdown the responsive manager
     */
    async shutdown(): Promise<void> {
        if (typeof window !== 'undefined') {
            // Remove media query listeners
            this._mediaQueries.forEach((mediaQuery) => {
                mediaQuery.removeEventListener('change', this.handleMediaQueryChange);
            });

            // Remove resize listener
            window.removeEventListener('resize', this.handleResize);
        }

        this._mediaQueries.clear();
        this._containerSizes.clear();
        this._initialized = false;

        this.emit('responsive:shutdown');
    }

    // ===== PRIVATE METHODS =====

    /**
     * Setup media queries for breakpoint detection
     */
    private setupMediaQueries(): void {
        if (typeof window === 'undefined') return;

        // Clear existing media queries
        this._mediaQueries.forEach((mediaQuery) => {
            mediaQuery.removeEventListener('change', this.handleMediaQueryChange);
        });
        this._mediaQueries.clear();

        // Create new media queries
        Object.entries(this._config.breakpoints).forEach(([breakpoint, width]) => {
            const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
            mediaQuery.addEventListener('change', this.handleMediaQueryChange);
            this._mediaQueries.set(breakpoint as keyof Breakpoints, mediaQuery);
        });
    }

    /**
     * Handle media query changes
     */
    private handleMediaQueryChange = (): void => {
        const previousBreakpoint = this._currentBreakpoint;
        this.detectCurrentBreakpoint();

        if (previousBreakpoint !== this._currentBreakpoint) {
            this.emit('responsive:breakpoint-changed', {
                previous: previousBreakpoint,
                current: this._currentBreakpoint
            });
        }
    };

    /**
     * Setup resize listener
     */
    private setupResizeListener(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('resize', this.handleResize);
    }

    /**
     * Handle window resize
     */
    private handleResize = (): void => {
        this.calculateContainerSizes();

        this.emit('responsive:resize', {
            width: window.innerWidth,
            height: window.innerHeight,
            breakpoint: this._currentBreakpoint
        });
    };

    /**
     * Detect current breakpoint
     */
    private detectCurrentBreakpoint(): void {
        if (typeof window === 'undefined') return;

        const width = window.innerWidth;
        const breakpoints = this._config.breakpoints;

        // Find the largest breakpoint that matches
        const breakpointEntries = Object.entries(breakpoints)
            .sort(([, a], [, b]) => b - a); // Sort descending

        for (const [breakpoint, minWidth] of breakpointEntries) {
            if (width >= minWidth) {
                this._currentBreakpoint = breakpoint as keyof Breakpoints;
                return;
            }
        }

        // Fallback to smallest breakpoint
        this._currentBreakpoint = 'xs';
    }

    /**
     * Calculate container sizes
     */
    private calculateContainerSizes(): void {
        if (typeof window === 'undefined') return;

        const width = window.innerWidth;
        const maxWidth = this.getContainerMaxWidth();

        if (maxWidth && width > maxWidth) {
            this._containerSizes.set('container', maxWidth);
        } else {
            this._containerSizes.set('container', width);
        }
    }

    /**
     * Generate media query for breakpoint only
     */
    private generateOnlyQuery(breakpoint: keyof Breakpoints): string {
        const breakpoints = Object.keys(this._config.breakpoints) as (keyof Breakpoints)[];
        const currentIndex = breakpoints.indexOf(breakpoint);
        const currentWidth = this._config.breakpoints[breakpoint];

        if (currentIndex === breakpoints.length - 1) {
            // Largest breakpoint
            return `@media (min-width: ${currentWidth}px)`;
        }

        const nextBreakpoint = breakpoints[currentIndex + 1];
        const nextWidth = this._config.breakpoints[nextBreakpoint];

        return `@media (min-width: ${currentWidth}px) and (max-width: ${nextWidth - 1}px)`;
    }

    /**
     * Generate spacing styles
     */
    private generateSpacingStyles(property: string, direction: string, value: number): Record<string, string> {
        const styles: Record<string, string> = {};

        switch (direction) {
            case '':
                styles[property] = `${value}px`;
                break;
            case 't':
                styles[`${property}-top`] = `${value}px`;
                break;
            case 'r':
                styles[`${property}-right`] = `${value}px`;
                break;
            case 'b':
                styles[`${property}-bottom`] = `${value}px`;
                break;
            case 'l':
                styles[`${property}-left`] = `${value}px`;
                break;
            case 'x':
                styles[`${property}-left`] = `${value}px`;
                styles[`${property}-right`] = `${value}px`;
                break;
            case 'y':
                styles[`${property}-top`] = `${value}px`;
                styles[`${property}-bottom`] = `${value}px`;
                break;
        }

        return styles;
    }
}

export default ResponsiveManager;
