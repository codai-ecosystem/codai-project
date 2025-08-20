import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const tooltipContentVariants = cva(
    "z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    {
        variants: {
            variant: {
                default: "bg-slate-900 text-white",
                light: "bg-white text-slate-900 border border-slate-200",
                destructive: "bg-red-500 text-white",
                success: "bg-green-500 text-white",
                warning: "bg-yellow-500 text-black",
                info: "bg-blue-500 text-white",
            },
            size: {
                sm: "px-2 py-1 text-xs",
                md: "px-3 py-1.5 text-sm",
                lg: "px-4 py-2 text-base",
            },
            app: {
                codai: "bg-blue-600 text-white",
                memorai: "bg-purple-600 text-white",
                bancai: "bg-green-600 text-white",
                romai: "bg-red-600 text-white",
                ajutai: "bg-orange-600 text-white",
                controlai: "bg-indigo-600 text-white",
                studiai: "bg-teal-600 text-white",
                sociai: "bg-pink-600 text-white",
                cumparai: "bg-cyan-600 text-white",
                donai: "bg-emerald-600 text-white",
            },
        },
        compoundVariants: [
            {
                variant: "light",
                app: "codai",
                className: "bg-blue-50 text-blue-900 border-blue-200",
            },
            {
                variant: "light",
                app: "memorai",
                className: "bg-purple-50 text-purple-900 border-purple-200",
            },
            {
                variant: "light",
                app: "bancai",
                className: "bg-green-50 text-green-900 border-green-200",
            },
            {
                variant: "light",
                app: "romai",
                className: "bg-red-50 text-red-900 border-red-200",
            },
            {
                variant: "light",
                app: "ajutai",
                className: "bg-orange-50 text-orange-900 border-orange-200",
            },
            {
                variant: "light",
                app: "controlai",
                className: "bg-indigo-50 text-indigo-900 border-indigo-200",
            },
            {
                variant: "light",
                app: "studiai",
                className: "bg-teal-50 text-teal-900 border-teal-200",
            },
            {
                variant: "light",
                app: "sociai",
                className: "bg-pink-50 text-pink-900 border-pink-200",
            },
            {
                variant: "light",
                app: "cumparai",
                className: "bg-cyan-50 text-cyan-900 border-cyan-200",
            },
            {
                variant: "light",
                app: "donai",
                className: "bg-emerald-50 text-emerald-900 border-emerald-200",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

const tooltipArrowVariants = cva(
    "fill-current",
    {
        variants: {
            variant: {
                default: "text-slate-900",
                light: "text-white",
                destructive: "text-red-500",
                success: "text-green-500",
                warning: "text-yellow-500",
                info: "text-blue-500",
            },
            app: {
                codai: "text-blue-600",
                memorai: "text-purple-600",
                bancai: "text-green-600",
                romai: "text-red-600",
                ajutai: "text-orange-600",
                controlai: "text-indigo-600",
                studiai: "text-teal-600",
                sociai: "text-pink-600",
                cumparai: "text-cyan-600",
                donai: "text-emerald-600",
            },
        },
        compoundVariants: [
            {
                variant: "light",
                app: "codai",
                className: "text-blue-50",
            },
            {
                variant: "light",
                app: "memorai",
                className: "text-purple-50",
            },
            {
                variant: "light",
                app: "bancai",
                className: "text-green-50",
            },
            {
                variant: "light",
                app: "romai",
                className: "text-red-50",
            },
            {
                variant: "light",
                app: "ajutai",
                className: "text-orange-50",
            },
            {
                variant: "light",
                app: "controlai",
                className: "text-indigo-50",
            },
            {
                variant: "light",
                app: "studiai",
                className: "text-teal-50",
            },
            {
                variant: "light",
                app: "sociai",
                className: "text-pink-50",
            },
            {
                variant: "light",
                app: "cumparai",
                className: "text-cyan-50",
            },
            {
                variant: "light",
                app: "donai",
                className: "text-emerald-50",
            },
        ],
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
    variant?: VariantProps<typeof tooltipContentVariants>["variant"];
    size?: VariantProps<typeof tooltipContentVariants>["size"];
    app?: AppName;
    disabled?: boolean;
    className?: string;
    contentClassName?: string;
    asChild?: boolean;
}

export interface TooltipContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipContentVariants> {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    app?: AppName;
    arrowProps?: React.SVGProps<SVGSVGElement>;
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export interface TooltipArrowProps
    extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof tooltipArrowVariants> {
    app?: AppName;
}

// Tooltip Context
const TooltipContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
    delayDuration: number;
    skipDelayDuration: number;
    disableHoverableContent: boolean;
} | null>(null);

const useTooltip = () => {
    const context = React.useContext(TooltipContext);
    if (!context) {
        throw new Error("useTooltip must be used within a TooltipProvider");
    }
    return context;
};

// Position calculation utility
const calculatePosition = (
    triggerRect: DOMRect,
    contentRect: DOMRect,
    side: "top" | "right" | "bottom" | "left",
    align: "start" | "center" | "end",
    sideOffset: number,
    alignOffset: number
) => {
    let x = 0;
    let y = 0;

    // Calculate base position based on side
    switch (side) {
        case "top":
            x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
            y = triggerRect.top - contentRect.height - sideOffset;
            break;
        case "right":
            x = triggerRect.right + sideOffset;
            y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
            break;
        case "bottom":
            x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
            y = triggerRect.bottom + sideOffset;
            break;
        case "left":
            x = triggerRect.left - contentRect.width - sideOffset;
            y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
            break;
    }

    // Adjust for alignment
    if (side === "top" || side === "bottom") {
        switch (align) {
            case "start":
                x = triggerRect.left + alignOffset;
                break;
            case "end":
                x = triggerRect.right - contentRect.width - alignOffset;
                break;
        }
    } else {
        switch (align) {
            case "start":
                y = triggerRect.top + alignOffset;
                break;
            case "end":
                y = triggerRect.bottom - contentRect.height - alignOffset;
                break;
        }
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    x = Math.max(8, Math.min(x, viewportWidth - contentRect.width - 8));
    y = Math.max(8, Math.min(y, viewportHeight - contentRect.height - 8));

    return { x, y };
};

// TooltipProvider component
export interface TooltipProviderProps {
    children: React.ReactNode;
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({
    children,
    delayDuration = 700,
    skipDelayDuration = 300,
    disableHoverableContent = false,
}) => {
    const [open, setOpen] = React.useState(false);

    return (
        <TooltipContext.Provider
            value={{
                open,
                setOpen,
                delayDuration,
                skipDelayDuration,
                disableHoverableContent,
            }}
        >
            {children}
        </TooltipContext.Provider>
    );
};

// Main Tooltip component
const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    side = "top",
    align = "center",
    sideOffset = 4,
    alignOffset = 0,
    delayDuration = 700,
    skipDelayDuration = 300,
    disableHoverableContent = false,
    variant = "default",
    size = "md",
    app,
    disabled = false,
    className,
    contentClassName,
    asChild = false,
}) => {
    const [open, setOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const triggerRef = React.useRef<HTMLElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const skipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const showTooltip = React.useCallback(() => {
        if (disabled) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setOpen(true);
        }, delayDuration);
    }, [disabled, delayDuration]);

    const hideTooltip = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (skipTimeoutRef.current) {
            clearTimeout(skipTimeoutRef.current);
        }

        skipTimeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, skipDelayDuration);
    }, [skipDelayDuration]);

    const updatePosition = React.useCallback(() => {
        if (triggerRef.current && contentRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const contentRect = contentRef.current.getBoundingClientRect();

            const newPosition = calculatePosition(
                triggerRect,
                contentRect,
                side,
                align,
                sideOffset,
                alignOffset
            );

            setPosition(newPosition);
        }
    }, [side, align, sideOffset, alignOffset]);

    React.useEffect(() => {
        if (open) {
            updatePosition();

            const handleResize = () => updatePosition();
            const handleScroll = () => updatePosition();

            window.addEventListener("resize", handleResize);
            window.addEventListener("scroll", handleScroll, true);

            return () => {
                window.removeEventListener("resize", handleResize);
                window.removeEventListener("scroll", handleScroll, true);
            };
        }
    }, [open, updatePosition]);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (skipTimeoutRef.current) {
                clearTimeout(skipTimeoutRef.current);
            }
        };
    }, []);

    const triggerProps = {
        ref: triggerRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
        "aria-describedby": open ? "tooltip-content" : undefined,
    };

    return (
        <>
            {asChild ? (
                React.cloneElement(children as React.ReactElement, triggerProps)
            ) : (
                <span className={cn("inline-block", className)} {...triggerProps}>
                    {children}
                </span>
            )}

            {open && !disabled && (
                <div
                    ref={contentRef}
                    id="tooltip-content"
                    role="tooltip"
                    className={cn(
                        tooltipContentVariants({ variant, size, app }),
                        "fixed pointer-events-none z-[9999]",
                        contentClassName
                    )}
                    style={{
                        left: position.x,
                        top: position.y,
                    }}
                    data-state="open"
                    data-side={side}
                >
                    {content}
                </div>
            )}
        </>
    );
};

// TooltipTrigger component
const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
    ({ className, children, asChild = false, ...props }, ref) => {
        const { setOpen, delayDuration } = useTooltip();
        const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

        const handleMouseEnter = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                setOpen(true);
            }, delayDuration);
        };

        const handleMouseLeave = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setOpen(false);
        };

        const triggerProps = {
            ...props,
            ref,
            className: cn("inline-block", className),
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onFocus: () => setOpen(true),
            onBlur: () => setOpen(false),
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, triggerProps);
        }

        return (
            <button {...triggerProps}>
                {children}
            </button>
        );
    }
);

TooltipTrigger.displayName = "TooltipTrigger";

// TooltipContent component
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
    (
        {
            className,
            children,
            side = "top",
            align = "center",
            sideOffset = 4,
            alignOffset = 0,
            variant = "default",
            size = "md",
            app,
            arrowProps,
            ...props
        },
        ref
    ) => {
        const { open } = useTooltip();

        if (!open) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={cn(
                    tooltipContentVariants({ variant, size, app }),
                    "fixed z-50",
                    className
                )}
                data-state="open"
                data-side={side}
                data-align={align}
                role="tooltip"
                {...props}
            >
                {children}
                {arrowProps && (
                    <TooltipArrow variant={variant} app={app} {...arrowProps} />
                )}
            </div>
        );
    }
);

TooltipContent.displayName = "TooltipContent";

// TooltipArrow component
const TooltipArrow = React.forwardRef<SVGSVGElement, TooltipArrowProps>(
    ({ className, variant, app, ...props }, ref) => {
        return (
            <svg
                ref={ref}
                width="11"
                height="5"
                viewBox="0 0 11 5"
                className={cn(tooltipArrowVariants({ variant, app }), className)}
                {...props}
            >
                <path d="M5.5 0L11 5H0L5.5 0Z" />
            </svg>
        );
    }
);

TooltipArrow.displayName = "TooltipArrow";

// Specialized tooltip components
export interface InfoTooltipProps extends Omit<TooltipProps, 'variant'> {
    children: React.ReactNode;
    info: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ children, info, ...props }) => {
    return (
        <Tooltip content={info} variant="info" {...props}>
            {children}
        </Tooltip>
    );
};

export interface ErrorTooltipProps extends Omit<TooltipProps, 'variant'> {
    children: React.ReactNode;
    error: React.ReactNode;
}

const ErrorTooltip: React.FC<ErrorTooltipProps> = ({ children, error, ...props }) => {
    return (
        <Tooltip content={error} variant="destructive" {...props}>
            {children}
        </Tooltip>
    );
};

export interface SuccessTooltipProps extends Omit<TooltipProps, 'variant'> {
    children: React.ReactNode;
    message: React.ReactNode;
}

const SuccessTooltip: React.FC<SuccessTooltipProps> = ({ children, message, ...props }) => {
    return (
        <Tooltip content={message} variant="success" {...props}>
            {children}
        </Tooltip>
    );
};

export interface WarningTooltipProps extends Omit<TooltipProps, 'variant'> {
    children: React.ReactNode;
    warning: React.ReactNode;
}

const WarningTooltip: React.FC<WarningTooltipProps> = ({ children, warning, ...props }) => {
    return (
        <Tooltip content={warning} variant="warning" {...props}>
            {children}
        </Tooltip>
    );
};

export {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
    TooltipArrow,
    InfoTooltip,
    ErrorTooltip,
    SuccessTooltip,
    WarningTooltip,
    tooltipContentVariants,
    tooltipArrowVariants,
};
