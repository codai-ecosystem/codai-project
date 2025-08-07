import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'primary' | 'secondary' | 'white' | 'gray' | 'blue'
    className?: string
    ariaLabel?: string
    role?: boolean // Allow disabling role
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
}

const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-500',
    blue: 'text-blue-600'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className,
    ariaLabel = 'Loading',
    role = true
}) => {
    return (
        <svg
            className={cn(
                'animate-spin',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            {...(role && { role: 'status', 'aria-label': ariaLabel })}
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
    )
}

interface LoadingDotsProps {
    size?: 'sm' | 'md' | 'lg'
    color?: 'gray' | 'blue' | 'green' | 'red'
    className?: string
    ariaLabel?: string
}

const dotSizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
}

const dotColorClasses = {
    gray: 'bg-gray-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
    size = 'md',
    color = 'gray',
    className,
    ariaLabel = 'Loading'
}) => {
    return (
        <div className={cn('flex space-x-1', className)} role="status" aria-label={ariaLabel}>
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={cn(
                        'rounded-full animate-pulse',
                        dotSizeClasses[size],
                        dotColorClasses[color]
                    )}
                    style={{
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: '1.4s'
                    }}
                />
            ))}
        </div>
    )
}

interface LoadingSkeletonProps {
    className?: string
    lines?: number
    animate?: boolean
    ariaLabel?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    className,
    lines = 1,
    animate = true,
    ariaLabel = 'Loading content'
}) => {
    return (
        <div className={cn('space-y-2', className)} role="status" aria-label={ariaLabel}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        'h-4 bg-gray-200 dark:bg-gray-700 rounded',
                        animate && 'animate-pulse',
                        index === lines - 1 && lines > 1 && 'w-3/4' // Last line shorter
                    )}
                />
            ))}
        </div>
    )
}

interface LoadingOverlayProps {
    show?: boolean
    message?: string
    className?: string
    spinnerSize?: 'sm' | 'md' | 'lg'
    spinnerColor?: 'primary' | 'secondary' | 'white'
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    show = true,
    message,
    className,
    spinnerSize = 'lg',
    spinnerColor = 'primary'
}) => {
    if (!show) {
        return null
    }

    return (
        <div
            className={cn(
                'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center',
                className
            )}
            role="status"
            aria-label="Loading overlay"
        >
            <div className="flex flex-col items-center space-y-4">
                <LoadingSpinner size={spinnerSize} color={spinnerColor} role={false} />
                {message && (
                    <p className="text-sm text-white">{message}</p>
                )}
            </div>
        </div>
    )
}

// Pulse animation for loading states
export const LoadingPulse: React.FC<{ className?: string; children: React.ReactNode }> = ({
    className,
    children
}) => {
    return (
        <div className={cn('animate-pulse', className)}>
            {children}
        </div>
    )
}
