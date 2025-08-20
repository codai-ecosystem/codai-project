import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { Calendar } from "./Calendar";

const datePickerVariants = cva(
    "relative inline-block w-full",
    {
        variants: {
            variant: {
                default: "",
                outline: "",
                filled: "",
            },
            size: {
                sm: "",
                md: "",
                lg: "",
            },
            app: {
                codai: "",
                memorai: "",
                bancai: "",
                romai: "",
                ajutai: "",
                controlai: "",
                studiai: "",
                sociai: "",
                cumparai: "",
                donai: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

const datePickerTriggerVariants = cva(
    "flex items-center justify-between w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-slate-200 hover:border-slate-300",
                outline: "border-slate-300 hover:border-slate-400",
                filled: "border-transparent bg-slate-50 hover:bg-slate-100",
            },
            size: {
                sm: "px-2 py-1 text-xs",
                md: "px-3 py-2 text-sm",
                lg: "px-4 py-3 text-base",
            },
            state: {
                default: "",
                error: "border-red-300 focus:ring-red-300",
                success: "border-green-300 focus:ring-green-300",
            },
            app: {
                codai: "focus:ring-blue-300 focus:border-blue-400",
                memorai: "focus:ring-purple-300 focus:border-purple-400",
                bancai: "focus:ring-green-300 focus:border-green-400",
                romai: "focus:ring-red-300 focus:border-red-400",
                ajutai: "focus:ring-orange-300 focus:border-orange-400",
                controlai: "focus:ring-indigo-300 focus:border-indigo-400",
                studiai: "focus:ring-teal-300 focus:border-teal-400",
                sociai: "focus:ring-pink-300 focus:border-pink-400",
                cumparai: "focus:ring-cyan-300 focus:border-cyan-400",
                donai: "focus:ring-emerald-300 focus:border-emerald-400",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            state: "default",
        },
    }
);

const datePickerDropdownVariants = cva(
    "absolute z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg",
    {
        variants: {
            position: {
                bottom: "top-full",
                top: "bottom-full",
            },
            app: {
                codai: "border-blue-200 shadow-blue-100/50",
                memorai: "border-purple-200 shadow-purple-100/50",
                bancai: "border-green-200 shadow-green-100/50",
                romai: "border-red-200 shadow-red-100/50",
                ajutai: "border-orange-200 shadow-orange-100/50",
                controlai: "border-indigo-200 shadow-indigo-100/50",
                studiai: "border-teal-200 shadow-teal-100/50",
                sociai: "border-pink-200 shadow-pink-100/50",
                cumparai: "border-cyan-200 shadow-cyan-100/50",
                donai: "border-emerald-200 shadow-emerald-100/50",
            },
        },
        defaultVariants: {
            position: "bottom",
        },
    }
);

// Date formatting utilities
const formatDate = (date: Date | null, format: string = "MMM dd, yyyy"): string => {
    if (!date) return "";

    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
        case "MM/dd/yyyy":
            return date.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            });
        case "dd/MM/yyyy":
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        case "yyyy-MM-dd":
            return date.toISOString().split('T')[0];
        case "MMM dd, yyyy":
        default:
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            });
    }
};

const parseDate = (dateString: string, format: string = "MMM dd, yyyy"): Date | null => {
    if (!dateString) return null;

    try {
        // Handle ISO format
        if (format === "yyyy-MM-dd") {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        }

        // Handle other formats - simplified parsing
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};

export interface DatePickerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof datePickerVariants> {
    app?: AppName;
    value?: Date | null;
    onSelect?: (date: Date | null) => void;
    placeholder?: string;
    format?: string;
    disabled?: boolean | ((date: Date) => boolean);
    minDate?: Date;
    maxDate?: Date;
    showClearButton?: boolean;
    required?: boolean;
    error?: boolean;
    success?: boolean;
    calendarProps?: React.ComponentProps<typeof Calendar>;
    dropdownPosition?: "bottom" | "top";
    closeOnSelect?: boolean;
}

export interface DatePickerTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof datePickerTriggerVariants> {
    app?: AppName;
    isOpen?: boolean;
    hasValue?: boolean;
    error?: boolean;
    success?: boolean;
}

export interface DatePickerInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    app?: AppName;
    onDateChange?: (date: Date | null) => void;
    format?: string;
}

// DatePickerTrigger Component
const DatePickerTrigger = React.forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
    (
        {
            className,
            variant,
            size,
            app,
            isOpen,
            hasValue,
            error,
            success,
            children,
            ...props
        },
        ref
    ) => {
        const state = error ? "error" : success ? "success" : "default";

        return (
            <button
                ref={ref}
                className={cn(
                    datePickerTriggerVariants({ variant, size, state, app }),
                    isOpen && "ring-2 ring-offset-2",
                    isOpen && app === "codai" && "ring-blue-300",
                    isOpen && app === "memorai" && "ring-purple-300",
                    isOpen && app === "bancai" && "ring-green-300",
                    isOpen && app === "romai" && "ring-red-300",
                    isOpen && app === "ajutai" && "ring-orange-300",
                    isOpen && app === "controlai" && "ring-indigo-300",
                    isOpen && app === "studiai" && "ring-teal-300",
                    isOpen && app === "sociai" && "ring-pink-300",
                    isOpen && app === "cumparai" && "ring-cyan-300",
                    isOpen && app === "donai" && "ring-emerald-300",
                    className
                )}
                {...props}
            >
                <span className={cn(!hasValue && "text-slate-500")}>
                    {children}
                </span>
                <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-slate-400 transition-transform",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </div>
            </button>
        );
    }
);

DatePickerTrigger.displayName = "DatePickerTrigger";

// DatePickerInput Component (for manual input)
const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
    (
        {
            className,
            app,
            onDateChange,
            format = "MMM dd, yyyy",
            value,
            onChange,
            ...props
        },
        ref
    ) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const dateValue = parseDate(event.target.value, format);
            onDateChange?.(dateValue);
            onChange?.(event);
        };

        return (
            <input
                ref={ref}
                type="text"
                className={cn(
                    "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    app === "codai" && "focus:ring-blue-300 focus:border-blue-400",
                    app === "memorai" && "focus:ring-purple-300 focus:border-purple-400",
                    app === "bancai" && "focus:ring-green-300 focus:border-green-400",
                    app === "romai" && "focus:ring-red-300 focus:border-red-400",
                    app === "ajutai" && "focus:ring-orange-300 focus:border-orange-400",
                    app === "controlai" && "focus:ring-indigo-300 focus:border-indigo-400",
                    app === "studiai" && "focus:ring-teal-300 focus:border-teal-400",
                    app === "sociai" && "focus:ring-pink-300 focus:border-pink-400",
                    app === "cumparai" && "focus:ring-cyan-300 focus:border-cyan-400",
                    app === "donai" && "focus:ring-emerald-300 focus:border-emerald-400",
                    className
                )}
                value={value || ""}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

DatePickerInput.displayName = "DatePickerInput";

// Main DatePicker Component
const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
    (
        {
            className,
            variant,
            size,
            app,
            value,
            onSelect,
            placeholder = "Select date",
            format = "MMM dd, yyyy",
            disabled,
            minDate,
            maxDate,
            showClearButton = true,
            required = false,
            error = false,
            success = false,
            calendarProps,
            dropdownPosition = "bottom",
            closeOnSelect = true,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [inputValue, setInputValue] = React.useState("");
        const [tempValue, setTempValue] = React.useState<Date | null>(value || null);
        const dropdownRef = React.useRef<HTMLDivElement>(null);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        // Update temp value when value changes
        React.useEffect(() => {
            setTempValue(value || null);
            setInputValue(value ? formatDate(value, format) : "");
        }, [value, format]);

        // Close dropdown when clicking outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target as Node) &&
                    triggerRef.current &&
                    !triggerRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Handle escape key
        React.useEffect(() => {
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener("keydown", handleEscape);
                return () => document.removeEventListener("keydown", handleEscape);
            }
        }, [isOpen]);

        const handleDateSelect = (date: Date | null) => {
            setTempValue(date);
            setInputValue(date ? formatDate(date, format) : "");
            onSelect?.(date);

            if (closeOnSelect) {
                setIsOpen(false);
            }
        };

        const handleClear = (event: React.MouseEvent) => {
            event.stopPropagation();
            handleDateSelect(null);
        };

        const handleTriggerClick = () => {
            if (typeof disabled === "boolean" && disabled) return;
            setIsOpen(!isOpen);
        };

        const isDateDisabled = (date: Date): boolean => {
            if (typeof disabled === "function") return disabled(date);
            if (typeof disabled === "boolean") return disabled;
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
        };

        const displayValue = tempValue ? formatDate(tempValue, format) : placeholder;
        const hasValue = !!tempValue;

        return (
            <div
                ref={ref}
                className={cn(datePickerVariants({ variant, size, app }), className)}
                {...props}
            >
                <DatePickerTrigger
                    ref={triggerRef}
                    variant={variant}
                    size={size}
                    app={app}
                    isOpen={isOpen}
                    hasValue={hasValue}
                    error={error}
                    success={success}
                    disabled={typeof disabled === "boolean" ? disabled : false}
                    onClick={handleTriggerClick}
                >
                    {displayValue}
                    {showClearButton && hasValue && (
                        <button
                            onClick={handleClear}
                            className="ml-1 rounded-full p-0.5 hover:bg-slate-100 focus:outline-none focus:bg-slate-100"
                            tabIndex={-1}
                        >
                            <X className="h-3 w-3 text-slate-400" />
                        </button>
                    )}
                </DatePickerTrigger>

                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className={cn(
                            datePickerDropdownVariants({ position: dropdownPosition, app })
                        )}
                    >
                        <Calendar
                            selected={tempValue}
                            onSelect={handleDateSelect}
                            disabled={isDateDisabled}
                            minDate={minDate}
                            maxDate={maxDate}
                            app={app}
                            initialFocus
                            {...calendarProps}
                        />
                    </div>
                )}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";

// DateTimePicker - Extension for date and time selection
export interface DateTimePickerProps extends DatePickerProps {
    showTime?: boolean;
    timeFormat?: "12h" | "24h";
    minuteStep?: number;
    showSeconds?: boolean;
}

const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
    (
        {
            showTime = true,
            timeFormat = "12h",
            minuteStep = 15,
            showSeconds = false,
            format = "MMM dd, yyyy HH:mm",
            ...props
        },
        ref
    ) => {
        // For now, this is a simplified version that extends DatePicker
        // A full implementation would include time selection UI
        return (
            <DatePicker
                ref={ref}
                format={format}
                closeOnSelect={false}
                {...props}
            />
        );
    }
);

DateTimePicker.displayName = "DateTimePicker";

// Form DatePicker - With label and error message
export interface FormDatePickerProps extends DatePickerProps {
    label?: string;
    description?: string;
    errorMessage?: string;
    successMessage?: string;
    required?: boolean;
}

const FormDatePicker = React.forwardRef<HTMLDivElement, FormDatePickerProps>(
    (
        {
            label,
            description,
            errorMessage,
            successMessage,
            required,
            error,
            success,
            className,
            ...props
        },
        ref
    ) => {
        const hasError = error || !!errorMessage;
        const hasSuccess = success || !!successMessage;

        return (
            <div className={cn("space-y-2", className)}>
                {label && (
                    <label className="text-sm font-medium text-slate-700">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}

                <DatePicker
                    ref={ref}
                    error={hasError}
                    success={hasSuccess}
                    required={required}
                    {...props}
                />

                {errorMessage && (
                    <p className="text-sm text-red-600">{errorMessage}</p>
                )}

                {successMessage && !hasError && (
                    <p className="text-sm text-green-600">{successMessage}</p>
                )}
            </div>
        );
    }
);

FormDatePicker.displayName = "FormDatePicker";

export {
    DatePicker,
    DatePickerTrigger,
    DatePickerInput,
    DateTimePicker,
    FormDatePicker,
    datePickerVariants,
    datePickerTriggerVariants,
    datePickerDropdownVariants,
    formatDate,
    parseDate,
};
