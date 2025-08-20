import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { Clock, ChevronUp, ChevronDown, X } from "lucide-react";

const timePickerVariants = cva(
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

const timePickerTriggerVariants = cva(
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

const timePickerDropdownVariants = cva(
    "absolute z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4",
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

const timeUnitVariants = cva(
    "flex flex-col items-center space-y-2",
    {
        variants: {
            size: {
                sm: "min-w-[60px]",
                md: "min-w-[80px]",
                lg: "min-w-[100px]",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

const timeUnitButtonVariants = cva(
    "inline-flex items-center justify-center rounded-md p-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-slate-100",
    {
        variants: {
            size: {
                sm: "h-6 w-6",
                md: "h-8 w-8",
                lg: "h-10 w-10",
            },
            app: {
                codai: "focus:ring-blue-300 text-blue-600 hover:bg-blue-50",
                memorai: "focus:ring-purple-300 text-purple-600 hover:bg-purple-50",
                bancai: "focus:ring-green-300 text-green-600 hover:bg-green-50",
                romai: "focus:ring-red-300 text-red-600 hover:bg-red-50",
                ajutai: "focus:ring-orange-300 text-orange-600 hover:bg-orange-50",
                controlai: "focus:ring-indigo-300 text-indigo-600 hover:bg-indigo-50",
                studiai: "focus:ring-teal-300 text-teal-600 hover:bg-teal-50",
                sociai: "focus:ring-pink-300 text-pink-600 hover:bg-pink-50",
                cumparai: "focus:ring-cyan-300 text-cyan-600 hover:bg-cyan-50",
                donai: "focus:ring-emerald-300 text-emerald-600 hover:bg-emerald-50",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

const timeUnitInputVariants = cva(
    "text-center border-0 bg-transparent p-1 font-mono text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
    {
        variants: {
            size: {
                sm: "text-sm w-8",
                md: "text-lg w-12",
                lg: "text-xl w-16",
            },
            app: {
                codai: "focus:ring-blue-300",
                memorai: "focus:ring-purple-300",
                bancai: "focus:ring-green-300",
                romai: "focus:ring-red-300",
                ajutai: "focus:ring-orange-300",
                controlai: "focus:ring-indigo-300",
                studiai: "focus:ring-teal-300",
                sociai: "focus:ring-pink-300",
                cumparai: "focus:ring-cyan-300",
                donai: "focus:ring-emerald-300",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

// Time formatting utilities
const formatTime = (
    hours: number,
    minutes: number,
    seconds: number = 0,
    format: "12h" | "24h" = "12h"
): string => {
    if (format === "24h") {
        const h = hours.toString().padStart(2, "0");
        const m = minutes.toString().padStart(2, "0");
        const s = seconds.toString().padStart(2, "0");
        return seconds > 0 ? `${h}:${m}:${s}` : `${h}:${m}`;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const h = displayHours.toString();
    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");

    return seconds > 0 ? `${h}:${m}:${s} ${period}` : `${h}:${m} ${period}`;
};

const parseTime = (timeString: string): { hours: number; minutes: number; seconds: number } | null => {
    if (!timeString) return null;

    try {
        // Handle 24h format (HH:mm or HH:mm:ss)
        const time24Regex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
        const match24 = timeString.match(time24Regex);

        if (match24) {
            const hours = parseInt(match24[1], 10);
            const minutes = parseInt(match24[2], 10);
            const seconds = match24[3] ? parseInt(match24[3], 10) : 0;

            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
                return { hours, minutes, seconds };
            }
        }

        // Handle 12h format (H:mm AM/PM or H:mm:ss AM/PM)
        const time12Regex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i;
        const match12 = timeString.match(time12Regex);

        if (match12) {
            let hours = parseInt(match12[1], 10);
            const minutes = parseInt(match12[2], 10);
            const seconds = match12[3] ? parseInt(match12[3], 10) : 0;
            const period = match12[4].toUpperCase();

            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
                return { hours, minutes, seconds };
            }
        }

        return null;
    } catch {
        return null;
    }
};

export interface TimePickerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof timePickerVariants> {
    app?: AppName;
    value?: { hours: number; minutes: number; seconds?: number } | null;
    onSelect?: (time: { hours: number; minutes: number; seconds: number } | null) => void;
    placeholder?: string;
    format?: "12h" | "24h";
    disabled?: boolean;
    showSeconds?: boolean;
    minuteStep?: number;
    hourStep?: number;
    required?: boolean;
    error?: boolean;
    success?: boolean;
    showClearButton?: boolean;
    dropdownPosition?: "bottom" | "top";
    closeOnSelect?: boolean;
}

export interface TimeUnitProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    size?: "sm" | "md" | "lg";
    app?: AppName;
    disabled?: boolean;
}

// TimeUnit Component
const TimeUnit = React.forwardRef<HTMLDivElement, TimeUnitProps>(
    (
        {
            label,
            value,
            min,
            max,
            step = 1,
            onChange,
            size = "md",
            app,
            disabled = false,
        },
        ref
    ) => {
        const [inputValue, setInputValue] = React.useState(value.toString().padStart(2, "0"));

        React.useEffect(() => {
            setInputValue(value.toString().padStart(2, "0"));
        }, [value]);

        const increment = () => {
            const newValue = Math.min(max, value + step);
            onChange(newValue);
        };

        const decrement = () => {
            const newValue = Math.max(min, value - step);
            onChange(newValue);
        };

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = event.target.value;
            setInputValue(rawValue);

            const numValue = parseInt(rawValue, 10);
            if (!isNaN(numValue) && numValue >= min && numValue <= max) {
                onChange(numValue);
            }
        };

        const handleInputBlur = () => {
            setInputValue(value.toString().padStart(2, "0"));
        };

        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === "ArrowUp") {
                event.preventDefault();
                increment();
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                decrement();
            }
        };

        return (
            <div ref={ref} className={cn(timeUnitVariants({ size }))}>
                <button
                    type="button"
                    onClick={increment}
                    disabled={disabled || value >= max}
                    className={cn(timeUnitButtonVariants({ size, app }))}
                    tabIndex={-1}
                >
                    <ChevronUp className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        className={cn(timeUnitInputVariants({ size, app }))}
                        maxLength={2}
                    />
                    <span className="text-xs text-slate-500 mt-1">{label}</span>
                </div>

                <button
                    type="button"
                    onClick={decrement}
                    disabled={disabled || value <= min}
                    className={cn(timeUnitButtonVariants({ size, app }))}
                    tabIndex={-1}
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>
        );
    }
);

TimeUnit.displayName = "TimeUnit";

// Main TimePicker Component
const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
    (
        {
            className,
            variant,
            size,
            app,
            value,
            onSelect,
            placeholder = "Select time",
            format = "12h",
            disabled = false,
            showSeconds = false,
            minuteStep = 1,
            hourStep = 1,
            required = false,
            error = false,
            success = false,
            showClearButton = true,
            dropdownPosition = "bottom",
            closeOnSelect = false,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [tempTime, setTempTime] = React.useState<{
            hours: number;
            minutes: number;
            seconds: number;
        }>({
            hours: value?.hours ?? 12,
            minutes: value?.minutes ?? 0,
            seconds: value?.seconds ?? 0,
        });

        const dropdownRef = React.useRef<HTMLDivElement>(null);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        // Update temp time when value changes
        React.useEffect(() => {
            if (value) {
                setTempTime({
                    hours: value.hours,
                    minutes: value.minutes,
                    seconds: value.seconds ?? 0,
                });
            }
        }, [value]);

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

        const handleTimeChange = (newTime: Partial<typeof tempTime>) => {
            const updatedTime = { ...tempTime, ...newTime };
            setTempTime(updatedTime);
            onSelect?.(updatedTime);

            if (closeOnSelect) {
                setIsOpen(false);
            }
        };

        const handleClear = (event: React.MouseEvent) => {
            event.stopPropagation();
            onSelect?.(null);
            setIsOpen(false);
        };

        const handleTriggerClick = () => {
            if (disabled) return;
            setIsOpen(!isOpen);
        };

        const displayValue = value
            ? formatTime(value.hours, value.minutes, showSeconds ? value.seconds : 0, format)
            : placeholder;

        const hasValue = !!value;
        const state = error ? "error" : success ? "success" : "default";

        return (
            <div
                ref={ref}
                className={cn(timePickerVariants({ variant, size, app }), className)}
                {...props}
            >
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={handleTriggerClick}
                    disabled={disabled}
                    className={cn(
                        timePickerTriggerVariants({ variant, size, state, app }),
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
                        isOpen && app === "donai" && "ring-emerald-300"
                    )}
                >
                    <span className={cn(!hasValue && "text-slate-500")}>
                        {displayValue}
                    </span>
                    <div className="flex items-center space-x-1">
                        {showClearButton && hasValue && (
                            <button
                                onClick={handleClear}
                                className="rounded-full p-0.5 hover:bg-slate-100 focus:outline-none focus:bg-slate-100"
                                tabIndex={-1}
                            >
                                <X className="h-3 w-3 text-slate-400" />
                            </button>
                        )}
                        <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                </button>

                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className={cn(
                            timePickerDropdownVariants({ position: dropdownPosition, app })
                        )}
                    >
                        <div className="flex items-center justify-center space-x-4">
                            {/* Hours */}
                            <TimeUnit
                                label="Hour"
                                value={tempTime.hours}
                                min={format === "12h" ? 1 : 0}
                                max={format === "12h" ? 12 : 23}
                                step={hourStep}
                                onChange={(hours) => handleTimeChange({ hours })}
                                size={size}
                                app={app}
                                disabled={disabled}
                            />

                            <div className="text-xl font-bold text-slate-400">:</div>

                            {/* Minutes */}
                            <TimeUnit
                                label="Min"
                                value={tempTime.minutes}
                                min={0}
                                max={59}
                                step={minuteStep}
                                onChange={(minutes) => handleTimeChange({ minutes })}
                                size={size}
                                app={app}
                                disabled={disabled}
                            />

                            {/* Seconds */}
                            {showSeconds && (
                                <>
                                    <div className="text-xl font-bold text-slate-400">:</div>
                                    <TimeUnit
                                        label="Sec"
                                        value={tempTime.seconds}
                                        min={0}
                                        max={59}
                                        step={1}
                                        onChange={(seconds) => handleTimeChange({ seconds })}
                                        size={size}
                                        app={app}
                                        disabled={disabled}
                                    />
                                </>
                            )}

                            {/* AM/PM for 12h format */}
                            {format === "12h" && (
                                <div className="flex flex-col space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newHours = tempTime.hours >= 12 ? tempTime.hours - 12 : tempTime.hours + 12;
                                            handleTimeChange({ hours: newHours });
                                        }}
                                        disabled={disabled}
                                        className={cn(
                                            "px-3 py-1 text-sm font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                                            tempTime.hours < 12
                                                ? "bg-slate-100 border-slate-300 text-slate-700"
                                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                                            app === "codai" && "focus:ring-blue-300",
                                            app === "memorai" && "focus:ring-purple-300",
                                            app === "bancai" && "focus:ring-green-300",
                                            app === "romai" && "focus:ring-red-300",
                                            app === "ajutai" && "focus:ring-orange-300",
                                            app === "controlai" && "focus:ring-indigo-300",
                                            app === "studiai" && "focus:ring-teal-300",
                                            app === "sociai" && "focus:ring-pink-300",
                                            app === "cumparai" && "focus:ring-cyan-300",
                                            app === "donai" && "focus:ring-emerald-300"
                                        )}
                                    >
                                        AM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newHours = tempTime.hours < 12 ? tempTime.hours + 12 : tempTime.hours - 12;
                                            handleTimeChange({ hours: newHours });
                                        }}
                                        disabled={disabled}
                                        className={cn(
                                            "px-3 py-1 text-sm font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                                            tempTime.hours >= 12
                                                ? "bg-slate-100 border-slate-300 text-slate-700"
                                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                                            app === "codai" && "focus:ring-blue-300",
                                            app === "memorai" && "focus:ring-purple-300",
                                            app === "bancai" && "focus:ring-green-300",
                                            app === "romai" && "focus:ring-red-300",
                                            app === "ajutai" && "focus:ring-orange-300",
                                            app === "controlai" && "focus:ring-indigo-300",
                                            app === "studiai" && "focus:ring-teal-300",
                                            app === "sociai" && "focus:ring-pink-300",
                                            app === "cumparai" && "focus:ring-cyan-300",
                                            app === "donai" && "focus:ring-emerald-300"
                                        )}
                                    >
                                        PM
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-700 focus:outline-none focus:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect?.(tempTime);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    app === "codai" && "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
                                    app === "memorai" && "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300",
                                    app === "bancai" && "bg-green-600 hover:bg-green-700 focus:ring-green-300",
                                    app === "romai" && "bg-red-600 hover:bg-red-700 focus:ring-red-300",
                                    app === "ajutai" && "bg-orange-600 hover:bg-orange-700 focus:ring-orange-300",
                                    app === "controlai" && "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300",
                                    app === "studiai" && "bg-teal-600 hover:bg-teal-700 focus:ring-teal-300",
                                    app === "sociai" && "bg-pink-600 hover:bg-pink-700 focus:ring-pink-300",
                                    app === "cumparai" && "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-300",
                                    (!app || app === "donai") && "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300"
                                )}
                            >
                                Set Time
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

TimePicker.displayName = "TimePicker";

// Form TimePicker - With label and error message
export interface FormTimePickerProps extends TimePickerProps {
    label?: string;
    description?: string;
    errorMessage?: string;
    successMessage?: string;
}

const FormTimePicker = React.forwardRef<HTMLDivElement, FormTimePickerProps>(
    (
        {
            label,
            description,
            errorMessage,
            successMessage,
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
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}

                <TimePicker
                    ref={ref}
                    error={hasError}
                    success={hasSuccess}
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

FormTimePicker.displayName = "FormTimePicker";

export {
    TimePicker,
    TimeUnit,
    FormTimePicker,
    timePickerVariants,
    timePickerTriggerVariants,
    timePickerDropdownVariants,
    timeUnitVariants,
    timeUnitButtonVariants,
    timeUnitInputVariants,
    formatTime,
    parseTime,
};
