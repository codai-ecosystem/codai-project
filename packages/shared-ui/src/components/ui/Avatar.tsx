'use client'

import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== AVATAR VARIANTS =====
const avatarVariants = cva(
    [
        'relative flex shrink-0 overflow-hidden rounded-full border',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    ],
    {
        variants: {
            size: {
                xs: 'h-6 w-6 text-xs',
                sm: 'h-8 w-8 text-xs',
                default: 'h-10 w-10 text-sm',
                lg: 'h-12 w-12 text-sm',
                xl: 'h-16 w-16 text-lg',
                '2xl': 'h-20 w-20 text-xl',
                '3xl': 'h-24 w-24 text-2xl'
            },
            variant: {
                default: 'border-border',
                primary: 'border-primary ring-primary/20',
                secondary: 'border-secondary ring-secondary/20',
                success: 'border-green-500 ring-green-500/20',
                warning: 'border-yellow-500 ring-yellow-500/20',
                destructive: 'border-red-500 ring-red-500/20'
            },
            app: {
                default: '',
                codai: 'border-codai-primary ring-codai-primary/20',
                memorai: 'border-memorai-primary ring-memorai-primary/20',
                bancai: 'border-bancai-primary ring-bancai-primary/20',
                romai: 'border-romai-primary ring-romai-primary/20',
                ajutai: 'border-ajutai-primary ring-ajutai-primary/20',
                controlai: 'border-controlai-primary ring-controlai-primary/20',
                studiai: 'border-studiai-primary ring-studiai-primary/20'
            },
            status: {
                none: '',
                online: 'ring-2 ring-green-500',
                offline: 'ring-2 ring-gray-400',
                busy: 'ring-2 ring-red-500',
                away: 'ring-2 ring-yellow-500'
            }
        },
        defaultVariants: {
            size: 'default',
            variant: 'default',
            app: 'default',
            status: 'none'
        }
    }
)

const avatarImageVariants = cva(
    'aspect-square h-full w-full object-cover',
    {
        variants: {
            rounded: {
                true: 'rounded-full',
                false: 'rounded-none'
            }
        },
        defaultVariants: {
            rounded: true
        }
    }
)

const avatarFallbackVariants = cva(
    [
        'flex h-full w-full items-center justify-center rounded-full font-medium',
        'bg-muted text-muted-foreground select-none'
    ],
    {
        variants: {
            app: {
                default: 'bg-muted text-muted-foreground',
                codai: 'bg-codai-primary/10 text-codai-primary',
                memorai: 'bg-memorai-primary/10 text-memorai-primary',
                bancai: 'bg-bancai-primary/10 text-bancai-primary',
                romai: 'bg-romai-primary/10 text-romai-primary',
                ajutai: 'bg-ajutai-primary/10 text-ajutai-primary',
                controlai: 'bg-controlai-primary/10 text-controlai-primary',
                studiai: 'bg-studiai-primary/10 text-studiai-primary'
            }
        },
        defaultVariants: {
            app: 'default'
        }
    }
)

// ===== AVATAR INTERFACES =====
export interface AvatarProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof avatarVariants>, 'app'> {
    app?: AppName | 'default'
    asChild?: boolean
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    rounded?: boolean
    src?: string
}

export interface AvatarFallbackProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof avatarFallbackVariants>, 'app'> {
    app?: AppName | 'default'
    delayMs?: number
}

// ===== AVATAR COMPONENTS =====
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
    ({ className, size, variant, app, status, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                avatarVariants({ size, variant, app: app as any, status }),
                className
            )}
            {...props}
        />
    )
)
Avatar.displayName = 'Avatar'

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, rounded = true, alt, ...props }, ref) => {
        const [imageLoaded, setImageLoaded] = useState(false)
        const [imageError, setImageError] = useState(false)

        const handleLoad = () => {
            setImageLoaded(true)
            setImageError(false)
        }

        const handleError = () => {
            setImageError(true)
            setImageLoaded(false)
        }

        if (imageError) return null

        return (
            <img
                ref={ref}
                className={cn(
                    avatarImageVariants({ rounded }),
                    !imageLoaded && 'opacity-0',
                    'transition-opacity duration-200',
                    className
                )}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        )
    }
)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
    ({ className, app, delayMs, children, ...props }, ref) => {
        const [show, setShow] = useState(!delayMs)

        React.useEffect(() => {
            if (delayMs) {
                const timer = setTimeout(() => setShow(true), delayMs)
                return () => clearTimeout(timer)
            }
        }, [delayMs])

        if (!show) return null

        return (
            <span
                ref={ref}
                className={cn(avatarFallbackVariants({ app: app as any }), className)}
                {...props}
            >
                {children}
            </span>
        )
    }
)
AvatarFallback.displayName = 'AvatarFallback'

// ===== USER AVATAR =====
interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
    user: {
        name: string
        avatar?: string
        email?: string
        status?: 'online' | 'offline' | 'busy' | 'away'
    }
    showTooltip?: boolean
    fallbackIcon?: React.ReactNode
}

const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
    ({ user, showTooltip = false, fallbackIcon, className, ...props }, ref) => {
        const getInitials = (name: string) => {
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }

        const content = (
            <Avatar
                ref={ref}
                className={cn('cursor-pointer', className)}
                status={user.status}
                {...props}
            >
                {user.avatar && (
                    <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback app={props.app}>
                    {fallbackIcon || getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
        )

        if (showTooltip) {
            return (
                <div className="group relative">
                    {content}
                    <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-popover text-popover-foreground rounded-md px-3 py-2 text-sm shadow-md border">
                            <div className="font-medium">{user.name}</div>
                            {user.email && (
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 transform">
                                <div className="border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return content
    }
)
UserAvatar.displayName = 'UserAvatar'

// ===== AVATAR GROUP =====
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    users: Array<{
        id: string
        name: string
        avatar?: string
        status?: 'online' | 'offline' | 'busy' | 'away'
    }>
    max?: number
    size?: AvatarProps['size']
    app?: AvatarProps['app']
    spacing?: 'tight' | 'normal' | 'loose'
    onSeeAll?: () => void
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
    ({
        users,
        max = 4,
        size = 'default',
        app,
        spacing = 'normal',
        onSeeAll,
        className,
        ...props
    }, ref) => {
        const visibleUsers = users.slice(0, max)
        const hiddenCount = users.length - max

        const spacingClasses = {
            tight: '-space-x-1',
            normal: '-space-x-2',
            loose: '-space-x-1'
        }

        return (
            <div
                ref={ref}
                className={cn('flex items-center', spacingClasses[spacing], className)}
                {...props}
            >
                {visibleUsers.map((user, index) => (
                    <UserAvatar
                        key={user.id}
                        user={user}
                        size={size}
                        app={app}
                        showTooltip
                        className={cn(
                            'border-2 border-background',
                            index > 0 && 'hover:z-10'
                        )}
                    />
                ))}

                {hiddenCount > 0 && (
                    <Avatar
                        size={size}
                        app={app}
                        className="border-2 border-background cursor-pointer hover:z-10"
                        onClick={onSeeAll}
                    >
                        <AvatarFallback app={app}>
                            +{hiddenCount}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>
        )
    }
)
AvatarGroup.displayName = 'AvatarGroup'

// ===== STATUS INDICATOR =====
interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
    status: 'online' | 'offline' | 'busy' | 'away'
    size?: 'sm' | 'default' | 'lg'
    animated?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
    ({ status, size = 'default', animated = false, className, ...props }, ref) => {
        const sizeClasses = {
            sm: 'h-2 w-2',
            default: 'h-3 w-3',
            lg: 'h-4 w-4'
        }

        const statusClasses = {
            online: 'bg-green-500',
            offline: 'bg-gray-400',
            busy: 'bg-red-500',
            away: 'bg-yellow-500'
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'absolute bottom-0 right-0 rounded-full border-2 border-background',
                    sizeClasses[size],
                    statusClasses[status],
                    animated && status === 'online' && 'animate-pulse',
                    className
                )}
                {...props}
            />
        )
    }
)
StatusIndicator.displayName = 'StatusIndicator'

// ===== AVATAR WITH STATUS =====
interface AvatarWithStatusProps extends UserAvatarProps {
    showStatus?: boolean
    statusSize?: StatusIndicatorProps['size']
    animateStatus?: boolean
}

const AvatarWithStatus = React.forwardRef<HTMLSpanElement, AvatarWithStatusProps>(
    ({
        user,
        showStatus = true,
        statusSize = 'default',
        animateStatus = false,
        className,
        ...props
    }, ref) => {
        return (
            <div className="relative">
                <UserAvatar
                    ref={ref}
                    user={user}
                    className={className}
                    {...props}
                />
                {showStatus && user.status && (
                    <StatusIndicator
                        status={user.status}
                        size={statusSize}
                        animated={animateStatus}
                    />
                )}
            </div>
        )
    }
)
AvatarWithStatus.displayName = 'AvatarWithStatus'

// ===== EXPORTS =====
export {
    Avatar,
    AvatarImage,
    AvatarFallback,
    UserAvatar,
    AvatarGroup,
    StatusIndicator,
    AvatarWithStatus,
    avatarVariants,
    avatarImageVariants,
    avatarFallbackVariants
}
