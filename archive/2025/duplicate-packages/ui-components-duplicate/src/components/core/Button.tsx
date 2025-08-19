/**
 * @fileoverview Button Component - Core UI Element
 * @version 1.0.0
 * 
 * Production-ready button component with comprehensive variants, sizes, and states.
 * Features accessibility compliance, loading states, icon support, and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion, type MotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/className';
import { Spinner } from '../feedback/Spinner';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95',
    'select-none'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
          'focus-visible:ring-primary'
        ],
        secondary: [
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          'focus-visible:ring-secondary'
        ],
        destructive: [
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
          'focus-visible:ring-destructive'
        ],
        outline: [
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-accent'
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-accent'
        ],
        link: [
          'text-primary underline-offset-4 hover:underline',
          'focus-visible:ring-primary'
        ],
        gradient: [
          'bg-gradient-to-r from-primary to-secondary text-white shadow-lg',
          'hover:from-primary/90 hover:to-secondary/90',
          'focus-visible:ring-primary'
        ]
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9 p-0'
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        fit: 'w-fit'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto'
    }
  }
);

const buttonAnimationVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  loading: {
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  /**
   * Render as child component (using Radix Slot)
   */
  asChild?: boolean;

  /**
   * Loading state - shows spinner and disables interaction
   */
  loading?: boolean;

  /**
   * Loading text to display when loading is true
   */
  loadingText?: string;

  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;

  /**
   * Enable motion animations
   */
  animated?: boolean;

  /**
   * Custom motion props
   */
  motionProps?: MotionProps;

  /**
   * Tooltip text for accessibility
   */
  tooltip?: string;

  /**
   * ARIA label for screen readers
   */
  'aria-label'?: string;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    width,
    asChild = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    animated = true,
    motionProps,
    tooltip,
    children,
    disabled,
    type = 'button',
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : animated ? motion.button : 'button';
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {loading ? (
          <>
            <Spinner size="sm" className="text-current" />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children && <span className="truncate">{children}</span>}
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </>
    );

    const buttonProps = {
      className: cn(buttonVariants({ variant, size, width, className })),
      ref,
      disabled: isDisabled,
      type,
      title: tooltip,
      'aria-disabled': isDisabled,
      'aria-busy': loading,
      ...props
    };

    if (animated && !asChild) {
      return (
        <motion.button
          {...buttonProps}
          variants={buttonAnimationVariants}
          initial="initial"
          whileHover={!isDisabled ? "hover" : undefined}
          whileTap={!isDisabled ? "tap" : undefined}
          animate={loading ? "loading" : "initial"}
          {...motionProps}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <Comp {...buttonProps}>
        {buttonContent}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

/**
 * Button Group Component for related actions
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, orientation = 'horizontal', size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientation === 'horizontal'
            ? 'flex-row divide-x divide-border'
            : 'flex-col divide-y divide-border',
          '[&>button]:rounded-none',
          '[&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md',
          orientation === 'vertical' && '[&>button:first-child]:rounded-t-md [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-b-md [&>button:last-child]:rounded-r-none',
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Button) {
            return React.cloneElement(child, {
              size: child.props.size || size,
              variant: child.props.variant || variant
            });
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

/**
 * Icon Button Component - Specialized button for icons only
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('aspect-square', className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Floating Action Button Component
 */
export interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  size?: 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FABProps>(
  ({ className, size = 'lg', position = 'bottom-right', ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    };

    return (
      <Button
        ref={ref}
        variant="primary"
        size={size === 'lg' ? 'xl' : 'lg'}
        className={cn(
          'rounded-full shadow-lg hover:shadow-xl',
          'z-50 transition-all duration-300',
          positionClasses[position],
          size === 'lg' ? 'h-14 w-14' : 'h-12 w-12',
          className
        )}
        {...props}
      />
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

export type { VariantProps };
export { buttonVariants };
