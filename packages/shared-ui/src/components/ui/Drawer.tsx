import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// Context for Drawer state management
interface DrawerContextType {
    open: boolean
    onOpenChange: (open: boolean) => void
    drawerId: string
}

const DrawerContext = createContext<DrawerContextType | null>(null)

const useDrawer = () => {
    const context = useContext(DrawerContext)
    if (!context) {
        throw new Error('Drawer components must be used within a Drawer')
    }
    return context
}

// Focus trap utility for drawer
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

        document.addEventListener('keydown', handleTabKey)
        firstElement?.focus()

        return () => {
            document.removeEventListener('keydown', handleTabKey)
        }
    }, [isActive, containerRef])
}

// Drawer Overlay variants
const drawerOverlayVariants = cva([
    'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
])

// Drawer Content variants
const drawerContentVariants = cva([
    'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:duration-300 data-[state=open]:duration-500'
], {
    variants: {
        side: {
            top: [
                'inset-x-0 top-0 border-b',
                'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top'
            ],
            bottom: [
                'inset-x-0 bottom-0 border-t',
                'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
            ],
            left: [
                'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
                'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            ],
            right: [
                'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
                'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
            ]
        },
        size: {
            sm: '',
            default: '',
            lg: '',
            xl: '',
            full: ''
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
    compoundVariants: [
        // Size variants for different sides
        {
            side: ['top', 'bottom'],
            size: 'sm',
            class: 'h-1/4'
        },
        {
            side: ['top', 'bottom'],
            size: 'default',
            class: 'h-1/3'
        },
        {
            side: ['top', 'bottom'],
            size: 'lg',
            class: 'h-1/2'
        },
        {
            side: ['top', 'bottom'],
            size: 'xl',
            class: 'h-2/3'
        },
        {
            side: ['top', 'bottom'],
            size: 'full',
            class: 'h-full'
        },
        {
            side: ['left', 'right'],
            size: 'sm',
            class: 'w-1/4 sm:max-w-xs'
        },
        {
            side: ['left', 'right'],
            size: 'default',
            class: 'w-3/4 sm:max-w-sm'
        },
        {
            side: ['left', 'right'],
            size: 'lg',
            class: 'w-1/2 sm:max-w-lg'
        },
        {
            side: ['left', 'right'],
            size: 'xl',
            class: 'w-2/3 sm:max-w-2xl'
        },
        {
            side: ['left', 'right'],
            size: 'full',
            class: 'w-full sm:max-w-none'
        }
    ],
    defaultVariants: {
        side: 'right',
        size: 'default',
        app: 'default'
    }
})

// Drawer Header variants
const drawerHeaderVariants = cva([
    'grid gap-1.5 p-4 text-center sm:text-left'
])

// Drawer Title variants
const drawerTitleVariants = cva([
    'text-lg font-semibold leading-none tracking-tight'
])

// Drawer Description variants
const drawerDescriptionVariants = cva([
    'text-sm text-muted-foreground'
])

// Drawer Footer variants
const drawerFooterVariants = cva([
    'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4'
])

// Drawer Close variants
const drawerCloseVariants = cva([
    'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
    'transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
    'focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
    'data-[state=open]:bg-secondary'
])

// Drawer Trigger variants
const drawerTriggerVariants = cva([
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
            codai: 'focus-visible:ring-codai-primary/20',
            memorai: 'focus-visible:ring-memorai-primary/20',
            bancai: 'focus-visible:ring-bancai-primary/20',
            romai: 'focus-visible:ring-romai-primary/20',
            ajutai: 'focus-visible:ring-ajutai-primary/20',
            controlai: 'focus-visible:ring-controlai-primary/20',
            studiai: 'focus-visible:ring-studiai-primary/20',
            sociai: 'focus-visible:ring-sociai-primary/20',
            cumparai: 'focus-visible:ring-cumparai-primary/20',
            donai: 'focus-visible:ring-donai-primary/20'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
        app: 'default'
    }
})

// Type definitions
export interface DrawerProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof drawerTriggerVariants> {
    children: React.ReactNode
    asChild?: boolean
    app?: AppName
}

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof drawerContentVariants> {
    children: React.ReactNode
    hideCloseButton?: boolean
    closeOnOutsideClick?: boolean
    closeOnEscape?: boolean
    app?: AppName
    side?: 'top' | 'bottom' | 'left' | 'right'
    size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
}

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
}

export interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode
}

export interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
    asChild?: boolean
}

// Drawer Root Component
export const Drawer: React.FC<DrawerProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const drawerId = useRef(`drawer-${Math.random().toString(36).substr(2, 9)}`).current

    const handleOpenChange = (newOpen: boolean) => {
        if (controlledOpen === undefined) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }

    return (
        <DrawerContext.Provider value={{ open, onOpenChange: handleOpenChange, drawerId }}>
            {children}
        </DrawerContext.Provider>
    )
}

// Drawer Trigger Component
export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({
    children,
    className,
    variant,
    size,
    app,
    asChild,
    onClick,
    ...props
}) => {
    const { onOpenChange } = useDrawer()

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
            className={cn(drawerTriggerVariants({ variant, size, app }), className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    )
}

// Drawer Portal Component
const DrawerPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(children, document.body)
}

// Drawer Overlay Component
const DrawerOverlay: React.FC<{
    className?: string
    onClick?: () => void
}> = ({ className, onClick }) => {
    return (
        <div
            className={cn(drawerOverlayVariants(), className)}
            onClick={onClick}
        />
    )
}

// Drawer Content Component
export const DrawerContent: React.FC<DrawerContentProps> = ({
    children,
    className,
    side,
    size,
    app,
    hideCloseButton = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    ...props
}) => {
    const { open, onOpenChange, drawerId } = useDrawer()
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
        <DrawerPortal>
            <DrawerOverlay
                onClick={closeOnOutsideClick ? () => onOpenChange(false) : undefined}
            />
            <div
                ref={contentRef}
                className={cn(drawerContentVariants({ side, size, app }), className)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${drawerId}-title`}
                aria-describedby={`${drawerId}-description`}
                onClick={(e) => e.stopPropagation()}
                data-state={open ? 'open' : 'closed'}
                {...props}
            >
                {!hideCloseButton && (
                    <DrawerClose className="absolute right-4 top-4">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DrawerClose>
                )}
                {children}
            </div>
        </DrawerPortal>
    )
}

// Drawer Header Component
export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div className={cn(drawerHeaderVariants(), className)} {...props}>
            {children}
        </div>
    )
}

// Drawer Title Component
export const DrawerTitle: React.FC<DrawerTitleProps> = ({
    children,
    className,
    ...props
}) => {
    const { drawerId } = useDrawer()

    return (
        <h2
            id={`${drawerId}-title`}
            className={cn(drawerTitleVariants(), className)}
            {...props}
        >
            {children}
        </h2>
    )
}

// Drawer Description Component
export const DrawerDescription: React.FC<DrawerDescriptionProps> = ({
    children,
    className,
    ...props
}) => {
    const { drawerId } = useDrawer()

    return (
        <p
            id={`${drawerId}-description`}
            className={cn(drawerDescriptionVariants(), className)}
            {...props}
        >
            {children}
        </p>
    )
}

// Drawer Footer Component
export const DrawerFooter: React.FC<DrawerFooterProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div className={cn(drawerFooterVariants(), className)} {...props}>
            {children}
        </div>
    )
}

// Drawer Close Component
export const DrawerClose: React.FC<DrawerCloseProps> = ({
    children,
    className,
    asChild,
    onClick,
    ...props
}) => {
    const { onOpenChange } = useDrawer()

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
            className={cn(drawerCloseVariants(), className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    )
}

// Preset Drawer Compositions
export const SidebarDrawer: React.FC<{
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
    side?: 'left' | 'right'
    app?: AppName | 'default'
}> = ({
    open,
    onOpenChange,
    children,
    side = 'left',
    app = 'default'
}) => {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent
                    side={side}
                    size="default"
                    app={app === 'default' ? undefined : app as AppName}
                    closeOnOutsideClick={true}
                >
                    {children}
                </DrawerContent>
            </Drawer>
        )
    }

export const BottomDrawer: React.FC<{
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
    app?: AppName | 'default'
}> = ({
    open,
    onOpenChange,
    children,
    app = 'default'
}) => {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent
                    side="bottom"
                    size="default"
                    app={app === 'default' ? undefined : app as AppName}
                    closeOnOutsideClick={true}
                >
                    {children}
                </DrawerContent>
            </Drawer>
        )
    }

export const FullScreenDrawer: React.FC<{
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
    side?: 'left' | 'right' | 'top' | 'bottom'
    app?: AppName | 'default'
}> = ({
    open,
    onOpenChange,
    children,
    side = 'right',
    app = 'default'
}) => {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent
                    side={side}
                    size="full"
                    app={app === 'default' ? undefined : app as AppName}
                    closeOnOutsideClick={false}
                    hideCloseButton={false}
                >
                    {children}
                </DrawerContent>
            </Drawer>
        )
    }

// Example usage in comments
/*
// Basic Drawer
<Drawer>
  <DrawerTrigger>Open Drawer</DrawerTrigger>
  <DrawerContent side="right">
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description goes here.</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">Drawer content</div>
    <DrawerFooter>
      <DrawerClose>Close</DrawerClose>
      <button>Action</button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>

// Controlled Drawer
const [open, setOpen] = useState(false)
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent side="left" size="lg" app="codai">
    // Content
  </DrawerContent>
</Drawer>

// Sidebar Drawer
<SidebarDrawer
  open={sidebarOpen}
  onOpenChange={setSidebarOpen}
  side="left"
  app="memorai"
>
  <nav>Navigation content</nav>
</SidebarDrawer>

// Bottom Drawer
<BottomDrawer
  open={bottomOpen}
  onOpenChange={setBottomOpen}
  app="bancai"
>
  <div>Bottom sheet content</div>
</BottomDrawer>
*/
