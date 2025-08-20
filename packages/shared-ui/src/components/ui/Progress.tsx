'use client'

import React, { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== PROGRESS VARIANTS =====
const progressVariants = cva(
    'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
    {
        variants: {
            size: {
                sm: 'h-1',
                default: 'h-2',
                lg: 'h-3',
                xl: 'h-4'
            },
            variant: {
                default: 'bg-secondary',
                success: 'bg-green-100 dark:bg-green-900/20',
                warning: 'bg-yellow-100 dark:bg-yellow-900/20',
                destructive: 'bg-red-100 dark:bg-red-900/20',
                info: 'bg-blue-100 dark:bg-blue-900/20'
            }
        },
        defaultVariants: {
            size: 'default',
            variant: 'default'
        }
    }
)

const progressBarVariants = cva(
    'h-full w-full flex-1 bg-primary transition-all duration-500 ease-out',
    {
        variants: {
            variant: {
                default: 'bg-primary',
                success: 'bg-green-600',
                warning: 'bg-yellow-600',
                destructive: 'bg-red-600',
                info: 'bg-blue-600'
            },
            app: {
                default: 'bg-primary',
                codai: 'bg-codai-primary',
                memorai: 'bg-memorai-primary',
                bancai: 'bg-bancai-primary',
                romai: 'bg-romai-primary',
                ajutai: 'bg-ajutai-primary',
                controlai: 'bg-controlai-primary',
                studiai: 'bg-studiai-primary',
                sociai: 'bg-sociai-primary',
                cumparai: 'bg-cumparai-primary',
                donai: 'bg-donai-primary'
            },
            animated: {
                false: '',
                true: 'bg-gradient-to-r from-current via-white/20 to-current bg-[length:200%_100%] animate-pulse',
                shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent'
            },
            striped: {
                false: '',
                true: 'bg-[length:1rem_1rem] bg-gradient-to-r bg-repeat-x',
                animated: 'bg-[length:1rem_1rem] bg-gradient-to-r bg-repeat-x animate-[progress-stripes_1s_linear_infinite]'
            }
        },
        defaultVariants: {
            variant: 'default',
            app: 'default',
            animated: false,
            striped: false
        }
    }
)

// ===== PROGRESS INTERFACES =====
export interface ProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof progressVariants>, 'app'>,
    Omit<VariantProps<typeof progressBarVariants>, 'variant'> {
    value?: number
    max?: number
    app?: AppName | 'default'
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
    showLabel?: boolean
    label?: string
    indeterminate?: boolean
    gradient?: boolean
}

// ===== PROGRESS COMPONENT =====
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({
        className,
        value = 0,
        max = 100,
        size,
        variant = 'default',
        app,
        animated,
        striped,
        showLabel = false,
        label,
        indeterminate = false,
        gradient = false,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

        return (
            <div className="w-full">
                {(showLabel || label) && (
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                            {label || `Progress`}
                        </span>
                        {showLabel && !indeterminate && (
                            <span className="text-sm text-muted-foreground">
                                {Math.round(percentage)}%
                            </span>
                        )}
                    </div>
                )}

                <div
                    ref={ref}
                    className={cn(progressVariants({ size, variant }), className)}
                    {...props}
                >
                    <div
                        className={cn(
                            progressBarVariants({
                                variant,
                                app: app as any,
                                animated: indeterminate ? 'shimmer' : animated,
                                striped
                            }),
                            gradient && 'bg-gradient-to-r from-current to-current/80',
                            indeterminate
                                ? 'w-1/3 animate-[indeterminate_2s_ease-in-out_infinite]'
                                : 'transition-transform duration-500 ease-out'
                        )}
                        style={{
                            transform: indeterminate
                                ? 'translateX(-100%)'
                                : `translateX(-${100 - percentage}%)`
                        }}
                        role="progressbar"
                        aria-valuenow={indeterminate ? undefined : value}
                        aria-valuemin={0}
                        aria-valuemax={max}
                        aria-label={label}
                    />
                </div>
            </div>
        )
    }
)
Progress.displayName = 'Progress'

// ===== CIRCULAR PROGRESS =====
interface CircularProgressProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
    value?: number
    max?: number
    size?: number
    strokeWidth?: number
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
    app?: AppName | 'default'
    showPercentage?: boolean
    indeterminate?: boolean
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
    ({
        value = 0,
        max = 100,
        size = 40,
        strokeWidth = 4,
        variant = 'default',
        app,
        showPercentage = false,
        indeterminate = false,
        className,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
        const radius = (size - strokeWidth) / 2
        const circumference = radius * 2 * Math.PI
        const strokeDasharray = `${circumference} ${circumference}`
        const strokeDashoffset = circumference - (percentage / 100) * circumference

        const strokeColor = {
            default: 'stroke-primary',
            success: 'stroke-green-600',
            warning: 'stroke-yellow-600',
            destructive: 'stroke-red-600',
            info: 'stroke-blue-600'
        }

        const appStrokeColor = {
            default: 'stroke-primary',
            codai: 'stroke-codai-primary',
            memorai: 'stroke-memorai-primary',
            bancai: 'stroke-bancai-primary',
            romai: 'stroke-romai-primary',
            ajutai: 'stroke-ajutai-primary',
            controlai: 'stroke-controlai-primary',
            studiai: 'stroke-studiai-primary'
        }

        return (
            <div className="relative inline-flex items-center justify-center">
                <svg
                    ref={ref}
                    className={cn('transform -rotate-90', className)}
                    width={size}
                    height={size}
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-muted stroke-current opacity-20"
                    />

                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
                        strokeLinecap="round"
                        className={cn(
                            'text-primary transition-all duration-500 ease-out',
                            app ? appStrokeColor[app] : strokeColor[variant],
                            indeterminate && 'animate-spin'
                        )}
                        style={{
                            strokeDasharray: indeterminate
                                ? `${circumference * 0.25} ${circumference}`
                                : strokeDasharray
                        }}
                    />
                </svg>

                {showPercentage && !indeterminate && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        )
    }
)
CircularProgress.displayName = 'CircularProgress'

// ===== MULTI PROGRESS =====
interface MultiProgressProps extends Omit<ProgressProps, 'value' | 'variant' | 'app'> {
    segments: Array<{
        value: number
        variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
        app?: AppName | 'default'
        label?: string
        color?: string
    }>
    showLegend?: boolean
}

const MultiProgress = React.forwardRef<HTMLDivElement, MultiProgressProps>(
    ({ segments, max = 100, size, showLegend = false, className, ...props }, ref) => {
        const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0)
        const normalizedSegments = segments.map(segment => ({
            ...segment,
            percentage: (segment.value / max) * 100
        }))

        return (
            <div className="w-full">
                <div
                    ref={ref}
                    className={cn(progressVariants({ size }), className)}
                    {...props}
                >
                    {normalizedSegments.map((segment, index) => {
                        const cumulativePercentage = normalizedSegments
                            .slice(0, index)
                            .reduce((sum, s) => sum + s.percentage, 0)

                        return (
                            <div
                                key={index}
                                className={cn(
                                    'absolute h-full transition-all duration-500 ease-out',
                                    segment.app
                                        ? `bg-${segment.app}-primary`
                                        : progressBarVariants({ variant: segment.variant }).split(' ').find(c => c.includes('bg-'))
                                )}
                                style={{
                                    left: `${cumulativePercentage}%`,
                                    width: `${segment.percentage}%`,
                                    backgroundColor: segment.color
                                }}
                                title={segment.label}
                            />
                        )
                    })}
                </div>

                {showLegend && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {segments.map((segment, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <div
                                    className="h-3 w-3 rounded-sm"
                                    style={{
                                        backgroundColor: segment.color ||
                                            (segment.app ? `var(--${segment.app}-primary)` : undefined)
                                    }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {segment.label} ({segment.value})
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
)
MultiProgress.displayName = 'MultiProgress'

// ===== STEP PROGRESS =====
interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    steps: Array<{
        id: string
        label: string
        description?: string
        completed: boolean
        current?: boolean
        error?: boolean
    }>
    orientation?: 'horizontal' | 'vertical'
    showLabels?: boolean
    app?: AppName | 'default'
}

const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
    ({
        steps,
        orientation = 'horizontal',
        showLabels = true,
        app,
        className,
        ...props
    }, ref) => {
        const isHorizontal = orientation === 'horizontal'

        return (
            <div
                ref={ref}
                className={cn(
                    'flex',
                    isHorizontal ? 'flex-row items-center' : 'flex-col',
                    className
                )}
                {...props}
            >
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                'flex items-center',
                                isHorizontal ? 'flex-row' : 'flex-col',
                                !isLast && (isHorizontal ? 'flex-1' : 'mb-4')
                            )}
                        >
                            {/* Step circle */}
                            <div
                                className={cn(
                                    'relative flex h-8 w-8 items-center justify-center rounded-full border-2 font-medium text-sm',
                                    step.completed && 'border-green-600 bg-green-600 text-white',
                                    step.current && !step.completed && 'border-primary bg-primary text-primary-foreground',
                                    step.error && 'border-red-600 bg-red-600 text-white',
                                    !step.completed && !step.current && !step.error && 'border-muted-foreground/30 bg-muted text-muted-foreground',
                                    app && step.current && !step.completed && `border-${app}-primary bg-${app}-primary`
                                )}
                            >
                                {step.completed ? (
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : step.error ? (
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>

                            {/* Step labels */}
                            {showLabels && (
                                <div className={cn(
                                    isHorizontal ? 'ml-3' : 'mt-2 text-center'
                                )}>
                                    <div className={cn(
                                        'text-sm font-medium',
                                        step.current && 'text-foreground',
                                        step.completed && 'text-foreground',
                                        !step.current && !step.completed && 'text-muted-foreground'
                                    )}>
                                        {step.label}
                                    </div>
                                    {step.description && (
                                        <div className="text-xs text-muted-foreground">
                                            {step.description}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Connector line */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        isHorizontal
                                            ? 'mx-4 h-0.5 flex-1 bg-muted-foreground/30'
                                            : 'my-2 w-0.5 h-8 bg-muted-foreground/30',
                                        step.completed && 'bg-green-600'
                                    )}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }
)
StepProgress.displayName = 'StepProgress'

// ===== ANIMATED PROGRESS =====
interface AnimatedProgressProps extends ProgressProps {
    duration?: number
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

const AnimatedProgress = React.forwardRef<HTMLDivElement, AnimatedProgressProps>(
    ({ value = 0, duration = 1000, easing = 'ease-out', ...props }, ref) => {
        const [currentValue, setCurrentValue] = useState(0)

        useEffect(() => {
            const timer = setTimeout(() => {
                setCurrentValue(value)
            }, 100)

            return () => clearTimeout(timer)
        }, [value])

        return (
            <Progress
                ref={ref}
                value={currentValue}
                {...props}
                style={{
                    transition: `all ${duration}ms ${easing}`,
                    ...props.style
                }}
            />
        )
    }
)
AnimatedProgress.displayName = 'AnimatedProgress'

// ===== EXPORTS =====
export {
    Progress,
    CircularProgress,
    MultiProgress,
    StepProgress,
    AnimatedProgress,
    progressVariants,
    progressBarVariants
}
