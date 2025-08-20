import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// Context for Menubar state management
interface MenubarContextType {
    activeMenu: string | null
    onMenuChange: (menu: string | null) => void
    closeMenus: () => void
}

const MenubarContext = createContext<MenubarContextType | null>(null)

const useMenubar = () => {
    const context = useContext(MenubarContext)
    if (!context) {
        throw new Error('Menubar components must be used within a Menubar')
    }
    return context
}

// Menubar variants
const menubarVariants = cva([
    'flex h-10 items-center space-x-1 rounded-md border bg-background p-1'
], {
    variants: {
        app: {
            default: '',
            codai: 'border-codai-primary/20',
            memorai: 'border-memorai-primary/20',
            bancai: 'border-bancai-primary/20',
            romai: 'border-romai-primary/20',
            ajutai: 'border-ajutai-primary/20',
            controlai: 'border-controlai-primary/20',
            studiai: 'border-studiai-primary/20',
            sociai: 'border-sociai-primary/20',
            cumparai: 'border-cumparai-primary/20',
            donai: 'border-donai-primary/20'
        }
    },
    defaultVariants: {
        app: 'default'
    }
})

// MenubarMenu variants
const menubarMenuVariants = cva([
    'relative'
])

// MenubarTrigger variants
const menubarTriggerVariants = cva([
    'flex cursor-default select-none items-center rounded-sm px-3 py-1.5',
    'text-sm outline-none focus:bg-accent focus:text-accent-foreground',
    'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
], {
    variants: {
        app: {
            default: '',
            codai: 'data-[state=open]:bg-codai-primary/10 focus:bg-codai-primary/10',
            memorai: 'data-[state=open]:bg-memorai-primary/10 focus:bg-memorai-primary/10',
            bancai: 'data-[state=open]:bg-bancai-primary/10 focus:bg-bancai-primary/10',
            romai: 'data-[state=open]:bg-romai-primary/10 focus:bg-romai-primary/10',
            ajutai: 'data-[state=open]:bg-ajutai-primary/10 focus:bg-ajutai-primary/10',
            controlai: 'data-[state=open]:bg-controlai-primary/10 focus:bg-controlai-primary/10',
            studiai: 'data-[state=open]:bg-studiai-primary/10 focus:bg-studiai-primary/10',
            sociai: 'data-[state=open]:bg-sociai-primary/10 focus:bg-sociai-primary/10',
            cumparai: 'data-[state=open]:bg-cumparai-primary/10 focus:bg-cumparai-primary/10',
            donai: 'data-[state=open]:bg-donai-primary/10 focus:bg-donai-primary/10'
        }
    },
    defaultVariants: {
        app: 'default'
    }
})

// MenubarContent variants
const menubarContentVariants = cva([
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1',
    'text-popover-foreground shadow-md data-[state=open]:animate-in',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
    'data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95',
    'data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
    'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
    'data-[side=top]:slide-in-from-bottom-2'
], {
    variants: {
        app: {
            default: '',
            codai: 'border-codai-primary/20',
            memorai: 'border-memorai-primary/20',
            bancai: 'border-bancai-primary/20',
            romai: 'border-romai-primary/20',
            ajutai: 'border-ajutai-primary/20',
            controlai: 'border-controlai-primary/20',
            studiai: 'border-studiai-primary/20',
            sociai: 'border-sociai-primary/20',
            cumparai: 'border-cumparai-primary/20',
            donai: 'border-donai-primary/20'
        }
    },
    defaultVariants: {
        app: 'default'
    }
})

// MenubarItem variants
const menubarItemVariants = cva([
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5',
    'text-sm outline-none focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
], {
    variants: {
        inset: {
            true: 'pl-8'
        }
    }
})

// MenubarCheckboxItem variants
const menubarCheckboxItemVariants = cva([
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2',
    'text-sm outline-none focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
])

// MenubarRadioItem variants
const menubarRadioItemVariants = cva([
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2',
    'text-sm outline-none focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
])

// MenubarLabel variants
const menubarLabelVariants = cva([
    'px-2 py-1.5 text-sm font-semibold'
])

// MenubarSeparator variants
const menubarSeparatorVariants = cva([
    '-mx-1 my-1 h-px bg-muted'
])

// MenubarShortcut variants
const menubarShortcutVariants = cva([
    'ml-auto text-xs tracking-widest opacity-60'
])

// MenubarSubTrigger variants
const menubarSubTriggerVariants = cva([
    'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm',
    'outline-none focus:bg-accent data-[state=open]:bg-accent'
], {
    variants: {
        inset: {
            true: 'pl-8'
        }
    }
})

// Type definitions
export interface MenubarProps extends VariantProps<typeof menubarVariants> {
    children: React.ReactNode
    className?: string
    app?: AppName
}

export interface MenubarMenuProps {
    children: React.ReactNode
    value: string
}

export interface MenubarTriggerProps extends VariantProps<typeof menubarTriggerVariants> {
    children: React.ReactNode
    className?: string
    app?: AppName
}

export interface MenubarContentProps extends VariantProps<typeof menubarContentVariants> {
    children: React.ReactNode
    className?: string
    align?: 'start' | 'center' | 'end'
    side?: 'top' | 'right' | 'bottom' | 'left'
    sideOffset?: number
    app?: AppName
}

export interface MenubarItemProps extends VariantProps<typeof menubarItemVariants> {
    children: React.ReactNode
    className?: string
    disabled?: boolean
    onSelect?: () => void
}

export interface MenubarCheckboxItemProps extends VariantProps<typeof menubarCheckboxItemVariants> {
    children: React.ReactNode
    className?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
}

export interface MenubarRadioGroupProps {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
}

export interface MenubarRadioItemProps extends VariantProps<typeof menubarRadioItemVariants> {
    children: React.ReactNode
    className?: string
    value: string
    disabled?: boolean
}

export interface MenubarLabelProps extends VariantProps<typeof menubarLabelVariants> {
    children: React.ReactNode
    className?: string
}

export interface MenubarSeparatorProps extends VariantProps<typeof menubarSeparatorVariants> {
    className?: string
}

export interface MenubarShortcutProps extends VariantProps<typeof menubarShortcutVariants> {
    children: React.ReactNode
    className?: string
}

export interface MenubarSubProps {
    children: React.ReactNode
}

export interface MenubarSubTriggerProps extends VariantProps<typeof menubarSubTriggerVariants> {
    children: React.ReactNode
    className?: string
}

export interface MenubarSubContentProps {
    children: React.ReactNode
    className?: string
}

// Menubar Root Component
export const Menubar: React.FC<MenubarProps> = ({
    children,
    className,
    app,
    ...props
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const menubarRef = useRef<HTMLDivElement>(null)

    const handleMenuChange = (menu: string | null) => {
        setActiveMenu(menu)
    }

    const closeMenus = () => {
        setActiveMenu(null)
    }

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menubarRef.current && !menubarRef.current.contains(event.target as Node)) {
                closeMenus()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenus()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    return (
        <MenubarContext.Provider
            value={{
                activeMenu,
                onMenuChange: handleMenuChange,
                closeMenus
            }}
        >
            <div
                ref={menubarRef}
                className={cn(menubarVariants({ app }), className)}
                {...props}
            >
                {children}
            </div>
        </MenubarContext.Provider>
    )
}

// MenubarMenu Component
export const MenubarMenu: React.FC<MenubarMenuProps> = ({
    children,
    value
}) => {
    const { activeMenu, onMenuChange } = useMenubar()
    const isOpen = activeMenu === value

    return (
        <div className={cn(menubarMenuVariants())} data-value={value}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        ...(child.props as any),
                        'data-state': isOpen ? 'open' : 'closed'
                    })
                }
                return child
            })}
        </div>
    )
}

// MenubarTrigger Component
export const MenubarTrigger: React.FC<MenubarTriggerProps> = ({
    children,
    className,
    app,
    ...props
}) => {
    const { activeMenu, onMenuChange } = useMenubar()
    const triggerRef = useRef<HTMLButtonElement>(null)

    // Find parent MenubarMenu to get the value
    const parentMenu = triggerRef.current?.closest('[data-value]')
    const value = parentMenu?.getAttribute('data-value') || ''
    const isOpen = activeMenu === value

    const handleClick = () => {
        if (isOpen) {
            onMenuChange(null)
        } else {
            onMenuChange(value)
        }
    }

    const handleMouseEnter = () => {
        if (activeMenu && !isOpen) {
            onMenuChange(value)
        }
    }

    return (
        <button
            ref={triggerRef}
            className={cn(menubarTriggerVariants({ app }), className)}
            data-state={isOpen ? 'open' : 'closed'}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            {children}
        </button>
    )
}

// MenubarContent Component
export const MenubarContent: React.FC<MenubarContentProps> = ({
    children,
    className,
    align = 'start',
    side = 'bottom',
    sideOffset = 4,
    app,
    ...props
}) => {
    const { activeMenu, closeMenus } = useMenubar()
    const contentRef = useRef<HTMLDivElement>(null)

    // Find parent MenubarMenu to get the value
    const parentMenu = contentRef.current?.closest('[data-value]')
    const value = parentMenu?.getAttribute('data-value') || ''
    const isOpen = activeMenu === value

    if (!isOpen) return null

    return (
        <div
            ref={contentRef}
            className={cn(menubarContentVariants({ app }), className)}
            data-state={isOpen ? 'open' : 'closed'}
            data-side={side}
            style={{
                position: 'absolute',
                top: side === 'bottom' ? '100%' : undefined,
                bottom: side === 'top' ? '100%' : undefined,
                left: align === 'start' ? 0 : align === 'center' ? '50%' : undefined,
                right: align === 'end' ? 0 : undefined,
                transform: align === 'center' ? 'translateX(-50%)' : undefined,
                marginTop: side === 'bottom' ? sideOffset : 0,
                marginBottom: side === 'top' ? sideOffset : 0,
                zIndex: 50
            }}
            {...props}
        >
            {children}
        </div>
    )
}

// MenubarItem Component
export const MenubarItem: React.FC<MenubarItemProps> = ({
    children,
    className,
    disabled,
    onSelect,
    inset,
    ...props
}) => {
    const { closeMenus } = useMenubar()

    const handleClick = () => {
        if (!disabled) {
            onSelect?.()
            closeMenus()
        }
    }

    return (
        <div
            className={cn(menubarItemVariants({ inset }), className)}
            data-disabled={disabled}
            onClick={handleClick}
            {...props}
        >
            {children}
        </div>
    )
}

// MenubarCheckboxItem Component
export const MenubarCheckboxItem: React.FC<MenubarCheckboxItemProps> = ({
    children,
    className,
    checked,
    onCheckedChange,
    disabled,
    ...props
}) => {
    const handleClick = () => {
        if (!disabled) {
            onCheckedChange?.(!checked)
        }
    }

    return (
        <div
            className={cn(menubarCheckboxItemVariants(), className)}
            data-disabled={disabled}
            onClick={handleClick}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {checked && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    )
}

// MenubarRadioGroup Component
export const MenubarRadioGroup: React.FC<MenubarRadioGroupProps> = ({
    children,
    value,
    onValueChange
}) => {
    return (
        <div role="radiogroup">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    const childProps = child.props as any
                    return React.cloneElement(child as React.ReactElement<any>, {
                        ...(childProps),
                        checked: value === childProps.value,
                        onCheckedChange: () => onValueChange?.(childProps.value)
                    })
                }
                return child
            })}
        </div>
    )
}

// MenubarRadioItem Component
export const MenubarRadioItem: React.FC<MenubarRadioItemProps> = ({
    children,
    className,
    value,
    disabled,
    ...props
}) => {
    return (
        <div
            className={cn(menubarRadioItemVariants(), className)}
            data-disabled={disabled}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Circle className="h-2 w-2 fill-current" />
            </span>
            {children}
        </div>
    )
}

// MenubarLabel Component
export const MenubarLabel: React.FC<MenubarLabelProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div
            className={cn(menubarLabelVariants(), className)}
            {...props}
        >
            {children}
        </div>
    )
}

// MenubarSeparator Component
export const MenubarSeparator: React.FC<MenubarSeparatorProps> = ({
    className,
    ...props
}) => {
    return (
        <div
            className={cn(menubarSeparatorVariants(), className)}
            {...props}
        />
    )
}

// MenubarShortcut Component
export const MenubarShortcut: React.FC<MenubarShortcutProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <span
            className={cn(menubarShortcutVariants(), className)}
            {...props}
        >
            {children}
        </span>
    )
}

// MenubarSub Component (for nested menus)
export const MenubarSub: React.FC<MenubarSubProps> = ({
    children
}) => {
    const [isSubOpen, setIsSubOpen] = useState(false)

    return (
        <div className="relative" data-sub-open={isSubOpen}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        ...(child.props as any),
                        onOpenChange: setIsSubOpen,
                        open: isSubOpen
                    })
                }
                return child
            })}
        </div>
    )
}

// MenubarSubTrigger Component
export const MenubarSubTrigger: React.FC<MenubarSubTriggerProps> = ({
    children,
    className,
    inset,
    ...props
}) => {
    return (
        <div
            className={cn(menubarSubTriggerVariants({ inset }), className)}
            {...props}
        >
            {children}
            <ChevronRight className="ml-auto h-4 w-4" />
        </div>
    )
}

// MenubarSubContent Component
export const MenubarSubContent: React.FC<MenubarSubContentProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1',
                'text-popover-foreground shadow-lg absolute left-full top-0 ml-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

// Preset Menubar Compositions
export const ApplicationMenubar: React.FC<{
    menus: Array<{
        label: string
        value: string
        items: Array<{
            label: string
            shortcut?: string
            onSelect?: () => void
            separator?: boolean
            checked?: boolean
            radioGroup?: string
            disabled?: boolean
        }>
    }>
    app?: AppName
    className?: string
}> = ({ menus, app, className }) => {
    return (
        <Menubar app={app} className={className}>
            {menus.map((menu) => (
                <MenubarMenu key={menu.value} value={menu.value}>
                    <MenubarTrigger app={app}>{menu.label}</MenubarTrigger>
                    <MenubarContent app={app}>
                        {menu.items.map((item, index) => {
                            if (item.separator) {
                                return <MenubarSeparator key={index} />
                            }

                            if (item.checked !== undefined) {
                                return (
                                    <MenubarCheckboxItem
                                        key={index}
                                        checked={item.checked}
                                        disabled={item.disabled}
                                    >
                                        {item.label}
                                        {item.shortcut && (
                                            <MenubarShortcut>{item.shortcut}</MenubarShortcut>
                                        )}
                                    </MenubarCheckboxItem>
                                )
                            }

                            return (
                                <MenubarItem
                                    key={index}
                                    disabled={item.disabled}
                                    onSelect={item.onSelect}
                                >
                                    {item.label}
                                    {item.shortcut && (
                                        <MenubarShortcut>{item.shortcut}</MenubarShortcut>
                                    )}
                                </MenubarItem>
                            )
                        })}
                    </MenubarContent>
                </MenubarMenu>
            ))}
        </Menubar>
    )
}

export const SimpleMenubar: React.FC<{
    items: Array<{
        label: string
        onClick?: () => void
    }>
    app?: AppName
    className?: string
}> = ({ items, app, className }) => {
    return (
        <Menubar app={app} className={className}>
            {items.map((item, index) => (
                <MenubarMenu key={index} value={`item-${index}`}>
                    <MenubarTrigger app={app}>
                        {item.label}
                    </MenubarTrigger>
                    <MenubarContent app={app}>
                        <MenubarItem onSelect={item.onClick}>
                            {item.label}
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            ))}
        </Menubar>
    )
}

// Example usage in comments
/*
// Application Menubar
<ApplicationMenubar
  menus={[
    {
      label: 'File',
      value: 'file',
      items: [
        { label: 'New', shortcut: '⌘N', onSelect: () => console.log('New') },
        { label: 'Open', shortcut: '⌘O', onSelect: () => console.log('Open') },
        { separator: true },
        { label: 'Save', shortcut: '⌘S', onSelect: () => console.log('Save') },
        { label: 'Save As...', shortcut: '⌘⇧S', onSelect: () => console.log('Save As') }
      ]
    },
    {
      label: 'Edit',
      value: 'edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', onSelect: () => console.log('Undo') },
        { label: 'Redo', shortcut: '⌘⇧Z', onSelect: () => console.log('Redo') },
        { separator: true },
        { label: 'Cut', shortcut: '⌘X', onSelect: () => console.log('Cut') },
        { label: 'Copy', shortcut: '⌘C', onSelect: () => console.log('Copy') },
        { label: 'Paste', shortcut: '⌘V', onSelect: () => console.log('Paste') }
      ]
    },
    {
      label: 'View',
      value: 'view',
      items: [
        { label: 'Show Sidebar', checked: true, onSelect: () => console.log('Toggle Sidebar') },
        { label: 'Show Toolbar', checked: false, onSelect: () => console.log('Toggle Toolbar') }
      ]
    }
  ]}
  app="codai"
/>

// Simple Menubar
<SimpleMenubar
  items={[
    { label: 'Home', onClick: () => console.log('Home') },
    { label: 'About', onClick: () => console.log('About') },
    { label: 'Contact', onClick: () => console.log('Contact') }
  ]}
  app="memorai"
/>

// Basic Menubar
<Menubar>
  <MenubarMenu value="file">
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem onSelect={() => console.log('New')}>
        New <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarItem onSelect={() => console.log('Open')}>
        Open <MenubarShortcut>⌘O</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarSub>
        <MenubarSubTrigger>Recent Files</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>file1.txt</MenubarItem>
          <MenubarItem>file2.txt</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
*/
