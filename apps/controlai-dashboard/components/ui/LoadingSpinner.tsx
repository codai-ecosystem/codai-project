'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
  overlay?: boolean
}

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  variant = 'default',
  overlay = false
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      case 'xl':
        return 'w-12 h-12'
      default:
        return 'w-6 h-6'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary-600'
      case 'secondary':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-900 dark:text-white'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'xs':
      case 'sm':
        return 'text-xs'
      case 'md':
        return 'text-sm'
      case 'lg':
        return 'text-base'
      case 'xl':
        return 'text-lg'
      default:
        return 'text-sm'
    }
  }

  const sizeClasses = getSizeClasses()
  const variantClasses = getVariantClasses()
  const textSizeClasses = getTextSize()

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        className={`${sizeClasses} ${variantClasses}`}
      >
        <Loader2 className="w-full h-full" />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${textSizeClasses} ${variantClasses} text-center`}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        {spinnerContent}
      </motion.div>
    )
  }

  return spinnerContent
}

// Alternative spinner with refresh icon
export function RefreshSpinner({
  size = 'md',
  text,
  className = '',
  variant = 'default'
}: Omit<LoadingSpinnerProps, 'overlay'>) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      case 'xl':
        return 'w-12 h-12'
      default:
        return 'w-6 h-6'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary-600'
      case 'secondary':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-900 dark:text-white'
    }
  }

  const sizeClasses = getSizeClasses()
  const variantClasses = getVariantClasses()

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
        className={`${sizeClasses} ${variantClasses}`}
      >
        <RefreshCw className="w-full h-full" />
      </motion.div>
      {text && (
        <p className={`text-sm ${variantClasses} text-center`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Pulse loader for skeleton states
export function PulseLoader({
  count = 3,
  size = 'md',
  className = ''
}: {
  count?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-1 h-1'
      case 'sm':
        return 'w-1.5 h-1.5'
      case 'md':
        return 'w-2 h-2'
      case 'lg':
        return 'w-3 h-3'
      default:
        return 'w-2 h-2'
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className={`flex space-x-1 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`${sizeClasses} bg-gray-400 dark:bg-gray-600 rounded-full`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

// Skeleton loader for content placeholders
export function SkeletonLoader({
  className = '',
  animate = true,
  lines = 1,
  width = 'full'
}: {
  className?: string
  animate?: boolean
  lines?: number
  width?: 'full' | '3/4' | '1/2' | '1/3' | '1/4'
}) {
  const getWidthClass = () => {
    switch (width) {
      case '3/4':
        return 'w-3/4'
      case '1/2':
        return 'w-1/2'
      case '1/3':
        return 'w-1/3'
      case '1/4':
        return 'w-1/4'
      default:
        return 'w-full'
    }
  }

  const widthClass = getWidthClass()

  const skeletonAnimation = animate ? {
    animate: {
      opacity: [0.5, 1, 0.5]
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  } : {}

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            index === lines - 1 && lines > 1 ? 'w-3/4' : widthClass
          }`}
          {...skeletonAnimation}
        />
      ))}
    </div>
  )
}

// Card skeleton for loading cards
export function CardSkeleton({
  className = '',
  showAvatar = false,
  lines = 3
}: {
  className?: string
  showAvatar?: boolean
  lines?: number
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="animate-pulse">
        {showAvatar && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
                index === lines - 1 ? 'w-2/3' : 'w-full'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Button loading state
export function ButtonSpinner({
  size = 'sm',
  className = ''
}: {
  size?: 'xs' | 'sm' | 'md'
  className?: string
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-5 h-5'
      default:
        return 'w-4 h-4'
    }
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      className={`${getSizeClasses()} ${className}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  )
}

export default LoadingSpinner
