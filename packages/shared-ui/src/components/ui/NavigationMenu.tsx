import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// Context for NavigationMenu state management
interface NavigationMenuContextType {
    activeValue: string | null
    onValueChange: (value: string | null) => void
    orientation: 'horizontal' | 'vertical'
    delayDuration: number
}

const NavigationMenuContext = createContext<NavigationMenuContextType | null>(null)

const useNavigationMenu = () => {
    const context = useContext(NavigationMenuContext)
    if (!context) {
        throw new Error('NavigationMenu components must be used within a NavigationMenu')
    }
    return context
}

// NavigationMenu variants
const navigationMenuVariants = cva([
    'relative z-10 flex max-w-max flex-1 items-center justify-center'
], {
    variants: {
        orientation: {
            horizontal: 'flex-row',
            vertical: 'flex-col items-start'
        }
    },
    defaultVariants: {
        orientation: 'horizontal'
    }
})

// NavigationMenuList variants
const navigationMenuListVariants = cva([
    'group flex flex-1 list-none items-center justify-center space-x-1'
], {
    variants: {
        orientation: {
            horizontal: 'flex-row space-x-1 space-y-0',
            vertical: 'flex-col space-x-0 space-y-1'
        }
    },
    defaultVariants: {
        orientation: 'horizontal'
    }
})

// NavigationMenuItem variants
const navigationMenuItemVariants = cva([
    'relative'
])

// NavigationMenuTrigger variants
const navigationMenuTriggerVariants = cva([
    'group inline-flex h-10 w-max items-center justify-center rounded-md',
    'bg-background px-4 py-2 text-sm font-medium transition-colors',
    'hover:bg-accent hover:text-accent-foreground focus:bg-accent',
    'focus:text-accent-foreground focus:outline-none disabled:pointer-events-none',
    'disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'
], {
    variants: {
        app: {
            default: '',
            codai: 'data-[active]:bg-codai-primary/10 data-[state=open]:bg-codai-primary/10',
            memorai: 'data-[active]:bg-memorai-primary/10 data-[state=open]:bg-memorai-primary/10',
            bancai: 'data-[active]:bg-bancai-primary/10 data-[state=open]:bg-bancai-primary/10',
            romai: 'data-[active]:bg-romai-primary/10 data-[state=open]:bg-romai-primary/10',
            ajutai: 'data-[active]:bg-ajutai-primary/10 data-[state=open]:bg-ajutai-primary/10',
            controlai: 'data-[active]:bg-controlai-primary/10 data-[state=open]:bg-controlai-primary/10',
            studiai: 'data-[active]:bg-studiai-primary/10 data-[state=open]:bg-studiai-primary/10',
            sociai: 'data-[active]:bg-sociai-primary/10 data-[state=open]:bg-sociai-primary/10',
            cumparai: 'data-[active]:bg-cumparai-primary/10 data-[state=open]:bg-cumparai-primary/10',
            donai: 'data-[active]:bg-donai-primary/10 data-[state=open]:bg-donai-primary/10'
        }
    },
    defaultVariants: {
        app: 'default'
    }
})

// NavigationMenuContent variants
const navigationMenuContentVariants = cva([
    'absolute left-0 top-0 w-full data-[motion^=from-]:animate-in',
    'data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in',
    'data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52',
    'data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52',
    'data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto'
])

// NavigationMenuLink variants
const navigationMenuLinkVariants = cva([
    'block select-none space-y-1 rounded-md p-3 leading-none no-underline',
    'outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
    'focus:bg-accent focus:text-accent-foreground'
])

// NavigationMenuIndicator variants
const navigationMenuIndicatorVariants = cva([
    'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
    'data-[state=visible]:animate-in data-[state=hidden]:animate-out',
    'data-[state=hidden]:fade-out data-[state=visible]:fade-in'
])

// NavigationMenuViewport variants
const navigationMenuViewportVariants = cva([
    'absolute left-0 top-full flex justify-center'
], {
    variants: {
        orientation: {
            horizontal: 'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
            vertical: 'origin-left-center relative ml-1.5 w-[var(--radix-navigation-menu-viewport-width)] h-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90'
        }
    },
    defaultVariants: {
        orientation: 'horizontal'
    }
})

// Type definitions
export interface NavigationMenuProps extends VariantProps<typeof navigationMenuVariants> {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string | null) => void
    delayDuration?: number
    skipDelayDuration?: number
    className?: string
    orientation?: 'horizontal' | 'vertical'
}

export interface NavigationMenuListProps extends VariantProps<typeof navigationMenuListVariants> {
    children: React.ReactNode
    className?: string
}

export interface NavigationMenuItemProps {
    children: React.ReactNode
    value: string
    className?: string
}

export interface NavigationMenuTriggerProps extends VariantProps<typeof navigationMenuTriggerVariants> {
    children: React.ReactNode
    className?: string
    app?: AppName
}

export interface NavigationMenuContentProps {
    children: React.ReactNode
    className?: string
}

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode
    className?: string
    asChild?: boolean
    active?: boolean
}

export interface NavigationMenuIndicatorProps {
    className?: string
}

export interface NavigationMenuViewportProps extends VariantProps<typeof navigationMenuViewportVariants> {
    className?: string
}

// NavigationMenu Root Component
export const NavigationMenu: React.FC<NavigationMenuProps> = ({
    children,
    value,
    onValueChange,
    delayDuration = 200,
    skipDelayDuration = 300,
    className,
    orientation = 'horizontal',
    ...props
}) => {
    const [activeValue, setActiveValue] = useState<string | null>(value || null)
    const [isDelaying, setIsDelaying] = useState(false)
    const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleValueChange = (newValue: string | null) => {
        if (value === undefined) {
            setActiveValue(newValue)
        }
        onValueChange?.(newValue)
    }

    const delayedValueChange = (newValue: string | null) => {
        if (delayTimeoutRef.current) {
            clearTimeout(delayTimeoutRef.current)
        }

        if (newValue === null) {
            handleValueChange(newValue)
            return
        }

        if (isDelaying) {
            handleValueChange(newValue)
            return
        }

        delayTimeoutRef.current = setTimeout(() => {
            handleValueChange(newValue)
            setIsDelaying(true)

            setTimeout(() => {
                setIsDelaying(false)
            }, skipDelayDuration)
        }, delayDuration)
    }

    useEffect(() => {
        return () => {
            if (delayTimeoutRef.current) {
                clearTimeout(delayTimeoutRef.current)
            }
        }
    }, [])

    const currentValue = value !== undefined ? value : activeValue

    return (
        <NavigationMenuContext.Provider
            value={{
                activeValue: currentValue,
                onValueChange: delayedValueChange,
                orientation,
                delayDuration
            }}
        >
            <nav
                className={cn(navigationMenuVariants({ orientation }), className)}
                {...props}
            >
                {children}
            </nav>
        </NavigationMenuContext.Provider>
    )
}

// NavigationMenuList Component
export const NavigationMenuList: React.FC<NavigationMenuListProps> = ({
    children,
    className,
    orientation,
    ...props
}) => {
    const { orientation: contextOrientation } = useNavigationMenu()
    const finalOrientation = orientation || contextOrientation

    return (
        <ul
            className={cn(navigationMenuListVariants({ orientation: finalOrientation }), className)}
            {...props}
        >
            {children}
        </ul>
    )
}

// NavigationMenuItem Component
export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
    children,
    value,
    className,
    ...props
}) => {
    const { activeValue, onValueChange } = useNavigationMenu()
    const isActive = activeValue === value

    return (
        <li
            className={cn(navigationMenuItemVariants(), className)}
            data-value={value}
            data-active={isActive}
            {...props}
        >
            {children}
        </li>
    )
}

// NavigationMenuTrigger Component
export const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({
    children,
    className,
    app,
    ...props
}) => {
    const { activeValue, onValueChange, orientation } = useNavigationMenu()
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    // Find parent NavigationMenuItem to get the value
    const parentItem = triggerRef.current?.closest('[data-value]')
    const value = parentItem?.getAttribute('data-value') || ''
    const isActive = activeValue === value

    const handleMouseEnter = () => {
        onValueChange(value)
        setIsOpen(true)
    }

    const handleMouseLeave = () => {
        onValueChange(null)
        setIsOpen(false)
    }

    const handleClick = () => {
        if (isActive) {
            onValueChange(null)
            setIsOpen(false)
        } else {
            onValueChange(value)
            setIsOpen(true)
        }
    }

    return (
        <button
            ref={triggerRef}
            className={cn(navigationMenuTriggerVariants({ app }), className)}
            data-state={isActive ? 'open' : 'closed'}
            data-active={isActive}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            {...props}
        >
            {children}
            {orientation === 'horizontal' ? (
                <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
            ) : (
                <ChevronRight className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-90" />
            )}
        </button>
    )
}

// NavigationMenuContent Component
export const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({
    children,
    className,
    ...props
}) => {
    const { activeValue } = useNavigationMenu()
    const contentRef = useRef<HTMLDivElement>(null)

    // Find parent NavigationMenuItem to get the value
    const parentItem = contentRef.current?.closest('[data-value]')
    const value = parentItem?.getAttribute('data-value') || ''
    const isVisible = activeValue === value

    if (!isVisible) return null

    return (
        <div
            ref={contentRef}
            className={cn(navigationMenuContentVariants(), className)}
            data-state={isVisible ? 'open' : 'closed'}
            {...props}
        >
            {children}
        </div>
    )
}

// NavigationMenuLink Component
export const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({
    children,
    className,
    asChild,
    active,
    ...props
}) => {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ...(children.props as any),
            className: cn(navigationMenuLinkVariants(), active && 'bg-accent text-accent-foreground', className)
        })
    }

    return (
        <a
            className={cn(navigationMenuLinkVariants(), active && 'bg-accent text-accent-foreground', className)}
            {...props}
        >
            {children}
        </a>
    )
}

// NavigationMenuIndicator Component
export const NavigationMenuIndicator: React.FC<NavigationMenuIndicatorProps> = ({
    className,
    ...props
}) => {
    const { activeValue } = useNavigationMenu()

    return (
        <div
            className={cn(navigationMenuIndicatorVariants(), className)}
            data-state={activeValue ? 'visible' : 'hidden'}
            {...props}
        >
            <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
        </div>
    )
}

// NavigationMenuViewport Component
export const NavigationMenuViewport: React.FC<NavigationMenuViewportProps> = ({
    className,
    orientation,
    ...props
}) => {
    const { activeValue, orientation: contextOrientation } = useNavigationMenu()
    const finalOrientation = orientation || contextOrientation

    return (
        <div className="perspective-[2000px] absolute left-0 top-full flex justify-center">
            <div
                className={cn(navigationMenuViewportVariants({ orientation: finalOrientation }), className)}
                data-state={activeValue ? 'open' : 'closed'}
                {...props}
            />
        </div>
    )
}

// Preset NavigationMenu Compositions
export const HorizontalNavigationMenu: React.FC<{
    items: Array<{
        trigger: React.ReactNode
        content?: React.ReactNode
        value: string
    }>
    app?: AppName
    className?: string
}> = ({ items, app, className }) => {
    return (
        <NavigationMenu orientation="horizontal" className={className}>
            <NavigationMenuList>
                {items.map((item) => (
                    <NavigationMenuItem key={item.value} value={item.value}>
                        <NavigationMenuTrigger app={app}>
                            {item.trigger}
                        </NavigationMenuTrigger>
                        {item.content && (
                            <NavigationMenuContent>
                                <div className="p-6 min-w-[400px]">
                                    {item.content}
                                </div>
                            </NavigationMenuContent>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
            <NavigationMenuViewport />
        </NavigationMenu>
    )
}

export const VerticalNavigationMenu: React.FC<{
    items: Array<{
        trigger: React.ReactNode
        content?: React.ReactNode
        value: string
    }>
    app?: AppName
    className?: string
}> = ({ items, app, className }) => {
    return (
        <NavigationMenu orientation="vertical" className={className}>
            <NavigationMenuList>
                {items.map((item) => (
                    <NavigationMenuItem key={item.value} value={item.value}>
                        <NavigationMenuTrigger app={app}>
                            {item.trigger}
                        </NavigationMenuTrigger>
                        {item.content && (
                            <NavigationMenuContent>
                                <div className="p-4 min-w-[300px]">
                                    {item.content}
                                </div>
                            </NavigationMenuContent>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
            <NavigationMenuViewport />
        </NavigationMenu>
    )
}

export const MegaMenu: React.FC<{
    items: Array<{
        trigger: React.ReactNode
        content?: React.ReactNode
        value: string
        columns?: number
    }>
    app?: AppName
    className?: string
}> = ({ items, app, className }) => {
    return (
        <NavigationMenu orientation="horizontal" className={className}>
            <NavigationMenuList>
                {items.map((item) => (
                    <NavigationMenuItem key={item.value} value={item.value}>
                        <NavigationMenuTrigger app={app}>
                            {item.trigger}
                        </NavigationMenuTrigger>
                        {item.content && (
                            <NavigationMenuContent>
                                <div
                                    className={cn(
                                        'p-6 min-w-[600px]',
                                        item.columns && `grid grid-cols-${item.columns} gap-6`
                                    )}
                                >
                                    {item.content}
                                </div>
                            </NavigationMenuContent>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
            <NavigationMenuViewport />
        </NavigationMenu>
    )
}

// Example usage in comments
/*
// Basic NavigationMenu
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="p-6 w-[400px]">
          <div className="grid gap-3">
            <NavigationMenuLink href="/product1">Product 1</NavigationMenuLink>
            <NavigationMenuLink href="/product2">Product 2</NavigationMenuLink>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem value="services">
      <NavigationMenuTrigger>Services</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="p-6 w-[500px]">
          Services content
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
  <NavigationMenuViewport />
</NavigationMenu>

// Horizontal NavigationMenu
<HorizontalNavigationMenu
  items={[
    {
      value: 'products',
      trigger: 'Products',
      content: <div>Products content</div>
    },
    {
      value: 'services',
      trigger: 'Services',
      content: <div>Services content</div>
    }
  ]}
  app="codai"
/>

// Mega Menu
<MegaMenu
  items={[
    {
      value: 'solutions',
      trigger: 'Solutions',
      columns: 3,
      content: (
        <>
          <div>Column 1</div>
          <div>Column 2</div>
          <div>Column 3</div>
        </>
      )
    }
  ]}
  app="memorai"
/>
*/
