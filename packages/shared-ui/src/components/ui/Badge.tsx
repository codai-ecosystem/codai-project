'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== BADGE VARIANTS =====
const badgeVariants = cva(
    [
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
    ],
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                success: 'border-transparent bg-green-500 text-white hover:bg-green-500/80',
                warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80',
                info: 'border-transparent bg-blue-500 text-white hover:bg-blue-500/80',
                outline: 'text-foreground border-border hover:bg-accent hover:text-accent-foreground',
                ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground'
            },
            size: {
                sm: 'px-1.5 py-0.5 text-xs rounded-md',
                default: 'px-2.5 py-0.5 text-xs',
                lg: 'px-3 py-1 text-sm rounded-lg'
            },
            app: {
                default: '',
                codai: 'bg-codai-primary text-white hover:bg-codai-primary/80',
                memorai: 'bg-memorai-primary text-white hover:bg-memorai-primary/80',
                bancai: 'bg-bancai-primary text-white hover:bg-bancai-primary/80',
                romai: 'bg-romai-primary text-white hover:bg-romai-primary/80',
                ajutai: 'bg-ajutai-primary text-white hover:bg-ajutai-primary/80',
                controlai: 'bg-controlai-primary text-white hover:bg-controlai-primary/80',
                studiai: 'bg-studiai-primary text-white hover:bg-studiai-primary/80'
            },
            animated: {
                false: '',
                true: 'animate-pulse',
                bounce: 'animate-bounce',
                ping: 'animate-ping'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            app: 'default',
            animated: false
        }
    }
)

// ===== BADGE INTERFACES =====
export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof badgeVariants>, 'app'> {
    app?: AppName | 'default'
    icon?: React.ReactNode
    closable?: boolean
    onClose?: () => void
    as?: React.ElementType
}

// ===== BADGE COMPONENT =====
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({
        className,
        variant,
        size,
        app,
        animated,
        icon,
        closable,
        onClose,
        children,
        as: Component = 'div',
        ...props
    }, ref) => {
        const handleClose = (e: React.MouseEvent) => {
            e.stopPropagation()
            onClose?.()
        }

        return (
            <Component
                ref={ref}
                className={cn(
                    badgeVariants({ variant, size, app: app as any, animated }),
                    closable && 'pr-1',
                    className
                )}
                {...props}
            >
                {icon && (
                    <span className="mr-1 h-3 w-3 flex items-center justify-center">
                        {icon}
                    </span>
                )}
                <span>{children}</span>
                {closable && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className="ml-1 h-3 w-3 flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-white/50"
                        aria-label="Remove badge"
                    >
                        <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M1.41 0L0 1.41l2.59 2.59L0 6.59 1.41 8l2.59-2.59L6.59 8 8 6.59l-2.59-2.59L8 1.41 6.59 0 4 2.59 1.41 0z" />
                        </svg>
                    </button>
                )}
            </Component>
        )
    }
)
Badge.displayName = 'Badge'

// ===== STATUS BADGE =====
interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'icon'> {
    status: 'online' | 'offline' | 'busy' | 'away' | 'pending' | 'active' | 'inactive'
    showText?: boolean
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
    ({ status, showText = true, ...props }, ref) => {
        const statusConfig = {
            online: { variant: 'success' as const, icon: '●', text: 'Online' },
            offline: { variant: 'secondary' as const, icon: '●', text: 'Offline' },
            busy: { variant: 'destructive' as const, icon: '●', text: 'Busy' },
            away: { variant: 'warning' as const, icon: '●', text: 'Away' },
            pending: { variant: 'warning' as const, icon: '●', text: 'Pending' },
            active: { variant: 'success' as const, icon: '●', text: 'Active' },
            inactive: { variant: 'secondary' as const, icon: '●', text: 'Inactive' }
        }

        const config = statusConfig[status]

        return (
            <Badge
                ref={ref}
                variant={config.variant}
                icon={<span className="text-current">{config.icon}</span>}
                {...props}
            >
                {showText ? config.text : null}
            </Badge>
        )
    }
)
StatusBadge.displayName = 'StatusBadge'

// ===== NOTIFICATION BADGE =====
interface NotificationBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
    count: number
    max?: number
    showZero?: boolean
    dot?: boolean
}

const NotificationBadge = React.forwardRef<HTMLDivElement, NotificationBadgeProps>(
    ({ count, max = 99, showZero = false, dot = false, ...props }, ref) => {
        if (count === 0 && !showZero) return null

        const displayCount = count > max ? `${max}+` : count.toString()

        return (
            <Badge
                ref={ref}
                variant="destructive"
                size="sm"
                className={cn(
                    'min-w-[1.25rem] h-5 p-0 flex items-center justify-center',
                    dot && 'w-2 h-2 min-w-0 p-0'
                )}
                {...props}
            >
                {!dot && displayCount}
            </Badge>
        )
    }
)
NotificationBadge.displayName = 'NotificationBadge'

// ===== PRIORITY BADGE =====
interface PriorityBadgeProps extends Omit<BadgeProps, 'variant' | 'icon'> {
    priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
}

const PriorityBadge = React.forwardRef<HTMLDivElement, PriorityBadgeProps>(
    ({ priority, ...props }, ref) => {
        const priorityConfig = {
            low: { variant: 'secondary' as const, icon: '↓', color: 'text-green-600' },
            medium: { variant: 'outline' as const, icon: '→', color: 'text-yellow-600' },
            high: { variant: 'warning' as const, icon: '↑', color: 'text-orange-600' },
            urgent: { variant: 'destructive' as const, icon: '↑↑', color: 'text-red-600' },
            critical: { variant: 'destructive' as const, icon: '⚠', color: 'text-red-700' }
        }

        const config = priorityConfig[priority]

        return (
            <Badge
                ref={ref}
                variant={config.variant}
                icon={<span className={config.color}>{config.icon}</span>}
                {...props}
            >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
        )
    }
)
PriorityBadge.displayName = 'PriorityBadge'

// ===== CATEGORY BADGE =====
interface CategoryBadgeProps extends BadgeProps {
    category: string
    color?: string
}

const CategoryBadge = React.forwardRef<HTMLDivElement, CategoryBadgeProps>(
    ({ category, color, className, ...props }, ref) => {
        const colorClasses = color
            ? {
                backgroundColor: `${color}20`,
                borderColor: `${color}40`,
                color: color
            }
            : {}

        return (
            <Badge
                ref={ref}
                variant="outline"
                className={cn('capitalize', className)}
                style={colorClasses}
                {...props}
            >
                {category}
            </Badge>
        )
    }
)
CategoryBadge.displayName = 'CategoryBadge'

// ===== BADGE GROUP =====
interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    badges: Array<{
        id: string
        label: string
        variant?: BadgeProps['variant']
        app?: BadgeProps['app']
        closable?: boolean
        onClose?: () => void
    }>
    max?: number
    onSeeAll?: () => void
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
    ({ badges, max = 3, onSeeAll, className, ...props }, ref) => {
        const visibleBadges = badges.slice(0, max)
        const hiddenCount = badges.length - max

        return (
            <div
                ref={ref}
                className={cn('flex flex-wrap items-center gap-1', className)}
                {...props}
            >
                {visibleBadges.map((badge) => (
                    <Badge
                        key={badge.id}
                        variant={badge.variant}
                        app={badge.app}
                        closable={badge.closable}
                        onClose={badge.onClose}
                    >
                        {badge.label}
                    </Badge>
                ))}

                {hiddenCount > 0 && (
                    <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={onSeeAll}
                    >
                        +{hiddenCount} more
                    </Badge>
                )}
            </div>
        )
    }
)
BadgeGroup.displayName = 'BadgeGroup'

// ===== EXPORTS =====
export {
    Badge,
    StatusBadge,
    NotificationBadge,
    PriorityBadge,
    CategoryBadge,
    BadgeGroup,
    badgeVariants
}
