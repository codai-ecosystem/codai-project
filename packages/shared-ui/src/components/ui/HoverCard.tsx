import * as React from "react";
import * as ReactDOM from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const hoverCardContentVariants = cva(
    "z-50 w-64 rounded-md border bg-white p-4 text-slate-950 shadow-md outline-none animate-in fade-in-0 zoom-in-95",
    {
        variants: {
            size: {
                sm: "w-48 p-3",
                md: "w-64 p-4",
                lg: "w-80 p-5",
                xl: "w-96 p-6",
                auto: "w-auto p-4",
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

const hoverCardArrowVariants = cva(
    "fill-white stroke-slate-200 stroke-1",
    {
        variants: {
            app: {
                codai: "stroke-blue-200",
                memorai: "stroke-purple-200",
                bancai: "stroke-green-200",
                romai: "stroke-red-200",
                ajutai: "stroke-orange-200",
                controlai: "stroke-indigo-200",
                studiai: "stroke-teal-200",
                sociai: "stroke-pink-200",
                cumparai: "stroke-cyan-200",
                donai: "stroke-emerald-200",
            },
        },
    }
);

export interface HoverCardProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    openDelay?: number;
    closeDelay?: number;
}

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

export interface HoverCardContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof hoverCardContentVariants> {
    app?: AppName;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    showArrow?: boolean;
    avoidCollisions?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
}

// Context for managing hover card state
const HoverCardContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    openDelay: number;
    closeDelay: number;
} | null>(null);

const useHoverCard = () => {
    const context = React.useContext(HoverCardContext);
    if (!context) {
        throw new Error("useHoverCard must be used within a HoverCard");
    }
    return context;
};

// Main HoverCard component
const HoverCard: React.FC<HoverCardProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300,
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
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
        <HoverCardContext.Provider
            value={{
                open,
                onOpenChange: handleOpenChange,
                openDelay,
                closeDelay,
            }}
        >
            {children}
        </HoverCardContext.Provider>
    );
};

// Trigger component
const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(
    ({ children, asChild = false, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
        const { onOpenChange, openDelay, closeDelay } = useHoverCard();
        const openTimerRef = React.useRef<NodeJS.Timeout | null>(null);
        const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

        const clearTimers = React.useCallback(() => {
            if (openTimerRef.current) {
                clearTimeout(openTimerRef.current);
            }
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        }, []);

        React.useEffect(() => {
            return clearTimers;
        }, [clearTimers]);

        const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
            clearTimers();
            openTimerRef.current = setTimeout(() => {
                onOpenChange(true);
            }, openDelay);
            onMouseEnter?.(event);
        };

        const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
            clearTimers();
            closeTimerRef.current = setTimeout(() => {
                onOpenChange(false);
            }, closeDelay);
            onMouseLeave?.(event);
        };

        const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
            clearTimers();
            onOpenChange(true);
            onFocus?.(event);
        };

        const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
            clearTimers();
            onOpenChange(false);
            onBlur?.(event);
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, {
                ...props,
                ref,
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                onFocus: handleFocus,
                onBlur: handleBlur,
            } as any);
        }

        return (
            <span
                ref={ref as React.RefObject<HTMLSpanElement>}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
            >
                {children}
            </span>
        );
    }
);

HoverCardTrigger.displayName = "HoverCardTrigger";

// Portal for rendering outside DOM tree
const HoverCardPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
    (
        {
            className,
            size,
            align = "center",
            side = "bottom",
            sideOffset = 4,
            alignOffset = 0,
            showArrow = true,
            avoidCollisions = true,
            app,
            children,
            onEscapeKeyDown,
            onPointerDownOutside,
            onMouseEnter,
            onMouseLeave,
            ...props
        },
        ref
    ) => {
        const { open, onOpenChange, closeDelay } = useHoverCard();
        const [position, setPosition] = React.useState({ x: 0, y: 0 });
        const contentRef = React.useRef<HTMLDivElement>(null);
        const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

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
            }

            return () => {
                document.removeEventListener("keydown", handleEscape);
            };
        }, [open, onEscapeKeyDown, onOpenChange]);

        // Position calculation (simplified for this implementation)
        React.useEffect(() => {
            if (open && contentRef.current) {
                const updatePosition = () => {
                    // In a real implementation, this would calculate position relative to trigger
                    // For now, we'll use a simplified approach
                    setPosition({ x: 0, y: 0 });
                };

                updatePosition();
                window.addEventListener("resize", updatePosition);
                window.addEventListener("scroll", updatePosition);

                return () => {
                    window.removeEventListener("resize", updatePosition);
                    window.removeEventListener("scroll", updatePosition);
                };
            }
        }, [open]);

        const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
            onMouseEnter?.(event);
        };

        const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
            closeTimerRef.current = setTimeout(() => {
                onOpenChange(false);
            }, closeDelay);
            onMouseLeave?.(event);
        };

        if (!open) {
            return null;
        }

        return (
            <HoverCardPortal>
                <div
                    ref={ref}
                    className={cn(
                        hoverCardContentVariants({ size, align, side, app, className }),
                        "fixed"
                    )}
                    style={{
                        left: position.x,
                        top: position.y,
                    }}
                    role="tooltip"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    data-side={side}
                    data-align={align}
                    {...props}
                >
                    {children}
                    {showArrow && (
                        <div
                            className={cn(
                                "absolute w-2 h-2 rotate-45 border",
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
                                backgroundColor: "white",
                                borderColor: app ? `oklch(var(--${app}-200))` : "oklch(var(--slate-200))",
                            }}
                        />
                    )}
                </div>
            </HoverCardPortal>
        );
    }
);

HoverCardContent.displayName = "HoverCardContent";

// User profile hover card
export interface UserHoverCardProps {
    user: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
        bio?: string;
        followers?: number;
        following?: number;
        verified?: boolean;
    };
    app?: AppName;
    children: React.ReactNode;
    showStats?: boolean;
    onUserClick?: (userId: string) => void;
}

const UserHoverCard: React.FC<UserHoverCardProps> = ({
    user,
    app,
    children,
    showStats = true,
    onUserClick,
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent app={app} size="md">
                <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                        {user.avatar ? (
                            <img
                                className="w-12 h-12 rounded-full"
                                src={user.avatar}
                                alt={user.name}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="text-lg font-medium text-slate-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                                {user.name}
                            </h4>
                            {user.verified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                        </div>

                        {user.username && (
                            <p className="text-sm text-slate-500">@{user.username}</p>
                        )}

                        {user.bio && (
                            <p className="text-sm text-slate-700 mt-2 line-clamp-3">
                                {user.bio}
                            </p>
                        )}

                        {showStats && (user.followers !== undefined || user.following !== undefined) && (
                            <div className="flex space-x-4 mt-3 text-sm text-slate-600">
                                {user.following !== undefined && (
                                    <span>
                                        <strong className="text-slate-900">{user.following}</strong> Following
                                    </span>
                                )}
                                {user.followers !== undefined && (
                                    <span>
                                        <strong className="text-slate-900">{user.followers}</strong> Followers
                                    </span>
                                )}
                            </div>
                        )}

                        {onUserClick && (
                            <button
                                onClick={() => onUserClick(user.id)}
                                className={cn(
                                    "mt-3 px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                    app ? `bg-${app}-600 hover:bg-${app}-700 text-white` : "bg-slate-900 hover:bg-slate-800 text-white"
                                )}
                            >
                                View Profile
                            </button>
                        )}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

// Link preview hover card
export interface LinkPreviewHoverCardProps {
    url: string;
    preview?: {
        title: string;
        description?: string;
        image?: string;
        domain: string;
        favicon?: string;
    };
    app?: AppName;
    children: React.ReactNode;
    loading?: boolean;
    onLinkClick?: (url: string) => void;
}

const LinkPreviewHoverCard: React.FC<LinkPreviewHoverCardProps> = ({
    url,
    preview,
    app,
    children,
    loading = false,
    onLinkClick,
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent app={app} size="lg">
                {loading ? (
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                    </div>
                ) : preview ? (
                    <div className="space-y-3">
                        {preview.image && (
                            <img
                                src={preview.image}
                                alt={preview.title}
                                className="w-full h-32 object-cover rounded"
                            />
                        )}

                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                {preview.favicon && (
                                    <img
                                        src={preview.favicon}
                                        alt=""
                                        className="w-4 h-4"
                                    />
                                )}
                                <span className="text-xs text-slate-500">{preview.domain}</span>
                            </div>

                            <h4 className="font-semibold text-slate-900 line-clamp-2">
                                {preview.title}
                            </h4>

                            {preview.description && (
                                <p className="text-sm text-slate-600 line-clamp-3 mt-1">
                                    {preview.description}
                                </p>
                            )}
                        </div>

                        {onLinkClick && (
                            <button
                                onClick={() => onLinkClick(url)}
                                className={cn(
                                    "w-full mt-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    app ? `bg-${app}-600 hover:bg-${app}-700 text-white` : "bg-slate-900 hover:bg-slate-800 text-white"
                                )}
                            >
                                Visit Link
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-slate-600">
                        No preview available for this link.
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
};

export {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
    UserHoverCard,
    LinkPreviewHoverCard,
    hoverCardContentVariants,
    hoverCardArrowVariants,
};
