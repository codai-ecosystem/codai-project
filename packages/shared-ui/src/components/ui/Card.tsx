'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== CARD VARIANTS - Enhanced with App-Specific Theming =====
const cardVariants = cva(
  // Base styles with enhanced design system
  [
    'rounded-xl border transition-all duration-300',
    'bg-background/80 backdrop-blur-sm',
    'hover:shadow-lg hover:border-primary/20',
    'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2',
    'group relative overflow-hidden'
  ],
  {
    variants: {
      // Visual variants
      variant: {
        default: 'border-border shadow-sm',
        elevated: 'border-border shadow-md hover:shadow-xl',
        ghost: 'border-transparent shadow-none hover:bg-accent/50',
        outline: 'border-2 border-primary/20 shadow-none',
        gradient: 'border-transparent bg-gradient-to-br from-primary/10 to-secondary/10',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md shadow-lg',
        neon: 'border-primary/50 shadow-lg shadow-primary/25 bg-primary/5'
      },
      // Size variants
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      },
      // App-specific branding
      app: {
        default: '',
        codai: 'border-l-4 border-l-codai-primary hover:border-l-codai-primary',
        memorai: 'border-l-4 border-l-memorai-primary hover:border-l-memorai-primary',
        bancai: 'border-l-4 border-l-bancai-primary hover:border-l-bancai-primary',
        romai: 'border-l-4 border-l-romai-primary hover:border-l-romai-primary',
        ajutai: 'border-l-4 border-l-ajutai-primary hover:border-l-ajutai-primary',
        controlai: 'border-l-4 border-l-controlai-primary hover:border-l-controlai-primary',
        studiai: 'border-l-4 border-l-studiai-primary hover:border-l-studiai-primary',
        sociai: 'border-l-4 border-l-sociai-primary hover:border-l-sociai-primary',
        cumparai: 'border-l-4 border-l-cumparai-primary hover:border-l-cumparai-primary',
        donai: 'border-l-4 border-l-donai-primary hover:border-l-donai-primary'
      },
      // Interactive states
      interactive: {
        false: '',
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        subtle: 'cursor-pointer hover:bg-accent/30'
      },
      // Loading state
      loading: {
        false: '',
        true: 'animate-pulse pointer-events-none'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      app: 'default',
      interactive: false,
      loading: false
    }
  }
)

const cardHeaderVariants = cva(
  'flex flex-col space-y-1.5 pb-3',
  {
    variants: {
      centered: {
        true: 'text-center items-center',
        false: ''
      }
    },
    defaultVariants: {
      centered: false
    }
  }
)

const cardContentVariants = cva(
  'flex-1',
  {
    variants: {
      spacing: {
        none: 'space-y-0',
        sm: 'space-y-2',
        default: 'space-y-4',
        lg: 'space-y-6'
      }
    },
    defaultVariants: {
      spacing: 'default'
    }
  }
)

const cardFooterVariants = cva(
  'flex items-center pt-3',
  {
    variants: {
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between'
      }
    },
    defaultVariants: {
      justify: 'start'
    }
  }
)

// ===== CARD INTERFACES =====
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  app?: AppName | 'default'
  loading?: boolean
  as?: React.ElementType
}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardHeaderVariants> { }

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardContentVariants> { }

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardFooterVariants> { }

// ===== CARD COMPONENTS =====
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, app, interactive, loading, as: Component = 'div', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(cardVariants({ variant, size, app, interactive, loading }), className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, centered, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ centered }), className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'font-semibold leading-none tracking-tight',
        'text-lg text-foreground',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground leading-relaxed',
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ spacing }), className)}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ justify }), className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// ===== ENHANCED CARD COMPOSITIONS =====
interface MetricCardProps extends CardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  loading?: boolean
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, description, icon, trend, loading, app, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      app={app}
      loading={loading}
      className={cn('hover:scale-[1.02] transition-transform', className)}
      {...props}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            value
          )}
        </div>
        {description && (
          <CardDescription className="mt-1">
            {description}
          </CardDescription>
        )}
        {trend && !loading && (
          <div className="flex items-center space-x-1 text-xs mt-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full font-medium',
                trend.direction === 'up' && 'bg-green-100 text-green-800',
                trend.direction === 'down' && 'bg-red-100 text-red-800',
                trend.direction === 'neutral' && 'bg-gray-100 text-gray-800'
              )}
            >
              {trend.direction === 'up' && '↗'}
              {trend.direction === 'down' && '↘'}
              {trend.direction === 'neutral' && '→'}
              {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
)
MetricCard.displayName = 'MetricCard'

interface FeatureCardProps extends CardProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
  image?: string
  comingSoon?: boolean
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, action, image, comingSoon, app, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      app={app}
      interactive={!comingSoon}
      className={cn(
        'h-full',
        comingSoon && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {image && (
        <div className="relative h-40 -m-4 mb-4 overflow-hidden rounded-t-xl">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {comingSoon && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium px-3 py-1 bg-primary rounded-full text-sm">
                Coming Soon
              </span>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <CardTitle className={cn(comingSoon && 'text-muted-foreground')}>
              {title}
            </CardTitle>
          </div>
          {comingSoon && !image && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Soon
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className={cn(comingSoon && 'text-muted-foreground/60')}>
          {description}
        </CardDescription>
      </CardContent>

      {action && !comingSoon && (
        <CardFooter>
          {action}
        </CardFooter>
      )}
    </Card>
  )
)
FeatureCard.displayName = 'FeatureCard'

// ===== EXPORTS =====
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
}
