// @ts-nocheck
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { Search } from "lucide-react";

export interface CommandItemData {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    shortcut?: string[];
    disabled?: boolean;
    group?: string;
    keywords?: string[];
    value?: any;
    onSelect?: () => void;
}

const commandVariants = cva(
    "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-slate-950",
    {
        variants: {
            variant: {
                default: "border border-slate-200",
                ghost: "border-0",
                filled: "bg-slate-50 border border-slate-200",
            },
            size: {
                sm: "text-sm",
                md: "text-base",
                lg: "text-lg",
            },
            app: {
                codai: "focus-within:ring-2 focus-within:ring-blue-500",
                memorai: "focus-within:ring-2 focus-within:ring-purple-500",
                bancai: "focus-within:ring-2 focus-within:ring-green-500",
                romai: "focus-within:ring-2 focus-within:ring-red-500",
                ajutai: "focus-within:ring-2 focus-within:ring-orange-500",
                controlai: "focus-within:ring-2 focus-within:ring-indigo-500",
                studiai: "focus-within:ring-2 focus-within:ring-teal-500",
                sociai: "focus-within:ring-2 focus-within:ring-pink-500",
                cumparai: "focus-within:ring-2 focus-within:ring-cyan-500",
                donai: "focus-within:ring-2 focus-within:ring-emerald-500",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

const commandInputVariants = cva(
    "flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            app: {
                codai: "focus:ring-blue-500",
                memorai: "focus:ring-purple-500",
                bancai: "focus:ring-green-500",
                romai: "focus:ring-red-500",
                ajutai: "focus:ring-orange-500",
                controlai: "focus:ring-indigo-500",
                studiai: "focus:ring-teal-500",
                sociai: "focus:ring-pink-500",
                cumparai: "focus:ring-cyan-500",
                donai: "focus:ring-emerald-500",
            },
        },
    }
);

const commandItemVariants = cva(
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
    {
        variants: {
            state: {
                default: "text-slate-900",
                selected: "bg-slate-100 text-slate-900",
                disabled: "pointer-events-none opacity-50",
            },
            app: {
                codai: "data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-900",
                memorai: "data-[selected=true]:bg-purple-100 data-[selected=true]:text-purple-900",
                bancai: "data-[selected=true]:bg-green-100 data-[selected=true]:text-green-900",
                romai: "data-[selected=true]:bg-red-100 data-[selected=true]:text-red-900",
                ajutai: "data-[selected=true]:bg-orange-100 data-[selected=true]:text-orange-900",
                controlai: "data-[selected=true]:bg-indigo-100 data-[selected=true]:text-indigo-900",
                studiai: "data-[selected=true]:bg-teal-100 data-[selected=true]:text-teal-900",
                sociai: "data-[selected=true]:bg-pink-100 data-[selected=true]:text-pink-900",
                cumparai: "data-[selected=true]:bg-cyan-100 data-[selected=true]:text-cyan-900",
                donai: "data-[selected=true]:bg-emerald-100 data-[selected=true]:text-emerald-900",
            },
        },
        defaultVariants: {
            state: "default",
        },
    }
);

export interface CommandProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof commandVariants> {
    app?: AppName;
    value?: string;
    onValueChange?: (value: string) => void;
    filter?: (value: string, search: string, keywords?: string[]) => boolean;
    shouldFilter?: boolean;
    loop?: boolean;
}

export interface CommandInputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof commandInputVariants> {
    app?: AppName;
    onValueChange?: (value: string) => void;
}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: string;
    children?: React.ReactNode;
}

export interface CommandItemProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>,
    VariantProps<typeof commandItemVariants> {
    app?: AppName;
    value?: string;
    disabled?: boolean;
    onSelect?: (value: string) => void;
    keywords?: string[];
}

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

// Context for managing command state
const CommandContext = React.createContext<{
    search: string;
    setSearch: (search: string) => void;
    value: string;
    onValueChange: (value: string) => void;
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    items: CommandItemData[];
    setItems: React.Dispatch<React.SetStateAction<CommandItemData[]>>;
    filter: (value: string, search: string, keywords?: string[]) => boolean;
    shouldFilter: boolean;
    loop: boolean;
    app?: AppName;
} | null>(null);

const useCommand = () => {
    const context = React.useContext(CommandContext);
    if (!context) {
        throw new Error("useCommand must be used within a Command");
    }
    return context;
};

// Default filter function
const defaultFilter = (value: string, search: string, keywords?: string[]) => {
    const searchLower = search.toLowerCase();
    const valueLower = value.toLowerCase();

    if (valueLower.includes(searchLower)) return true;

    if (keywords) {
        return keywords.some(keyword => keyword.toLowerCase().includes(searchLower));
    }

    return false;
};

// Main Command component
const Command = React.forwardRef<HTMLDivElement, CommandProps>(
    (
        {
            className,
            children,
            variant,
            size,
            app,
            value = "",
            onValueChange,
            filter = defaultFilter,
            shouldFilter = true,
            loop = false,
            ...props
        },
        ref
    ) => {
        const [search, setSearch] = React.useState("");
        const [selectedIndex, setSelectedIndex] = React.useState(0);
        const [items, setItems] = React.useState<CommandItemData[]>([]);

        const handleValueChange = React.useCallback(
            (newValue: string) => {
                onValueChange?.(newValue);
            },
            [onValueChange]
        );

        React.useEffect(() => {
            setSelectedIndex(0);
        }, [search]);

        return (
            <CommandContext.Provider
                value={{
                    search,
                    setSearch,
                    value,
                    onValueChange: handleValueChange,
                    selectedIndex,
                    setSelectedIndex,
                    items,
                    setItems,
                    filter,
                    shouldFilter,
                    loop,
                    app,
                }}
            >
                <div
                    ref={ref}
                    className={cn(commandVariants({ variant, size, app, className }))}
                    {...props}
                >
                    {children}
                </div>
            </CommandContext.Provider>
        );
    }
);

Command.displayName = "Command";

// Input component
const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
    ({ className, app, placeholder = "Search...", value, onValueChange, ...props }, ref) => {
        const { search, setSearch } = useCommand();

        const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setSearch(newValue);
            onValueChange?.(newValue);
        };

        return (
            <div className="flex items-center border-b border-slate-200 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                    ref={ref}
                    className={cn(commandInputVariants({ app, className }))}
                    placeholder={placeholder}
                    value={value ?? search}
                    onChange={handleValueChange}
                    {...props}
                />
            </div>
        );
    }
);

CommandInput.displayName = "CommandInput";

// List component
const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CommandList.displayName = "CommandList";

// Empty component
const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
    ({ className, children = "No results found.", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("py-6 text-center text-sm text-slate-500", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CommandEmpty.displayName = "CommandEmpty";

// Group component
const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
    ({ className, children, heading, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "overflow-hidden p-1 text-slate-950",
                    "[&_[data-heading]]:px-2 [&_[data-heading]]:py-1.5 [&_[data-heading]]:text-xs [&_[data-heading]]:font-medium [&_[data-heading]]:text-slate-500",
                    className
                )}
                {...props}
            >
                {heading && <div data-heading="">{heading}</div>}
                {children}
            </div>
        );
    }
);

CommandGroup.displayName = "CommandGroup";

// Item component
const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
    (
        {
            className,
            children,
            app,
            value = "",
            disabled = false,
            onSelect,
            keywords,
            ...props
        },
        ref
    ) => {
        const { onValueChange, search, filter, shouldFilter } = useCommand();
        const [isSelected, setIsSelected] = React.useState(false);

        // Filter item based on search
        const isVisible = React.useMemo(() => {
            if (!shouldFilter || !search) return true;
            return filter(value, search, keywords);
        }, [shouldFilter, search, value, keywords, filter]);

        const handleClick = () => {
            if (disabled) return;
            onSelect?.(value);
            onValueChange(value);
        };

        if (!isVisible) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={cn(
                    commandItemVariants({
                        state: disabled ? "disabled" : isSelected ? "selected" : "default",
                        app
                    }),
                    className
                )}
                onClick={handleClick}
                data-selected={isSelected}
                data-disabled={disabled}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CommandItem.displayName = "CommandItem";

// Separator component
const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("-mx-1 h-px bg-slate-200", className)}
                {...props}
            />
        );
    }
);

CommandSeparator.displayName = "CommandSeparator";

// Shortcut component
const CommandShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
    className,
    ...props
}) => {
    return (
        <span
            className={cn("ml-auto text-xs tracking-widest text-slate-500", className)}
            {...props}
        />
    );
};

CommandShortcut.displayName = "CommandShortcut";

// Command palette dialog
export interface CommandPaletteProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    app?: AppName;
    items?: CommandItemData[];
    onItemSelect?: (item: CommandItemData) => void;
    groups?: Array<{
        heading: string;
        items: CommandItemData[];
    }>;
    emptyMessage?: string;
    loading?: boolean;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
    open,
    onOpenChange,
    placeholder = "Type a command or search...",
    app,
    items = [],
    onItemSelect,
    groups = [],
    emptyMessage = "No results found.",
    loading = false,
}) => {
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                onOpenChange?.(!open);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    const handleItemSelect = (item: CommandItemData) => {
        onItemSelect?.(item);
        item.onSelect?.();
        onOpenChange?.(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-0 shadow-lg rounded-lg">
                <Command app={app} className="border-0">
                    <CommandInput
                        placeholder={placeholder}
                        app={app}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="py-6 text-center">
                                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-r-transparent" />
                                <span className="ml-2 text-sm text-slate-500">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>{emptyMessage}</CommandEmpty>

                                {groups.length > 0 ? (
                                    groups.map((group, groupIndex) => (
                                        <CommandGroup key={groupIndex} heading={group.heading}>
                                            {group.items.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={item.label}
                                                    disabled={item.disabled}
                                                    onSelect={() => handleItemSelect(item)}
                                                    keywords={item.keywords}
                                                    app={app}
                                                >
                                                    {item.icon && (
                                                        <span className="mr-2 flex-shrink-0">
                                                            {item.icon}
                                                        </span>
                                                    )}
                                                    <span className="flex-1">{item.label}</span>
                                                    {item.description && (
                                                        <span className="text-xs text-slate-500 ml-2">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                    {item.shortcut && (
                                                        <CommandShortcut>
                                                            {item.shortcut.join("+")}
                                                        </CommandShortcut>
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    ))
                                ) : (
                                    <CommandGroup>
                                        {items.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.label}
                                                disabled={item.disabled}
                                                onSelect={() => handleItemSelect(item)}
                                                keywords={item.keywords}
                                                app={app}
                                            >
                                                {item.icon && (
                                                    <span className="mr-2 flex-shrink-0">
                                                        {item.icon}
                                                    </span>
                                                )}
                                                <span className="flex-1">{item.label}</span>
                                                {item.description && (
                                                    <span className="text-xs text-slate-500 ml-2">
                                                        {item.description}
                                                    </span>
                                                )}
                                                {item.shortcut && (
                                                    <CommandShortcut>
                                                        {item.shortcut.join("+")}
                                                    </CommandShortcut>
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </div>
        </div>
    );
};

// Search command for autocomplete
export interface SearchCommandProps {
    placeholder?: string;
    app?: AppName;
    items?: CommandItemData[];
    onItemSelect?: (item: CommandItemData) => void;
    loading?: boolean;
    className?: string;
}

const SearchCommand: React.FC<SearchCommandProps> = ({
    placeholder = "Search...",
    app,
    items = [],
    onItemSelect,
    loading = false,
    className,
}) => {
    const [search, setSearch] = React.useState("");

    const handleItemSelect = (item: CommandItem) => {
        onItemSelect?.(item);
        item.onSelect?.();
        setSearch("");
    };

    return (
        <Command
            app={app}
            className={cn("border shadow-md", className)}
            shouldFilter={false}
        >
            <CommandInput
                placeholder={placeholder}
                app={app}
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                {loading ? (
                    <div className="py-4 text-center">
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-r-transparent" />
                        <span className="ml-2 text-sm text-slate-500">Searching...</span>
                    </div>
                ) : (
                    <>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.label}
                                    disabled={item.disabled}
                                    onSelect={() => handleItemSelect(item)}
                                    keywords={item.keywords}
                                    app={app}
                                >
                                    {item.icon && (
                                        <span className="mr-2 flex-shrink-0">
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="flex-1">{item.label}</span>
                                    {item.description && (
                                        <span className="text-xs text-slate-500 ml-2">
                                            {item.description}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </Command>
    );
};

export {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
    CommandPalette,
    SearchCommand,
    commandVariants,
    commandInputVariants,
    commandItemVariants,
};
