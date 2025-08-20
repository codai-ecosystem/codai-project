import * as React from "react";
import * as ReactDOM from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { X } from "lucide-react";

const sheetOverlayVariants = cva(
    "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-200",
    {
        variants: {
            state: {
                open: "animate-in fade-in-0",
                closed: "animate-out fade-out-0",
            },
        },
        defaultVariants: {
            state: "closed",
        },
    }
);

const sheetContentVariants = cva(
    "fixed z-50 gap-4 bg-white p-6 shadow-lg transition-all duration-300 border",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b animate-in slide-in-from-top-full",
                bottom: "inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom-full",
                left: "inset-y-0 left-0 h-full w-3/4 border-r animate-in slide-in-from-left-full sm:max-w-sm",
                right: "inset-y-0 right-0 h-full w-3/4 border-l animate-in slide-in-from-right-full sm:max-w-sm",
            },
            size: {
                sm: "",
                md: "",
                lg: "",
                xl: "",
                full: "",
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
        compoundVariants: [
            // Top/Bottom size variants
            {
                side: ["top", "bottom"],
                size: "sm",
                class: "h-1/3",
            },
            {
                side: ["top", "bottom"],
                size: "md",
                class: "h-1/2",
            },
            {
                side: ["top", "bottom"],
                size: "lg",
                class: "h-2/3",
            },
            {
                side: ["top", "bottom"],
                size: "xl",
                class: "h-3/4",
            },
            {
                side: ["top", "bottom"],
                size: "full",
                class: "h-full",
            },
            // Left/Right size variants
            {
                side: ["left", "right"],
                size: "sm",
                class: "w-1/4 sm:max-w-xs",
            },
            {
                side: ["left", "right"],
                size: "md",
                class: "w-1/2 sm:max-w-md",
            },
            {
                side: ["left", "right"],
                size: "lg",
                class: "w-2/3 sm:max-w-lg",
            },
            {
                side: ["left", "right"],
                size: "xl",
                class: "w-3/4 sm:max-w-xl",
            },
            {
                side: ["left", "right"],
                size: "full",
                class: "w-full",
            },
        ],
        defaultVariants: {
            side: "right",
            size: "md",
        },
    }
);

const sheetCloseVariants = cva(
    "absolute rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none",
    {
        variants: {
            side: {
                top: "right-4 top-4",
                bottom: "right-4 top-4",
                left: "right-4 top-4",
                right: "right-4 top-4",
            },
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
        defaultVariants: {
            side: "right",
        },
    }
);

export interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export interface SheetContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetContentVariants> {
    app?: AppName;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    showClose?: boolean;
    closeOnOutsideClick?: boolean;
}

export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

// Context for managing sheet state
const SheetContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
} | null>(null);

const useSheet = () => {
    const context = React.useContext(SheetContext);
    if (!context) {
        throw new Error("useSheet must be used within a Sheet");
    }
    return context;
};

// Main Sheet component
const Sheet: React.FC<SheetProps> = ({
    open = false,
    onOpenChange,
    children,
}) => {
    const [isOpen, setIsOpen] = React.useState(open);

    React.useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = React.useCallback(
        (newOpen: boolean) => {
            setIsOpen(newOpen);
            onOpenChange?.(newOpen);
        },
        [onOpenChange]
    );

    return (
        <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </SheetContext.Provider>
    );
};

// Trigger component
const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
    ({ children, asChild = false, onClick, ...props }, ref) => {
        const { onOpenChange } = useSheet();

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(true);
            onClick?.(event);
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, {
                ...props,
                onClick: handleClick,
                ref,
            } as any);
        }

        return (
            <button ref={ref} onClick={handleClick} {...props}>
                {children}
            </button>
        );
    }
);

SheetTrigger.displayName = "SheetTrigger";

// Portal for rendering outside DOM tree
const SheetPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// Overlay component
const SheetOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { open } = useSheet();

    return (
        <div
            ref={ref}
            className={cn(sheetOverlayVariants({ state: open ? "open" : "closed", className }))}
            {...props}
        />
    );
});

SheetOverlay.displayName = "SheetOverlay";

// Content component
const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    (
        {
            side = "right",
            size = "md",
            className,
            children,
            app,
            onEscapeKeyDown,
            onPointerDownOutside,
            showClose = true,
            closeOnOutsideClick = true,
            ...props
        },
        ref
    ) => {
        const { open, onOpenChange } = useSheet();

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
                document.body.style.overflow = "hidden";
            }

            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow = "unset";
            };
        }, [open, onEscapeKeyDown, onOpenChange]);

        // Handle click outside
        const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
            if (closeOnOutsideClick && event.target === event.currentTarget) {
                onPointerDownOutside?.(event.nativeEvent as any);
                onOpenChange(false);
            }
        };

        if (!open) {
            return null;
        }

        return (
            <SheetPortal>
                <SheetOverlay onClick={handleOverlayClick} />
                <div
                    ref={ref}
                    className={cn(sheetContentVariants({ side, size, app, className }))}
                    role="dialog"
                    aria-modal="true"
                    {...props}
                >
                    {children}
                    {showClose && (
                        <SheetClose side={side} app={app}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </SheetClose>
                    )}
                </div>
            </SheetPortal>
        );
    }
);

SheetContent.displayName = "SheetContent";

// Close button component
export interface SheetCloseProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sheetCloseVariants> {
    app?: AppName;
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
    ({ className, side, app, onClick, ...props }, ref) => {
        const { onOpenChange } = useSheet();

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(false);
            onClick?.(event);
        };

        return (
            <button
                ref={ref}
                className={cn(sheetCloseVariants({ side, app, className }))}
                onClick={handleClick}
                {...props}
            />
        );
    }
);

SheetClose.displayName = "SheetClose";

// Header component
const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
    />
);

SheetHeader.displayName = "SheetHeader";

// Footer component
const SheetFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
);

SheetFooter.displayName = "SheetFooter";

// Title component
const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold text-slate-900", className)}
        {...props}
    />
));

SheetTitle.displayName = "SheetTitle";

// Description component
const SheetDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-600", className)}
        {...props}
    />
));

SheetDescription.displayName = "SheetDescription";

// Sidebar sheet for navigation
export interface SidebarSheetProps extends Omit<SheetProps, 'children'> {
    app?: AppName;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    width?: "sm" | "md" | "lg" | "xl";
}

const SidebarSheet: React.FC<SidebarSheetProps> = ({
    app,
    title,
    description,
    children,
    width = "md",
    ...props
}) => {
    return (
        <Sheet {...props}>
            <SheetContent side="left" size={width} app={app}>
                {(title || description) && (
                    <SheetHeader>
                        {title && <SheetTitle>{title}</SheetTitle>}
                        {description && <SheetDescription>{description}</SheetDescription>}
                    </SheetHeader>
                )}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
};

// Bottom sheet for mobile
export interface BottomSheetProps extends Omit<SheetProps, 'children'> {
    app?: AppName;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    height?: "sm" | "md" | "lg" | "xl";
    snapPoints?: string[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    app,
    title,
    description,
    children,
    height = "md",
    snapPoints,
    ...props
}) => {
    return (
        <Sheet {...props}>
            <SheetContent side="bottom" size={height} app={app}>
                {/* Drag handle for mobile */}
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-300" />

                {(title || description) && (
                    <SheetHeader>
                        {title && <SheetTitle>{title}</SheetTitle>}
                        {description && <SheetDescription>{description}</SheetDescription>}
                    </SheetHeader>
                )}

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
};

// Notification sheet
export interface NotificationSheetProps extends Omit<SheetProps, 'children'> {
    app?: AppName;
    notifications?: Array<{
        id: string;
        title: string;
        description?: string;
        timestamp: Date;
        read?: boolean;
        action?: () => void;
    }>;
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
}

const NotificationSheet: React.FC<NotificationSheetProps> = ({
    app,
    notifications = [],
    onMarkAsRead,
    onMarkAllAsRead,
    ...props
}) => {
    return (
        <Sheet {...props}>
            <SheetContent side="right" size="md" app={app}>
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>Notifications</SheetTitle>
                        {notifications.some(n => !n.read) && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-auto space-y-3 mt-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-colors",
                                notification.read
                                    ? "bg-slate-50 border-slate-200"
                                    : "bg-white border-blue-200 shadow-sm"
                            )}
                            onClick={() => {
                                if (!notification.read) {
                                    onMarkAsRead?.(notification.id);
                                }
                                notification.action?.();
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className={cn(
                                        "font-medium text-sm",
                                        notification.read ? "text-slate-600" : "text-slate-900"
                                    )}>
                                        {notification.title}
                                    </h4>
                                    {notification.description && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {notification.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-2">
                                        {notification.timestamp.toLocaleDateString()}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                                )}
                            </div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-500">No notifications</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
    SheetClose,
    SidebarSheet,
    BottomSheet,
    NotificationSheet,
    sheetOverlayVariants,
    sheetContentVariants,
    sheetCloseVariants,
};
