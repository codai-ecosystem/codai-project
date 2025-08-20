import React, { useState, useEffect, useRef, useMemo } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { AppName } from '../../config/design-tokens'

// Combobox variants
const comboboxVariants = cva([
    'relative flex h-10 w-full cursor-default rounded-md border border-input',
    'bg-background px-3 py-2 text-sm ring-offset-background',
    'placeholder:text-muted-foreground focus:outline-none focus:ring-2',
    'focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
], {
    variants: {
        variant: {
            default: 'border-input',
            outline: 'border-2',
            ghost: 'border-transparent bg-transparent',
            filled: 'bg-muted border-transparent'
        },
        size: {
            sm: 'h-8 px-2 text-xs',
            default: 'h-10 px-3 text-sm',
            lg: 'h-12 px-4 text-base'
        },
        app: {
            default: '',
            codai: 'focus:ring-codai-primary/20 focus:border-codai-primary',
            memorai: 'focus:ring-memorai-primary/20 focus:border-memorai-primary',
            bancai: 'focus:ring-bancai-primary/20 focus:border-bancai-primary',
            romai: 'focus:ring-romai-primary/20 focus:border-romai-primary',
            ajutai: 'focus:ring-ajutai-primary/20 focus:border-ajutai-primary',
            controlai: 'focus:ring-controlai-primary/20 focus:border-controlai-primary',
            studiai: 'focus:ring-studiai-primary/20 focus:border-studiai-primary',
            sociai: 'focus:ring-sociai-primary/20 focus:border-sociai-primary',
            cumparai: 'focus:ring-cumparai-primary/20 focus:border-cumparai-primary',
            donai: 'focus:ring-donai-primary/20 focus:border-donai-primary'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
        app: 'default'
    }
})

// Combobox dropdown variants
const comboboxDropdownVariants = cva([
    'absolute z-50 max-h-60 w-full overflow-auto rounded-md border bg-popover',
    'p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95'
], {
    variants: {
        position: {
            bottom: 'top-full mt-1',
            top: 'bottom-full mb-1'
        }
    },
    defaultVariants: {
        position: 'bottom'
    }
})

// Combobox item variants
const comboboxItemVariants = cva([
    'relative flex w-full cursor-default select-none items-center rounded-sm',
    'py-1.5 pl-8 pr-2 text-sm outline-none',
    'aria-selected:bg-accent aria-selected:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
])

// Combobox input variants
const comboboxInputVariants = cva([
    'flex-1 bg-transparent outline-none placeholder:text-muted-foreground'
])

// Types
export interface ComboboxOption {
    value: string
    label: string
    disabled?: boolean
    group?: string
}

export interface ComboboxProps extends VariantProps<typeof comboboxVariants> {
    options: ComboboxOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    multiple?: boolean
    clearable?: boolean
    searchable?: boolean
    groupBy?: boolean
    className?: string
    app?: AppName
    onInputChange?: (value: string) => void
    filterFunction?: (option: ComboboxOption, search: string) => boolean
    renderOption?: (option: ComboboxOption) => React.ReactNode
    renderValue?: (option: ComboboxOption) => React.ReactNode
}

export interface MultiComboboxProps extends Omit<ComboboxProps, 'value' | 'onValueChange' | 'multiple'> {
    value?: string[]
    onValueChange?: (value: string[]) => void
    multiple: true
    maxSelections?: number
    showCount?: boolean
}

// Default filter function
const defaultFilter = (option: ComboboxOption, search: string): boolean => {
    return option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.value.toLowerCase().includes(search.toLowerCase())
}

// Combobox Hook
const useCombobox = (options: ComboboxOption[], filterFunction = defaultFilter) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredOptions = useMemo(() => {
        if (!search) return options
        return options.filter(option => filterFunction(option, search))
    }, [options, search, filterFunction])

    const groupedOptions = useMemo(() => {
        const groups: { [key: string]: ComboboxOption[] } = {}
        filteredOptions.forEach(option => {
            const group = option.group || 'default'
            if (!groups[group]) groups[group] = []
            groups[group].push(option)
        })
        return groups
    }, [filteredOptions])

    return {
        open,
        setOpen,
        search,
        setSearch,
        filteredOptions,
        groupedOptions
    }
}

// Single Combobox Component
export const Combobox: React.FC<ComboboxProps> = ({
    options,
    value,
    onValueChange,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No options found.',
    disabled = false,
    clearable = false,
    searchable = true,
    groupBy = false,
    className,
    variant,
    size,
    app,
    onInputChange,
    filterFunction = defaultFilter,
    renderOption,
    renderValue,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')

    const {
        open,
        setOpen,
        search,
        setSearch,
        filteredOptions,
        groupedOptions
    } = useCombobox(options, filterFunction)

    const selectedOption = options.find(option => option.value === value)

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setSearch(newValue)
        onInputChange?.(newValue)
    }

    // Handle option selection
    const handleOptionSelect = (optionValue: string) => {
        onValueChange?.(optionValue)
        setOpen(false)
        setSearch('')
    }

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onValueChange?.('')
        setSearch('')
    }

    // Handle key navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false)
            setSearch('')
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (filteredOptions.length === 1) {
                handleOptionSelect(filteredOptions[0].value)
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
                setSearch('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Calculate dropdown position
    useEffect(() => {
        if (open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            if (spaceBelow < 250 && spaceAbove > spaceBelow) {
                setDropdownPosition('top')
            } else {
                setDropdownPosition('bottom')
            }
        }
    }, [open])

    // Render options by group
    const renderGroupedOptions = () => {
        if (!groupBy) {
            return filteredOptions.map((option) => (
                <div
                    key={option.value}
                    className={cn(comboboxItemVariants())}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    data-disabled={option.disabled}
                    aria-selected={value === option.value}
                >
                    <Check className={cn(
                        'absolute left-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                    )} />
                    {renderOption ? renderOption(option) : option.label}
                </div>
            ))
        }

        return Object.entries(groupedOptions).map(([group, groupOptions]) => (
            <div key={group}>
                {group !== 'default' && (
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {group}
                    </div>
                )}
                {groupOptions.map((option) => (
                    <div
                        key={option.value}
                        className={cn(comboboxItemVariants())}
                        onClick={() => !option.disabled && handleOptionSelect(option.value)}
                        data-disabled={option.disabled}
                        aria-selected={value === option.value}
                    >
                        <Check className={cn(
                            'absolute left-2 h-4 w-4',
                            value === option.value ? 'opacity-100' : 'opacity-0'
                        )} />
                        {renderOption ? renderOption(option) : option.label}
                    </div>
                ))}
            </div>
        ))
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                className={cn(comboboxVariants({ variant, size, app }), className)}
                onClick={() => !disabled && setOpen(!open)}
                {...props}
            >
                {!open && selectedOption ? (
                    <div className="flex-1 flex items-center">
                        {renderValue ? renderValue(selectedOption) : selectedOption.label}
                    </div>
                ) : (
                    <input
                        ref={inputRef}
                        className={cn(comboboxInputVariants())}
                        placeholder={open ? searchPlaceholder : placeholder}
                        value={search}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || !searchable}
                        readOnly={!searchable}
                    />
                )}

                <div className="flex items-center gap-1">
                    {clearable && selectedOption && (
                        <X
                            className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        open ? 'rotate-180' : 'rotate-0'
                    )} />
                </div>
            </div>

            {open && (
                <div className={cn(comboboxDropdownVariants({ position: dropdownPosition }))}>
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        renderGroupedOptions()
                    )}
                </div>
            )}
        </div>
    )
}

// Multi Combobox Component
export const MultiCombobox: React.FC<MultiComboboxProps> = ({
    options,
    value = [],
    onValueChange,
    placeholder = 'Select options...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No options found.',
    disabled = false,
    clearable = true,
    searchable = true,
    groupBy = false,
    maxSelections,
    showCount = false,
    className,
    variant,
    size,
    app,
    onInputChange,
    filterFunction = defaultFilter,
    renderOption,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')

    const {
        open,
        setOpen,
        search,
        setSearch,
        filteredOptions,
        groupedOptions
    } = useCombobox(options, filterFunction)

    const selectedOptions = options.filter(option => value.includes(option.value))

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setSearch(newValue)
        onInputChange?.(newValue)
    }

    // Handle option selection
    const handleOptionSelect = (optionValue: string) => {
        if (value.includes(optionValue)) {
            // Remove from selection
            onValueChange?.(value.filter(v => v !== optionValue))
        } else {
            // Add to selection
            if (!maxSelections || value.length < maxSelections) {
                onValueChange?.([...value, optionValue])
            }
        }
    }

    // Handle clear all
    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation()
        onValueChange?.([])
        setSearch('')
    }

    // Handle remove single selection
    const handleRemoveSelection = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onValueChange?.(value.filter(v => v !== optionValue))
    }

    // Handle key navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false)
            setSearch('')
        } else if (e.key === 'Backspace' && search === '' && value.length > 0) {
            // Remove last selection on backspace
            onValueChange?.(value.slice(0, -1))
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
                setSearch('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Calculate dropdown position
    useEffect(() => {
        if (open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            if (spaceBelow < 250 && spaceAbove > spaceBelow) {
                setDropdownPosition('top')
            } else {
                setDropdownPosition('bottom')
            }
        }
    }, [open])

    // Render options by group
    const renderGroupedOptions = () => {
        if (!groupBy) {
            return filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)
                const isDisabled = option.disabled ||
                    (maxSelections && !isSelected && value.length >= maxSelections)

                return (
                    <div
                        key={option.value}
                        className={cn(comboboxItemVariants())}
                        onClick={() => !isDisabled && handleOptionSelect(option.value)}
                        data-disabled={isDisabled}
                        aria-selected={isSelected}
                    >
                        <Check className={cn(
                            'absolute left-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                        )} />
                        {renderOption ? renderOption(option) : option.label}
                    </div>
                )
            })
        }

        return Object.entries(groupedOptions).map(([group, groupOptions]) => (
            <div key={group}>
                {group !== 'default' && (
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {group}
                    </div>
                )}
                {groupOptions.map((option) => {
                    const isSelected = value.includes(option.value)
                    const isDisabled = option.disabled ||
                        (maxSelections && !isSelected && value.length >= maxSelections)

                    return (
                        <div
                            key={option.value}
                            className={cn(comboboxItemVariants())}
                            onClick={() => !isDisabled && handleOptionSelect(option.value)}
                            data-disabled={isDisabled}
                            aria-selected={isSelected}
                        >
                            <Check className={cn(
                                'absolute left-2 h-4 w-4',
                                isSelected ? 'opacity-100' : 'opacity-0'
                            )} />
                            {renderOption ? renderOption(option) : option.label}
                        </div>
                    )
                })}
            </div>
        ))
    }

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                className={cn(
                    'relative flex min-h-10 w-full cursor-default rounded-md border border-input',
                    'bg-background text-sm ring-offset-background',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    variant === 'outline' && 'border-2',
                    variant === 'ghost' && 'border-transparent bg-transparent',
                    variant === 'filled' && 'bg-muted border-transparent',
                    app === 'codai' && 'focus-within:ring-codai-primary/20 focus-within:border-codai-primary',
                    app === 'memorai' && 'focus-within:ring-memorai-primary/20 focus-within:border-memorai-primary',
                    app === 'bancai' && 'focus-within:ring-bancai-primary/20 focus-within:border-bancai-primary',
                    app === 'romai' && 'focus-within:ring-romai-primary/20 focus-within:border-romai-primary',
                    app === 'ajutai' && 'focus-within:ring-ajutai-primary/20 focus-within:border-ajutai-primary',
                    app === 'controlai' && 'focus-within:ring-controlai-primary/20 focus-within:border-controlai-primary',
                    app === 'studiai' && 'focus-within:ring-studiai-primary/20 focus-within:border-studiai-primary',
                    app === 'sociai' && 'focus-within:ring-sociai-primary/20 focus-within:border-sociai-primary',
                    app === 'cumparai' && 'focus-within:ring-cumparai-primary/20 focus-within:border-cumparai-primary',
                    app === 'donai' && 'focus-within:ring-donai-primary/20 focus-within:border-donai-primary',
                    className
                )}
                onClick={() => !disabled && inputRef.current?.focus()}
                {...props}
            >
                <div className="flex flex-wrap gap-1 p-2">
                    {selectedOptions.map((option) => (
                        <span
                            key={option.value}
                            className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 text-xs"
                        >
                            {option.label}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={(e) => handleRemoveSelection(option.value, e)}
                            />
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                        placeholder={selectedOptions.length === 0 ? placeholder : searchPlaceholder}
                        value={search}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        disabled={disabled || !searchable}
                        readOnly={!searchable}
                    />
                </div>

                <div className="flex items-center gap-1 pr-2">
                    {showCount && value.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {value.length}{maxSelections && `/${maxSelections}`}
                        </span>
                    )}
                    {clearable && value.length > 0 && (
                        <X
                            className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                            onClick={handleClearAll}
                        />
                    )}
                    <ChevronDown className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        open ? 'rotate-180' : 'rotate-0'
                    )} />
                </div>
            </div>

            {open && (
                <div className={cn(comboboxDropdownVariants({ position: dropdownPosition }))}>
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        renderGroupedOptions()
                    )}
                </div>
            )}
        </div>
    )
}

// Async Combobox Component
export const AsyncCombobox: React.FC<Omit<ComboboxProps, 'options'> & {
    loadOptions: (search: string) => Promise<ComboboxOption[]>
    defaultOptions?: ComboboxOption[]
    loadingMessage?: string
    debounceMs?: number
}> = ({
    loadOptions,
    defaultOptions = [],
    loadingMessage = 'Loading...',
    debounceMs = 300,
    ...props
}) => {
        const [options, setOptions] = useState<ComboboxOption[]>(defaultOptions)
        const [loading, setLoading] = useState(false)
        const [search, setSearch] = useState('')
        const debounceRef = useRef<NodeJS.Timeout | null>(null)

        useEffect(() => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }

            debounceRef.current = setTimeout(async () => {
                if (search) {
                    setLoading(true)
                    try {
                        const newOptions = await loadOptions(search)
                        setOptions(newOptions)
                    } catch (error) {
                        console.error('Error loading options:', error)
                        setOptions([])
                    } finally {
                        setLoading(false)
                    }
                } else {
                    setOptions(defaultOptions)
                }
            }, debounceMs)

            return () => {
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current)
                }
            }
        }, [search, loadOptions, defaultOptions, debounceMs])

        return (
            <Combobox
                {...props}
                options={options}
                onInputChange={(value) => {
                    setSearch(value)
                    props.onInputChange?.(value)
                }}
                emptyMessage={loading ? loadingMessage : props.emptyMessage}
            />
        )
    }

// Example usage in comments
/*
// Basic Combobox
const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' }
]

<Combobox
  options={options}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Select a fruit..."
  app="codai"
/>

// Multi Combobox
<MultiCombobox
  options={options}
  value={selectedValues}
  onValueChange={setSelectedValues}
  maxSelections={3}
  showCount
  app="memorai"
/>

// Grouped Combobox
const groupedOptions = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' }
]

<Combobox
  options={groupedOptions}
  groupBy
  value={selectedValue}
  onValueChange={setSelectedValue}
/>

// Async Combobox
<AsyncCombobox
  loadOptions={async (search) => {
    const response = await fetch(`/api/search?q=${search}`)
    return response.json()
  }}
  value={selectedValue}
  onValueChange={setSelectedValue}
  debounceMs={500}
/>
*/
