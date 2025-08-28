'use client';

import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useMotion } from '@/contexts/MotionContext';
import { cn } from '@/utils';

type CardVariant = 'default' | 'outlined' | 'filled' | 'ghost';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';
type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Card content
     */
    children: ReactNode;
    
    /**
     * Visual style variant
     */
    variant?: CardVariant;
    
    /**
     * Size variant affecting default padding
     */
    size?: CardSize;
    
    /**
     * Custom padding override
     */
    padding?: CardPadding;
    
    /**
     * Border radius
     */
    radius?: CardRadius;
    
    /**
     * Whether card is interactive (clickable)
     */
    interactive?: boolean;
    
    /**
     * Whether card is disabled
     */
    disabled?: boolean;
    
    /**
     * Whether to show shadow
     */
    shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl';
    
    /**
     * Whether to show hover effects
     */
    hover?: boolean;
    
    /**
     * Loading state
     */
    loading?: boolean;
    
    /**
     * Test ID for testing
     */
    testId?: string;
}

/**
 * Card Component
 * Flexible container component with consistent styling
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({
    children,
    className,
    variant = 'default',
    size = 'md',
    padding,
    radius = 'md',
    interactive = false,
    disabled = false,
    shadow = false,
    hover = false,
    loading = false,
    testId,
    onClick,
    ...props
}, ref) => {
    const { resolvedTheme } = useTheme();
    const { prefersReducedMotion } = useMotion();

    // Determine padding based on size or explicit padding prop
    const getPaddingClass = () => {
        if (padding) {
            switch (padding) {
                case 'none': return 'p-0';
                case 'xs': return 'p-2';
                case 'sm': return 'p-3';
                case 'md': return 'p-4';
                case 'lg': return 'p-6';
                case 'xl': return 'p-8';
                default: return 'p-4';
            }
        }
        
        // Use size-based padding if no explicit padding
        switch (size) {
            case 'sm': return 'p-3';
            case 'md': return 'p-4';
            case 'lg': return 'p-6';
            case 'xl': return 'p-8';
            default: return 'p-4';
        }
    };

    const cardClasses = cn(
        // Base styles
        'relative overflow-hidden',
        
        // Border radius
        radius === 'none' && 'rounded-none',
        radius === 'sm' && 'rounded-sm',
        radius === 'md' && 'rounded-md',
        radius === 'lg' && 'rounded-lg',
        radius === 'xl' && 'rounded-xl',
        radius === 'full' && 'rounded-full',
        
        // Padding
        getPaddingClass(),
        
        // Variant styles
        variant === 'default' && 'bg-white border border-gray-200',
        variant === 'default' && resolvedTheme === 'dark' && 'bg-gray-900 border-gray-700',
        
        variant === 'outlined' && 'bg-transparent border-2 border-gray-200',
        variant === 'outlined' && resolvedTheme === 'dark' && 'border-gray-700',
        
        variant === 'filled' && 'bg-gray-50 border border-gray-100',
        variant === 'filled' && resolvedTheme === 'dark' && 'bg-gray-800 border-gray-700',
        
        variant === 'ghost' && 'bg-transparent border-0',
        
        // Shadow
        shadow === true && 'shadow',
        shadow === 'sm' && 'shadow-sm',
        shadow === 'md' && 'shadow-md',
        shadow === 'lg' && 'shadow-lg',
        shadow === 'xl' && 'shadow-xl',
        
        // Interactive states
        interactive && 'cursor-pointer',
        interactive && !disabled && !prefersReducedMotion && 'transition-all duration-200',
        
        // Hover effects
        hover && !disabled && 'hover:shadow-md',
        hover && !disabled && resolvedTheme === 'light' && 'hover:bg-gray-50',
        hover && !disabled && resolvedTheme === 'dark' && 'hover:bg-gray-800',
        
        // Interactive hover
        interactive && !disabled && 'hover:scale-[1.02]',
        interactive && !disabled && 'hover:shadow-lg',
        
        // Focus styles
        interactive && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        
        // Loading state
        loading && 'pointer-events-none',
        
        className
    );

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || loading) {
            event.preventDefault();
            return;
        }
        onClick?.(event);
    };

    return (
        <div
            ref={ref}
            className={cardClasses}
            onClick={interactive ? handleClick : onClick}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive && !disabled ? 0 : undefined}
            aria-disabled={disabled}
            data-testid={testId}
            data-variant={variant}
            data-size={size}
            data-loading={loading}
            {...props}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
            )}
            {children}
        </div>
    );
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: CardPadding;
    testId?: string;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
    children,
    className,
    padding = 'none',
    testId,
    ...props
}, ref) => {
    const getPaddingClass = () => {
        switch (padding) {
            case 'xs': return 'p-2';
            case 'sm': return 'p-3';
            case 'md': return 'p-4';
            case 'lg': return 'p-6';
            case 'xl': return 'p-8';
            default: return 'p-0';
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                'border-b border-gray-200 dark:border-gray-700',
                getPaddingClass(),
                className
            )}
            data-testid={testId}
            {...props}
        >
            {children}
        </div>
    );
});

CardHeader.displayName = 'CardHeader';

/**
 * Card Content Component
 */
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: CardPadding;
    testId?: string;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
    children,
    className,
    padding = 'none',
    testId,
    ...props
}, ref) => {
    const getPaddingClass = () => {
        switch (padding) {
            case 'xs': return 'p-2';
            case 'sm': return 'p-3';
            case 'md': return 'p-4';
            case 'lg': return 'p-6';
            case 'xl': return 'p-8';
            default: return 'p-0';
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                getPaddingClass(),
                className
            )}
            data-testid={testId}
            {...props}
        >
            {children}
        </div>
    );
});

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: CardPadding;
    testId?: string;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
    children,
    className,
    padding = 'none',
    testId,
    ...props
}, ref) => {
    const getPaddingClass = () => {
        switch (padding) {
            case 'xs': return 'p-2';
            case 'sm': return 'p-3';
            case 'md': return 'p-4';
            case 'lg': return 'p-6';
            case 'xl': return 'p-8';
            default: return 'p-0';
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                'border-t border-gray-200 dark:border-gray-700',
                getPaddingClass(),
                className
            )}
            data-testid={testId}
            {...props}
        >
            {children}
        </div>
    );
});

CardFooter.displayName = 'CardFooter';