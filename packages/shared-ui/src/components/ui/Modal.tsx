'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== MODAL VARIANTS =====
const modalOverlayVariants = cva(
    [
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
    ]
)

const modalContentVariants = cva(
    [
        'relative z-50 grid w-full gap-4 border shadow-lg',
        'bg-background p-6 rounded-xl',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]'
    ],
    {
        variants: {
            size: {
                sm: 'max-w-sm',
                default: 'max-w-lg',
                lg: 'max-w-2xl',
                xl: 'max-w-4xl',
                full: 'max-w-full h-full m-4'
            },
            app: {
                default: '',
                codai: 'border-l-4 border-l-codai-primary',
                memorai: 'border-l-4 border-l-memorai-primary',
                bancai: 'border-l-4 border-l-bancai-primary',
                romai: 'border-l-4 border-l-romai-primary',
                ajutai: 'border-l-4 border-l-ajutai-primary',
                controlai: 'border-l-4 border-l-controlai-primary',
                studiai: 'border-l-4 border-l-studiai-primary',
                sociai: 'border-l-4 border-l-sociai-primary',
                cumparai: 'border-l-4 border-l-cumparai-primary',
                donai: 'border-l-4 border-l-donai-primary'
            }
        },
        defaultVariants: {
            size: 'default',
            app: 'default'
        }
    }
)

const modalHeaderVariants = cva(
    'flex flex-col space-y-1.5 text-center sm:text-left'
)

const modalFooterVariants = cva(
    'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'
)

// ===== INTERFACES =====
export interface ModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export interface ModalContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentVariants> {
    app?: AppName | 'default'
    onEscapeKeyDown?: (event: KeyboardEvent) => void
    onInteractOutside?: (event: Event) => void
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export interface ModalCloseProps extends React.HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

// ===== MODAL CONTEXT =====
interface ModalContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ModalContext = React.createContext<ModalContextValue | undefined>(undefined)

const useModalContext = () => {
    const context = React.useContext(ModalContext)
    if (!context) {
        throw new Error('Modal components must be used within a Modal')
    }
    return context
}

// ===== MODAL COMPONENTS =====
const Modal: React.FC<ModalProps> = ({ open, onOpenChange, children }) => {
    return (
        <ModalContext.Provider value={{ open, onOpenChange }}>
            {children}
        </ModalContext.Provider>
    )
}

const ModalTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
    const { onOpenChange } = useModalContext()

    return (
        <button
            ref={ref}
            onClick={(e) => {
                onOpenChange(true)
                onClick?.(e)
            }}
            {...props}
        />
    )
})
ModalTrigger.displayName = 'ModalTrigger'

const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return typeof document !== 'undefined'
        ? ReactDOM.createPortal(children, document.body)
        : null
}

// Import ReactDOM at the top with other imports
import * as ReactDOM from 'react-dom'

const ModalOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { open, onOpenChange } = useModalContext()

    if (!open) return null

    return (
        <div
            ref={ref}
            className={cn(modalOverlayVariants(), className)}
            data-state={open ? 'open' : 'closed'}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onOpenChange(false)
                }
            }}
            {...props}
        />
    )
})
ModalOverlay.displayName = 'ModalOverlay'

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
    ({
        className,
        children,
        size,
        app,
        onEscapeKeyDown,
        onInteractOutside,
        ...props
    }, ref) => {
        const { open, onOpenChange } = useModalContext()

        // Handle escape key
        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onEscapeKeyDown?.(event)
                    if (!event.defaultPrevented) {
                        onOpenChange(false)
                    }
                }
            }

            if (open) {
                document.addEventListener('keydown', handleKeyDown)
                // Prevent body scroll
                document.body.style.overflow = 'hidden'
            }

            return () => {
                document.removeEventListener('keydown', handleKeyDown)
                document.body.style.overflow = 'unset'
            }
        }, [open, onOpenChange, onEscapeKeyDown])

        if (!open) return null

        return (
            <ModalPortal>
                <ModalOverlay>
                    <div
                        ref={ref}
                        className={cn(modalContentVariants({ size, app }), className)}
                        data-state={open ? 'open' : 'closed'}
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                        {...props}
                    >
                        {children}
                    </div>
                </ModalOverlay>
            </ModalPortal>
        )
    }
)
ModalContent.displayName = 'ModalContent'

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(modalHeaderVariants(), className)}
            {...props}
        />
    )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
    ({ className, as: Component = 'h2', ...props }, ref) => (
        <Component
            ref={ref}
            className={cn(
                'text-lg font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        />
    )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    )
)
ModalDescription.displayName = 'ModalDescription'

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(modalFooterVariants(), className)}
            {...props}
        />
    )
)
ModalFooter.displayName = 'ModalFooter'

const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
    ({ className, onClick, children, asChild, ...props }, ref) => {
        const { onOpenChange } = useModalContext()

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                    onOpenChange(false)
                    onClick?.(e as any)
                    const childProps = (children as any)?.props
                    childProps?.onClick?.(e)
                }
            })
        }

        return (
            <button
                ref={ref}
                className={cn(
                    'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
                    'transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
                    'focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
                    className
                )}
                onClick={(e) => {
                    onOpenChange(false)
                    onClick?.(e)
                }}
                {...props}
            >
                {children || (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                <span className="sr-only">Close</span>
            </button>
        )
    }
)
ModalClose.displayName = 'ModalClose'

// ===== CONFIRMATION MODAL =====
interface ConfirmationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void | Promise<void>
    loading?: boolean
    app?: AppName | 'default'
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    loading = false,
    app
}) => {
    const handleConfirm = async () => {
        try {
            await onConfirm()
            onOpenChange(false)
        } catch (error) {
            // Error handling should be done by the parent component
            console.error('Confirmation action failed:', error)
        }
    }

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent size="sm" app={app}>
                <ModalHeader>
                    <ModalTitle>{title}</ModalTitle>
                    {description && (
                        <ModalDescription>{description}</ModalDescription>
                    )}
                </ModalHeader>
                <ModalFooter className="gap-2">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className={cn(
                            'inline-flex items-center justify-center rounded-md text-sm font-medium',
                            'ring-offset-background transition-colors focus-visible:outline-none',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'disabled:pointer-events-none disabled:opacity-50',
                            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                            'h-10 px-4 py-2'
                        )}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            'inline-flex items-center justify-center rounded-md text-sm font-medium',
                            'ring-offset-background transition-colors focus-visible:outline-none',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            'disabled:pointer-events-none disabled:opacity-50',
                            'h-10 px-4 py-2',
                            variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                    >
                        {loading && (
                            <div className="mr-2 h-4 w-4 animate-spin">
                                <div className="h-full w-full border-2 border-current border-t-transparent rounded-full" />
                            </div>
                        )}
                        {confirmText}
                    </button>
                </ModalFooter>
                <ModalClose />
            </ModalContent>
        </Modal>
    )
}

// ===== EXPORTS =====
export {
    Modal,
    ModalTrigger,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalFooter,
    ModalClose,
    ModalPortal,
    ModalOverlay
}
