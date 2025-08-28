'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { designSystem, componentVariants } from '@/lib/design-system'
import { cn } from '@/lib/utils'

// Typography Component Types
interface BaseTypographyProps {
  variant?: 'display' | 'heading' | 'body' | 'caption' | 'overline'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'muted' | 'error' | 'warning' | 'success' | 'info'
  align?: 'left' | 'center' | 'right' | 'justify'
  decoration?: 'none' | 'underline' | 'line-through'
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  gradient?: boolean
  animated?: boolean
  className?: string
  children: React.ReactNode
}

// Typography component with proper TypeScript handling
export const Typography = React.forwardRef<HTMLElement, BaseTypographyProps>(
  ({
    variant = 'body',
    size = 'base',
    weight = 'normal',
    color = 'primary',
    align = 'left',
    decoration = 'none',
    transform = 'none',
    gradient = false,
    animated = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const { theme } = useTheme()

    // Get color styles based on theme
    const getColorClasses = () => {
      const colorMap = {
        primary: 'text-gray-900 dark:text-gray-50',
        secondary: 'text-gray-700 dark:text-gray-200',
        tertiary: 'text-gray-500 dark:text-gray-400',
        accent: 'text-blue-600 dark:text-blue-400',
        muted: 'text-gray-400 dark:text-gray-500',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-amber-600 dark:text-amber-400',
        success: 'text-emerald-600 dark:text-emerald-400',
        info: 'text-cyan-600 dark:text-cyan-400'
      }
      return colorMap[color]
    }

    // Get gradient classes
    const getGradientClasses = () => {
      if (!gradient) return ''
      
      const gradients = {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
        secondary: 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent',
        accent: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
        success: 'bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent',
        error: 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent',
        info: 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent',
        muted: 'bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent',
        tertiary: 'bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent'
      }
      
      return gradients[color] || gradients.primary
    }

    // Get variant-specific classes
    const getVariantClasses = () => {
      const variants = {
        display: {
          fontFamily: 'font-display',
          letterSpacing: 'tracking-tight',
          lineHeight: 'leading-tight',
          fontWeight: 'font-bold'
        },
        heading: {
          fontFamily: 'font-sans',
          letterSpacing: 'tracking-tight',
          lineHeight: 'leading-snug',
          fontWeight: 'font-semibold'
        },
        body: {
          fontFamily: 'font-sans',
          letterSpacing: 'tracking-normal',
          lineHeight: 'leading-relaxed',
          fontWeight: 'font-normal'
        },
        caption: {
          fontFamily: 'font-sans',
          letterSpacing: 'tracking-wide',
          lineHeight: 'leading-normal',
          fontWeight: 'font-medium'
        },
        overline: {
          fontFamily: 'font-sans',
          letterSpacing: 'tracking-widest',
          lineHeight: 'leading-none',
          fontWeight: 'font-bold'
        }
      }
      
      const variantStyle = variants[variant]
      return `${variantStyle.fontFamily} ${variantStyle.letterSpacing} ${variantStyle.lineHeight} ${variantStyle.fontWeight}`
    }

    // Get size classes
    const getSizeClasses = () => {
      const sizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
        '7xl': 'text-7xl',
        '8xl': 'text-8xl',
        '9xl': 'text-9xl'
      }
      return sizes[size]
    }

    // Get utility classes
    const getUtilityClasses = () => {
      const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify'
      }
      
      const decorationClasses = {
        none: 'no-underline',
        underline: 'underline',
        'line-through': 'line-through'
      }
      
      const transformClasses = {
        none: '',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize'
      }
      
      const weightClasses = {
        thin: 'font-thin',
        extralight: 'font-extralight',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black'
      }

      return `${alignClasses[align]} ${decorationClasses[decoration]} ${transformClasses[transform]} ${weightClasses[weight]}`
    }

    const combinedClasses = cn(
      getSizeClasses(),
      getVariantClasses(),
      gradient ? getGradientClasses() : getColorClasses(),
      getUtilityClasses(),
      'transition-all duration-300',
      animated && 'hover:scale-105 cursor-default',
      variant === 'overline' && 'uppercase',
      className
    )

    if (animated) {
      return (
        <motion.div
          ref={ref as any}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className={combinedClasses}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref as any}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Typography.displayName = 'Typography'

// Pre-defined Typography Variants for Common Use Cases
export const Display: React.FC<BaseTypographyProps> = (props) => (
  <Typography variant="display" size={props.size || '6xl'} weight={props.weight || 'bold'} {...props} />
)

export const Heading: React.FC<BaseTypographyProps> = (props) => (
  <Typography variant="heading" size={props.size || '3xl'} weight={props.weight || 'semibold'} {...props} />
)

export const Body: React.FC<BaseTypographyProps> = (props) => (
  <Typography variant="body" size={props.size || 'base'} weight={props.weight || 'normal'} {...props} />
)

export const Caption: React.FC<BaseTypographyProps> = (props) => (
  <Typography variant="caption" size={props.size || 'sm'} weight={props.weight || 'medium'} color={props.color || 'secondary'} {...props} />
)

export const Overline: React.FC<BaseTypographyProps> = (props) => (
  <Typography variant="overline" size={props.size || 'xs'} weight={props.weight || 'bold'} color={props.color || 'tertiary'} {...props} />
)

// Gradient Text Component
export const GradientText: React.FC<BaseTypographyProps> = (props) => (
  <Typography gradient {...props} />
)

// Specific semantic components using proper HTML elements
export const H1: React.FC<BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => (
  <h1 className={cn(
    'font-display text-6xl font-bold leading-tight tracking-tight',
    props.gradient ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-900 dark:text-gray-50',
    props.className
  )}>
    {children}
  </h1>
)

export const H2: React.FC<BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => (
  <h2 className={cn(
    'font-sans text-4xl font-semibold leading-snug tracking-tight',
    props.gradient ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-900 dark:text-gray-50',
    props.className
  )}>
    {children}
  </h2>
)

export const H3: React.FC<BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => (
  <h3 className={cn(
    'font-sans text-3xl font-semibold leading-snug tracking-tight',
    props.gradient ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-900 dark:text-gray-50',
    props.className
  )}>
    {children}
  </h3>
)

export const H4: React.FC<BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => (
  <h4 className={cn(
    'font-sans text-2xl font-semibold leading-snug tracking-tight',
    props.gradient ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-900 dark:text-gray-50',
    props.className
  )}>
    {children}
  </h4>
)

export const P: React.FC<BaseTypographyProps & React.HTMLAttributes<HTMLParagraphElement>> = ({ children, ...props }) => (
  <p className={cn(
    'font-sans text-base font-normal leading-relaxed',
    props.gradient ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-700 dark:text-gray-200',
    props.className
  )}>
    {children}
  </p>
)

export default Typography