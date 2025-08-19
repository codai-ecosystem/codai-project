import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all duration-300 ease-in-out',
    {
        variants: {
            variant: {
                default: 'border-border bg-background text-foreground',
                success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/50 dark:text-green-200',
                error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200',
                warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
                info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

const iconMap = {
    default: Info,
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
}

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
    title?: string
    description?: string
    message?: string  // Add message prop for backward compatibility
    action?: React.ReactNode
    onClose?: () => void
    showCloseButton?: boolean
    icon?: React.ReactNode
    duration?: number
    type?: 'default' | 'success' | 'error' | 'warning' | 'info'  // Add type alias for variant
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({
        className,
        variant = 'default',
        type, // Add type prop
        title,
        description,
        message, // Add message prop
        action,
        onClose,
        showCloseButton = true,
        icon,
        duration,
        ...props
    }, ref) => {
        const [isVisible, setIsVisible] = React.useState(true)
        const [progress, setProgress] = React.useState(100)
        const [isPaused, setIsPaused] = React.useState(false)
        const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

        // Use type as alias for variant if provided
        const effectiveVariant = type || variant || 'default'
        const IconComponent = iconMap[effectiveVariant]

        React.useEffect(() => {
            if (duration && duration > 0) {
                const startProgress = () => {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                    }

                    intervalRef.current = setInterval(() => {
                        if (!isPaused) {
                            setProgress((prev) => {
                                const newProgress = prev - (100 / (duration / 100))
                                if (newProgress <= 0) {
                                    clearInterval(intervalRef.current!)
                                    handleClose()
                                    return 0
                                }
                                return newProgress
                            })
                        }
                    }, 100)
                }

                startProgress()

                return () => {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                    }
                }
            }
        }, [duration, isPaused])

        const handleClose = () => {
            setIsVisible(false)
            setTimeout(() => {
                onClose?.()
            }, 300)
        }

        const handleMouseEnter = () => {
            setIsPaused(true)
        }

        const handleMouseLeave = () => {
            setIsPaused(false)
        }

        if (!isVisible) {
            return null
        }

        return (
            <div
                ref={ref}
                role="alert"  // Add required role for accessibility
                aria-live="polite"  // Change to polite as expected by tests
                aria-atomic="true"  // Add aria-atomic for accessibility
                className={cn(
                    toastVariants({ variant: effectiveVariant }),
                    'transform transition-all duration-300 ease-in-out',
                    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
                    className
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                <div className="flex items-start space-x-3 flex-1">
                    {(icon || IconComponent) && (
                        <div className="flex-shrink-0">
                            {icon || <IconComponent className="h-5 w-5" />}
                        </div>
                    )}

                    <div className="flex-1 space-y-1">
                        {title && (
                            <div className="text-sm font-semibold">
                                {title}
                            </div>
                        )}
                        {(description || message) && (
                            <div className="text-sm opacity-90">
                                {description || message}
                            </div>
                        )}
                    </div>
                </div>

                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}

                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                        aria-label="dismiss"  // Change to match test expectations
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {duration && duration > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }} />
                )}
            </div>
        )
    }
)
Toast.displayName = 'Toast'

// Toast Container Component
export interface ToastContainerProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
    className?: string
    children?: React.ReactNode
    toasts?: ToastState[]  // Add toasts prop for rendering toast states
    onDismiss?: (id: string) => void  // Add onDismiss callback
}

const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    position = 'top-right',
    className,
    children,
    toasts = [],
    onDismiss
}) => {
    return (
        <div
            data-testid="toast-container"
            className={cn(
                'fixed z-50 flex flex-col space-y-2 w-full max-w-sm',
                positionClasses[position],
                className
            )}
            role="region"
            aria-live="polite"
            aria-label="Notifications"
        >
            {children}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    title={toast.title}
                    description={toast.description}
                    message={toast.message || toast.description}  // Use message if available
                    variant={toast.variant || toast.type}  // Support both variant and type
                    type={toast.type}
                    duration={toast.duration}
                    action={toast.action}
                    onClose={() => onDismiss?.(toast.id)}
                />
            ))}
        </div>
    )
}

// Hook for programmatic toast management
export interface ToastState {
    id: string
    title?: string
    description?: string
    message?: string  // Add message for compatibility
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
    type?: 'default' | 'success' | 'error' | 'warning' | 'info'  // Add type alias
    duration?: number
    action?: React.ReactNode
}

export const useToast = () => {
    const [toasts, setToasts] = React.useState<ToastState[]>([])

    const addToast = React.useCallback((toast: Omit<ToastState, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { ...toast, id }])
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const clearAllToasts = React.useCallback(() => {
        setToasts([])
    }, [])

    // Convenience methods
    const toast = React.useMemo(() => ({
        success: (title: string, description?: string, options?: Partial<ToastState>) =>
            addToast({ title, description, variant: 'success', duration: 4000, ...options }),
        error: (title: string, description?: string, options?: Partial<ToastState>) =>
            addToast({ title, description, variant: 'error', duration: 6000, ...options }),
        warning: (title: string, description?: string, options?: Partial<ToastState>) =>
            addToast({ title, description, variant: 'warning', duration: 5000, ...options }),
        info: (title: string, description?: string, options?: Partial<ToastState>) =>
            addToast({ title, description, variant: 'info', duration: 4000, ...options }),
        default: (title: string, description?: string, options?: Partial<ToastState>) =>
            addToast({ title, description, variant: 'default', duration: 4000, ...options }),
    }), [addToast])

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        toast,
        showToast: addToast,  // Add showToast alias for test compatibility
    }
}

export { Toast, toastVariants }
