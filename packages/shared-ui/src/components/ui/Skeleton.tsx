'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== SKELETON VARIANTS =====
const skeletonVariants = cva(
    [
        'animate-pulse rounded-md bg-muted',
        'relative overflow-hidden'
    ],
    {
        variants: {
            variant: {
                default: 'bg-muted',
                shimmer: 'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
                wave: 'bg-gradient-to-r from-muted to-muted/30 animate-[wave_2s_ease-in-out_infinite]',
                pulse: 'bg-muted animate-pulse'
            },
            speed: {
                slow: 'animate-pulse [animation-duration:2s]',
                normal: 'animate-pulse [animation-duration:1.5s]',
                fast: 'animate-pulse [animation-duration:1s]'
            },
            rounded: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                default: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
                full: 'rounded-full'
            },
            app: {
                default: '',
                codai: 'bg-codai-primary/10',
                memorai: 'bg-memorai-primary/10',
                bancai: 'bg-bancai-primary/10',
                romai: 'bg-romai-primary/10',
                ajutai: 'bg-ajutai-primary/10',
                controlai: 'bg-controlai-primary/10',
                studiai: 'bg-studiai-primary/10'
            }
        },
        defaultVariants: {
            variant: 'default',
            speed: 'normal',
            rounded: 'default',
            app: 'default'
        }
    }
)

// ===== SKELETON INTERFACES =====
export interface SkeletonProps
    extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof skeletonVariants>, 'app'> {
    app?: AppName | 'default'
    width?: string | number
    height?: string | number
    count?: number
    circle?: boolean
    lines?: number
    inline?: boolean
}

// ===== SKELETON COMPONENT =====
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({
        className,
        variant,
        speed,
        rounded,
        app,
        width,
        height,
        count = 1,
        circle = false,
        lines,
        inline = false,
        style,
        ...props
    }, ref) => {
        const baseStyle = {
            width,
            height,
            ...style
        }

        // Single skeleton
        if (count === 1 && !lines) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        skeletonVariants({
                            variant,
                            speed,
                            rounded: circle ? 'full' : rounded,
                            app: app as any
                        }),
                        inline && 'inline-block',
                        className
                    )}
                    style={baseStyle}
                    {...props}
                />
            )
        }

        // Multiple skeletons or lines
        const itemCount = lines || count

        return (
            <div
                ref={ref}
                className={cn(
                    'space-y-2',
                    inline && 'flex space-x-2 space-y-0',
                    className
                )}
                {...props}
            >
                {Array.from({ length: itemCount }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            skeletonVariants({
                                variant,
                                speed,
                                rounded: circle ? 'full' : rounded,
                                app: app as any
                            }),
                            lines && index === itemCount - 1 && 'w-3/4' // Last line shorter
                        )}
                        style={baseStyle}
                    />
                ))}
            </div>
        )
    }
)
Skeleton.displayName = 'Skeleton'

// ===== TEXT SKELETON =====
interface TextSkeletonProps extends Omit<SkeletonProps, 'lines' | 'circle'> {
    lines?: number
    lineHeight?: string | number
    lastLineWidth?: string
}

const TextSkeleton = React.forwardRef<HTMLDivElement, TextSkeletonProps>(
    ({
        lines = 3,
        lineHeight = '1rem',
        lastLineWidth = '60%',
        className,
        ...props
    }, ref) => {
        return (
            <div ref={ref} className={cn('space-y-2', className)}>
                {Array.from({ length: lines }).map((_, index) => (
                    <Skeleton
                        key={index}
                        height={lineHeight}
                        width={index === lines - 1 ? lastLineWidth : '100%'}
                        {...props}
                    />
                ))}
            </div>
        )
    }
)
TextSkeleton.displayName = 'TextSkeleton'

// ===== AVATAR SKELETON =====
interface AvatarSkeletonProps extends Omit<SkeletonProps, 'circle' | 'width' | 'height'> {
    size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl'
    withText?: boolean
    textLines?: number
}

const AvatarSkeleton = React.forwardRef<HTMLDivElement, AvatarSkeletonProps>(
    ({
        size = 'default',
        withText = false,
        textLines = 2,
        className,
        ...props
    }, ref) => {
        const sizeMap = {
            xs: { width: '1.5rem', height: '1.5rem' },
            sm: { width: '2rem', height: '2rem' },
            default: { width: '2.5rem', height: '2.5rem' },
            lg: { width: '3rem', height: '3rem' },
            xl: { width: '4rem', height: '4rem' },
            '2xl': { width: '5rem', height: '5rem' },
            '3xl': { width: '6rem', height: '6rem' }
        }

        const dimensions = sizeMap[size]

        if (!withText) {
            return (
                <Skeleton
                    ref={ref}
                    circle
                    width={dimensions.width}
                    height={dimensions.height}
                    className={className}
                    {...props}
                />
            )
        }

        return (
            <div ref={ref} className={cn('flex items-center space-x-3', className)}>
                <Skeleton
                    circle
                    width={dimensions.width}
                    height={dimensions.height}
                    {...props}
                />
                <div className="space-y-1 flex-1">
                    {Array.from({ length: textLines }).map((_, index) => (
                        <Skeleton
                            key={index}
                            height="0.75rem"
                            width={index === 0 ? '60%' : '40%'}
                            {...props}
                        />
                    ))}
                </div>
            </div>
        )
    }
)
AvatarSkeleton.displayName = 'AvatarSkeleton'

// ===== CARD SKELETON =====
interface CardSkeletonProps extends Omit<SkeletonProps, 'lines'> {
    showHeader?: boolean
    showFooter?: boolean
    contentLines?: number
    headerHeight?: string | number
    footerHeight?: string | number
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
    ({
        showHeader = true,
        showFooter = false,
        contentLines = 4,
        headerHeight = '1.5rem',
        footerHeight = '2rem',
        className,
        ...props
    }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'p-6 border rounded-lg space-y-4 bg-card',
                    className
                )}
            >
                {showHeader && (
                    <div className="space-y-2">
                        <Skeleton height={headerHeight} width="60%" {...props} />
                        <Skeleton height="0.875rem" width="40%" {...props} />
                    </div>
                )}

                <div className="space-y-2">
                    {Array.from({ length: contentLines }).map((_, index) => (
                        <Skeleton
                            key={index}
                            height="1rem"
                            width={index === contentLines - 1 ? '70%' : '100%'}
                            {...props}
                        />
                    ))}
                </div>

                {showFooter && (
                    <Skeleton height={footerHeight} width="30%" {...props} />
                )}
            </div>
        )
    }
)
CardSkeleton.displayName = 'CardSkeleton'

// ===== TABLE SKELETON =====
interface TableSkeletonProps extends Omit<SkeletonProps, 'lines'> {
    rows?: number
    columns?: number
    showHeader?: boolean
    cellHeight?: string | number
}

const TableSkeleton = React.forwardRef<HTMLDivElement, TableSkeletonProps>(
    ({
        rows = 5,
        columns = 4,
        showHeader = true,
        cellHeight = '2.5rem',
        className,
        ...props
    }, ref) => {
        return (
            <div ref={ref} className={cn('space-y-2', className)}>
                {showHeader && (
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, index) => (
                            <Skeleton
                                key={`header-${index}`}
                                height={cellHeight}
                                width="80%"
                                {...props}
                            />
                        ))}
                    </div>
                )}

                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        className="grid gap-4"
                        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                    >
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton
                                key={`cell-${rowIndex}-${colIndex}`}
                                height={cellHeight}
                                width={colIndex === 0 ? '60%' : '90%'}
                                {...props}
                            />
                        ))}
                    </div>
                ))}
            </div>
        )
    }
)
TableSkeleton.displayName = 'TableSkeleton'

// ===== BUTTON SKELETON =====
interface ButtonSkeletonProps extends Omit<SkeletonProps, 'width' | 'height'> {
    size?: 'sm' | 'default' | 'lg' | 'xl'
    fullWidth?: boolean
}

const ButtonSkeleton = React.forwardRef<HTMLDivElement, ButtonSkeletonProps>(
    ({ size = 'default', fullWidth = false, className, ...props }, ref) => {
        const sizeMap = {
            sm: { height: '2rem', width: '4rem' },
            default: { height: '2.5rem', width: '5rem' },
            lg: { height: '3rem', width: '6rem' },
            xl: { height: '3.5rem', width: '7rem' }
        }

        const dimensions = sizeMap[size]

        return (
            <Skeleton
                ref={ref}
                height={dimensions.height}
                width={fullWidth ? '100%' : dimensions.width}
                rounded="default"
                className={className}
                {...props}
            />
        )
    }
)
ButtonSkeleton.displayName = 'ButtonSkeleton'

// ===== SKELETON GROUP =====
interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    template: 'card' | 'list' | 'table' | 'profile' | 'dashboard' | 'custom'
    count?: number
    spacing?: 'tight' | 'normal' | 'loose'
    customTemplate?: React.ReactNode
    app?: AppName | 'default'
}

const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
    ({
        template,
        count = 3,
        spacing = 'normal',
        customTemplate,
        app,
        className,
        ...props
    }, ref) => {
        const spacingClasses = {
            tight: 'space-y-2',
            normal: 'space-y-4',
            loose: 'space-y-6'
        }

        const renderTemplate = () => {
            switch (template) {
                case 'card':
                    return <CardSkeleton app={app} />
                case 'list':
                    return <AvatarSkeleton withText textLines={2} app={app} />
                case 'table':
                    return <TableSkeleton rows={1} app={app} />
                case 'profile':
                    return (
                        <div className="space-y-4">
                            <AvatarSkeleton size="xl" withText textLines={3} app={app} />
                            <TextSkeleton lines={4} app={app} />
                        </div>
                    )
                case 'dashboard':
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CardSkeleton showFooter app={app} />
                            <CardSkeleton showFooter app={app} />
                            <CardSkeleton showFooter app={app} />
                        </div>
                    )
                case 'custom':
                    return customTemplate
                default:
                    return <Skeleton app={app} />
            }
        }

        if (template === 'dashboard') {
            return (
                <div ref={ref} className={cn(spacingClasses[spacing], className)} {...props}>
                    {renderTemplate()}
                </div>
            )
        }

        return (
            <div ref={ref} className={cn(spacingClasses[spacing], className)} {...props}>
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index}>
                        {renderTemplate()}
                    </div>
                ))}
            </div>
        )
    }
)
SkeletonGroup.displayName = 'SkeletonGroup'

// ===== EXPORTS =====
export {
    Skeleton,
    TextSkeleton,
    AvatarSkeleton,
    CardSkeleton,
    TableSkeleton,
    ButtonSkeleton,
    SkeletonGroup,
    skeletonVariants
}
