import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
    'flex w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'border-border hover:border-border/80 focus-visible:border-primary focus-visible:ring-primary/50',
                error: 'border-danger focus-visible:ring-danger/50 focus-visible:border-danger',
                success: 'border-success focus-visible:ring-success/50 focus-visible:border-success',
                warning: 'border-warning focus-visible:ring-warning/50 focus-visible:border-warning',
            },
            size: {
                default: 'h-10',
                sm: 'h-8 px-2 text-xs',
                lg: 'h-12 px-4 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
    label?: string
    error?: string
    success?: string
    warning?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        variant,
        size,
        type = 'text',
        label,
        error,
        success,
        warning,
        leftIcon,
        rightIcon,
        helperText,
        id,
        ...props
    }, ref) => {
        // Auto-determine variant based on state
        const effectiveVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        type={type}
                        id={inputId}
                        className={cn(
                            inputVariants({ variant: effectiveVariant, size, className }),
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10'
                        )}
                        ref={ref}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {(error || success || warning || helperText) && (
                    <div className="space-y-1">
                        {error && (
                            <p className="text-sm text-danger" role="alert">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="text-sm text-success">
                                {success}
                            </p>
                        )}
                        {warning && (
                            <p className="text-sm text-warning">
                                {warning}
                            </p>
                        )}
                        {helperText && !error && !success && !warning && (
                            <p className="text-sm text-muted-foreground">
                                {helperText}
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input, inputVariants }
