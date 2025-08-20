'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== TOAST VARIANTS =====
const toastVariants = cva(
    [
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4',
        'overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        'data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full'
    ],
    {
        variants: {
            variant: {
                default: 'border bg-background text-foreground',
                success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
                warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
                error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
                info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
            },
            app: {
                default: '',
                codai: 'border-l-4 border-l-codai-primary',
                memorai: 'border-l-4 border-l-memorai-primary',
                bancai: 'border-l-4 border-l-bancai-primary',
                romai: 'border-l-4 border-l-romai-primary',
                ajutai: 'border-l-4 border-l-ajutai-primary',
                controlai: 'border-l-4 border-l-controlai-primary',
                studiai: 'border-l-4 border-l-studiai-primary'
            }
        },
        defaultVariants: {
            variant: 'default',
            app: 'default'
        }
    }
)

const toastActionVariants = cva(
    [
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium',
        'ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40',
        'group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground',
        'group-[.destructive]:focus:ring-destructive'
    ]
)

// ===== TOAST INTERFACES =====
export interface ToastProps
    extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof toastVariants>, 'app'> {
    app?: AppName | 'default'
}

export interface ToastActionProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toastActionVariants> { }

export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> { }

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> { }

// ===== TOAST CONTEXT =====
interface ToastContextValue {
    toasts: ToastData[]
    addToast: (toast: Omit<ToastData, 'id'>) => void
    removeToast: (id: string) => void
    clearToasts: () => void
}

interface ToastData {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    app?: AppName | 'default'
    action?: {
        label: string
        onClick: () => void
    }
    duration?: number
    persistent?: boolean
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// ===== TOAST COMPONENTS =====
const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, app, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(toastVariants({ variant, app: app as any }), className)}
            {...props}
        />
    )
)
Toast.displayName = 'Toast'

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
    ({ className, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(toastActionVariants(), className)}
            {...props}
        />
    )
)
ToastAction.displayName = 'ToastAction'

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
    ({ className, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity',
                'hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
                className
            )}
            {...props}
        >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    )
)
ToastClose.displayName = 'ToastClose'

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('text-sm font-semibold', className)}
            {...props}
        />
    )
)
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('text-sm opacity-90', className)}
            {...props}
        />
    )
)
ToastDescription.displayName = 'ToastDescription'

// ===== TOAST VIEWPORT =====
const ToastViewport = React.forwardRef<
    HTMLOListElement,
    React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn(
            'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = 'ToastViewport'

// ===== TOAST PROVIDER =====
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = React.useState<ToastData[]>([])

    const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: ToastData = {
            ...toast,
            id,
            duration: toast.duration ?? 5000
        }

        setToasts((prev) => [...prev, newToast])

        // Auto-remove toast if not persistent
        if (!toast.persistent && newToast.duration) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, newToast.duration)
        }
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const clearToasts = React.useCallback(() => {
        setToasts([])
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

// ===== TOAST CONTAINER =====
const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast()

    if (toasts.length === 0) return null

    return (
        <ToastViewport>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </ToastViewport>
    )
}

// ===== TOAST ITEM =====
interface ToastItemProps {
    toast: ToastData
    onRemove: () => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    return (
        <Toast variant={toast.variant} app={toast.app}>
            <div className="grid gap-1">
                {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
            {toast.action && (
                <ToastAction onClick={toast.action.onClick}>
                    {toast.action.label}
                </ToastAction>
            )}
            <ToastClose onClick={onRemove} />
        </Toast>
    )
}

// ===== TOAST HELPERS =====
interface ToastOptions {
    title?: string
    description?: string
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    app?: AppName | 'default'
    action?: {
        label: string
        onClick: () => void
    }
    duration?: number
    persistent?: boolean
}

export const createToastHelpers = () => {
    const { addToast } = useToast()

    return {
        toast: (options: ToastOptions) => addToast(options),
        success: (title: string, description?: string, options?: Partial<ToastOptions>) =>
            addToast({ title, description, variant: 'success', ...options }),
        error: (title: string, description?: string, options?: Partial<ToastOptions>) =>
            addToast({ title, description, variant: 'error', ...options }),
        warning: (title: string, description?: string, options?: Partial<ToastOptions>) =>
            addToast({ title, description, variant: 'warning', ...options }),
        info: (title: string, description?: string, options?: Partial<ToastOptions>) =>
            addToast({ title, description, variant: 'info', ...options })
    }
}

// ===== TOAST HOOK WITH HELPERS =====
export const useToastHelpers = () => {
    const context = useToast()
    const helpers = createToastHelpers()

    return {
        ...context,
        ...helpers
    }
}

// ===== TOAST ICONS =====
const ToastIcons = {
    success: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    error: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    ),
    warning: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    ),
    info: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    )
}

// ===== ENHANCED TOAST WITH ICON =====
interface IconToastProps extends ToastOptions {
    children?: React.ReactNode
}

export const IconToast: React.FC<IconToastProps> = ({
    title,
    description,
    variant = 'default',
    app,
    children
}) => {
    const icon = variant !== 'default' ? ToastIcons[variant as keyof typeof ToastIcons] : null

    return (
        <Toast variant={variant} app={app}>
            <div className="flex items-start space-x-3">
                {icon && (
                    <div className="flex-shrink-0 mt-0.5">
                        {icon}
                    </div>
                )}
                <div className="grid gap-1 flex-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && <ToastDescription>{description}</ToastDescription>}
                    {children}
                </div>
            </div>
        </Toast>
    )
}

// ===== EXPORTS =====
export {
    Toast,
    ToastAction,
    ToastClose,
    ToastTitle,
    ToastDescription,
    ToastViewport,
    ToastProvider,
    ToastIcons,
    toastVariants
}
