'use client';

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import React, { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Type definitions
interface AnimatedDivProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  variants?: Variants;
}

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

interface ScaleInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

interface StaggerContainerProps
  extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
}

interface BouncyButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'variants'> {
  children?: ReactNode;
  className?: string;
}

interface FloatingProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children?: ReactNode;
  className?: string;
  floatAmount?: number;
  duration?: number;
}

// Base animated div component
export const AnimatedDiv = forwardRef<HTMLDivElement, AnimatedDivProps>(
  (props, ref) => {
    const { children, className, variants, ...motionProps } = props;

    const motionPropsWithVariants = variants
      ? { ...motionProps, variants }
      : motionProps;

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        {...motionPropsWithVariants}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedDiv.displayName = 'AnimatedDiv';

// Page wrapper with transitions
export const PageWrapper = forwardRef<HTMLDivElement, AnimatedDivProps>(
  (props, ref) => {
    const { children, className, ...motionProps } = props;
    return (
      <motion.div
        ref={ref}
        className={cn('h-full w-full', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          type: 'tween',
          ease: 'anticipate',
          duration: 0.4,
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

PageWrapper.displayName = 'PageWrapper';

// Fade in component
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>((props, ref) => {
  const {
    children,
    className,
    delay = 0,
    duration = 0.6,
    ...motionProps
  } = props;
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay,
        duration,
        ease: 'easeOut',
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

FadeIn.displayName = 'FadeIn';

// Scale in component
export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  (props, ref) => {
    const {
      children,
      className,
      delay = 0,
      duration = 0.3,
      ...motionProps
    } = props;
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay,
          duration,
          ease: 'easeOut',
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';

// Slide in component
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  (props, ref) => {
    const {
      children,
      className,
      direction = 'up',
      delay = 0,
      duration = 0.6,
      ...motionProps
    } = props;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up':
          return { y: 50, opacity: 0 };
        case 'down':
          return { y: -50, opacity: 0 };
        case 'left':
          return { x: 50, opacity: 0 };
        case 'right':
          return { x: -50, opacity: 0 };
        default:
          return { y: 50, opacity: 0 };
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={getInitialPosition()}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{
          delay,
          duration,
          ease: 'easeOut',
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

SlideIn.displayName = 'SlideIn';

// Stagger container
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>((props, ref) => {
  const {
    children,
    className,
    staggerDelay = 0.1,
    delayChildren = 0.1,
    ...motionProps
  } = props;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            delayChildren,
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
});

StaggerContainer.displayName = 'StaggerContainer';

// Stagger item
export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  (props, ref) => {
    const { children, className, ...motionProps } = props;
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: 'easeOut',
            },
          },
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerItem.displayName = 'StaggerItem';

// Bouncy button
export const BouncyButton = forwardRef<HTMLButtonElement, BouncyButtonProps>(
  (props, ref) => {
    const { children, className, ...motionProps } = props;
    return (
      <motion.button
        ref={ref}
        className={cn(className)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
        }}
        {...motionProps}
      >
        {children}
      </motion.button>
    );
  }
);

BouncyButton.displayName = 'BouncyButton';

// Floating animation
export const Floating = forwardRef<HTMLDivElement, FloatingProps>(
  (props, ref) => {
    const {
      children,
      className,
      floatAmount = 10,
      duration = 2,
      ...motionProps
    } = props;
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        animate={{
          y: [-floatAmount, floatAmount, -floatAmount],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

Floating.displayName = 'Floating';
