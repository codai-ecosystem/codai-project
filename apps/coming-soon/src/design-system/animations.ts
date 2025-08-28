/**
 * CODAI Design System - Animation Utilities
 * 
 * Performance-optimized animation system following 2025 best practices:
 * - Minimal Framer Motion usage for better performance
 * - CSS-first animations with JavaScript enhancement
 * - Accessibility-compliant with reduced motion support
 * - Smooth, professional animations for AI/Tech aesthetic
 */

import { Variants, Transition, MotionValue } from 'framer-motion';

// Animation Durations - Following Material Design & Apple HIG
export const durations = {
    instant: 0,
    fast: 0.15,        // Quick interactions (hover, focus)
    normal: 0.3,       // Standard transitions
    slow: 0.5,         // Page transitions, large elements
    slower: 0.75,      // Complex animations
    slowest: 1.0,      // Hero animations, special effects
} as const;

// Easing Functions - Natural motion curves
export const easings = {
    // Standard easings
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Custom cubic-bezier curves
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',      // Material smooth
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',       // Material sharp
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring effect
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',  // Bounce effect

    // Framer Motion easings
    anticipate: [0.175, 0.885, 0.32, 1.275],
    backOut: [0.175, 0.885, 0.32, 1.275],
    circOut: [0, 0.55, 0.45, 1],
} as const;

// Spring Configurations for Framer Motion
export const springs = {
    // Gentle spring for UI elements
    gentle: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 100,
        mass: 0.8,
    },

    // Bouncy spring for playful interactions
    bouncy: {
        type: 'spring' as const,
        damping: 8,
        stiffness: 200,
        mass: 0.5,
    },

    // Smooth spring for large elements
    smooth: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 120,
        mass: 1,
    },

    // Snappy spring for quick interactions
    snappy: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 300,
        mass: 0.7,
    },
} as const;

// CSS Animation Classes - Performance-first approach
export const cssAnimations = {
    // Fade animations
    fadeIn: {
        keyframes: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        },
        animation: `fadeIn ${durations.normal}s ${easings.smooth} forwards`,
    },

    fadeOut: {
        keyframes: {
            '0%': { opacity: '1' },
            '100%': { opacity: '0' },
        },
        animation: `fadeOut ${durations.normal}s ${easings.smooth} forwards`,
    },

    fadeInUp: {
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateY(2rem)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            },
        },
        animation: `fadeInUp ${durations.slow}s ${easings.smooth} forwards`,
    },

    fadeInDown: {
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateY(-2rem)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            },
        },
        animation: `fadeInDown ${durations.slow}s ${easings.smooth} forwards`,
    },

    // Slide animations
    slideInLeft: {
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateX(-2rem)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateX(0)'
            },
        },
        animation: `slideInLeft ${durations.slow}s ${easings.smooth} forwards`,
    },

    slideInRight: {
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'translateX(2rem)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateX(0)'
            },
        },
        animation: `slideInRight ${durations.slow}s ${easings.smooth} forwards`,
    },

    // Scale animations
    scaleIn: {
        keyframes: {
            '0%': {
                opacity: '0',
                transform: 'scale(0.8)'
            },
            '100%': {
                opacity: '1',
                transform: 'scale(1)'
            },
        },
        animation: `scaleIn ${durations.slow}s ${easings.smooth} forwards`,
    },

    // Glow effect
    glow: {
        keyframes: {
            '0%': {
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            },
            '50%': {
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5)'
            },
            '100%': {
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            },
        },
        animation: `glow ${durations.slowest * 2}s ${easings.smooth} infinite`,
    },

    // Floating effect
    float: {
        keyframes: {
            '0%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-0.5rem)' },
            '100%': { transform: 'translateY(0)' },
        },
        animation: `float ${durations.slowest * 3}s ${easings.smooth} infinite`,
    },

    // Pulse effect
    pulse: {
        keyframes: {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
        },
        animation: `pulse ${durations.slowest * 2}s ${easings.smooth} infinite`,
    },

    // Rotate effect
    rotate: {
        keyframes: {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        animation: `rotate ${durations.slowest * 2}s ${easings.linear} infinite`,
    },
} as const;

// Framer Motion Variants - Reusable animation patterns
export const motionVariants: Record<string, Variants> = {
    // Container animations (stagger children)
    staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    },

    // Item animations (for use with stagger containers)
    staggerItem: {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 100,
                mass: 0.8,
            },
        },
    },

    // Page transitions
    pageTransition: {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: durations.slow,
                ease: easings.smooth,
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: durations.normal,
                ease: easings.smooth,
            },
        },
    },

    // Modal/overlay animations
    overlay: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: durations.normal,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: durations.normal,
            },
        },
    },

    modal: {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 50,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 200,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: {
                duration: durations.normal,
                ease: easings.smooth,
            },
        },
    },

    // Button hover effects
    buttonHover: {
        rest: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: {
                duration: durations.fast,
                ease: easings.smooth,
            },
        },
        tap: {
            scale: 0.95,
            transition: {
                duration: durations.instant,
            },
        },
    },

    // Card hover effects
    cardHover: {
        rest: {
            scale: 1,
            y: 0,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.8)',
        },
        hover: {
            scale: 1.02,
            y: -4,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.4)',
            transition: {
                duration: durations.normal,
                ease: easings.smooth,
            },
        },
    },

    // Hero text animations
    heroText: {
        hidden: {
            opacity: 0,
            y: 50,
            scale: 0.9,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                damping: 15,
                stiffness: 100,
                mass: 1,
                delay: 0.2,
            },
        },
    },

    // Scroll-triggered animations
    scrollFadeUp: {
        hidden: {
            opacity: 0,
            y: 100,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: durations.slow,
                ease: easings.smooth,
            },
        },
    },

    // Loading animations
    loadingSpinner: {
        animate: {
            rotate: [0, 360],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: easings.linear,
            },
        },
    },

    loadingPulse: {
        animate: {
            opacity: [0.5, 1, 0.5],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: easings.smooth,
            },
        },
    },
} as const;

// Animation Presets - Common animation combinations
export const animationPresets = {
    // Entrance animations
    entrance: {
        fadeInUp: {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: durations.slow, ease: easings.smooth },
        },

        scaleIn: {
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            transition: springs.gentle,
        },

        slideInLeft: {
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: durations.slow, ease: easings.smooth },
        },
    },

    // Hover effects
    hover: {
        lift: {
            whileHover: { y: -8, scale: 1.02 },
            transition: { duration: durations.fast, ease: easings.smooth },
        },

        glow: {
            whileHover: {
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)',
            },
            transition: { duration: durations.normal, ease: easings.smooth },
        },

        scale: {
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.95 },
            transition: { duration: durations.fast, ease: easings.smooth },
        },
    },

    // Loading states
    loading: {
        spinner: {
            animate: { rotate: 360 },
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: easings.linear
            },
        },

        dots: {
            animate: {
                opacity: [0.3, 1, 0.3],
                y: [0, -10, 0],
            },
            transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: easings.smooth
            },
        },
    },
} as const;

// Accessibility - Reduced Motion Support
export const reducedMotionConfig = {
    // Respect user's motion preferences
    respectReducedMotion: true,

    // Fallback animations for reduced motion
    reducedMotionFallbacks: {
        fadeIn: { opacity: 1 },
        slideIn: { opacity: 1 },
        scaleIn: { opacity: 1, scale: 1 },
    },
} as const;

// Animation Utilities
export const animationUtils = {
    // Create staggered animation
    createStagger: (staggerDelay: number = 0.1, delayChildren: number = 0) => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delayChildren,
            },
        },
    }),

    // Create delay function
    createDelay: (delay: number) => ({
        transition: {
            delay,
            duration: durations.normal,
            ease: easings.smooth,
        },
    }),

    // Generate CSS animation classes
    generateAnimationClass: (animationName: string, duration: number, easing: string, delay: number = 0) => ({
        animation: `${animationName} ${duration}s ${easing} ${delay}s forwards`,
    }),

    // Parallax scroll utilities
    createParallaxTransform: (scrollY: MotionValue<number>, range: [number, number], outputRange: [number, number]) => {
        // This would be used with useTransform from Framer Motion
        // Example: const y = useTransform(scrollY, [0, 1000], [0, -200]);
        return { range, outputRange };
    },
} as const;

// Performance Monitoring
export const performanceConfig = {
    // Monitor animation performance
    enablePerformanceMonitoring: process.env.NODE_ENV === 'development',

    // Layout thrashing prevention
    gpuAcceleration: {
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform, opacity',
    },

    // Optimize for 60fps
    optimizeForPerformance: {
        // Use transform instead of changing layout properties
        preferTransform: true,
        // Avoid animating expensive properties
        avoidLayoutProps: ['width', 'height', 'top', 'left'],
        // Prefer opacity and transform
        preferredProps: ['opacity', 'transform'],
    },
} as const;

// Export types
export type Durations = typeof durations;
export type Easings = typeof easings;
export type Springs = typeof springs;
export type MotionVariants = typeof motionVariants;
export type AnimationPresets = typeof animationPresets;