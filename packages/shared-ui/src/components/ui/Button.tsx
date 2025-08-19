import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm hover:shadow-md",
        info: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
        // App-specific variants
        'app-primary': "bg-[var(--app-primary)] text-white hover:bg-[var(--app-primary-600)] shadow-sm hover:shadow-md",
        'app-outline': "border-2 border-[var(--app-primary)] text-[var(--app-primary)] bg-transparent hover:bg-[var(--app-primary)] hover:text-white",
        'app-ghost': "text-[var(--app-primary)] hover:bg-[var(--app-primary-50)] hover:text-[var(--app-primary-700)]",
        // Special effect variants
        gradient: "bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-600)] text-white hover:from-[var(--app-primary-600)] hover:to-[var(--app-primary-700)] shadow-lg hover:shadow-xl",
        'gradient-animated': "bg-gradient-to-r from-[var(--app-primary)] via-[var(--app-primary-600)] to-[var(--app-primary)] bg-[length:200%_100%] text-white hover:bg-[position:100%_0] transition-all duration-500 shadow-lg hover:shadow-xl",
        glass: "backdrop-blur-md bg-white/10 border border-white/20 text-foreground hover:bg-white/20 shadow-lg",
        glow: "bg-[var(--app-primary)] text-white shadow-lg shadow-[var(--app-primary)]/25 hover:shadow-[var(--app-primary)]/40 hover:shadow-xl",
        // Size-specific variants for better touch targets
        floating: "bg-[var(--app-primary)] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
        "icon-xl": "h-14 w-14 rounded-lg",
        // Touch-friendly sizes
        touch: "h-11 px-6 py-3 text-base rounded-lg",
        'touch-sm': "h-9 px-4 py-2 text-sm rounded-md",
        'touch-lg': "h-13 px-8 py-4 text-lg rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loadingText?: string
  fullWidth?: boolean
  pulse?: boolean
  tooltip?: string
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
    children,
    disabled,
    loadingText,
    fullWidth,
    pulse,
    tooltip,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    const isDisabled = disabled || loading

    // When using asChild, we need to pass only the children without additional wrapper elements
    // The loading, leftIcon, and rightIcon are ignored when asChild is true
    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size }),
            fullWidth && "w-full",
            pulse && "animate-pulse",
            className
          )}
          ref={ref}
          disabled={isDisabled}
          title={tooltip}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          pulse && "animate-pulse",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        title={tooltip}
        {...props}
      >
        {/* Ripple effect background */}
        {(variant === 'gradient-animated' || variant === 'glow') && (
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        )}

        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        {!loading && leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
        <span className="relative z-10">
          {loading && loadingText ? loadingText : children}
        </span>
        {!loading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
