'use client';

import React, { type HTMLAttributes } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils';
import { ComponentSize } from '@/components/types';

type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Loader variant
     */
    variant?: LoaderVariant;
    
    /**
     * Loader size
     */
    size?: ComponentSize;
    
    /**
     * Loading text
     */
    text?: string;
    
    /**
     * Color variant
     */
    color?: 'primary' | 'secondary' | 'white';
    
    /**
     * Test ID for testing
     */
    testId?: string;
}

/**
 * Loader Component
 * Loading indicators with various styles
 */
export const Loader: React.FC<LoaderProps> = ({
    className,
    variant = 'spinner',
    size = 'md',
    text,
    color = 'primary',
    testId,
    ...props
}) => {
    const { resolvedTheme } = useTheme();

    // Size classes
    const getSizeClasses = () => {
        switch (size) {
            case 'xs': return 'w-4 h-4';
            case 'sm': return 'w-5 h-5';
            case 'md': return 'w-6 h-6';
            case 'lg': return 'w-8 h-8';
            case 'xl': return 'w-10 h-10';
            default: return 'w-6 h-6';
        }
    };

    // Color classes
    const getColorClasses = () => {
        switch (color) {
            case 'primary':
                return 'text-blue-600 dark:text-blue-400';
            case 'secondary':
                return 'text-gray-600 dark:text-gray-400';
            case 'white':
                return 'text-white';
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    // Spinner loader
    if (variant === 'spinner') {
        return (
            <div
                className={cn('flex items-center justify-center', className)}
                data-testid={testId}
                {...props}
            >
                <div className="flex flex-col items-center space-y-2">
                    <div
                        className={cn(
                            getSizeClasses(),
                            'animate-spin rounded-full border-2 border-t-transparent',
                            color === 'primary' && 'border-blue-600 dark:border-blue-400',
                            color === 'secondary' && 'border-gray-600 dark:border-gray-400',
                            color === 'white' && 'border-white'
                        )}
                    />
                    {text && (
                        <p className={cn('text-sm', getColorClasses())}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Dots loader
    if (variant === 'dots') {
        const dotSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3';
        
        return (
            <div
                className={cn('flex items-center justify-center', className)}
                data-testid={testId}
                {...props}
            >
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                className={cn(
                                    dotSize,
                                    'rounded-full animate-pulse',
                                    color === 'primary' && 'bg-blue-600 dark:bg-blue-400',
                                    color === 'secondary' && 'bg-gray-600 dark:bg-gray-400',
                                    color === 'white' && 'bg-white'
                                )}
                                style={{
                                    animationDelay: `${index * 0.2}s`,
                                    animationDuration: '1s'
                                }}
                            />
                        ))}
                    </div>
                    {text && (
                        <p className={cn('text-sm', getColorClasses())}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Pulse loader
    if (variant === 'pulse') {
        return (
            <div
                className={cn('flex items-center justify-center', className)}
                data-testid={testId}
                {...props}
            >
                <div className="flex flex-col items-center space-y-2">
                    <div
                        className={cn(
                            getSizeClasses(),
                            'rounded-full animate-pulse',
                            color === 'primary' && 'bg-blue-600 dark:bg-blue-400',
                            color === 'secondary' && 'bg-gray-600 dark:bg-gray-400',
                            color === 'white' && 'bg-white'
                        )}
                    />
                    {text && (
                        <p className={cn('text-sm', getColorClasses())}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Bars loader
    if (variant === 'bars') {
        const barHeight = size === 'xs' ? 'h-3' : size === 'sm' ? 'h-4' : size === 'md' ? 'h-5' : size === 'lg' ? 'h-6' : 'h-8';
        
        return (
            <div
                className={cn('flex items-center justify-center', className)}
                data-testid={testId}
                {...props}
            >
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-end space-x-1">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={cn(
                                    'w-1 animate-pulse rounded-sm',
                                    barHeight,
                                    color === 'primary' && 'bg-blue-600 dark:bg-blue-400',
                                    color === 'secondary' && 'bg-gray-600 dark:bg-gray-400',
                                    color === 'white' && 'bg-white'
                                )}
                                style={{
                                    animationDelay: `${index * 0.15}s`,
                                    animationDuration: '1.2s'
                                }}
                            />
                        ))}
                    </div>
                    {text && (
                        <p className={cn('text-sm', getColorClasses())}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Skeleton loader
    if (variant === 'skeleton') {
        return (
            <div
                className={cn('animate-pulse', className)}
                data-testid={testId}
                {...props}
            >
                <div className="flex space-x-4">
                    <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-10 w-10" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default to spinner
    return (
        <div
            className={cn('flex items-center justify-center', className)}
            data-testid={testId}
            {...props}
        >
            <div className="flex flex-col items-center space-y-2">
                <div
                    className={cn(
                        getSizeClasses(),
                        'animate-spin rounded-full border-2 border-t-transparent',
                        color === 'primary' && 'border-blue-600 dark:border-blue-400',
                        color === 'secondary' && 'border-gray-600 dark:border-gray-400',
                        color === 'white' && 'border-white'
                    )}
                />
                {text && (
                    <p className={cn('text-sm', getColorClasses())}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

Loader.displayName = 'Loader';