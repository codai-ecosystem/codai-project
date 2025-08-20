// 🎬 Core Animation System - Manual Implementation
// Version: 2.0.0 - Week 2 Phase 2 Advanced Animations

import { useState, useEffect, useRef, useCallback } from 'react';

// Animation Configuration Interfaces
export interface AnimationConfig {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit?: Record<string, any>;
    transition: TransitionConfig;
}

export interface TransitionConfig {
    duration: number;
    easing: string;
    delay?: number;
    stagger?: number;
    type?: 'spring' | 'tween' | 'keyframes';
    spring?: SpringConfig;
}

export interface SpringConfig {
    tension: number;
    friction: number;
    mass: number;
    velocity: number;
}

export interface UseAnimationOptions {
    trigger: 'scroll' | 'hover' | 'focus' | 'mount' | 'manual';
    threshold?: number;
    duration?: number;
    easing?: string;
    delay?: number;
    reducedMotion?: boolean;
}

// Easing Functions
export const easingFunctions = {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    linear: 'linear'
};

// Animation Presets Registry
export const animationPresets: Record<string, AnimationConfig> = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3, easing: easingFunctions.easeOut }
    },
    slideUp: {
        initial: { opacity: 0, transform: 'translateY(30px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' },
        transition: { duration: 0.4, easing: easingFunctions.easeOut }
    },
    slideDown: {
        initial: { opacity: 0, transform: 'translateY(-30px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' },
        transition: { duration: 0.4, easing: easingFunctions.easeOut }
    },
    slideLeft: {
        initial: { opacity: 0, transform: 'translateX(30px)' },
        animate: { opacity: 1, transform: 'translateX(0px)' },
        transition: { duration: 0.4, easing: easingFunctions.easeOut }
    },
    slideRight: {
        initial: { opacity: 0, transform: 'translateX(-30px)' },
        animate: { opacity: 1, transform: 'translateX(0px)' },
        transition: { duration: 0.4, easing: easingFunctions.easeOut }
    },
    scaleIn: {
        initial: { opacity: 0, transform: 'scale(0.9)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        transition: { duration: 0.3, easing: easingFunctions.bounce }
    },
    scaleOut: {
        initial: { opacity: 1, transform: 'scale(1)' },
        animate: { opacity: 0, transform: 'scale(0.9)' },
        transition: { duration: 0.2, easing: easingFunctions.easeIn }
    },
    bounceIn: {
        initial: { opacity: 0, transform: 'scale(0.3)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        transition: { duration: 0.6, easing: easingFunctions.bounce }
    },
    rotateIn: {
        initial: { opacity: 0, transform: 'rotate(-180deg) scale(0.8)' },
        animate: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
        transition: { duration: 0.5, easing: easingFunctions.elastic }
    },
    elastic: {
        initial: { transform: 'scale(0)' },
        animate: { transform: 'scale(1)' },
        transition: { duration: 0.8, easing: easingFunctions.elastic }
    }
};

// Reduced Motion Detection
export function useReducedMotion(): boolean {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return reducedMotion;
}

// Intersection Observer Hook for Scroll Animations
export function useIntersectionObserver(
    threshold: number = 0.1,
    rootMargin: string = '0px'
) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.unobserve(element);
    }, [threshold, rootMargin, hasIntersected]);

    return { ref, isIntersecting, hasIntersected };
}

// Main Animation Hook
export function useAnimation(options: UseAnimationOptions) {
    const [isVisible, setIsVisible] = useState(options.trigger === 'mount');
    const [isAnimating, setIsAnimating] = useState(false);
    const reducedMotion = useReducedMotion();
    const { ref, isIntersecting, hasIntersected } = useIntersectionObserver(
        options.threshold || 0.1
    );

    const triggerAnimation = useCallback(() => {
        if (reducedMotion && options.reducedMotion) {
            setIsVisible(true);
            return;
        }

        setIsAnimating(true);
        setIsVisible(true);

        const duration = options.duration || 300;
        setTimeout(() => {
            setIsAnimating(false);
        }, duration);
    }, [reducedMotion, options.reducedMotion, options.duration]);

    useEffect(() => {
        switch (options.trigger) {
            case 'scroll':
                if (isIntersecting || hasIntersected) {
                    triggerAnimation();
                }
                break;
            case 'mount':
                triggerAnimation();
                break;
        }
    }, [options.trigger, isIntersecting, hasIntersected, triggerAnimation]);

    const handlers = {
        onMouseEnter: options.trigger === 'hover' ? triggerAnimation : undefined,
        onFocus: options.trigger === 'focus' ? triggerAnimation : undefined,
    };

    return {
        ref,
        isVisible,
        isAnimating,
        triggerAnimation,
        handlers,
        reducedMotion
    };
}

// Spring Animation Class
export class SpringAnimation {
    private tension: number;
    private friction: number;
    private mass: number;
    private velocity: number;
    private position: number;
    private target: number;
    private animationId: number | null = null;

    constructor(config: SpringConfig) {
        this.tension = config.tension || 120;
        this.friction = config.friction || 14;
        this.mass = config.mass || 1;
        this.velocity = config.velocity || 0;
        this.position = 0;
        this.target = 0;
    }

    animate(
        from: number,
        to: number,
        onUpdate: (value: number) => void,
        onComplete?: () => void
    ): Promise<void> {
        return new Promise((resolve) => {
            this.position = from;
            this.target = to;
            this.velocity = 0;

            const step = () => {
                // Spring physics calculation
                const force = -this.tension * (this.position - this.target);
                const damping = -this.friction * this.velocity;
                const acceleration = (force + damping) / this.mass;

                this.velocity += acceleration * (1 / 60); // 60fps
                this.position += this.velocity * (1 / 60);

                onUpdate(this.position);

                // Check if animation should continue
                const isAtRest =
                    Math.abs(this.position - this.target) < 0.01 &&
                    Math.abs(this.velocity) < 0.01;

                if (isAtRest) {
                    onUpdate(this.target);
                    onComplete?.();
                    resolve();
                } else {
                    this.animationId = requestAnimationFrame(step);
                }
            };

            this.animationId = requestAnimationFrame(step);
        });
    }

    stop(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Performance Monitoring
export class AnimationPerformanceMonitor {
    private frameCount: number = 0;
    private lastTime: number = 0;
    private fps: number = 0;
    private memoryUsage: number = 0;

    startMonitoring(callback: (metrics: AnimationMetrics) => void): void {
        const monitor = (currentTime: number) => {
            this.frameCount++;

            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;

                // Memory usage (if available)
                if ('memory' in performance) {
                    this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
                }

                callback({
                    fps: this.fps,
                    frameDrops: this.fps < 55 ? 60 - this.fps : 0,
                    memoryUsage: this.memoryUsage,
                    cpuUsage: 0, // Would need more complex implementation
                    batteryImpact: this.fps < 30 ? 'high' : this.fps < 50 ? 'medium' : 'low'
                });
            }

            requestAnimationFrame(monitor);
        };

        requestAnimationFrame(monitor);
    }
}

export interface AnimationMetrics {
    fps: number;
    frameDrops: number;
    memoryUsage: number;
    cpuUsage: number;
    batteryImpact: 'low' | 'medium' | 'high';
}

// Stagger Animation Utility
export function createStaggerAnimation(
    elements: HTMLElement[],
    animation: AnimationConfig,
    staggerDelay: number = 100
): Promise<void[]> {
    return Promise.all(
        elements.map((element, index) => {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    // Apply animation to element
                    Object.assign(element.style, {
                        ...animation.animate,
                        transition: `all ${animation.transition.duration}s ${animation.transition.easing}`
                    });

                    setTimeout(resolve, animation.transition.duration * 1000);
                }, index * staggerDelay);
            });
        })
    );
}

// Animation Queue Manager
export class AnimationQueue {
    private queue: Array<() => Promise<void>> = [];
    private isProcessing: boolean = false;

    add(animation: () => Promise<void>): void {
        this.queue.push(animation);
        this.process();
    }

    private async process(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const animation = this.queue.shift();
            if (animation) {
                await animation();
            }
        }

        this.isProcessing = false;
    }

    clear(): void {
        this.queue = [];
    }

    get length(): number {
        return this.queue.length;
    }
}

// GPU Layer Promotion Utility
export function promoteToGPULayer(element: HTMLElement): void {
    element.style.willChange = 'transform, opacity';
    element.style.transform = 'translateZ(0)';
}

export function demoteFromGPULayer(element: HTMLElement): void {
    element.style.willChange = 'auto';
    element.style.transform = '';
}

// Export everything for use in components
export default {
    useAnimation,
    useReducedMotion,
    useIntersectionObserver,
    animationPresets,
    easingFunctions,
    SpringAnimation,
    AnimationPerformanceMonitor,
    createStaggerAnimation,
    AnimationQueue,
    promoteToGPULayer,
    demoteFromGPULayer
};
