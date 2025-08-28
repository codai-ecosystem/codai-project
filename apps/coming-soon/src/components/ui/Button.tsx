'use client';

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useMotion } from '@/contexts/MotionContext';
import { cn } from '@/utils';
import type { ComponentVariant, ComponentSize } from '@/components/types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Button content
     */
    children: ReactNode;
    
    /**
     * Visual variant
     */
    variant?: ComponentVariant;
    
    /**
     * Button size
     */
    size?: ComponentSize;
    
    /**
     * Loading state
     */
    loading?: boolean;
    
    /**
     * Success state for feedback
     */
    success?: boolean;
    
    /**
     * Error state for feedback
     */
    error?: boolean;
    
    /**
     * Icon to display before text
     */
    iconBefore?: ReactNode;
    
    /**
     * Icon to display after text
     */
    iconAfter?: ReactNode;
    
    /**
     * Full width button
     */
    fullWidth?: boolean;
    
    /**
     * Test ID for testing
     */
    testId?: string;
}

/**
 * Button Component
 * Accessible, themed button with variants and states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    success = false,
    error = false,
    iconBefore,
    iconAfter,
    fullWidth = false,
    disabled,
    testId,
    ...props
}, ref) => {
    const { resolvedTheme } = useTheme();
    const { motionPreference } = useMotion();

    const isDisabled = disabled || loading;
    const hasIcon = iconBefore || iconAfter;

    const buttonClasses = cn(
        // Base styles
        'inline-flex',
        'items-center',
        'justify-center',
        'gap-2',
        'font-medium',
        'transition-all',
        'duration-200',
        'ease-out',
        'border',
        'focus:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-offset-2',
        'focus-visible:ring-blue-500',
        
        // Size variants - xs
        size === 'xs' && 'px-2.5',
        size === 'xs' && 'py-1.5',
        size === 'xs' && 'text-xs',
        size === 'xs' && 'rounded',
        size === 'xs' && 'min-h-[28px]',
        
        // Size variants - sm
        size === 'sm' && 'px-3',
        size === 'sm' && 'py-2',
        size === 'sm' && 'text-sm',
        size === 'sm' && 'rounded-md',
        size === 'sm' && 'min-h-[32px]',
        
        // Size variants - md
        size === 'md' && 'px-4',
        size === 'md' && 'py-2.5',
        size === 'md' && 'text-sm',
        size === 'md' && 'rounded-md',
        size === 'md' && 'min-h-[40px]',
        
        // Size variants - lg
        size === 'lg' && 'px-6',
        size === 'lg' && 'py-3',
        size === 'lg' && 'text-base',
        size === 'lg' && 'rounded-lg',
        size === 'lg' && 'min-h-[48px]',
        
        // Size variants - xl
        size === 'xl' && 'px-8',
        size === 'xl' && 'py-4',
        size === 'xl' && 'text-lg',
        size === 'xl' && 'rounded-lg',
        size === 'xl' && 'min-h-[56px]',
        
        // Variant styles - Primary
        variant === 'primary' && 'bg-blue-600',
        variant === 'primary' && 'border-blue-600',
        variant === 'primary' && 'text-white',
        variant === 'primary' && 'shadow-sm',
        variant === 'primary' && !isDisabled && motionPreference !== 'disabled' && 'hover:bg-blue-700',
        variant === 'primary' && !isDisabled && motionPreference !== 'disabled' && 'hover:border-blue-700',
        variant === 'primary' && !isDisabled && motionPreference !== 'disabled' && 'hover:shadow-md',
        variant === 'primary' && !isDisabled && motionPreference !== 'disabled' && 'active:bg-blue-800',
        variant === 'primary' && !isDisabled && motionPreference !== 'disabled' && 'active:transform',
        variant === 'primary' && !isDisabled && motionPreference !== 'disabled' && 'active:scale-95',
        
        // Variant styles - Secondary
        variant === 'secondary' && 'bg-gray-100',
        variant === 'secondary' && 'border-gray-300',
        variant === 'secondary' && 'text-gray-900',
        variant === 'secondary' && 'shadow-sm',
        variant === 'secondary' && resolvedTheme === 'dark' && 'bg-gray-800',
        variant === 'secondary' && resolvedTheme === 'dark' && 'border-gray-600',
        variant === 'secondary' && resolvedTheme === 'dark' && 'text-gray-100',
        variant === 'secondary' && !isDisabled && motionPreference !== 'disabled' && 'hover:bg-gray-200',
        variant === 'secondary' && !isDisabled && motionPreference !== 'disabled' && 'hover:border-gray-400',
        variant === 'secondary' && !isDisabled && motionPreference !== 'disabled' && resolvedTheme === 'dark' && 'hover:bg-gray-700',
        variant === 'secondary' && !isDisabled && motionPreference !== 'disabled' && 'active:transform',
        variant === 'secondary' && !isDisabled && motionPreference !== 'disabled' && 'active:scale-95',
        
        // Variant styles - Tertiary
        variant === 'tertiary' && 'bg-transparent',
        variant === 'tertiary' && 'border-transparent',
        variant === 'tertiary' && 'text-gray-700',
        variant === 'tertiary' && resolvedTheme === 'dark' && 'text-gray-300',
        variant === 'tertiary' && !isDisabled && motionPreference !== 'disabled' && 'hover:bg-gray-100',
        variant === 'tertiary' && !isDisabled && motionPreference !== 'disabled' && resolvedTheme === 'dark' && 'hover:bg-gray-800',
        variant === 'tertiary' && !isDisabled && motionPreference !== 'disabled' && 'active:transform',
        variant === 'tertiary' && !isDisabled && motionPreference !== 'disabled' && 'active:scale-95',
        
        // Variant styles - Ghost
        variant === 'ghost' && 'bg-transparent',
        variant === 'ghost' && 'border-transparent',
        variant === 'ghost' && 'text-blue-600',
        variant === 'ghost' && resolvedTheme === 'dark' && 'text-blue-400',
        variant === 'ghost' && !isDisabled && motionPreference !== 'disabled' && 'hover:bg-blue-50',
        variant === 'ghost' && !isDisabled && motionPreference !== 'disabled' && resolvedTheme === 'dark' && 'hover:bg-blue-950',
        variant === 'ghost' && !isDisabled && motionPreference !== 'disabled' && 'active:transform',
        variant === 'ghost' && !isDisabled && motionPreference !== 'disabled' && 'active:scale-95',
        
        // State styles
        loading && 'cursor-wait',
        loading && 'pointer-events-none',
        
        success && 'bg-green-600',
        success && 'border-green-600',
        success && 'text-white',
        
        error && 'bg-red-600',
        error && 'border-red-600',
        error && 'text-white',
        
        // Disabled styles
        isDisabled && 'opacity-50',
        isDisabled && 'cursor-not-allowed',
        isDisabled && 'pointer-events-none',
        
        // Full width
        fullWidth && 'w-full',
        
        className
    );

    return (
        <button
            ref={ref}
            className={buttonClasses}
            disabled={isDisabled}
            data-testid={testId}
            data-variant={variant}
            data-size={size}
            data-loading={loading}
            data-success={success}
            data-error={error}
            aria-busy={loading}
            {...props}
        >
            {/* Loading spinner */}
            {loading && (
                <svg
                    className={cn(
                        'animate-spin',
                        size === 'xs' && 'h-3 w-3',
                        size === 'sm' && 'h-3 w-3',
                        size === 'md' && 'h-4 w-4',
                        size === 'lg' && 'h-4 w-4',
                        size === 'xl' && 'h-5 w-5'
                    )}
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            
            {/* Icon before */}
            {!loading && iconBefore && (
                <span
                    className={cn(
                        'flex-shrink-0',
                        size === 'xs' && 'h-3 w-3',
                        size === 'sm' && 'h-3 w-3',
                        size === 'md' && 'h-4 w-4',
                        size === 'lg' && 'h-4 w-4',
                        size === 'xl' && 'h-5 w-5'
                    )}
                    aria-hidden="true"
                >
                    {iconBefore}
                </span>
            )}
            
            {/* Button text */}
            <span className={hasIcon ? 'truncate' : undefined}>
                {children}
            </span>
            
            {/* Icon after */}
            {!loading && iconAfter && (
                <span
                    className={cn(
                        'flex-shrink-0',
                        size === 'xs' && 'h-3 w-3',
                        size === 'sm' && 'h-3 w-3',
                        size === 'md' && 'h-4 w-4',
                        size === 'lg' && 'h-4 w-4',
                        size === 'xl' && 'h-5 w-5'
                    )}
                    aria-hidden="true"
                >
                    {iconAfter}
                </span>
            )}
        </button>
    );
});

Button.displayName = 'Button';