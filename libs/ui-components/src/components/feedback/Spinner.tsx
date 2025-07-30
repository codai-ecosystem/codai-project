/**
 * @fileoverview Spinner Component - Loading Indicator
 * @version 1.0.0
 * 
 * Versatile spinner component with multiple variants, sizes, and animations.
 * Supports accessibility features and customizable styling.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/className';

const spinnerVariants = cva('inline-block animate-spin', {
  variants: {
    variant: {
      default: 'border-current border-t-transparent rounded-full',
      dots: 'flex items-center justify-center gap-1',
      pulse: 'bg-current rounded-full animate-pulse',
      bars: 'flex items-end justify-center gap-1',
      ring: 'border-2 border-current border-t-transparent rounded-full',
      dual: 'border-2 border-current border-t-transparent border-r-transparent rounded-full'
    },
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12'
    },
    speed: {
      slow: 'animate-spin-slow',
      normal: 'animate-spin',
      fast: 'animate-spin-fast'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    speed: 'normal'
  }
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
  VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for screen readers
   */
  label?: string;

  /**
   * Custom color for the spinner
   */
  color?: string;

  /**
   * Show loading text alongside spinner
   */
  text?: string;

  /**
   * Position of loading text relative to spinner
   */
  textPosition?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Custom thickness for border-based spinners
   */
  thickness?: '1' | '2' | '3' | '4';

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    className,
    variant,
    size,
    speed,
    label = 'Loading',
    color,
    text,
    textPosition = 'bottom',
    thickness = '2',
    style,
    ...props
  }, ref) => {
    const sizeClasses = {
      xs: { width: '12px', height: '12px', text: 'text-xs' },
      sm: { width: '16px', height: '16px', text: 'text-sm' },
      md: { width: '24px', height: '24px', text: 'text-base' },
      lg: { width: '32px', height: '32px', text: 'text-lg' },
      xl: { width: '48px', height: '48px', text: 'text-xl' }
    };

    const currentSize = sizeClasses[size || 'md'];

    // Animation variants for different spinner types
    const animationVariants = {
      spin: {
        rotate: [0, 360],
        transition: {
          duration: speed === 'slow' ? 1.5 : speed === 'fast' ? 0.5 : 1,
          repeat: Infinity,
          ease: 'linear'
        }
      },
      pulse: {
        scale: [1, 0.8, 1],
        opacity: [1, 0.5, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    };

    const renderSpinner = () => {
      const baseClasses = cn(
        spinnerVariants({ variant, size, speed }),
        color && `text-${color}`,
        className
      );

      const customStyle = {
        ...style,
        ...(color && !color.startsWith('text-') && { color }),
      };

      switch (variant) {
        case 'dots':
          return (
            <div className={cn('flex items-center justify-center gap-1', currentSize.text)}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'rounded-full bg-current',
                    size === 'xs' && 'h-1 w-1',
                    size === 'sm' && 'h-1.5 w-1.5',
                    size === 'md' && 'h-2 w-2',
                    size === 'lg' && 'h-2.5 w-2.5',
                    size === 'xl' && 'h-3 w-3'
                  )}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut'
                  }}
                  style={customStyle}
                />
              ))}
            </div>
          );

        case 'bars':
          return (
            <div className={cn('flex items-end justify-center gap-0.5', currentSize.text)}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'bg-current rounded-sm',
                    size === 'xs' && 'w-0.5 h-2',
                    size === 'sm' && 'w-0.5 h-3',
                    size === 'md' && 'w-1 h-4',
                    size === 'lg' && 'w-1 h-6',
                    size === 'xl' && 'w-1.5 h-8'
                  )}
                  animate={{
                    scaleY: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }}
                  style={customStyle}
                />
              ))}
            </div>
          );

        case 'pulse':
          return (
            <motion.div
              className={cn(
                'bg-current rounded-full',
                spinnerVariants({ size }),
                className
              )}
              variants={animationVariants}
              animate="pulse"
              style={customStyle}
            />
          );

        default:
          return (
            <motion.div
              className={cn(
                baseClasses,
                `border-${thickness}`
              )}
              variants={animationVariants}
              animate="spin"
              style={customStyle}
            />
          );
      }
    };

    const spinnerElement = renderSpinner();

    if (!text) {
      return (
        <div
          ref={ref}
          role="status"
          aria-label={label}
          className="inline-flex items-center justify-center"
          {...props}
        >
          {spinnerElement}
          <span className="sr-only">{label}</span>
        </div>
      );
    }

    // Layout with text
    const textElement = (
      <span className={cn('text-muted-foreground', currentSize.text)}>
        {text}
      </span>
    );

    const flexDirection = {
      top: 'flex-col-reverse',
      bottom: 'flex-col',
      left: 'flex-row-reverse',
      right: 'flex-row'
    };

    const gap = {
      top: 'gap-2',
      bottom: 'gap-2',
      left: 'gap-3',
      right: 'gap-3'
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center',
          flexDirection[textPosition],
          gap[textPosition]
        )}
        {...props}
      >
        {spinnerElement}
        {textElement}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Loading Overlay Component
 * Full-screen or container overlay with spinner
 */
export interface LoadingOverlayProps {
  /**
   * Whether the overlay is visible
   */
  visible: boolean;

  /**
   * Loading message
   */
  message?: string;

  /**
   * Spinner props
   */
  spinnerProps?: SpinnerProps;

  /**
   * Custom overlay className
   */
  className?: string;

  /**
   * Whether to blur the background
   */
  blur?: boolean;

  /**
   * Opacity of the overlay background
   */
  opacity?: 'light' | 'medium' | 'heavy';

  /**
   * Position of the overlay
   */
  position?: 'fixed' | 'absolute';
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({
    visible,
    message = 'Loading...',
    spinnerProps = {},
    className,
    blur = false,
    opacity = 'medium',
    position = 'fixed',
    ...props
  }, ref) => {
    if (!visible) return null;

    const opacityClasses = {
      light: 'bg-background/60',
      medium: 'bg-background/80',
      heavy: 'bg-background/95'
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'inset-0 z-50 flex items-center justify-center',
          position === 'fixed' ? 'fixed' : 'absolute',
          opacityClasses[opacity],
          blur && 'backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card shadow-lg border">
          <Spinner
            size="lg"
            text={message}
            textPosition="bottom"
            {...spinnerProps}
          />
        </div>
      </motion.div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * Inline Loader Component
 * Small spinner for inline loading states
 */
export interface InlineLoaderProps extends SpinnerProps {
  /**
   * Whether to show the loader
   */
  loading: boolean;

  /**
   * Content to show when not loading
   */
  children?: React.ReactNode;

  /**
   * Fallback content while loading
   */
  fallback?: React.ReactNode;
}

export const InlineLoader = forwardRef<HTMLDivElement, InlineLoaderProps>(
  ({ loading, children, fallback, ...spinnerProps }, ref) => {
    if (loading) {
      return fallback || (
        <Spinner
          ref={ref}
          size="sm"
          variant="dots"
          {...spinnerProps}
        />
      );
    }

    return <>{children}</>;
  }
);

InlineLoader.displayName = 'InlineLoader';

export type { VariantProps };
export { spinnerVariants };
