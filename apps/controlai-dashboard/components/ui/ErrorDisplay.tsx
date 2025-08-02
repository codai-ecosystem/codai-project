'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, XCircle, RefreshCw, ChevronRight } from 'lucide-react'

interface ErrorDisplayProps {
  error: Error | string | null
  title?: string
  description?: string
  onRetry?: () => void
  retryText?: string
  showDetails?: boolean
  className?: string
  variant?: 'default' | 'card' | 'inline'
  size?: 'sm' | 'md' | 'lg'
}

export function ErrorDisplay({
  error,
  title = 'Something went wrong',
  description,
  onRetry,
  retryText = 'Try again',
  showDetails = false,
  className = '',
  variant = 'default',
  size = 'md'
}: ErrorDisplayProps) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false)

  const getErrorMessage = () => {
    if (!error) return 'An unknown error occurred'
    if (typeof error === 'string') return error
    return error.message || 'An unknown error occurred'
  }

  const getErrorStack = () => {
    if (!error || typeof error === 'string') return null
    return error.stack
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          title: 'text-lg',
          description: 'text-sm',
          button: 'px-3 py-1.5 text-sm',
          icon: 'w-5 h-5'
        }
      case 'md':
        return {
          container: 'p-6',
          title: 'text-xl',
          description: 'text-base',
          button: 'px-4 py-2 text-sm',
          icon: 'w-6 h-6'
        }
      case 'lg':
        return {
          container: 'p-8',
          title: 'text-2xl',
          description: 'text-lg',
          button: 'px-6 py-3 text-base',
          icon: 'w-8 h-8'
        }
      default:
        return {
          container: 'p-6',
          title: 'text-xl',
          description: 'text-base',
          button: 'px-4 py-2 text-sm',
          icon: 'w-6 h-6'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  }

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: 0.1
      }
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 shadow-sm'
      case 'inline':
        return 'bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800'
      default:
        return 'bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800'
    }
  }

  const variantClasses = getVariantClasses()

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`${variantClasses} ${sizeClasses.container} ${className}`}
    >
      <div className="flex items-start space-x-4">
        {/* Error Icon */}
        <motion.div
          variants={iconVariants}
          className="flex-shrink-0"
        >
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <XCircle className={`${sizeClasses.icon} text-red-600 dark:text-red-400`} />
          </div>
        </motion.div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`${sizeClasses.title} font-semibold text-red-900 dark:text-red-100 mb-2`}>
            {title}
          </h3>

          {description && (
            <p className={`${sizeClasses.description} text-red-700 dark:text-red-200 mb-4`}>
              {description}
            </p>
          )}

          <p className={`${sizeClasses.description} text-red-600 dark:text-red-300 mb-4`}>
            {getErrorMessage()}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {onRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetry}
                className={`
                  ${sizeClasses.button} bg-red-600 text-white rounded-lg 
                  hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  transition-colors duration-200 flex items-center space-x-2
                `}
              >
                <RefreshCw className="w-4 h-4" />
                <span>{retryText}</span>
              </motion.button>
            )}

            {showDetails && getErrorStack() && (
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className={`
                  ${sizeClasses.button} text-red-600 dark:text-red-400 
                  hover:text-red-700 dark:hover:text-red-300
                  focus:outline-none transition-colors duration-200
                  flex items-center space-x-1
                `}
              >
                <span>Error Details</span>
                <motion.div
                  animate={{ rotate: showErrorDetails ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </button>
            )}
          </div>

          {/* Error Details */}
          {showDetails && showErrorDetails && getErrorStack() && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
            >
              <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-2">
                Stack Trace:
              </p>
              <pre className="text-xs text-red-700 dark:text-red-300 overflow-x-auto whitespace-pre-wrap">
                {getErrorStack()}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Simplified error component for inline use
export function InlineError({
  message,
  onRetry,
  className = ''
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`flex items-center space-x-2 text-red-600 dark:text-red-400 ${className}`}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm underline hover:no-underline focus:outline-none"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// Error boundary fallback component
export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <ErrorDisplay
      error={error}
      title="Application Error"
      description="Something went wrong in the application. Please try refreshing the page."
      onRetry={resetErrorBoundary}
      retryText="Refresh Page"
      showDetails={process.env.NODE_ENV === 'development'}
      variant="card"
      size="lg"
      className="max-w-2xl mx-auto"
    />
  )
}

// Network error component
export function NetworkError({
  onRetry,
  className = ''
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorDisplay
      error="Unable to connect to the server. Please check your internet connection."
      title="Connection Error"
      description="There seems to be a problem with your network connection."
      onRetry={onRetry}
      retryText="Retry Connection"
      variant="card"
      className={className}
    />
  )
}

// 404 error component
export function NotFoundError({
  resource = 'page',
  onRetry,
  className = ''
}: {
  resource?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorDisplay
      error={`The ${resource} you're looking for doesn't exist or has been moved.`}
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
      description="This might be a temporary issue or the content may have been removed."
      onRetry={onRetry}
      retryText="Go Back"
      variant="card"
      className={className}
    />
  )
}

// Permission error component
export function PermissionError({
  action = 'access this resource',
  onRetry,
  className = ''
}: {
  action?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorDisplay
      error={`You don't have permission to ${action}.`}
      title="Access Denied"
      description="Please contact your administrator if you believe this is an error."
      onRetry={onRetry}
      retryText="Try Again"
      variant="card"
      className={className}
    />
  )
}

export default ErrorDisplay
