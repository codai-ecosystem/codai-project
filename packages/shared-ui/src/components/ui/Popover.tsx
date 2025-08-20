import * as React from "react";
import * as ReactDOM from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { X } from "lucide-react";

const popoverContentVariants = cva(
    "z-50 rounded-md border bg-white p-4 text-slate-950 shadow-md outline-none animate-in fade-in-0 zoom-in-95",
    {
        variants: {
            size: {
                sm: "w-48 p-3",
                md: "w-64 p-4",
                lg: "w-80 p-5",
                xl: "w-96 p-6",
                auto: "w-auto p-4",
                full: "w-full max-w-lg p-4",
            },
            align: {
                start: "data-[align=start]:animate-in data-[align=start]:slide-in-from-right-0",
                center: "data-[align=center]:animate-in data-[align=center]:slide-in-from-bottom-0",
                end: "data-[align=end]:animate-in data-[align=end]:slide-in-from-left-0",
            },
            side: {
                top: "data-[side=top]:animate-in data-[side=top]:slide-in-from-bottom-2",
                right: "data-[side=right]:animate-in data-[side=right]:slide-in-from-left-2",
                bottom: "data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-2",
                left: "data-[side=left]:animate-in data-[side=left]:slide-in-from-right-2",
            },
            app: {
                codai: "border-blue-200 focus-within:ring-2 focus-within:ring-blue-500",
                memorai: "border-purple-200 focus-within:ring-2 focus-within:ring-purple-500",
                bancai: "border-green-200 focus-within:ring-2 focus-within:ring-green-500",
                romai: "border-red-200 focus-within:ring-2 focus-within:ring-red-500",
                ajutai: "border-orange-200 focus-within:ring-2 focus-within:ring-orange-500",
                controlai: "border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-500",
                studiai: "border-teal-200 focus-within:ring-2 focus-within:ring-teal-500",
                sociai: "border-pink-200 focus-within:ring-2 focus-within:ring-pink-500",
                cumparai: "border-cyan-200 focus-within:ring-2 focus-within:ring-cyan-500",
                donai: "border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-500",
            },
        },
        defaultVariants: {
            size: "md",
            align: "center",
            side: "bottom",
        },
    }
);

const popoverCloseVariants = cva(
    "absolute right-2 top-2 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none",
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

export interface PopoverProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export interface PopoverContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof popoverContentVariants> {
    app?: AppName;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    showArrow?: boolean;
    showClose?: boolean;
    avoidCollisions?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    closeOnOutsideClick?: boolean;
}

// Context for managing popover state
const PopoverContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modal: boolean;
    triggerRef: React.RefObject<HTMLElement>;
} | null>(null);

const usePopover = () => {
    const context = React.useContext(PopoverContext);
    if (!context) {
        throw new Error("usePopover must be used within a Popover");
    }
    return context;
};

// Main Popover component
const Popover: React.FC<PopoverProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    modal = false,
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLElement>(null);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const handleOpenChange = React.useCallback(
        (newOpen: boolean) => {
            if (!isControlled) {
                setInternalOpen(newOpen);
            }
            onOpenChange?.(newOpen);
        },
        [isControlled, onOpenChange]
    );

    return (
        <PopoverContext.Provider
            value={{
                open,
                onOpenChange: handleOpenChange,
                modal,
                triggerRef,
            }}
        >
            {children}
        </PopoverContext.Provider>
    );
};

// Trigger component
const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
    ({ children, asChild = false, onClick, ...props }, ref) => {
        const { onOpenChange, open, triggerRef } = usePopover();

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(!open);
            onClick?.(event);
        };

        const combinedRef = React.useCallback(
            (node: HTMLButtonElement) => {
                if (node) {
                    (triggerRef as React.MutableRefObject<HTMLElement>).current = node;
                }
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref, triggerRef]
        );

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, {
                ...props,
                ref: combinedRef,
                onClick: handleClick,
            } as any);
        }

        return (
            <button ref={combinedRef} onClick={handleClick} {...props}>
                {children}
            </button>
        );
    }
);

PopoverTrigger.displayName = "PopoverTrigger";

// Portal for rendering outside DOM tree
const PopoverPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        typeof document !== "undefined" &&
        document.body &&
        ReactDOM.createPortal(children, document.body)
    );
};

// Content component with positioning logic
const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
    (
        {
            className,
            size,
            align = "center",
            side = "bottom",
            sideOffset = 4,
            alignOffset = 0,
            showArrow = true,
            showClose = false,
            avoidCollisions = true,
            closeOnOutsideClick = true,
            app,
            children,
            onEscapeKeyDown,
            onPointerDownOutside,
            ...props
        },
        ref
    ) => {
        const { open, onOpenChange, modal, triggerRef } = usePopover();
        const [position, setPosition] = React.useState({ x: 0, y: 0 });
        const contentRef = React.useRef<HTMLDivElement>(null);

        // Calculate position relative to trigger
        const calculatePosition = React.useCallback(() => {
            if (!triggerRef.current || !contentRef.current) return;

            const triggerRect = triggerRef.current.getBoundingClientRect();
            const contentRect = contentRef.current.getBoundingClientRect();
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            let x = 0;
            let y = 0;

            // Calculate base position based on side
            switch (side) {
                case "top":
                    x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
                    y = triggerRect.top - contentRect.height - sideOffset;
                    break;
                case "right":
                    x = triggerRect.right + sideOffset;
                    y = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
                    break;
                case "bottom":
                    x = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
                    y = triggerRect.bottom + sideOffset;
                    break;
                case "left":
                    x = triggerRect.left - contentRect.width - sideOffset;
                    y = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
                    break;
            }

            // Apply alignment offset
            if (side === "top" || side === "bottom") {
                if (align === "start") x = triggerRect.left + alignOffset;
                if (align === "end") x = triggerRect.right - contentRect.width - alignOffset;
            } else {
                if (align === "start") y = triggerRect.top + alignOffset;
                if (align === "end") y = triggerRect.bottom - contentRect.height - alignOffset;
            }

            // Collision detection and avoidance
            if (avoidCollisions) {
                if (x + contentRect.width > viewport.width) {
                    x = viewport.width - contentRect.width - 8;
                }
                if (x < 8) {
                    x = 8;
                }
                if (y + contentRect.height > viewport.height) {
                    y = viewport.height - contentRect.height - 8;
                }
                if (y < 8) {
                    y = 8;
                }
            }

            setPosition({ x, y });
        }, [side, align, sideOffset, alignOffset, avoidCollisions]);

        // Handle escape key
        React.useEffect(() => {
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    onEscapeKeyDown?.(event);
                    onOpenChange(false);
                }
            };

            if (open) {
                document.addEventListener("keydown", handleEscape);
                if (modal) {
                    document.body.style.overflow = "hidden";
                }
            }

            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow = "unset";
            };
        }, [open, modal, onEscapeKeyDown, onOpenChange]);

        // Handle click outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    closeOnOutsideClick &&
                    contentRef.current &&
                    !contentRef.current.contains(event.target as Node) &&
                    triggerRef.current &&
                    !triggerRef.current.contains(event.target as Node)
                ) {
                    onPointerDownOutside?.(event as any);
                    onOpenChange(false);
                }
            };

            if (open) {
                document.addEventListener("mousedown", handleClickOutside);
            }

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [open, closeOnOutsideClick, onPointerDownOutside, onOpenChange]);

        // Update position when content or trigger changes
        React.useEffect(() => {
            if (open) {
                calculatePosition();

                const resizeObserver = new ResizeObserver(calculatePosition);
                if (triggerRef.current) {
                    resizeObserver.observe(triggerRef.current);
                }
                if (contentRef.current) {
                    resizeObserver.observe(contentRef.current);
                }

                window.addEventListener("resize", calculatePosition);
                window.addEventListener("scroll", calculatePosition);

                return () => {
                    resizeObserver.disconnect();
                    window.removeEventListener("resize", calculatePosition);
                    window.removeEventListener("scroll", calculatePosition);
                };
            }
        }, [open, calculatePosition]);

        if (!open) {
            return null;
        }

        const content = (
            <div
                ref={(node) => {
                    contentRef.current = node;
                    if (typeof ref === "function") {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                className={cn(
                    popoverContentVariants({ size, align, side, app, className }),
                    "fixed"
                )}
                style={{
                    left: position.x,
                    top: position.y,
                }}
                role="dialog"
                aria-modal={modal}
                data-side={side}
                data-align={align}
                {...props}
            >
                {children}

                {showClose && (
                    <PopoverClose app={app}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </PopoverClose>
                )}

                {showArrow && (
                    <div
                        className={cn(
                            "absolute w-2 h-2 rotate-45 border bg-white",
                            side === "top" && "bottom-[-5px] border-b border-r",
                            side === "right" && "left-[-5px] border-l border-b",
                            side === "bottom" && "top-[-5px] border-t border-l",
                            side === "left" && "right-[-5px] border-r border-t",
                            align === "start" && (side === "top" || side === "bottom") && "left-3",
                            align === "center" && (side === "top" || side === "bottom") && "left-1/2 -translate-x-1/2",
                            align === "end" && (side === "top" || side === "bottom") && "right-3",
                            align === "start" && (side === "left" || side === "right") && "top-3",
                            align === "center" && (side === "left" || side === "right") && "top-1/2 -translate-y-1/2",
                            align === "end" && (side === "left" || side === "right") && "bottom-3"
                        )}
                        style={{
                            borderColor: app ? `oklch(var(--${app}-200))` : "oklch(var(--slate-200))",
                        }}
                    />
                )}
            </div>
        );

        if (modal) {
            return (
                <PopoverPortal>
                    <div className="fixed inset-0 z-40 bg-black/20" />
                    {content}
                </PopoverPortal>
            );
        }

        return <PopoverPortal>{content}</PopoverPortal>;
    }
);

PopoverContent.displayName = "PopoverContent";

// Close button component
export interface PopoverCloseProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof popoverCloseVariants> {
    app?: AppName;
}

const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
    ({ className, app, onClick, ...props }, ref) => {
        const { onOpenChange } = usePopover();

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(false);
            onClick?.(event);
        };

        return (
            <button
                ref={ref}
                className={cn(popoverCloseVariants({ app, className }))}
                onClick={handleClick}
                {...props}
            />
        );
    }
);

PopoverClose.displayName = "PopoverClose";

// Menu popover for dropdown-like functionality
export interface MenuPopoverProps extends Omit<PopoverProps, 'children'> {
    trigger: React.ReactNode;
    items: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        separator?: boolean;
    }>;
    app?: AppName;
}

const MenuPopover: React.FC<MenuPopoverProps> = ({
    trigger,
    items,
    app,
    ...props
}) => {
    const { onOpenChange } = usePopover();

    const handleItemClick = (item: typeof items[0]) => {
        if (!item.disabled && item.onClick) {
            item.onClick();
            onOpenChange?.(false);
        }
    };

    return (
        <Popover {...props}>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent app={app} size="auto" className="p-1">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {item.separator ? (
                            <div className="h-px bg-slate-200 my-1" />
                        ) : (
                            <button
                                className={cn(
                                    "flex items-center w-full px-3 py-2 text-sm text-left rounded-sm transition-colors",
                                    item.disabled
                                        ? "text-slate-400 cursor-not-allowed"
                                        : "text-slate-700 hover:bg-slate-100",
                                    app && !item.disabled && `hover:bg-${app}-50`
                                )}
                                onClick={() => handleItemClick(item)}
                                disabled={item.disabled}
                            >
                                {item.icon && (
                                    <span className="mr-2 flex-shrink-0">
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </PopoverContent>
        </Popover>
    );
};

// Form popover for input-like functionality
export interface FormPopoverProps extends Omit<PopoverProps, 'children'> {
    trigger: React.ReactNode;
    title?: string;
    description?: string;
    children: React.ReactNode;
    app?: AppName;
    onSubmit?: () => void;
    onCancel?: () => void;
    submitText?: string;
    cancelText?: string;
    showActions?: boolean;
}

const FormPopover: React.FC<FormPopoverProps> = ({
    trigger,
    title,
    description,
    children,
    app,
    onSubmit,
    onCancel,
    submitText = "Save",
    cancelText = "Cancel",
    showActions = true,
    ...props
}) => {
    const { onOpenChange } = usePopover();

    const handleSubmit = () => {
        onSubmit?.();
        onOpenChange?.(false);
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange?.(false);
    };

    return (
        <Popover {...props}>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent app={app} size="lg">
                {(title || description) && (
                    <div className="space-y-2 mb-4">
                        {title && (
                            <h3 className="font-semibold text-slate-900">{title}</h3>
                        )}
                        {description && (
                            <p className="text-sm text-slate-600">{description}</p>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    {children}
                </div>

                {showActions && (
                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={cn(
                                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                app
                                    ? `bg-${app}-600 hover:bg-${app}-700 text-white`
                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                            )}
                        >
                            {submitText}
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

export {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
    MenuPopover,
    FormPopover,
    popoverContentVariants,
    popoverCloseVariants,
};
