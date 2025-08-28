'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { motion, HTMLMotionProps, Variants, Transition } from 'framer-motion'
import { cn } from '@/lib/utils'

// Enhanced Button with animations
interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  glowEffect?: boolean
  magneticEffect?: boolean
}

const buttonVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeInOut' }
  }
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    glowEffect = false,
    magneticEffect = false,
    className,
    ...props
  }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variantStyles = {
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500',
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const glowStyles = glowEffect
      ? 'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-blue-600 before:to-purple-600 before:blur-lg before:opacity-0 hover:before:opacity-30 before:transition-opacity before:-z-10'
      : ''

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          glowStyles,
          className
        )}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        disabled={loading}
        {...props}
      >
        {loading && (
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
          </motion.div>
        )}
        {children}

        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full scale-0 opacity-0"
            whileTap={{
              scale: 4,
              opacity: [0, 1, 0],
              transition: { duration: 0.4, ease: 'easeOut' }
            }}
          />
        </div>
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

// Enhanced Card component
interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
  glowOnHover?: boolean
  tiltEffect?: boolean
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glowOnHover = false,
  tiltEffect = false,
}) => {
  const cardVariants: Variants = {
    initial: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    hover: {
      scale: hoverEffect ? 1.02 : 1,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  }

  return (
    <motion.div
      className={cn(
        'relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden',
        glowOnHover && 'hover:shadow-2xl hover:shadow-blue-500/25',
        className
      )}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
    >
      {children}

      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

// Animated icon wrapper
interface AnimatedIconProps {
  children: React.ReactNode
  className?: string
  animation?: 'bounce' | 'pulse' | 'rotate' | 'scale' | 'shake'
  trigger?: 'hover' | 'always' | 'tap'
}

const iconAnimations = {
  bounce: {
    y: [0, -10, 0],
  },
  pulse: {
    scale: [1, 1.1, 1],
  },
  rotate: {
    rotate: 360,
  },
  scale: {
    scale: 1.1,
  },
  shake: {
    x: [0, -5, 5, -5, 5, 0],
  }
}

const iconTransitions: Record<string, Transition> = {
  bounce: { duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
  pulse: { duration: 2, ease: "easeInOut", repeat: Infinity },
  rotate: { duration: 2, ease: "linear", repeat: Infinity },
  scale: { duration: 0.2, ease: "easeOut" },
  shake: { duration: 0.5, ease: "easeInOut" }
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  children,
  className = '',
  animation = 'scale',
  trigger = 'hover',
}) => {
  const getAnimationProps = () => {
    const animationProps = iconAnimations[animation]
    const transition = iconTransitions[animation]

    if (trigger === 'always') {
      return {
        animate: animationProps,
        transition,
      }
    } else if (trigger === 'hover') {
      return {
        whileHover: { ...animationProps, transition },
      }
    } else if (trigger === 'tap') {
      return {
        whileTap: { ...animationProps, transition },
      }
    }
    return {}
  }

  return (
    <motion.div
      className={cn('inline-block', className)}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  )
}

// Animated text with typewriter effect
interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  delay?: number
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className = '',
  speed = 50,
  delay = 0,
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: delay + (index * speed / 1000),
            duration: 0.1,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Animated counter with custom hook
interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}

function useAnimatedCounter(from: number, to: number, duration: number = 2) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const currentCount = Math.floor(from + (to - from) * progress)

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [from, to, duration])

  return count
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 2,
  className = '',
  suffix = '',
  prefix = '',
}) => {
  const count = useAnimatedCounter(from, to, duration)

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  )
}

// Utility function for creating staggered animations
export const createStaggerVariants = (staggerDelay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
})

export const staggerChildVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}