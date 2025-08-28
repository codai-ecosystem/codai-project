/**
 * @fileoverview Enhanced Button Component
 * @description Production-ready button component with comprehensive variants, loading states, and accessibility
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    [
        "inline-flex items-center justify-center",
        "whitespace-nowrap rounded-md text-sm font-medium",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "border"
    ].join(" "),
    {
        variants: {
            variant: {
                primary: [
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 focus-visible:bg-primary/90",
                    "border-primary",
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                secondary: [
                    "bg-secondary text-secondary-foreground", 
                    "hover:bg-secondary/90 focus-visible:bg-secondary/90",
                    "border-secondary",
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                tertiary: [
                    "bg-background text-foreground",
                    "hover:bg-muted focus-visible:bg-muted",
                    "border-border",
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                danger: [
                    "bg-danger text-danger-foreground",
                    "hover:bg-danger/90 focus-visible:bg-danger/90", 
                    "border-danger",
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                success: [
                    "bg-success text-success-foreground",
                    "hover:bg-success/90 focus-visible:bg-success/90",
                    "border-success", 
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                warning: [
                    "bg-warning text-warning-foreground",
                    "hover:bg-warning/90 focus-visible:bg-warning/90",
                    "border-warning",
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                info: [
                    "bg-info text-info-foreground", 
                    "hover:bg-info/90 focus-visible:bg-info/90",
                    "border-info",
                    "shadow-sm hover:shadow-md"
                ].join(" "),
                ghost: [
                    "bg-transparent text-foreground",
                    "hover:bg-muted focus-visible:bg-muted",
                    "border-transparent"
                ].join(" "),
                link: [
                    "bg-transparent text-primary",
                    "hover:text-primary/80 focus-visible:text-primary/80", 
                    "border-transparent p-0 h-auto",
                    "underline-offset-4 hover:underline"
                ].join(" "),
                // Legacy shadcn variants for compatibility
                default: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm",
                destructive: "bg-danger text-danger-foreground hover:bg-danger/90 border-danger shadow-sm",
                outline: "border-border bg-background hover:bg-muted hover:text-foreground shadow-sm",
            },
            size: {
                xs: "h-7 px-2 text-xs rounded-sm",
                sm: "h-8 px-3 text-sm rounded-md", 
                default: "h-10 px-4 py-2",
                md: "h-10 px-4 text-sm rounded-md",
                lg: "h-11 px-6 text-base rounded-md",
                xl: "h-12 px-8 text-lg rounded-lg",
                icon: "h-10 w-10 p-0",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
)

const LoadingSpinner = ({ size }: { size?: string }) => {
  const spinnerSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    default: 'h-4 w-4', 
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
    icon: 'h-4 w-4',
  } as const;

  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size as keyof typeof spinnerSizes] || spinnerSizes.default)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    /** Loading state - shows spinner and disables interaction */
    loading?: boolean
    /** Icon to display before the text */
    leftIcon?: React.ReactNode
    /** Icon to display after the text */
    rightIcon?: React.ReactNode
    /** Make button full width */
    fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ 
        className, 
        variant, 
        size, 
        asChild = false, 
        loading = false,
        leftIcon,
        rightIcon,
        fullWidth = false,
        disabled,
        children,
        ...props 
    }, ref) => {
        const Comp = asChild ? Slot : "button"
        const isDisabled = disabled || loading;
        
        return (
            <Comp
                className={cn(
                    buttonVariants({ variant, size }),
                    fullWidth && "w-full",
                    className
                )}
                ref={ref}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                {...props}
            >
                {/* Left icon or loading spinner */}
                {loading ? (
                    <LoadingSpinner size={size || 'default'} />
                ) : leftIcon ? (
                    <span className={cn('mr-2', children && 'flex-shrink-0')}>
                        {leftIcon}
                    </span>
                ) : null}

                {/* Button content */}
                {loading && children ? (
                    <span className="ml-2">{children}</span>
                ) : (
                    children
                )}

                {/* Right icon */}
                {!loading && rightIcon && (
                    <span className={cn('ml-2', children && 'flex-shrink-0')}>
                        {rightIcon}
                    </span>
                )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

// Icon button variant for actions without text
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** Icon to display */
  icon: React.ReactNode
  /** Accessible label for screen readers */
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'default', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size === 'default' ? 'icon' : size}
        className={cn('p-0', className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { Button, buttonVariants }
