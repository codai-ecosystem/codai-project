/**
 * 📱 Mobile Touch Optimization System
 * 
 * Advanced mobile touch optimizations for gesture-based interactions.
 * Provides enhanced touch handling, haptic feedback, and mobile-specific gestures.
 * 
 * @version 1.0.0
 * @author CODAI Ecosystem
 * @created 2025-08-03
 */

import { GestureType } from './advanced-gesture-engine';

// ==================== MOBILE TOUCH INTERFACES ====================

export interface MobileTouchConfig {
    touchSensitivity: number;
    swipeThreshold: number;
    longPressDelay: number;
    pinchSensitivity: number;
    hapticFeedback: boolean;
    preventScrolling: boolean;
    touchAreas: TouchAreaConfig[];
}

export interface TouchAreaConfig {
    id: string;
    element: HTMLElement;
    gestures: GestureType[];
    sensitivity: number;
    hapticPattern?: HapticPattern;
}

export interface HapticPattern {
    pattern: number[];
    intensity: 'light' | 'medium' | 'heavy';
}

export interface MobileTouchMetrics {
    touchEvents: number;
    gestureAccuracy: number;
    averageResponseTime: number;
    hapticEvents: number;
    touchPressure: number;
    multiTouchEvents: number;
}

// ==================== MOBILE TOUCH DETECTOR ====================

export class MobileTouchDetector {
    private config: MobileTouchConfig;
    private metrics: MobileTouchMetrics;
    private activeTouch: TouchInfo | null = null;
    private touchStart: TouchInfo | null = null;
    private touchAreas: Map<string, TouchAreaConfig> = new Map();

    constructor(config: Partial<MobileTouchConfig> = {}) {
        this.config = {
            touchSensitivity: 0.8,
            swipeThreshold: 50,
            longPressDelay: 600,
            pinchSensitivity: 0.3,
            hapticFeedback: true,
            preventScrolling: true,
            touchAreas: [],
            ...config
        };

        this.metrics = {
            touchEvents: 0,
            gestureAccuracy: 0,
            averageResponseTime: 0,
            hapticEvents: 0,
            touchPressure: 0,
            multiTouchEvents: 0
        };

        this.initializeMobileDetection();
    }

    private initializeMobileDetection(): void {
        // Detect mobile device capabilities
        const isMobile = this.detectMobileDevice();
        const hasHaptics = this.detectHapticSupport();

        if (isMobile) {
            this.optimizeForMobile();
        }

        if (hasHaptics && this.config.hapticFeedback) {
            this.enableHapticFeedback();
        }
    }

    private detectMobileDevice(): boolean {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return false;
        }

        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
    }

    private detectHapticSupport(): boolean {
        // Check if we're in a browser environment
        if (typeof navigator === 'undefined') {
            return false;
        }

        return 'vibrate' in navigator ||
            'hapticActuators' in navigator ||
            ('webkitVibrate' in navigator);
    }

    private optimizeForMobile(): void {
        // Adjust sensitivity for mobile
        this.config.touchSensitivity *= 1.2;
        this.config.swipeThreshold *= 0.8;
        this.config.longPressDelay *= 0.9;

        // Add mobile-specific touch handling
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    }

    private enableHapticFeedback(): void {
        console.log('🔊 Haptic feedback enabled for mobile touch optimization');
    }

    // ==================== TOUCH EVENT HANDLERS ====================

    private handleTouchStart(event: TouchEvent): void {
        const startTime = performance.now();
        this.metrics.touchEvents++;

        if (event.touches.length > 1) {
            this.metrics.multiTouchEvents++;
            this.handleMultiTouch(event);
            return;
        }

        const touch = event.touches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: startTime,
            pressure: (touch as any).force || 0.5,
            identifier: touch.identifier
        };

        this.activeTouch = this.touchStart;

        // Update pressure metrics
        this.metrics.touchPressure = (this.metrics.touchPressure + this.touchStart.pressure) / 2;

        // Start long press detection
        setTimeout(() => {
            if (this.activeTouch && this.activeTouch.identifier === touch.identifier) {
                this.detectLongPress();
            }
        }, this.config.longPressDelay);

        // Prevent scrolling if configured
        if (this.config.preventScrolling) {
            event.preventDefault();
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (!this.activeTouch || event.touches.length === 0) return;

        const touch = event.touches[0];
        if (touch.identifier !== this.activeTouch.identifier) return;

        this.activeTouch = {
            ...this.activeTouch,
            x: touch.clientX,
            y: touch.clientY,
            pressure: (touch as any).force || 0.5
        };

        // Prevent scrolling during gesture
        if (this.config.preventScrolling) {
            event.preventDefault();
        }
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (!this.touchStart || !this.activeTouch) return;

        const endTime = performance.now();
        const responseTime = endTime - this.touchStart.time;

        // Update metrics
        this.metrics.averageResponseTime = (this.metrics.averageResponseTime + responseTime) / 2;

        // Detect gesture based on touch data
        const gesture = this.detectTouchGesture();

        if (gesture) {
            this.triggerGesture(gesture, {
                x: this.activeTouch.x,
                y: this.activeTouch.y,
                responseTime,
                pressure: this.activeTouch.pressure
            });
        }

        this.resetTouch();
    }

    private handleTouchCancel(event: TouchEvent): void {
        this.resetTouch();
    }

    private handleMultiTouch(event: TouchEvent): void {
        if (event.touches.length === 2) {
            this.detectPinchGesture(event);
        }
    }

    // ==================== GESTURE DETECTION ====================

    private detectTouchGesture(): GestureType | null {
        if (!this.touchStart || !this.activeTouch) return null;

        const deltaX = this.activeTouch.x - this.touchStart.x;
        const deltaY = this.activeTouch.y - this.touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Check if movement exceeds threshold
        if (distance < this.config.swipeThreshold) {
            return null; // No significant movement
        }

        // Determine swipe direction
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        if (Math.abs(angle) <= 45) {
            return 'swipe_right';
        } else if (Math.abs(angle) >= 135) {
            return 'swipe_left';
        } else if (angle > 45 && angle < 135) {
            return 'swipe_down';
        } else {
            return 'swipe_up';
        }
    }

    private detectLongPress(): void {
        if (!this.activeTouch || !this.touchStart) return;

        // Check if touch is still active and hasn't moved much
        const deltaX = this.activeTouch.x - this.touchStart.x;
        const deltaY = this.activeTouch.y - this.touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < this.config.swipeThreshold * 0.3) {
            this.triggerGesture('long_press', {
                x: this.activeTouch.x,
                y: this.activeTouch.y,
                responseTime: performance.now() - this.touchStart.time,
                pressure: this.activeTouch.pressure
            });
        }
    }

    private detectPinchGesture(event: TouchEvent): void {
        if (event.touches.length !== 2) return;

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // Store initial distance for comparison
        if (!this.activeTouch) {
            this.activeTouch = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2,
                time: performance.now(),
                pressure: 0.5,
                identifier: -1,
                initialDistance: distance
            };
            return;
        }

        const initialDistance = this.activeTouch.initialDistance || distance;
        const distanceChange = distance - initialDistance;
        const changeRatio = Math.abs(distanceChange) / initialDistance;

        if (changeRatio > this.config.pinchSensitivity) {
            const gestureType = distanceChange > 0 ? 'pinch_out' : 'pinch_in';
            this.triggerGesture(gestureType, {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2,
                responseTime: performance.now() - this.activeTouch.time,
                pressure: 0.5
            });
        }
    }

    // ==================== GESTURE TRIGGERING ====================

    private triggerGesture(type: GestureType, data: GestureData): void {
        // Haptic feedback
        this.triggerHapticFeedback(type);

        // Update accuracy metrics
        this.metrics.gestureAccuracy = (this.metrics.gestureAccuracy + 1) / 2;

        // Dispatch custom event
        const event = new CustomEvent('mobileGesture', {
            detail: { type, data }
        });

        document.dispatchEvent(event);
    }

    private triggerHapticFeedback(gestureType: GestureType): void {
        if (!this.config.hapticFeedback) return;

        this.metrics.hapticEvents++;

        // Different haptic patterns for different gestures
        const patterns: Record<GestureType, number[]> = {
            'swipe_right': [50],
            'swipe_left': [50],
            'swipe_up': [100],
            'swipe_down': [100],
            'long_press': [200],
            'pinch_out': [50, 50, 50],
            'pinch_in': [50, 50, 50]
        };

        const pattern = patterns[gestureType] || [50];

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // ==================== UTILITIES ====================

    private resetTouch(): void {
        this.touchStart = null;
        this.activeTouch = null;
    }

    public getMetrics(): MobileTouchMetrics {
        return { ...this.metrics };
    }

    public registerTouchArea(config: TouchAreaConfig): void {
        this.touchAreas.set(config.id, config);

        // Add touch event listeners to the specific element
        config.element.addEventListener('touchstart', (e) => {
            // Mark this touch area as active
            this.handleTouchStart(e as TouchEvent);
        }, { passive: false });
    }

    public updateConfig(newConfig: Partial<MobileTouchConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

// ==================== TOUCH INFO INTERFACE ====================

interface TouchInfo {
    x: number;
    y: number;
    time: number;
    pressure: number;
    identifier: number;
    initialDistance?: number;
}

interface GestureData {
    x: number;
    y: number;
    responseTime: number;
    pressure: number;
}

// ==================== MOBILE OPTIMIZATION UTILITIES ====================

export class MobileOptimizationUtils {
    static optimizeTouchTargets(): void {
        // Ensure touch targets are at least 44px
        const elements = document.querySelectorAll('[data-gesture-area]');
        elements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                (element as HTMLElement).style.minWidth = '44px';
                (element as HTMLElement).style.minHeight = '44px';
                (element as HTMLElement).style.padding = '8px';
            }
        });
    }

    static preventZoom(): void {
        // Prevent zoom on double-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    static optimizeScrolling(): void {
        // Improve scroll performance on mobile
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overscrollBehavior = 'contain';
    }

    static addMobileViewportOptimizations(): void {
        // Add mobile viewport optimizations
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        }
    }
}

// ==================== EXPORT SINGLETON ====================

export const mobileTouchDetector = new MobileTouchDetector();

// Auto-initialize mobile optimizations
if (typeof window !== 'undefined') {
    MobileOptimizationUtils.optimizeTouchTargets();
    MobileOptimizationUtils.preventZoom();
    MobileOptimizationUtils.optimizeScrolling();
    MobileOptimizationUtils.addMobileViewportOptimizations();
}
