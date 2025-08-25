/**
 * @fileoverview Touch Optimization Enhancer
 * @description Adds touch-friendly interactions and gesture support
 */

const fs = require('fs');
const path = require('path');

function enhanceTouchOptimization(stylesDir) {
    createTouchOptimizedStyles(stylesDir);
    createTouchGestureHandler(stylesDir);
    createHapticFeedbackUtils(stylesDir);
}

function createTouchOptimizedStyles(stylesDir) {
    const touchStylesPath = path.join(stylesDir, 'touch-styles.css');

    const touchStyles = `/* Touch-optimized styles for mobile devices */

/* Base touch optimizations */
* {
    /* Prevent text selection on touch devices */
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
}

/* Touch target improvements */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem;
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

/* Interactive element enhancements */
button, .btn {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
    transition: all 0.15s ease;
}

button:active, .btn:active {
    transform: scale(0.98);
}

/* Input optimizations */
input, textarea, select {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
    touch-action: manipulation;
}

input:focus, textarea:focus, select:focus {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
}

/* Link improvements */
a {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    touch-action: manipulation;
}

/* Card and clickable area enhancements */
.clickable-card {
    cursor: pointer;
    touch-action: manipulation;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.clickable-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clickable-card:active {
    transform: translateY(0) scale(0.99);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Swipeable elements */
.swipeable {
    touch-action: pan-x;
    user-select: none;
    -webkit-user-select: none;
}

.swipeable-vertical {
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
}

/* Scrollable areas */
.scroll-area {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
}

/* Loading states for touch interactions */
.touch-loading {
    pointer-events: none;
    opacity: 0.7;
    cursor: wait;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    .touch-target,
    .clickable-card,
    button,
    .btn {
        transition: none;
    }
    
    .clickable-card:active,
    button:active,
    .btn:active {
        transform: none;
    }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .touch-target {
        border: 2px solid;
    }
    
    button:focus,
    .btn:focus {
        outline: 3px solid;
        outline-offset: 2px;
    }
}

/* Dark mode touch optimizations */
@media (prefers-color-scheme: dark) {
    * {
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0.1);
    }
}

/* Responsive touch adjustments */
@media (max-width: 640px) {
    .touch-target {
        min-height: 48px;
        min-width: 48px;
        padding: 0.75rem;
    }
    
    button, .btn {
        min-height: 48px;
        min-width: 48px;
    }
    
    input, textarea, select {
        min-height: 48px;
        padding: 0.75rem;
    }
}

/* Ultra-wide screens */
@media (min-width: 1920px) {
    .touch-target {
        min-height: 52px;
        min-width: 52px;
    }
}`;

    fs.writeFileSync(touchStylesPath, touchStyles);
}

function createTouchGestureHandler(stylesDir) {
    const utilsDir = path.join(path.dirname(stylesDir), 'utils');
    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }

    const gestureHandlerPath = path.join(utilsDir, 'touchGestureHandler.ts');

    const gestureHandler = `/**
 * @fileoverview Touch Gesture Handler
 * @description Handles touch gestures for mobile optimization
 */

export interface TouchPoint {
    x: number;
    y: number;
    timestamp: number;
}

export interface SwipeEvent {
    direction: 'left' | 'right' | 'up' | 'down';
    distance: number;
    velocity: number;
    duration: number;
}

export interface TapEvent {
    x: number;
    y: number;
    timestamp: number;
}

export interface GestureConfig {
    swipeThreshold: number;
    tapTimeout: number;
    longPressTimeout: number;
    velocityThreshold: number;
}

export class TouchGestureHandler {
    private element: HTMLElement;
    private config: GestureConfig;
    private touchStart: TouchPoint | null = null;
    private touchEnd: TouchPoint | null = null;
    private tapTimer: NodeJS.Timeout | null = null;
    private longPressTimer: NodeJS.Timeout | null = null;

    constructor(element: HTMLElement, config: Partial<GestureConfig> = {}) {
        this.element = element;
        this.config = {
            swipeThreshold: 50,
            tapTimeout: 300,
            longPressTimeout: 500,
            velocityThreshold: 0.3,
            ...config
        };

        this.attachListeners();
    }

    private attachListeners(): void {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
    }

    private handleTouchStart(event: TouchEvent): void {
        const touch = event.touches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };

        // Start long press timer
        this.longPressTimer = setTimeout(() => {
            this.dispatchLongPress();
        }, this.config.longPressTimeout);

        // Prevent scrolling for swipeable elements
        if (this.element.classList.contains('swipeable') || 
            this.element.classList.contains('swipeable-vertical')) {
            event.preventDefault();
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (!this.touchStart) return;

        const touch = event.changedTouches[0];
        this.touchEnd = {
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now()
        };

        // Clear timers
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        this.processGesture();
    }

    private handleTouchCancel(): void {
        this.cleanup();
    }

    private processGesture(): void {
        if (!this.touchStart || !this.touchEnd) return;

        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = this.touchEnd.timestamp - this.touchStart.timestamp;
        const velocity = distance / duration;

        // Check for swipe
        if (distance >= this.config.swipeThreshold && velocity >= this.config.velocityThreshold) {
            this.dispatchSwipe(deltaX, deltaY, distance, velocity, duration);
        } 
        // Check for tap
        else if (distance < 10 && duration < this.config.tapTimeout) {
            this.dispatchTap();
        }

        this.cleanup();
    }

    private dispatchSwipe(deltaX: number, deltaY: number, distance: number, velocity: number, duration: number): void {
        const direction = Math.abs(deltaX) > Math.abs(deltaY)
            ? (deltaX > 0 ? 'right' : 'left')
            : (deltaY > 0 ? 'down' : 'up');

        const swipeEvent: SwipeEvent = { direction, distance, velocity, duration };
        
        this.element.dispatchEvent(new CustomEvent('swipe', { 
            detail: swipeEvent,
            bubbles: true
        }));

        this.element.dispatchEvent(new CustomEvent(\`swipe\${direction}\`, { 
            detail: swipeEvent,
            bubbles: true
        }));
    }

    private dispatchTap(): void {
        if (!this.touchStart) return;

        const tapEvent: TapEvent = {
            x: this.touchStart.x,
            y: this.touchStart.y,
            timestamp: this.touchStart.timestamp
        };

        this.element.dispatchEvent(new CustomEvent('tap', { 
            detail: tapEvent,
            bubbles: true
        }));

        // Trigger haptic feedback if available
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    private dispatchLongPress(): void {
        if (!this.touchStart) return;

        const longPressEvent: TapEvent = {
            x: this.touchStart.x,
            y: this.touchStart.y,
            timestamp: this.touchStart.timestamp
        };

        this.element.dispatchEvent(new CustomEvent('longpress', { 
            detail: longPressEvent,
            bubbles: true
        }));

        // Trigger stronger haptic feedback for long press
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 10, 50]);
        }
    }

    private cleanup(): void {
        this.touchStart = null;
        this.touchEnd = null;
        
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
            this.tapTimer = null;
        }
        
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    public destroy(): void {
        this.cleanup();
        this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    }
}

// React Hook for touch gestures
export function useTouchGestures(
    ref: React.RefObject<HTMLElement>,
    config: Partial<GestureConfig> = {}
) {
    React.useEffect(() => {
        if (!ref.current) return;

        const handler = new TouchGestureHandler(ref.current, config);
        return () => handler.destroy();
    }, [ref, config]);
}`;

    fs.writeFileSync(gestureHandlerPath, gestureHandler);
}

function createHapticFeedbackUtils(stylesDir) {
    const utilsDir = path.join(path.dirname(stylesDir), 'utils');
    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }

    const hapticUtilsPath = path.join(utilsDir, 'hapticFeedback.ts');

    const hapticUtils = `/**
 * @fileoverview Haptic Feedback Utilities
 * @description Provides haptic feedback for mobile interactions
 */

export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticPattern = number | number[];

export interface HapticConfig {
    enabled: boolean;
    intensity: HapticIntensity;
    respectUserPreferences: boolean;
}

export class HapticFeedback {
    private config: HapticConfig;
    private isSupported: boolean;

    constructor(config: Partial<HapticConfig> = {}) {
        this.config = {
            enabled: true,
            intensity: 'medium',
            respectUserPreferences: true,
            ...config
        };

        this.isSupported = 'vibrate' in navigator;
    }

    /**
     * Check if haptic feedback is available and enabled
     */
    public isAvailable(): boolean {
        if (!this.config.enabled || !this.isSupported) {
            return false;
        }

        // Respect user's reduced motion preference
        if (this.config.respectUserPreferences) {
            return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        return true;
    }

    /**
     * Trigger haptic feedback for button tap
     */
    public tap(): void {
        if (!this.isAvailable()) return;

        const patterns = {
            light: 10,
            medium: 20,
            heavy: 30
        };

        navigator.vibrate(patterns[this.config.intensity]);
    }

    /**
     * Trigger haptic feedback for successful action
     */
    public success(): void {
        if (!this.isAvailable()) return;
        
        navigator.vibrate([50, 10, 50]);
    }

    /**
     * Trigger haptic feedback for error
     */
    public error(): void {
        if (!this.isAvailable()) return;
        
        navigator.vibrate([100, 50, 100, 50, 100]);
    }

    /**
     * Trigger haptic feedback for warning
     */
    public warning(): void {
        if (!this.isAvailable()) return;
        
        navigator.vibrate([50, 25, 75]);
    }

    /**
     * Trigger haptic feedback for selection change
     */
    public selection(): void {
        if (!this.isAvailable()) return;
        
        navigator.vibrate(15);
    }

    /**
     * Trigger haptic feedback for long press
     */
    public longPress(): void {
        if (!this.isAvailable()) return;
        
        navigator.vibrate([30, 10, 50, 10, 30]);
    }

    /**
     * Trigger custom haptic pattern
     */
    public custom(pattern: HapticPattern): void {
        if (!this.isAvailable()) return;
        
        navigator.vibrate(pattern);
    }

    /**
     * Update configuration
     */
    public updateConfig(config: Partial<HapticConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Enable haptic feedback
     */
    public enable(): void {
        this.config.enabled = true;
    }

    /**
     * Disable haptic feedback
     */
    public disable(): void {
        this.config.enabled = false;
    }
}

// Global instance
export const haptic = new HapticFeedback();

// React Hook for haptic feedback
export function useHapticFeedback(config: Partial<HapticConfig> = {}) {
    const [hapticInstance] = React.useState(() => new HapticFeedback(config));

    React.useEffect(() => {
        hapticInstance.updateConfig(config);
    }, [config, hapticInstance]);

    return React.useMemo(() => ({
        tap: () => hapticInstance.tap(),
        success: () => hapticInstance.success(),
        error: () => hapticInstance.error(),
        warning: () => hapticInstance.warning(),
        selection: () => hapticInstance.selection(),
        longPress: () => hapticInstance.longPress(),
        custom: (pattern: HapticPattern) => hapticInstance.custom(pattern),
        isAvailable: () => hapticInstance.isAvailable(),
        enable: () => hapticInstance.enable(),
        disable: () => hapticInstance.disable(),
    }), [hapticInstance]);
}`;

    fs.writeFileSync(hapticUtilsPath, hapticUtils);
}

module.exports = enhanceTouchOptimization;