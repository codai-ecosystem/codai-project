import * as React from "react";
import * as ReactDOM from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { X, AlertTriangle, CheckCircle, XCircle, Info, AlertCircle } from "lucide-react";

const alertDialogOverlayVariants = cva(
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

const alertDialogContentVariants = cva(
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg transition-all duration-200 rounded-lg",
    {
        variants: {
            size: {
                sm: "max-w-sm",
                md: "max-w-lg",
                lg: "max-w-2xl",
                xl: "max-w-4xl",
                full: "max-w-[95vw] max-h-[95vh]",
            },
            variant: {
                default: "border-slate-200",
                destructive: "border-red-200 bg-red-50",
                warning: "border-orange-200 bg-orange-50",
                success: "border-green-200 bg-green-50",
                info: "border-blue-200 bg-blue-50",
            },
            state: {
                open: "animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]",
                closed: "animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-[48%]",
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
            size: "md",
            variant: "default",
            state: "closed",
        },
    }
);

const alertDialogActionVariants = cva(
    "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-slate-900 text-white hover:bg-slate-800",
                destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
                warning: "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500",
                success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
                outline: "border border-slate-200 bg-transparent hover:bg-slate-50",
                ghost: "hover:bg-slate-100",
            },
            app: {
                codai: "data-[variant=default]:bg-blue-600 data-[variant=default]:hover:bg-blue-700 focus:ring-blue-500",
                memorai: "data-[variant=default]:bg-purple-600 data-[variant=default]:hover:bg-purple-700 focus:ring-purple-500",
                bancai: "data-[variant=default]:bg-green-600 data-[variant=default]:hover:bg-green-700 focus:ring-green-500",
                romai: "data-[variant=default]:bg-red-600 data-[variant=default]:hover:bg-red-700 focus:ring-red-500",
                ajutai: "data-[variant=default]:bg-orange-600 data-[variant=default]:hover:bg-orange-700 focus:ring-orange-500",
                controlai: "data-[variant=default]:bg-indigo-600 data-[variant=default]:hover:bg-indigo-700 focus:ring-indigo-500",
                studiai: "data-[variant=default]:bg-teal-600 data-[variant=default]:hover:bg-teal-700 focus:ring-teal-500",
                sociai: "data-[variant=default]:bg-pink-600 data-[variant=default]:hover:bg-pink-700 focus:ring-pink-500",
                cumparai: "data-[variant=default]:bg-cyan-600 data-[variant=default]:hover:bg-cyan-700 focus:ring-cyan-500",
                donai: "data-[variant=default]:bg-emerald-600 data-[variant=default]:hover:bg-emerald-700 focus:ring-emerald-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface AlertDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export interface AlertDialogContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertDialogContentVariants> {
    app?: AppName;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
}

export interface AlertDialogActionProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof alertDialogActionVariants> {
    app?: AppName;
}

// Context for managing alert dialog state
const AlertDialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
} | null>(null);

const useAlertDialog = () => {
    const context = React.useContext(AlertDialogContext);
    if (!context) {
        throw new Error("useAlertDialog must be used within an AlertDialog");
    }
    return context;
};

// Main AlertDialog component
const AlertDialog: React.FC<AlertDialogProps> = ({
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
        <AlertDialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </AlertDialogContext.Provider>
    );
};

// Trigger component
export interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
    ({ children, asChild = false, onClick, ...props }, ref) => {
        const { onOpenChange } = useAlertDialog();

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

AlertDialogTrigger.displayName = "AlertDialogTrigger";

// Portal for rendering outside DOM tree
const AlertDialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
const AlertDialogOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { open } = useAlertDialog();

    return (
        <div
            ref={ref}
            className={cn(alertDialogOverlayVariants({ state: open ? "open" : "closed", className }))}
            {...props}
        />
    );
});

AlertDialogOverlay.displayName = "AlertDialogOverlay";

// Content component
const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
    (
        {
            className,
            children,
            size,
            variant,
            app,
            onEscapeKeyDown,
            onPointerDownOutside,
            ...props
        },
        ref
    ) => {
        const { open, onOpenChange } = useAlertDialog();

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
        const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onPointerDownOutside?.(event.nativeEvent);
                onOpenChange(false);
            }
        };

        if (!open) {
            return null;
        }

        return (
            <AlertDialogPortal>
                <AlertDialogOverlay />
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onPointerDown={handlePointerDown}
                >
                    <div
                        ref={ref}
                        className={cn(
                            alertDialogContentVariants({
                                size,
                                variant,
                                app,
                                state: open ? "open" : "closed",
                                className,
                            })
                        )}
                        role="alertdialog"
                        aria-modal="true"
                        {...props}
                    >
                        {children}
                    </div>
                </div>
            </AlertDialogPortal>
        );
    }
);

AlertDialogContent.displayName = "AlertDialogContent";

// Header component
const AlertDialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
    />
);

AlertDialogHeader.displayName = "AlertDialogHeader";

// Footer component
const AlertDialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
);

AlertDialogFooter.displayName = "AlertDialogFooter";

// Title component
const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold text-slate-900", className)}
        {...props}
    />
));

AlertDialogTitle.displayName = "AlertDialogTitle";

// Description component
const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-600", className)}
        {...props}
    />
));

AlertDialogDescription.displayName = "AlertDialogDescription";

// Action component
const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
    ({ className, variant, app, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(alertDialogActionVariants({ variant, app, className }))}
                data-variant={variant}
                {...props}
            />
        );
    }
);

AlertDialogAction.displayName = "AlertDialogAction";

// Cancel component
const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
    ({ className, onClick, ...props }, ref) => {
        const { onOpenChange } = useAlertDialog();

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(false);
            onClick?.(event);
        };

        return (
            <AlertDialogAction
                ref={ref}
                variant="outline"
                className={cn("mt-2 sm:mt-0", className)}
                onClick={handleClick}
                {...props}
            />
        );
    }
);

AlertDialogCancel.displayName = "AlertDialogCancel";

// Predefined confirmation dialog
export interface ConfirmationDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "warning";
    app?: AppName;
    onConfirm?: () => void;
    onCancel?: () => void;
    icon?: React.ReactNode;
    loading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    app,
    onConfirm,
    onCancel,
    icon,
    loading = false,
}) => {
    const getIcon = () => {
        if (icon) return icon;

        switch (variant) {
            case "destructive":
                return <XCircle className="w-6 h-6 text-red-600" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-orange-600" />;
            default:
                return <AlertCircle className="w-6 h-6 text-blue-600" />;
        }
    };

    const handleConfirm = () => {
        onConfirm?.();
        onOpenChange?.(false);
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange?.(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent variant={variant} app={app}>
                <AlertDialogHeader>
                    <div className="flex items-center space-x-3">
                        {getIcon()}
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </div>
                    {description && (
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={loading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={variant}
                        app={app}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// Success dialog
export interface SuccessDialogProps extends Omit<ConfirmationDialogProps, 'variant' | 'icon'> {
    successText?: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
    confirmText = "OK",
    ...props
}) => (
    <ConfirmationDialog
        {...props}
        variant="default"
        confirmText={confirmText}
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
    />
);

// Error dialog
export interface ErrorDialogProps extends Omit<ConfirmationDialogProps, 'variant' | 'icon'> {
    errorText?: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
    confirmText = "OK",
    ...props
}) => (
    <ConfirmationDialog
        {...props}
        variant="destructive"
        confirmText={confirmText}
        icon={<XCircle className="w-6 h-6 text-red-600" />}
    />
);

// Info dialog
export interface InfoDialogProps extends Omit<ConfirmationDialogProps, 'variant' | 'icon'> { }

const InfoDialog: React.FC<InfoDialogProps> = ({
    confirmText = "OK",
    ...props
}) => (
    <ConfirmationDialog
        {...props}
        variant="default"
        confirmText={confirmText}
        icon={<Info className="w-6 h-6 text-blue-600" />}
    />
);

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    ConfirmationDialog,
    SuccessDialog,
    ErrorDialog,
    InfoDialog,
    alertDialogOverlayVariants,
    alertDialogContentVariants,
    alertDialogActionVariants,
};
