/**
 * Utility Functions
 * Helper functions for the CODAI scrollytelling experience
 */

// =============================================================================
// Class Name Utilities
// =============================================================================

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

// =============================================================================
// Accessibility Utilities
// =============================================================================

/**
 * Announces text to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    try {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    } catch (error) {
        console.error('Error announcing to screen reader:', error);
    }
}

/**
 * Sets focus to element with optional smooth scroll
 */
export function setFocus(element: HTMLElement | null, smooth: boolean = true): void {
    if (!element) return;
    
    try {
        if (smooth) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest' 
            });
        }
        
        // Small delay to ensure scroll completes before focusing
        setTimeout(() => {
            element.focus();
        }, smooth ? 200 : 0);
    } catch (error) {
        console.error('Error setting focus:', error);
        // Fallback without smooth scroll
        element.focus();
    }
}

/**
 * Creates a unique ID for accessibility labeling
 */
export function createA11yId(prefix: string = 'a11y'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// Performance Utilities
// =============================================================================

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
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
    
    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Request animation frame with fallback
 */
export function requestAnimFrame(callback: () => void): void {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(callback);
    } else {
        setTimeout(callback, 16); // ~60fps fallback
    }
}

// =============================================================================
// Device and Environment Detection
// =============================================================================

/**
 * Detects if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
        return false;
    }
}

/**
 * Detects device type based on screen size
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

/**
 * Detects if device supports touch
 */
export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Detects if browser supports specific features
 */
export function supportsFeature(feature: 'intersectionObserver' | 'webGL' | 'webGL2' | 'customProperties'): boolean {
    if (typeof window === 'undefined') return false;
    
    switch (feature) {
        case 'intersectionObserver':
            return 'IntersectionObserver' in window;
        case 'webGL':
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            } catch {
                return false;
            }
        case 'webGL2':
            try {
                const canvas = document.createElement('canvas');
                return !!canvas.getContext('webgl2');
            } catch {
                return false;
            }
        case 'customProperties':
            return typeof window.CSS !== 'undefined' && typeof window.CSS.supports === 'function' && window.CSS.supports('--custom-property', '0');
        default:
            return false;
    }
}

// =============================================================================
// Math and Animation Utilities
// =============================================================================

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Map value from one range to another
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Easing functions for animations
 */
export const easing = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

// =============================================================================
// Storage Utilities
// =============================================================================

/**
 * Safe localStorage operations with fallback
 */
export const storage = {
    get: <T>(key: string, fallback: T): T => {
        try {
            if (typeof window === 'undefined') return fallback;
            
            const item = localStorage.getItem(key);
            if (item === null) return fallback;
            
            return JSON.parse(item);
        } catch {
            return fallback;
        }
    },
    
    set: <T>(key: string, value: T): void => {
        try {
            if (typeof window === 'undefined') return;
            
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    remove: (key: string): void => {
        try {
            if (typeof window === 'undefined') return;
            
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
};