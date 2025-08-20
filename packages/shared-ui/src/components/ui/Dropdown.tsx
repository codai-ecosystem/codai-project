'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// ===== DROPDOWN VARIANTS =====
const dropdownTriggerVariants = cva(
    [
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        'ring-offset-background transition-colors focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50'
    ],
    {
        variants: {
            variant: {
                default: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
            },
            size: {
                sm: 'h-8 px-2 text-xs',
                default: 'h-10 px-4 py-2',
                lg: 'h-11 px-8',
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
                studiai: 'focus-visible:ring-studiai-primary/20'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            app: 'default'
        }
    }
)

const dropdownContentVariants = cva(
    [
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ],
    {
        variants: {
            app: {
                default: '',
                codai: 'border-l-2 border-l-codai-primary',
                memorai: 'border-l-2 border-l-memorai-primary',
                bancai: 'border-l-2 border-l-bancai-primary',
                romai: 'border-l-2 border-l-romai-primary',
                ajutai: 'border-l-2 border-l-ajutai-primary',
                controlai: 'border-l-2 border-l-controlai-primary',
                studiai: 'border-l-2 border-l-studiai-primary'
            }
        },
        defaultVariants: {
            app: 'default'
        }
    }
)

const dropdownItemVariants = cva(
    [
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'transition-colors focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ],
    {
        variants: {
            variant: {
                default: '',
                destructive: 'text-destructive focus:bg-destructive focus:text-destructive-foreground'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
)

// ===== INTERFACES =====
export interface DropdownProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
    modal?: boolean
}

export interface DropdownTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof dropdownTriggerVariants>, 'app'> {
    app?: AppName | 'default'
    asChild?: boolean
}

export interface DropdownContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof dropdownContentVariants>, 'app'> {
    app?: AppName | 'default'
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
    alignOffset?: number
    onEscapeKeyDown?: (event: KeyboardEvent) => void
    onInteractOutside?: (event: Event) => void
}

export interface DropdownItemProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>,
    VariantProps<typeof dropdownItemVariants> {
    disabled?: boolean
    onSelect?: (event: React.MouseEvent) => void
    asChild?: boolean
}

export interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> { }

export interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

// ===== DROPDOWN CONTEXT =====
interface DropdownContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined)

const useDropdownContext = () => {
    const context = React.useContext(DropdownContext)
    if (!context) {
        throw new Error('Dropdown components must be used within a Dropdown')
    }
    return context
}

// ===== DROPDOWN COMPONENTS =====
const Dropdown: React.FC<DropdownProps> = ({
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    children,
    modal = false
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false)

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const onOpenChange = controlledOnOpenChange || setInternalOpen

    return (
        <DropdownContext.Provider value={{ open, onOpenChange }}>
            <div className="relative">
                {children}
            </div>
        </DropdownContext.Provider>
    )
}

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
    ({ className, variant, size, app, asChild, onClick, children, ...props }, ref) => {
        const { open, onOpenChange } = useDropdownContext()

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                    onOpenChange(!open)
                    onClick?.(e as any)
                        ; (children as React.ReactElement<any>).props.onClick?.(e)
                },
                'aria-expanded': open,
                'aria-haspopup': 'menu'
            })
        }

        return (
            <button
                ref={ref}
                className={cn(dropdownTriggerVariants({ variant, size, app: app as any }), className)}
                onClick={(e) => {
                    onOpenChange(!open)
                    onClick?.(e)
                }}
                aria-expanded={open}
                aria-haspopup="menu"
                {...props}
            >
                {children}
                <svg
                    className={cn(
                        'ml-2 h-4 w-4 transition-transform',
                        open && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        )
    }
)
DropdownTrigger.displayName = 'DropdownTrigger'

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
    ({
        className,
        app,
        side = 'bottom',
        align = 'start',
        sideOffset = 4,
        alignOffset = 0,
        onEscapeKeyDown,
        onInteractOutside,
        children,
        ...props
    }, ref) => {
        const { open, onOpenChange } = useDropdownContext()
        const contentRef = React.useRef<HTMLDivElement>(null)

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
            }

            return () => {
                document.removeEventListener('keydown', handleKeyDown)
            }
        }, [open, onOpenChange, onEscapeKeyDown])

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: Event) => {
                if (
                    contentRef.current &&
                    !contentRef.current.contains(event.target as Node)
                ) {
                    onInteractOutside?.(event)
                    if (!event.defaultPrevented) {
                        onOpenChange(false)
                    }
                }
            }

            if (open) {
                document.addEventListener('mousedown', handleClickOutside)
                document.addEventListener('touchstart', handleClickOutside)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
                document.removeEventListener('touchstart', handleClickOutside)
            }
        }, [open, onOpenChange, onInteractOutside])

        if (!open) return null

        return (
            <div
                ref={contentRef}
                className={cn(
                    dropdownContentVariants({ app: app as any }),
                    'absolute z-50',
                    side === 'bottom' && 'top-full',
                    side === 'top' && 'bottom-full',
                    side === 'right' && 'left-full',
                    side === 'left' && 'right-full',
                    align === 'start' && side === 'bottom' && 'left-0',
                    align === 'center' && side === 'bottom' && 'left-1/2 -translate-x-1/2',
                    align === 'end' && side === 'bottom' && 'right-0',
                    className
                )}
                style={{
                    marginTop: side === 'bottom' ? sideOffset : undefined,
                    marginBottom: side === 'top' ? sideOffset : undefined,
                    marginLeft: side === 'right' ? sideOffset : alignOffset,
                    marginRight: side === 'left' ? sideOffset : undefined
                }}
                data-state={open ? 'open' : 'closed'}
                data-side={side}
                role="menu"
                {...props}
            >
                {children}
            </div>
        )
    }
)
DropdownContent.displayName = 'DropdownContent'

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
    ({ className, variant, disabled, onSelect, asChild, children, ...props }, ref) => {
        const { onOpenChange } = useDropdownContext()

        const handleSelect = (event: React.MouseEvent) => {
            if (disabled) return

            onSelect?.(event as any)
            if (!event.defaultPrevented) {
                onOpenChange(false)
            }
        }

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                    if (disabled) return

                    onSelect?.(e)
                    if (!e.defaultPrevented) {
                        onOpenChange(false)
                    }
                },
                'data-disabled': disabled,
                role: 'menuitem'
            })
        }

        return (
            <div
                ref={ref}
                className={cn(dropdownItemVariants({ variant }), className)}
                data-disabled={disabled}
                role="menuitem"
                onClick={handleSelect}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DropdownItem.displayName = 'DropdownItem'

const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('px-2 py-1.5 text-sm font-semibold', className)}
            {...props}
        />
    )
)
DropdownLabel.displayName = 'DropdownLabel'

const DropdownSeparator = React.forwardRef<HTMLDivElement, DropdownSeparatorProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('-mx-1 my-1 h-px bg-border', className)}
            role="separator"
            {...props}
        />
    )
)
DropdownSeparator.displayName = 'DropdownSeparator'

// ===== ENHANCED DROPDOWN COMPOSITIONS =====
interface DropdownMenuCompositionProps extends DropdownProps {
    trigger: React.ReactNode
    app?: AppName | 'default'
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
}

const DropdownMenuComposition: React.FC<DropdownMenuCompositionProps> = ({
    trigger,
    children,
    app,
    side,
    align,
    ...dropdownProps
}) => (
    <Dropdown {...dropdownProps}>
        {React.isValidElement(trigger) ? (
            <DropdownTrigger asChild app={app}>
                {trigger}
            </DropdownTrigger>
        ) : (
            <DropdownTrigger app={app}>
                {trigger}
            </DropdownTrigger>
        )}
        <DropdownContent app={app} side={side} align={align}>
            {children}
        </DropdownContent>
    </Dropdown>
)

interface UserMenuProps {
    user: {
        name: string
        email: string
        avatar?: string
    }
    app?: AppName | 'default'
    onSignOut: () => void
    onProfile?: () => void
    onSettings?: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({
    user,
    app,
    onSignOut,
    onProfile,
    onSettings
}) => (
    <DropdownMenuComposition
        app={app}
        trigger={
            <button className="flex items-center space-x-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-primary font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <span className="hidden sm:block">{user.name}</span>
            </button>
        }
        align="end"
    >
        <DropdownLabel>
            <div className="font-normal">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
        </DropdownLabel>
        <DropdownSeparator />

        {onProfile && (
            <DropdownItem onSelect={onProfile}>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
            </DropdownItem>
        )}

        {onSettings && (
            <DropdownItem onSelect={onSettings}>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
            </DropdownItem>
        )}

        <DropdownSeparator />

        <DropdownItem variant="destructive" onSelect={onSignOut}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
        </DropdownItem>
    </DropdownMenuComposition>
)

// ===== EXPORTS =====
export {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownLabel,
    DropdownSeparator,
    DropdownMenuComposition
}

export type {
    DropdownMenuCompositionProps,
    UserMenuProps
}
