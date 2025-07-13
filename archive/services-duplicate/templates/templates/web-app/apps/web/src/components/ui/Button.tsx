import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { LoadingSpinner } from './LoadingSpinner';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95 transition-transform',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ): React.ReactElement => {
    const Comp = asChild === true ? Slot : 'button';
    const content = (
      <>
        {isLoading === true ? (
          <LoadingSpinner
            size="sm"
            className="mr-2"
            data-testid="loading-spinner"
          />
        ) : null}
        {isLoading === false && leftIcon !== undefined ? (
          <span className="mr-2" data-testid="left-icon-container">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {isLoading === false && rightIcon !== undefined ? (
          <span className="ml-2" data-testid="right-icon-container">
            {rightIcon}
          </span>
        ) : null}
      </>
    );

    if (asChild === true) {
      return (
        <Slot
          className={cn(
            buttonVariants({ variant, size, fullWidth, className })
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={(disabled ?? false) || isLoading}
        aria-disabled={(disabled ?? false) || isLoading}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
