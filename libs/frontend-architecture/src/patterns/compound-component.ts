// Compound Component Pattern Implementation
// A pattern that allows creating components with multiple parts that work together

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { cn } from '@codai/ui-components/utils/className'

// Context for compound component communication
interface CompoundComponentContextValue<T = any> {
  value: T
  setValue: (value: T) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggle: () => void
  activeIndex: number
  setActiveIndex: (index: number) => void
  registerItem: (id: string) => void
  unregisterItem: (id: string) => void
  items: Set<string>
}

// Generic compound component context
export const createCompoundContext = <T = any>(
  defaultValue?: Partial<CompoundComponentContextValue<T>>
) => {
  const Context = createContext<CompoundComponentContextValue<T> | null>(null)

  const useCompoundContext = () => {
    const context = useContext(Context)
    if (!context) {
      throw new Error('Compound component must be used within its Provider')
    }
    return context
  }

  const Provider: React.FC<{
    children: ReactNode
    initialValue?: T
    initialOpen?: boolean
    onValueChange?: (value: T) => void
    onOpenChange?: (isOpen: boolean) => void
  }> = ({
    children,
    initialValue,
    initialOpen = false,
    onValueChange,
    onOpenChange,
  }) => {
      const [value, setValue] = useState<T>(initialValue as T)
      const [isOpen, setIsOpen] = useState(initialOpen)
      const [activeIndex, setActiveIndex] = useState(-1)
      const [items] = useState(() => new Set<string>())

      const handleSetValue = useCallback((newValue: T) => {
        setValue(newValue)
        onValueChange?.(newValue)
      }, [onValueChange])

      const handleSetIsOpen = useCallback((newIsOpen: boolean) => {
        setIsOpen(newIsOpen)
        onOpenChange?.(newIsOpen)
      }, [onOpenChange])

      const toggle = useCallback(() => {
        handleSetIsOpen(!isOpen)
      }, [isOpen, handleSetIsOpen])

      const registerItem = useCallback((id: string) => {
        items.add(id)
      }, [items])

      const unregisterItem = useCallback((id: string) => {
        items.delete(id)
      }, [items])

      const contextValue = useMemo(
        () => ({
          value,
          setValue: handleSetValue,
          isOpen,
          setIsOpen: handleSetIsOpen,
          toggle,
          activeIndex,
          setActiveIndex,
          registerItem,
          unregisterItem,
          items,
          ...defaultValue,
        }),
        [
          value,
          handleSetValue,
          isOpen,
          handleSetIsOpen,
          toggle,
          activeIndex,
          registerItem,
          unregisterItem,
          items,
          defaultValue,
        ]
      )

      return <Context.Provider value={ contextValue }> { children } </Context.Provider>
    }

  return { Provider, useCompoundContext, Context }
}

// Example: Advanced Dropdown Compound Component
const dropdownAnimations: Variants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
}

interface DropdownContextValue {
  selectedValue: string | null
  selectedLabel: string | null
  placeholder: string
}

const { Provider: DropdownProvider, useCompoundContext: useDropdown } =
  createCompoundContext<DropdownContextValue>({
    value: { selectedValue: null, selectedLabel: null, placeholder: 'Select...' },
  })

// Root component
interface DropdownProps extends ComponentPropsWithoutRef<'div'> {
  onValueChange?: (value: string) => void
  onOpenChange?: (isOpen: boolean) => void
  placeholder?: string
  defaultValue?: string
}

const DropdownRoot: React.FC<DropdownProps> = ({
  children,
  onValueChange,
  onOpenChange,
  placeholder = 'Select...',
  defaultValue,
  className,
  ...props
}) => {
  const initialValue = useMemo(() => ({
    selectedValue: defaultValue || null,
    selectedLabel: null,
    placeholder,
  }), [defaultValue, placeholder])

  return (
    <div className= { cn('relative inline-block', className) } {...props }>
      <DropdownProvider
        initialValue={ initialValue }
  onValueChange = {(newValue) => {
  if (newValue.selectedValue) {
    onValueChange?.(newValue.selectedValue)
  }
}}
onOpenChange = { onOpenChange }
  >
  { children }
  </DropdownProvider>
  </div>
  )
}

// Trigger component
interface DropdownTriggerProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean
}

const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    const { isOpen, toggle, value } = useDropdown()

    const displayText = value.selectedLabel || value.placeholder

    return (
      <button
        ref= { ref }
    type = "button"
    className = {
      cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:bg-accent hover:text-accent-foreground',
          'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        className
      )
    }
    data - state={ isOpen ? 'open' : 'closed' }
    onClick = { toggle }
    {...props}
      >
  <span className="truncate" > { displayText } </span>
    < motion.div
animate = {{ rotate: isOpen ? 180 : 0 }}
transition = {{ duration: 0.2 }}
className = "h-4 w-4 opacity-50"
  >
  <svg
            width="15"
height = "15"
viewBox = "0 0 15 15"
fill = "none"
xmlns = "http://www.w3.org/2000/svg"
  >
  <path
              d="m4.5 6 3 3 3-3"
stroke = "currentColor"
strokeWidth = "1"
strokeLinecap = "round"
strokeLinejoin = "round"
  />
  </svg>
  </motion.div>
  </button>
    )
  }
)
DropdownTrigger.displayName = 'DropdownTrigger'

// Content component
interface DropdownContentProps extends ComponentPropsWithoutRef<'div'> {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ children, className, align = 'start', sideOffset = 4, ...props }, ref) => {
    const { isOpen, setIsOpen } = useDropdown()

    React.useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (ref && 'current' in ref && ref.current && !ref.current.contains(target)) {
          setIsOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, setIsOpen, ref])

    return (
      <AnimatePresence>
      { isOpen && (
        <motion.div
            ref= { ref }
    variants = { dropdownAnimations }
    initial = "closed"
    animate = "open"
    exit = "closed"
    className = {
      cn(
              'absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        align === 'start' && 'left-0',
      align === 'center' && 'left-1/2 -translate-x-1/2',
      align === 'end' && 'right-0',
      className
            )}
style = {{ marginTop: sideOffset }}
{...props }
          >
  { children }
  </motion.div>
        )}
</AnimatePresence>
    )
  }
)
DropdownContent.displayName = 'DropdownContent'

// Item component
interface DropdownItemProps extends ComponentPropsWithoutRef<'div'> {
  value: string
  disabled?: boolean
  onSelect?: (value: string) => void
}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ children, className, value, disabled, onSelect, ...props }, ref) => {
    const { setValue, setIsOpen, value: contextValue } = useDropdown()

    const handleSelect = useCallback(() => {
      if (disabled) return

      const newValue = {
        ...contextValue,
        selectedValue: value,
        selectedLabel: typeof children === 'string' ? children : value,
      }

      setValue(newValue)
      setIsOpen(false)
      onSelect?.(value)
    }, [disabled, value, children, contextValue, setValue, setIsOpen, onSelect])

    const isSelected = contextValue.selectedValue === value

    return (
      <div
        ref= { ref }
    role = "option"
    aria - selected={ isSelected }
    data - disabled={ disabled ? '' : undefined }
    className = {
      cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        isSelected && 'bg-accent text-accent-foreground',
      className
        )}
onClick = { handleSelect }
{...props }
      >
  { isSelected && (
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" >
      <svg
              width="15"
height = "15"
viewBox = "0 0 15 15"
fill = "none"
xmlns = "http://www.w3.org/2000/svg"
  >
  <path
                d="m11.5 3.5-6 6-3-3"
stroke = "currentColor"
strokeWidth = "2"
strokeLinecap = "round"
strokeLinejoin = "round"
  />
  </svg>
  </span>
        )}
<span className={ cn('pl-6', { 'pl-0': !isSelected }) }> { children } </span>
  </div>
    )
  }
)
DropdownItem.displayName = 'DropdownItem'

// Separator component
const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref= { ref }
    className = { cn('-mx-1 my-1 h-px bg-muted', className) }
    { ...props }
  />
))
  DropdownSeparator.displayName = 'DropdownSeparator'

// Label component
const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref= { ref }
    className = { cn('px-2 py-1.5 text-sm font-semibold', className) }
    { ...props }
  />
))
  DropdownLabel.displayName = 'DropdownLabel'

// Compound component export
export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
  Label: DropdownLabel,
}

// Hook for external control
export const useDropdownContext = () => {
  try {
    return useDropdown()
  } catch {
    return null
  }
}

// Pattern utilities
export interface CompoundComponentConfig {
  name: string
  description: string
  parts: string[]
  context?: string
  examples: Array<{
    name: string
    description: string
    code: string
  }>
}

export const createCompoundComponent = <T extends Record<string, any>>(
  config: CompoundComponentConfig & {
    context: React.Context<T>
    provider: React.ComponentType<{ children: ReactNode; value?: Partial<T> }>
    parts: Record<string, React.ComponentType<any>>
  }
) => {
  const useContext = () => {
    const context = React.useContext(config.context)
    if (!context) {
      throw new Error(`${config.name} compound component must be used within its Provider`)
    }
    return context
  }

  return {
    ...config.parts,
    Provider: config.provider,
    useContext,
    config,
  }
}

// Pattern documentation
export const COMPOUND_COMPONENT_PATTERN = {
  name: 'Compound Component Pattern',
  description: 'A pattern that allows creating components with multiple parts that work together seamlessly through shared context',
  benefits: [
    'Flexible component composition',
    'Clear separation of concerns',
    'Reusable component parts',
    'Type-safe communication between parts',
    'Better developer experience',
  ],
  useCases: [
    'Dropdown menus',
    'Accordion components',
    'Tab systems',
    'Modal dialogs',
    'Form components',
    'Navigation menus',
  ],
  examples: [
    {
      name: 'Basic Dropdown',
      code: `
<Dropdown.Root onValueChange={(value) => console.log(value)}>
  <Dropdown.Trigger>
    Select an option
  </Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item value="option1">Option 1</Dropdown.Item>
    <Dropdown.Item value="option2">Option 2</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item value="option3">Option 3</Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
      `,
    },
    {
      name: 'Advanced Dropdown with Labels',
      code: `
<Dropdown.Root placeholder="Choose a tool">
  <Dropdown.Trigger className="w-48" />
  <Dropdown.Content>
    <Dropdown.Label>Development</Dropdown.Label>
    <Dropdown.Item value="vscode">VS Code</Dropdown.Item>
    <Dropdown.Item value="webstorm">WebStorm</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Label>Design</Dropdown.Label>
    <Dropdown.Item value="figma">Figma</Dropdown.Item>
    <Dropdown.Item value="sketch">Sketch</Dropdown.Item>
  </Dropdown.Content>
</Dropdown.Root>
      `,
    },
  ],
  bestPractices: [
    'Use TypeScript for type safety',
    'Implement proper accessibility attributes',
    'Handle keyboard navigation',
    'Provide clear error messages',
    'Use consistent naming conventions',
    'Document component APIs thoroughly',
  ],
  antiPatterns: [
    'Overcomplicating simple components',
    'Creating too many context levels',
    'Ignoring accessibility requirements',
    'Poor error handling',
    'Inconsistent component interfaces',
  ],
} as const

export type CompoundComponentPattern = typeof COMPOUND_COMPONENT_PATTERN
