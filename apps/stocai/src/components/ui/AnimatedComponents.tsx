'use client';

import { motion } from 'framer-motion';
import type { HTMLMotionProps, Variants, Transition } from 'framer-motion';
import React, { forwardRef, useMemo } from 'react';

import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS & SHARED CONFIGURATION
// ============================================================================

const ANIMATION_CONFIG = {
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
  },
  easings: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    anticipate: [0.22, 1, 0.36, 1],
    spring: { type: 'spring', damping: 15, stiffness: 300 } as Transition,
  },
  distances: {
    small: 20,
    medium: 40,
    large: 60,
  },
} as const;

// Common variants for reusability
export const commonVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: ANIMATION_CONFIG.distances.medium },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      },
    },
  },
  slideDown: {
    hidden: { opacity: 0, y: -ANIMATION_CONFIG.distances.medium },
    visible: {
      opacity: 1,
      y: 0,
      transition: ANIMATION_CONFIG.easings.spring,
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: ANIMATION_CONFIG.distances.medium },
    visible: {
      opacity: 1,
      x: 0,
      transition: ANIMATION_CONFIG.easings.spring,
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: -ANIMATION_CONFIG.distances.medium },
    visible: {
      opacity: 1,
      x: 0,
      transition: ANIMATION_CONFIG.easings.spring,
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: ANIMATION_CONFIG.easings.spring,
    },
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
} as const satisfies Record<string, Variants>;

// ============================================================================
// BASE ANIMATED COMPONENT
// ============================================================================

interface BaseAnimatedProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: React.ReactNode;
  className?: string;
  variants?: Variants;
  duration?: keyof typeof ANIMATION_CONFIG.durations | number;
  delay?: number;
  easing?: keyof typeof ANIMATION_CONFIG.easings;
}

/**
 * Base animated div component with optimized defaults and performance
 */
export const AnimatedDiv = forwardRef<HTMLDivElement, BaseAnimatedProps>(
  (
    {
      children,
      className,
      variants,
      duration = 'normal',
      delay = 0,
      easing = 'easeOut',
      ...motionProps
    },
    ref
  ) => {
    const transition = useMemo(() => {
      const baseDuration =
        typeof duration === 'number'
          ? duration
          : ANIMATION_CONFIG.durations[duration];
      const baseEasing = ANIMATION_CONFIG.easings[easing];

      return {
        duration: baseDuration,
        ease: Array.isArray(baseEasing) ? baseEasing : undefined,
        delay,
        ...(typeof baseEasing === 'object' ? baseEasing : {}),
      };
    }, [duration, delay, easing]);
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        {...(variants != null && { variants })}
        transition={transition}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedDiv.displayName = 'AnimatedDiv';

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

interface PageWrapperProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit'> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
}

/**
 * Optimized page wrapper with smooth transitions for route changes
 */
export const PageWrapper = forwardRef<HTMLDivElement, PageWrapperProps>(
  ({ children, className, variant = 'slide', ...motionProps }, ref) => {
    const variants = useMemo(() => {
      switch (variant) {
        case 'fade':
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          };
        case 'scale':
          return {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1.05 },
          };
        case 'slide':
        default:
          return {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
          };
      }
    }, [variant]);

    return (
      <motion.div
        ref={ref}
        className={cn('min-h-screen w-full', className)}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          type: 'tween',
          ease: ANIMATION_CONFIG.easings.easeOut,
          duration: ANIMATION_CONFIG.durations.normal,
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

PageWrapper.displayName = 'PageWrapper';

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

interface FadeInProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: keyof typeof ANIMATION_CONFIG.durations | number;
  inView?: boolean;
}

/**
 * Performance-optimized fade in component with viewport detection
 */
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      children,
      className,
      delay = 0,
      duration = 'normal',
      inView = false,
      ...motionProps
    },
    ref
  ) => {
    const transition = useMemo(
      () => ({
        duration:
          typeof duration === 'number'
            ? duration
            : ANIMATION_CONFIG.durations[duration],
        delay,
        ease: ANIMATION_CONFIG.easings.easeOut,
      }),
      [duration, delay]
    );

    const animationProps = useMemo(
      () =>
        inView
          ? {
            initial: { opacity: 0 },
            whileInView: { opacity: 1 },
            viewport: { once: true, margin: '-50px' },
          }
          : {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
          },
      [inView]
    );

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        transition={transition}
        {...animationProps}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = 'FadeIn';

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

interface SlideInProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  children?: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: keyof typeof ANIMATION_CONFIG.durations | number;
  distance?: keyof typeof ANIMATION_CONFIG.distances | number;
  inView?: boolean;
}

/**
 * Optimized slide in component with customizable direction and distance
 */
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      className,
      direction = 'up',
      delay = 0,
      duration = 'normal',
      distance = 'medium',
      inView = false,
      ...motionProps
    },
    ref
  ) => {
    const slideDistance =
      typeof distance === 'number'
        ? distance
        : ANIMATION_CONFIG.distances[distance];

    const variants = useMemo(() => {
      const positions = {
        up: { y: slideDistance },
        down: { y: -slideDistance },
        left: { x: slideDistance },
        right: { x: -slideDistance },
      };

      return {
        hidden: {
          opacity: 0,
          ...positions[direction],
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
        },
      };
    }, [direction, slideDistance]);

    const transition = useMemo(
      () => ({
        type: 'spring' as const,
        damping: 20,
        stiffness: 300,
        duration:
          typeof duration === 'number'
            ? duration
            : ANIMATION_CONFIG.durations[duration],
        delay,
      }),
      [duration, delay]
    );

    const animationProps = useMemo(
      () =>
        inView
          ? {
            variants,
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, margin: '-100px' },
          }
          : {
            variants,
            initial: 'hidden',
            animate: 'visible',
          },
      [inView, variants]
    );

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        transition={transition}
        {...animationProps}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = 'SlideIn';

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

interface ScaleInProps
  extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: keyof typeof ANIMATION_CONFIG.durations | number;
  initialScale?: number;
  inView?: boolean;
}

/**
 * Scale in animation with spring physics for natural movement
 */
export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  (
    {
      children,
      className,
      delay = 0,
      duration: _duration = 'normal',
      initialScale = 0.8,
      inView = false,
      ...motionProps
    },
    ref
  ) => {
    const transition = useMemo(
      () => ({
        type: 'spring' as const,
        damping: 15,
        stiffness: 300,
        delay,
      }),
      [delay]
    );

    const variants = useMemo(
      () => ({
        hidden: {
          opacity: 0,
          scale: initialScale,
        },
        visible: {
          opacity: 1,
          scale: 1,
        },
      }),
      [initialScale]
    );

    const animationProps = useMemo(
      () =>
        inView
          ? {
            variants,
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, margin: '-50px' },
          }
          : {
            variants,
            initial: 'hidden',
            animate: 'visible',
          },
      [inView, variants]
    );

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        transition={transition}
        {...animationProps}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

interface StaggerContainerProps
  extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  variant?: keyof typeof commonVariants;
  inView?: boolean;
}

/**
 * Container for staggered animations with optimized performance
 */
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>(
  (
    {
      children,
      className,
      staggerDelay = 0.1,
      delayChildren = 0.1,
      variant: _variant = 'stagger',
      inView = false,
      ...motionProps
    },
    ref
  ) => {
    const staggerVariants = useMemo(
      () => ({
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }),
      [staggerDelay, delayChildren]
    );

    const animationProps = useMemo(
      () =>
        inView
          ? {
            variants: staggerVariants,
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, margin: '-100px' },
          }
          : {
            variants: staggerVariants,
            initial: 'hidden',
            animate: 'visible',
          },
      [inView, staggerVariants]
    );

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        {...animationProps}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'fadeIn' | 'slideUp' | 'scaleIn';
}

/**
 * Individual item for stagger animations
 */
export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, variant = 'fadeIn', ...motionProps }, ref) => (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={commonVariants[variant]}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
);

StaggerItem.displayName = 'StaggerItem';

// ============================================================================
// INTERACTION ANIMATIONS
// ============================================================================

interface HoverScaleProps extends Omit<HTMLMotionProps<'div'>, 'whileHover'> {
  children?: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

/**
 * Hover scale effect with optimized performance
 */
export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  (
    { children, className, scale = 1.05, duration = 0.2, ...motionProps },
    ref
  ) => (
    <motion.div
      ref={ref}
      className={cn(className)}
      whileHover={{
        scale,
        transition: {
          duration,
          ease: ANIMATION_CONFIG.easings.easeOut,
        },
      }}
      whileTap={{ scale: scale * 0.95 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
);

HoverScale.displayName = 'HoverScale';

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

interface PulseProps extends Omit<HTMLMotionProps<'div'>, 'animate'> {
  children?: React.ReactNode;
  className?: string;
  duration?: number;
  intensity?: number;
}

/**
 * Pulse animation for loading states
 */
export const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  (
    { children, className, duration = 2, intensity = 0.7, ...motionProps },
    ref
  ) => (
    <motion.div
      ref={ref}
      className={cn(className)}
      animate={{
        opacity: [1, intensity, 1],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: ANIMATION_CONFIG.easings.easeInOut,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
);

Pulse.displayName = 'Pulse';

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ANIMATION_CONFIG,
  type BaseAnimatedProps,
  type PageWrapperProps,
  type FadeInProps,
  type SlideInProps,
  type ScaleInProps,
  type StaggerContainerProps,
  type StaggerItemProps,
  type HoverScaleProps,
  type PulseProps,
};

// Default export for dynamic imports
const AnimatedComponents = {
  AnimatedDiv,
  PageWrapper,
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  Pulse,
  ANIMATION_CONFIG,
};

export default AnimatedComponents;
