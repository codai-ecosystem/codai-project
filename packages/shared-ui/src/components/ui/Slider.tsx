import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const sliderVariants = cva(
    "relative flex w-full touch-none select-none items-center",
    {
        variants: {
            size: {
                sm: "h-4",
                md: "h-6",
                lg: "h-8",
                xl: "h-10",
            },
            orientation: {
                horizontal: "w-full",
                vertical: "h-full w-6 flex-col",
            },
        },
        defaultVariants: {
            size: "md",
            orientation: "horizontal",
        },
    }
);

const sliderTrackVariants = cva(
    "relative grow overflow-hidden rounded-full bg-slate-200",
    {
        variants: {
            size: {
                sm: "h-1.5",
                md: "h-2",
                lg: "h-3",
                xl: "h-4",
            },
            orientation: {
                horizontal: "w-full",
                vertical: "h-full w-full",
            },
        },
        defaultVariants: {
            size: "md",
            orientation: "horizontal",
        },
    }
);

const sliderRangeVariants = cva(
    "absolute rounded-full",
    {
        variants: {
            size: {
                sm: "h-1.5",
                md: "h-2",
                lg: "h-3",
                xl: "h-4",
            },
            orientation: {
                horizontal: "h-full",
                vertical: "w-full",
            },
            app: {
                codai: "bg-blue-500",
                memorai: "bg-purple-500",
                bancai: "bg-green-500",
                romai: "bg-red-500",
                ajutai: "bg-orange-500",
                controlai: "bg-indigo-500",
                studiai: "bg-teal-500",
                sociai: "bg-pink-500",
                cumparai: "bg-cyan-500",
                donai: "bg-emerald-500",
            },
        },
        defaultVariants: {
            size: "md",
            orientation: "horizontal",
            app: "codai",
        },
    }
);

const sliderThumbVariants = cva(
    "block rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "h-4 w-4",
                md: "h-5 w-5",
                lg: "h-6 w-6",
                xl: "h-7 w-7",
            },
            app: {
                codai: "border-blue-500 focus-visible:ring-blue-500",
                memorai: "border-purple-500 focus-visible:ring-purple-500",
                bancai: "border-green-500 focus-visible:ring-green-500",
                romai: "border-red-500 focus-visible:ring-red-500",
                ajutai: "border-orange-500 focus-visible:ring-orange-500",
                controlai: "border-indigo-500 focus-visible:ring-indigo-500",
                studiai: "border-teal-500 focus-visible:ring-teal-500",
                sociai: "border-pink-500 focus-visible:ring-pink-500",
                cumparai: "border-cyan-500 focus-visible:ring-cyan-500",
                donai: "border-emerald-500 focus-visible:ring-emerald-500",
            },
        },
        defaultVariants: {
            size: "md",
            app: "codai",
        },
    }
);

export interface SliderProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue'>,
    VariantProps<typeof sliderVariants> {
    app?: AppName;
    value?: number[];
    defaultValue?: number[];
    onValueChange?: (values: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    description?: string;
    error?: string;
    helperText?: string;
    showValue?: boolean;
    showTicks?: boolean;
    showTooltip?: boolean;
    formatValue?: (value: number) => string;
    thumbIcon?: React.ReactNode;
    marks?: Array<{ value: number; label?: string }>;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    (
        {
            className,
            size,
            orientation,
            app,
            value,
            defaultValue = [0],
            onValueChange,
            min = 0,
            max = 100,
            step = 1,
            label,
            description,
            error,
            helperText,
            showValue = false,
            showTicks = false,
            showTooltip = false,
            formatValue = (val) => val.toString(),
            thumbIcon,
            marks = [],
            disabled,
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = React.useState(value || defaultValue);
        const [isDragging, setIsDragging] = React.useState(false);
        const [activeThumb, setActiveThumb] = React.useState<number | null>(null);
        const sliderRef = React.useRef<HTMLDivElement>(null);

        React.useImperativeHandle(ref, () => sliderRef.current as HTMLDivElement);

        React.useEffect(() => {
            if (value !== undefined) {
                setInternalValue(value);
            }
        }, [value]);

        const handleValueChange = (newValues: number[]) => {
            setInternalValue(newValues);
            onValueChange?.(newValues);
        };

        const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

        const getValueFromPosition = (position: number, rect: DOMRect) => {
            const percentage = orientation === 'horizontal'
                ? position / rect.width
                : 1 - position / rect.height;
            const value = min + percentage * (max - min);
            return Math.round(value / step) * step;
        };

        const handleMouseDown = (e: React.MouseEvent, thumbIndex?: number) => {
            if (disabled) return;

            e.preventDefault();
            setIsDragging(true);
            setActiveThumb(thumbIndex ?? 0);

            const rect = sliderRef.current?.getBoundingClientRect();
            if (!rect) return;

            const position = orientation === 'horizontal'
                ? e.clientX - rect.left
                : e.clientY - rect.top;

            const newValue = getValueFromPosition(position, rect);
            const newValues = [...internalValue];
            newValues[thumbIndex ?? 0] = Math.max(min, Math.min(max, newValue));
            handleValueChange(newValues);
        };

        const handleMouseMove = React.useCallback((e: MouseEvent) => {
            if (!isDragging || activeThumb === null || disabled) return;

            const rect = sliderRef.current?.getBoundingClientRect();
            if (!rect) return;

            const position = orientation === 'horizontal'
                ? e.clientX - rect.left
                : e.clientY - rect.top;

            const newValue = getValueFromPosition(position, rect);
            const newValues = [...internalValue];
            newValues[activeThumb] = Math.max(min, Math.min(max, newValue));
            handleValueChange(newValues);
        }, [isDragging, activeThumb, orientation, min, max, step, internalValue, disabled]);

        const handleMouseUp = React.useCallback(() => {
            setIsDragging(false);
            setActiveThumb(null);
        }, []);

        React.useEffect(() => {
            if (isDragging) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                return () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
            }
        }, [isDragging, handleMouseMove, handleMouseUp]);

        const fieldId = React.useId();

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {description && (
                    <p className="text-xs text-slate-500">{description}</p>
                )}

                <div className="relative">
                    {/* Value display */}
                    {showValue && (
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>{formatValue(min)}</span>
                            <span className="font-medium text-slate-900">
                                {internalValue.map(val => formatValue(val)).join(' - ')}
                            </span>
                            <span>{formatValue(max)}</span>
                        </div>
                    )}

                    {/* Slider */}
                    <div
                        ref={sliderRef}
                        className={cn(sliderVariants({ size, orientation, className }))}
                        onMouseDown={handleMouseDown}
                        role="slider"
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={internalValue[0]}
                        tabIndex={disabled ? -1 : 0}
                    >
                        {/* Track */}
                        <div className={cn(sliderTrackVariants({ size, orientation }))}>
                            {/* Range */}
                            <div
                                className={cn(sliderRangeVariants({ size, orientation, app }))}
                                style={orientation === 'horizontal'
                                    ? {
                                        left: `${getPercentage(Math.min(...internalValue))}%`,
                                        width: `${getPercentage(Math.max(...internalValue)) - getPercentage(Math.min(...internalValue))}%`
                                    }
                                    : {
                                        bottom: `${getPercentage(Math.min(...internalValue))}%`,
                                        height: `${getPercentage(Math.max(...internalValue)) - getPercentage(Math.min(...internalValue))}%`
                                    }
                                }
                            />
                        </div>

                        {/* Thumbs */}
                        {internalValue.map((val, index) => (
                            <div
                                key={index}
                                className={cn(sliderThumbVariants({ size, app }))}
                                style={orientation === 'horizontal'
                                    ? { left: `${getPercentage(val)}%`, transform: 'translateX(-50%)' }
                                    : { bottom: `${getPercentage(val)}%`, transform: 'translateY(50%)' }
                                }
                                onMouseDown={(e) => handleMouseDown(e, index)}
                            >
                                {thumbIcon && (
                                    <div className="flex items-center justify-center h-full w-full">
                                        {thumbIcon}
                                    </div>
                                )}

                                {/* Tooltip */}
                                {showTooltip && (activeThumb === index || isDragging) && (
                                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-slate-900 text-white rounded whitespace-nowrap">
                                        {formatValue(val)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Marks */}
                    {(showTicks || marks.length > 0) && (
                        <div className="relative mt-2">
                            {marks.map((mark) => (
                                <div
                                    key={mark.value}
                                    className="absolute flex flex-col items-center"
                                    style={orientation === 'horizontal'
                                        ? { left: `${getPercentage(mark.value)}%`, transform: 'translateX(-50%)' }
                                        : { bottom: `${getPercentage(mark.value)}%`, transform: 'translateY(50%)' }
                                    }
                                >
                                    <div className="w-0.5 h-2 bg-slate-300" />
                                    {mark.label && (
                                        <span className="text-xs text-slate-500 mt-1">{mark.label}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {(error || helperText) && (
                    <div className={cn("text-xs", error ? "text-red-500" : "text-slate-500")}>
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Slider.displayName = "Slider";

// Range Slider component for dual handle ranges
export interface RangeSliderProps extends Omit<SliderProps, 'value' | 'defaultValue' | 'onValueChange'> {
    value?: [number, number];
    defaultValue?: [number, number];
    onValueChange?: (values: [number, number]) => void;
}

const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(
    (
        {
            value,
            defaultValue = [0, 100],
            onValueChange,
            ...props
        },
        ref
    ) => {
        const handleValueChange = (values: number[]) => {
            if (values.length >= 2) {
                onValueChange?.([values[0], values[1]]);
            }
        };

        return (
            <Slider
                ref={ref}
                value={value}
                defaultValue={defaultValue}
                onValueChange={handleValueChange}
                {...props}
            />
        );
    }
);

RangeSlider.displayName = "RangeSlider";

// Enhanced SliderField component
export interface SliderFieldProps extends SliderProps {
    label: string;
    fieldDescription?: string;
}

const SliderField = React.forwardRef<HTMLDivElement, SliderFieldProps>(
    ({ label, fieldDescription, error, helperText, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {fieldDescription && (
                    <p className="text-sm text-slate-700">{fieldDescription}</p>
                )}
                <Slider
                    ref={ref}
                    label={label}
                    error={error}
                    helperText={helperText}
                    {...props}
                />
            </div>
        );
    }
);

SliderField.displayName = "SliderField";

export { Slider, RangeSlider, SliderField, sliderVariants, sliderTrackVariants, sliderRangeVariants, sliderThumbVariants };
