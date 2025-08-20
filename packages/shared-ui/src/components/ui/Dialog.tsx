import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// Context for Dialog state management
interface DialogContextType {
    open: boolean
    onOpenChange: (open: boolean) => void
    dialogId: string
}

const DialogContext = createContext<DialogContextType | null>(null)

const useDialog = () => {
    const context = useContext(DialogContext)
    if (!context) {
        throw new Error('Dialog components must be used within a Dialog')
    }
    return context
}

// Focus trap utility
const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const container = containerRef.current
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus()
                    e.preventDefault()
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus()
                    e.preventDefault()
                }
            }
        }

        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // This will be handled by the Dialog component
            }
        }

        document.addEventListener('keydown', handleTabKey)
        document.addEventListener('keydown', handleEscapeKey)
        firstElement?.focus()

        return () => {
            document.removeEventListener('keydown', handleTabKey)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isActive, containerRef])
}

// Dialog Overlay variants
const dialogOverlayVariants = cva([
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    'bg-black/80 backdrop-blur-sm',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
])

// Dialog Content variants
const dialogContentVariants = cva([
    'relative z-50 grid w-full gap-4 rounded-lg border bg-background p-6 shadow-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    'duration-200'
], {
    variants: {
        size: {
            sm: 'max-w-sm',
            default: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl',
            '2xl': 'max-w-7xl',
            full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]'
        },
        position: {
            center: 'mx-auto',
            top: 'mx-auto mt-8',
            bottom: 'mx-auto mb-8'
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
        position: 'center',
        app: 'default'
    }
})

// Dialog Header variants
const dialogHeaderVariants = cva([
    'flex flex-col space-y-1.5 text-center sm:text-left'
])

// Dialog Title variants
const dialogTitleVariants = cva([
    'text-lg font-semibold leading-none tracking-tight'
])

// Dialog Description variants
const dialogDescriptionVariants = cva([
    'text-sm text-muted-foreground'
])

// Dialog Footer variants
const dialogFooterVariants = cva([
    'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'
])

// Dialog Close variants
const dialogCloseVariants = cva([
    'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
    'transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
    'focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
    'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
])

// Dialog Trigger variants
const dialogTriggerVariants = cva([
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'ring-offset-background transition-colors focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50'
], {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10'
        },
        app: {
            default: '',
            codai: 'focus-visible:ring-codai-primary/20 data-[state=open]:bg-codai-primary/10',
            memorai: 'focus-visible:ring-memorai-primary/20 data-[state=open]:bg-memorai-primary/10',
            bancai: 'focus-visible:ring-bancai-primary/20 data-[state=open]:bg-bancai-primary/10',
            romai: 'focus-visible:ring-romai-primary/20 data-[state=open]:bg-romai-primary/10',
            ajutai: 'focus-visible:ring-ajutai-primary/20 data-[state=open]:bg-ajutai-primary/10',
            controlai: 'focus-visible:ring-controlai-primary/20 data-[state=open]:bg-controlai-primary/10',
            studiai: 'focus-visible:ring-studiai-primary/20 data-[state=open]:bg-studiai-primary/10',
            sociai: 'focus-visible:ring-sociai-primary/20 data-[state=open]:bg-sociai-primary/10',
            cumparai: 'focus-visible:ring-cumparai-primary/20 data-[state=open]:bg-cumparai-primary/10',
            donai: 'focus-visible:ring-donai-primary/20 data-[state=open]:bg-donai-primary/10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
        app: 'default'
    }
})

// Type definitions
export interface DialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof dialogTriggerVariants> {
    children: React.ReactNode
    asChild?: boolean
    app?: AppName
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof dialogContentVariants> {
    children: React.ReactNode
    hideCloseButton?: boolean
    closeOnOutsideClick?: boolean
    closeOnEscape?: boolean
    app?: AppName
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
    asChild?: boolean
}

// Dialog Root Component
export const Dialog: React.FC<DialogProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const dialogId = useRef(`dialog-${Math.random().toString(36).substr(2, 9)}`).current

    const handleOpenChange = (newOpen: boolean) => {
        if (controlledOpen === undefined) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }

    return (
        <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange, dialogId }}>
            {children}
        </DialogContext.Provider>
    )
}

// Dialog Trigger Component
export const DialogTrigger: React.FC<DialogTriggerProps> = ({
    children,
    className,
    variant,
    size,
    app,
    asChild,
    onClick,
    ...props
}) => {
    const { onOpenChange } = useDialog()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange(true)
        onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ...(children.props as any),
            onClick: handleClick
        })
    }

    return (
        <button
            className={cn(dialogTriggerVariants({ variant, size, app }), className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    )
}

// Dialog Portal Component
const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(children, document.body)
}

// Dialog Overlay Component
const DialogOverlay: React.FC<{
    className?: string
    onClick?: () => void
}> = ({ className, onClick }) => {
    return (
        <div
            className={cn(dialogOverlayVariants(), className)}
            onClick={onClick}
        />
    )
}

// Dialog Content Component
export const DialogContent: React.FC<DialogContentProps> = ({
    children,
    className,
    size,
    position,
    app,
    hideCloseButton = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    ...props
}) => {
    const { open, onOpenChange, dialogId } = useDialog()
    const contentRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Focus management
    useFocusTrap(open, contentRef)

    useEffect(() => {
        if (open) {
            previousActiveElement.current = document.activeElement as HTMLElement
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            previousActiveElement.current?.focus()
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    // Escape key handling
    useEffect(() => {
        if (!closeOnEscape) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [open, closeOnEscape, onOpenChange])

    if (!open) return null

    return (
        <DialogPortal>
            <div className={cn(dialogOverlayVariants())}>
                <DialogOverlay
                    onClick={closeOnOutsideClick ? () => onOpenChange(false) : undefined}
                />
                <div
                    ref={contentRef}
                    className={cn(dialogContentVariants({ size, position, app }), className)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`${dialogId}-title`}
                    aria-describedby={`${dialogId}-description`}
                    onClick={(e) => e.stopPropagation()}
                    {...props}
                >
                    {!hideCloseButton && (
                        <DialogClose className="absolute right-4 top-4">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    )}
                    {children}
                </div>
            </div>
        </DialogPortal>
    )
}

// Dialog Header Component
export const DialogHeader: React.FC<DialogHeaderProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div className={cn(dialogHeaderVariants(), className)} {...props}>
            {children}
        </div>
    )
}

// Dialog Title Component
export const DialogTitle: React.FC<DialogTitleProps> = ({
    children,
    className,
    ...props
}) => {
    const { dialogId } = useDialog()

    return (
        <h2
            id={`${dialogId}-title`}
            className={cn(dialogTitleVariants(), className)}
            {...props}
        >
            {children}
        </h2>
    )
}

// Dialog Description Component
export const DialogDescription: React.FC<DialogDescriptionProps> = ({
    children,
    className,
    ...props
}) => {
    const { dialogId } = useDialog()

    return (
        <p
            id={`${dialogId}-description`}
            className={cn(dialogDescriptionVariants(), className)}
            {...props}
        >
            {children}
        </p>
    )
}

// Dialog Footer Component
export const DialogFooter: React.FC<DialogFooterProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div className={cn(dialogFooterVariants(), className)} {...props}>
            {children}
        </div>
    )
}

// Dialog Close Component
export const DialogClose: React.FC<DialogCloseProps> = ({
    children,
    className,
    asChild,
    onClick,
    ...props
}) => {
    const { onOpenChange } = useDialog()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange(false)
        onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ...(children.props as any),
            onClick: handleClick
        })
    }

    return (
        <button
            className={cn(dialogCloseVariants(), className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    )
}

// Preset Dialog Compositions
export const ConfirmDialog: React.FC<{
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
    app?: AppName | 'default'
    variant?: 'default' | 'destructive'
}> = ({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    app = 'default',
    variant = 'default'
}) => {
        const handleConfirm = () => {
            onConfirm()
            onOpenChange(false)
        }

        const handleCancel = () => {
            onCancel?.()
            onOpenChange(false)
        }

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent app={app === 'default' ? undefined : app} size="sm">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={cn(
                                'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                variant === 'destructive'
                                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            )}
                        >
                            {confirmText}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

export const AlertDialog: React.FC<{
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    actionText?: string
    app?: AppName | 'default'
}> = ({
    open,
    onOpenChange,
    title,
    description,
    actionText = 'OK',
    app = 'default'
}) => {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent app={app === 'default' ? undefined : app} size="sm" closeOnOutsideClick={false}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {actionText}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

// Example usage in comments
/*
// Basic Dialog
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description goes here.</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <button>Confirm</button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Controlled Dialog
const [open, setOpen] = useState(false)
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent app="codai" size="lg">
    // Content
  </DialogContent>
</Dialog>

// Confirm Dialog
<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Delete Item"
  description="Are you sure you want to delete this item?"
  variant="destructive"
  onConfirm={handleDelete}
  app="bancai"
/>
*/
