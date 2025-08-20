import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const calendarVariants = cva(
    "p-3 bg-white border border-slate-200 rounded-lg shadow-sm",
    {
        variants: {
            variant: {
                default: "",
                compact: "p-2",
                minimal: "border-0 shadow-none p-0",
            },
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
            app: {
                codai: "border-blue-200 focus-within:border-blue-400",
                memorai: "border-purple-200 focus-within:border-purple-400",
                bancai: "border-green-200 focus-within:border-green-400",
                romai: "border-red-200 focus-within:border-red-400",
                ajutai: "border-orange-200 focus-within:border-orange-400",
                controlai: "border-indigo-200 focus-within:border-indigo-400",
                studiai: "border-teal-200 focus-within:border-teal-400",
                sociai: "border-pink-200 focus-within:border-pink-400",
                cumparai: "border-cyan-200 focus-within:border-cyan-400",
                donai: "border-emerald-200 focus-within:border-emerald-400",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

const calendarHeaderVariants = cva(
    "flex items-center justify-between mb-4",
    {
        variants: {
            variant: {
                default: "",
                compact: "mb-2",
                minimal: "mb-3",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const calendarButtonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                default: "hover:bg-slate-100 focus:ring-slate-300",
                ghost: "hover:bg-slate-100 focus:ring-slate-300",
            },
            size: {
                sm: "h-6 w-6",
                md: "h-8 w-8",
                lg: "h-10 w-10",
            },
            app: {
                codai: "hover:bg-blue-50 focus:ring-blue-300 text-blue-600",
                memorai: "hover:bg-purple-50 focus:ring-purple-300 text-purple-600",
                bancai: "hover:bg-green-50 focus:ring-green-300 text-green-600",
                romai: "hover:bg-red-50 focus:ring-red-300 text-red-600",
                ajutai: "hover:bg-orange-50 focus:ring-orange-300 text-orange-600",
                controlai: "hover:bg-indigo-50 focus:ring-indigo-300 text-indigo-600",
                studiai: "hover:bg-teal-50 focus:ring-teal-300 text-teal-600",
                sociai: "hover:bg-pink-50 focus:ring-pink-300 text-pink-600",
                cumparai: "hover:bg-cyan-50 focus:ring-cyan-300 text-cyan-600",
                donai: "hover:bg-emerald-50 focus:ring-emerald-300 text-emerald-600",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

const calendarDayVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
    {
        variants: {
            variant: {
                default: "hover:bg-slate-100",
                selected: "text-white",
                today: "bg-slate-900 text-white hover:bg-slate-800",
                outside: "text-slate-400 opacity-50 hover:bg-slate-50",
                disabled: "text-slate-300 cursor-not-allowed",
                range: "text-white",
                rangeStart: "text-white rounded-r-none",
                rangeEnd: "text-white rounded-l-none",
                rangeMiddle: "text-white rounded-none",
            },
            size: {
                sm: "h-6 w-6 text-xs",
                md: "h-8 w-8 text-sm",
                lg: "h-10 w-10 text-base",
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
        compoundVariants: [
            {
                variant: "selected",
                app: "codai",
                className: "bg-blue-600 hover:bg-blue-700",
            },
            {
                variant: "selected",
                app: "memorai",
                className: "bg-purple-600 hover:bg-purple-700",
            },
            {
                variant: "selected",
                app: "bancai",
                className: "bg-green-600 hover:bg-green-700",
            },
            {
                variant: "selected",
                app: "romai",
                className: "bg-red-600 hover:bg-red-700",
            },
            {
                variant: "selected",
                app: "ajutai",
                className: "bg-orange-600 hover:bg-orange-700",
            },
            {
                variant: "selected",
                app: "controlai",
                className: "bg-indigo-600 hover:bg-indigo-700",
            },
            {
                variant: "selected",
                app: "studiai",
                className: "bg-teal-600 hover:bg-teal-700",
            },
            {
                variant: "selected",
                app: "sociai",
                className: "bg-pink-600 hover:bg-pink-700",
            },
            {
                variant: "selected",
                app: "cumparai",
                className: "bg-cyan-600 hover:bg-cyan-700",
            },
            {
                variant: "selected",
                app: "donai",
                className: "bg-emerald-600 hover:bg-emerald-700",
            },
            {
                variant: "range",
                app: "codai",
                className: "bg-blue-100 text-blue-900 hover:bg-blue-200",
            },
            {
                variant: "range",
                app: "memorai",
                className: "bg-purple-100 text-purple-900 hover:bg-purple-200",
            },
            {
                variant: "range",
                app: "bancai",
                className: "bg-green-100 text-green-900 hover:bg-green-200",
            },
            {
                variant: "range",
                app: "romai",
                className: "bg-red-100 text-red-900 hover:bg-red-200",
            },
            {
                variant: "range",
                app: "ajutai",
                className: "bg-orange-100 text-orange-900 hover:bg-orange-200",
            },
            {
                variant: "range",
                app: "controlai",
                className: "bg-indigo-100 text-indigo-900 hover:bg-indigo-200",
            },
            {
                variant: "range",
                app: "studiai",
                className: "bg-teal-100 text-teal-900 hover:bg-teal-200",
            },
            {
                variant: "range",
                app: "sociai",
                className: "bg-pink-100 text-pink-900 hover:bg-pink-200",
            },
            {
                variant: "range",
                app: "cumparai",
                className: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",
            },
            {
                variant: "range",
                app: "donai",
                className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "codai",
                className: "bg-blue-600 hover:bg-blue-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "memorai",
                className: "bg-purple-600 hover:bg-purple-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "bancai",
                className: "bg-green-600 hover:bg-green-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "romai",
                className: "bg-red-600 hover:bg-red-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "ajutai",
                className: "bg-orange-600 hover:bg-orange-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "controlai",
                className: "bg-indigo-600 hover:bg-indigo-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "studiai",
                className: "bg-teal-600 hover:bg-teal-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "sociai",
                className: "bg-pink-600 hover:bg-pink-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "cumparai",
                className: "bg-cyan-600 hover:bg-cyan-700",
            },
            {
                variant: ["rangeStart", "rangeEnd"],
                app: "donai",
                className: "bg-emerald-600 hover:bg-emerald-700",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

// Date utilities
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

const isSameMonth = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    );
};

const isDateInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    return date >= start && date <= end;
};

const isDateRangeStart = (date: Date, start: Date | null): boolean => {
    return start ? isSameDay(date, start) : false;
};

const isDateRangeEnd = (date: Date, end: Date | null): boolean => {
    return end ? isSameDay(date, end) : false;
};

const getDaysInMonth = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevMonthDay = new Date(year, month, -i);
        days.push(prevMonthDay);
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
    }

    // Add days from next month to complete the grid
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        days.push(new Date(year, month + 1, day));
    }

    return days;
};

export interface CalendarProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof calendarVariants> {
    app?: AppName;
    selected?: Date | null;
    onSelect?: (date: Date | null) => void;
    disabled?: (date: Date) => boolean;
    mode?: "single" | "range";
    rangeStart?: Date | null;
    rangeEnd?: Date | null;
    onRangeSelect?: (start: Date | null, end: Date | null) => void;
    locale?: string;
    showOutsideDays?: boolean;
    fixedWeeks?: boolean;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    initialFocus?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

export interface CalendarButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calendarButtonVariants> {
    app?: AppName;
}

export interface CalendarDayProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calendarDayVariants> {
    app?: AppName;
    date: Date;
    isSelected?: boolean;
    isToday?: boolean;
    isOutside?: boolean;
    isDisabled?: boolean;
    isInRange?: boolean;
    isRangeStart?: boolean;
    isRangeEnd?: boolean;
}

// Calendar Day Component
const CalendarDay = React.forwardRef<HTMLButtonElement, CalendarDayProps>(
    (
        {
            className,
            variant,
            size,
            app,
            date,
            isSelected,
            isToday,
            isOutside,
            isDisabled,
            isInRange,
            isRangeStart,
            isRangeEnd,
            children,
            ...props
        },
        ref
    ) => {
        const getVariant = () => {
            if (isDisabled) return "disabled";
            if (isRangeStart) return "rangeStart";
            if (isRangeEnd) return "rangeEnd";
            if (isInRange) return "rangeMiddle";
            if (isSelected) return "selected";
            if (isToday) return "today";
            if (isOutside) return "outside";
            return "default";
        };

        return (
            <button
                ref={ref}
                className={cn(
                    calendarDayVariants({ variant: getVariant(), size, app }),
                    className
                )}
                disabled={isDisabled}
                {...props}
            >
                {children || date.getDate()}
            </button>
        );
    }
);

CalendarDay.displayName = "CalendarDay";

// Calendar Button Component
const CalendarButton = React.forwardRef<HTMLButtonElement, CalendarButtonProps>(
    ({ className, variant, size, app, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(calendarButtonVariants({ variant, size, app }), className)}
                {...props}
            />
        );
    }
);

CalendarButton.displayName = "CalendarButton";

// Main Calendar Component
const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    (
        {
            className,
            variant,
            size,
            app,
            selected,
            onSelect,
            disabled,
            mode = "single",
            rangeStart,
            rangeEnd,
            onRangeSelect,
            locale = "en-US",
            showOutsideDays = true,
            fixedWeeks = false,
            weekStartsOn = 0,
            initialFocus = false,
            minDate,
            maxDate,
            ...props
        },
        ref
    ) => {
        const [currentMonth, setCurrentMonth] = React.useState(
            selected || new Date()
        );
        const [focusedDay, setFocusedDay] = React.useState<Date | null>(null);
        const [isRangeSelecting, setIsRangeSelecting] = React.useState(false);

        const today = new Date();
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = getDaysInMonth(year, month);

        // Navigation handlers
        const goToPreviousMonth = () => {
            setCurrentMonth(new Date(year, month - 1, 1));
        };

        const goToNextMonth = () => {
            setCurrentMonth(new Date(year, month + 1, 1));
        };

        const goToPreviousYear = () => {
            setCurrentMonth(new Date(year - 1, month, 1));
        };

        const goToNextYear = () => {
            setCurrentMonth(new Date(year + 1, month, 1));
        };

        // Date selection handlers
        const handleDateSelect = (date: Date) => {
            if (disabled?.(date)) return;

            if (mode === "single") {
                onSelect?.(isSameDay(date, selected || new Date()) ? null : date);
            } else if (mode === "range" && onRangeSelect) {
                if (!rangeStart || (rangeStart && rangeEnd)) {
                    // Start new range
                    onRangeSelect(date, null);
                    setIsRangeSelecting(true);
                } else if (rangeStart && !rangeEnd) {
                    // Complete range
                    if (date < rangeStart) {
                        onRangeSelect(date, rangeStart);
                    } else {
                        onRangeSelect(rangeStart, date);
                    }
                    setIsRangeSelecting(false);
                }
            }
        };

        // Keyboard navigation
        const handleKeyDown = (event: React.KeyboardEvent) => {
            const currentFocus = focusedDay || selected || today;
            let newFocus: Date | null = null;

            switch (event.key) {
                case "ArrowLeft":
                    newFocus = new Date(currentFocus.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case "ArrowRight":
                    newFocus = new Date(currentFocus.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case "ArrowUp":
                    newFocus = new Date(currentFocus.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case "ArrowDown":
                    newFocus = new Date(currentFocus.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case "Home":
                    newFocus = new Date(year, month, 1);
                    break;
                case "End":
                    newFocus = new Date(year, month + 1, 0);
                    break;
                case "PageUp":
                    if (event.shiftKey) {
                        newFocus = new Date(year - 1, month, currentFocus.getDate());
                    } else {
                        newFocus = new Date(year, month - 1, currentFocus.getDate());
                    }
                    break;
                case "PageDown":
                    if (event.shiftKey) {
                        newFocus = new Date(year + 1, month, currentFocus.getDate());
                    } else {
                        newFocus = new Date(year, month + 1, currentFocus.getDate());
                    }
                    break;
                case "Enter":
                case " ":
                    event.preventDefault();
                    handleDateSelect(currentFocus);
                    return;
                default:
                    return;
            }

            if (newFocus) {
                event.preventDefault();
                setFocusedDay(newFocus);

                // Change month if necessary
                if (!isSameMonth(newFocus, currentMonth)) {
                    setCurrentMonth(new Date(newFocus.getFullYear(), newFocus.getMonth(), 1));
                }
            }
        };

        // Check if date is disabled
        const isDateDisabled = (date: Date): boolean => {
            if (disabled?.(date)) return true;
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
        };

        // Render days
        const renderDays = () => {
            const weeks: React.ReactNode[] = [];

            for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
                const week: React.ReactNode[] = [];

                for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                    const dayPosition = weekIndex * 7 + dayIndex;
                    const date = days[dayPosition];

                    if (!date) continue;

                    const isOutside = !isSameMonth(date, currentMonth);
                    const isToday = isSameDay(date, today);
                    const isSelected = mode === "single" ? isSameDay(date, selected || new Date()) : false;
                    const isDisabled = isDateDisabled(date);
                    const isInRange = mode === "range" ? isDateInRange(date, rangeStart, rangeEnd) : false;
                    const isRangeStartDay = mode === "range" ? isDateRangeStart(date, rangeStart) : false;
                    const isRangeEndDay = mode === "range" ? isDateRangeEnd(date, rangeEnd) : false;
                    const isFocused = focusedDay ? isSameDay(date, focusedDay) : false;

                    if (!showOutsideDays && isOutside) {
                        week.push(<div key={dayPosition} className={cn(calendarDayVariants({ size }))} />);
                        continue;
                    }

                    week.push(
                        <CalendarDay
                            key={dayPosition}
                            date={date}
                            size={size}
                            app={app}
                            isSelected={isSelected}
                            isToday={isToday}
                            isOutside={isOutside}
                            isDisabled={isDisabled}
                            isInRange={isInRange}
                            isRangeStart={isRangeStartDay}
                            isRangeEnd={isRangeEndDay}
                            onClick={() => handleDateSelect(date)}
                            tabIndex={isFocused ? 0 : -1}
                            autoFocus={initialFocus && isFocused}
                        />
                    );
                }

                weeks.push(
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week}
                    </div>
                );

                if (!fixedWeeks && weekIndex >= 4 && !week.some(day => day)) {
                    break;
                }
            }

            return weeks;
        };

        return (
            <div
                ref={ref}
                className={cn(calendarVariants({ variant, size, app }), className)}
                role="application"
                aria-label="Calendar"
                onKeyDown={handleKeyDown}
                {...props}
            >
                {/* Header */}
                <div className={cn(calendarHeaderVariants({ variant }))}>
                    <div className="flex items-center space-x-1">
                        <CalendarButton
                            variant="ghost"
                            size={size}
                            app={app}
                            onClick={goToPreviousYear}
                            aria-label="Previous year"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <ChevronLeft className="h-4 w-4 -ml-2" />
                        </CalendarButton>
                        <CalendarButton
                            variant="ghost"
                            size={size}
                            app={app}
                            onClick={goToPreviousMonth}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </CalendarButton>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            className="text-sm font-semibold hover:underline focus:outline-none focus:underline"
                            onClick={() => setCurrentMonth(new Date())}
                        >
                            {MONTHS[month]} {year}
                        </button>
                    </div>

                    <div className="flex items-center space-x-1">
                        <CalendarButton
                            variant="ghost"
                            size={size}
                            app={app}
                            onClick={goToNextMonth}
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </CalendarButton>
                        <CalendarButton
                            variant="ghost"
                            size={size}
                            app={app}
                            onClick={goToNextYear}
                            aria-label="Next year"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <ChevronRight className="h-4 w-4 -ml-2" />
                        </CalendarButton>
                    </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_OF_WEEK.map((day) => (
                        <div
                            key={day}
                            className={cn(
                                "text-center text-xs font-medium text-slate-500 py-2",
                                size === "sm" && "text-xs py-1",
                                size === "lg" && "text-sm py-3"
                            )}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="space-y-1">
                    {renderDays()}
                </div>
            </div>
        );
    }
);

Calendar.displayName = "Calendar";

// Date Range Picker Component
export interface DateRangePickerProps extends Omit<CalendarProps, "mode" | "selected" | "onSelect"> {
    startDate?: Date | null;
    endDate?: Date | null;
    onDateRangeChange?: (start: Date | null, end: Date | null) => void;
    placeholder?: string;
    format?: string;
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
    (
        {
            startDate,
            endDate,
            onDateRangeChange,
            placeholder = "Select date range",
            format = "MMM dd, yyyy",
            app,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [tempStartDate, setTempStartDate] = React.useState<Date | null>(startDate || null);
        const [tempEndDate, setTempEndDate] = React.useState<Date | null>(endDate || null);

        const formatDate = (date: Date | null): string => {
            if (!date) return "";
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            });
        };

        const displayValue = () => {
            if (startDate && endDate) {
                return `${formatDate(startDate)} - ${formatDate(endDate)}`;
            }
            if (startDate) {
                return formatDate(startDate);
            }
            return placeholder;
        };

        const handleRangeSelect = (start: Date | null, end: Date | null) => {
            setTempStartDate(start);
            setTempEndDate(end);

            if (start && end) {
                onDateRangeChange?.(start, end);
                setIsOpen(false);
            }
        };

        return (
            <div ref={ref} className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
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
                    <span className={cn(!startDate && !endDate && "text-slate-500")}>
                        {displayValue()}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                        <Calendar
                            mode="range"
                            rangeStart={tempStartDate}
                            rangeEnd={tempEndDate}
                            onRangeSelect={handleRangeSelect}
                            app={app}
                            {...props}
                        />
                    </div>
                )}
            </div>
        );
    }
);

DateRangePicker.displayName = "DateRangePicker";

// Mini Calendar - Compact version
export interface MiniCalendarProps extends Omit<CalendarProps, "variant" | "size"> {
    showHeader?: boolean;
}

const MiniCalendar = React.forwardRef<HTMLDivElement, MiniCalendarProps>(
    ({ showHeader = false, ...props }, ref) => {
        return (
            <Calendar
                ref={ref}
                variant="compact"
                size="sm"
                showOutsideDays={false}
                fixedWeeks={false}
                {...props}
                className={cn("w-64", props.className)}
            />
        );
    }
);

MiniCalendar.displayName = "MiniCalendar";

export {
    Calendar,
    CalendarDay,
    CalendarButton,
    DateRangePicker,
    MiniCalendar,
    calendarVariants,
    calendarHeaderVariants,
    calendarButtonVariants,
    calendarDayVariants,
};
