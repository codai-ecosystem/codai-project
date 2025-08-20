import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const radioVariants = cva(
    "h-4 w-4 rounded-full border border-slate-200 text-slate-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
    {
        variants: {
            size: {
                sm: "h-3 w-3",
                md: "h-4 w-4",
                lg: "h-5 w-5",
                xl: "h-6 w-6",
            },
            variant: {
                default: "border-slate-200 focus-visible:ring-slate-950 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900",
                destructive: "border-red-500 focus-visible:ring-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500",
                success: "border-green-500 focus-visible:ring-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500",
                warning: "border-yellow-500 focus-visible:ring-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500",
            },
            app: {
                codai: "focus-visible:ring-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
                memorai: "focus-visible:ring-purple-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500",
                bancai: "focus-visible:ring-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500",
                romai: "focus-visible:ring-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500",
                ajutai: "focus-visible:ring-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500",
                controlai: "focus-visible:ring-indigo-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500",
                studiai: "focus-visible:ring-teal-500 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500",
                sociai: "focus-visible:ring-pink-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500",
                cumparai: "focus-visible:ring-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500",
                donai: "focus-visible:ring-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
    app?: AppName;
    label?: string;
    description?: string;
    error?: string;
    helperText?: string;
    onValueChange?: (value: string) => void;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    (
        {
            className,
            size,
            variant,
            app,
            label,
            description,
            error,
            helperText,
            checked,
            value,
            onValueChange,
            onChange,
            disabled,
            ...props
        },
        ref
    ) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            if (e.target.checked && value) {
                onValueChange?.(value.toString());
            }
        };

        const effectiveVariant = error ? "destructive" : variant;
        const fieldId = React.useId();

        return (
            <div className="flex items-start space-x-3">
                <div className="relative flex items-center">
                    <input
                        type="radio"
                        id={fieldId}
                        ref={ref}
                        className="sr-only"
                        checked={checked}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        {...props}
                    />
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            radioVariants({ size, variant: effectiveVariant, app, className }),
                            "cursor-pointer relative",
                            disabled && "cursor-not-allowed"
                        )}
                        data-state={checked ? "checked" : "unchecked"}
                    >
                        {checked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={cn(
                                    "rounded-full bg-white",
                                    size === "sm" && "h-1 w-1",
                                    size === "md" && "h-1.5 w-1.5",
                                    size === "lg" && "h-2 w-2",
                                    size === "xl" && "h-2.5 w-2.5"
                                )} />
                            </div>
                        )}
                    </label>
                </div>

                {(label || description) && (
                    <div className="flex-1 min-w-0">
                        {label && (
                            <label
                                htmlFor={fieldId}
                                className={cn(
                                    "block text-sm font-medium text-slate-900 cursor-pointer",
                                    disabled && "cursor-not-allowed opacity-50"
                                )}
                            >
                                {label}
                                {props.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                        )}
                        {description && (
                            <p className={cn(
                                "mt-1 text-xs text-slate-500",
                                disabled && "opacity-50"
                            )}>
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Radio.displayName = "Radio";

// RadioGroup component for multiple radio buttons
export interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface RadioGroupProps
    extends Omit<RadioProps, 'label' | 'description' | 'value' | 'checked' | 'onValueChange'> {
    options: RadioOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    label?: string;
    description?: string;
    orientation?: 'horizontal' | 'vertical';
    name: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    (
        {
            options,
            value,
            defaultValue,
            onValueChange,
            label,
            description,
            orientation = 'vertical',
            name,
            error,
            helperText,
            disabled,
            ...props
        },
        ref
    ) => {
        const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

        React.useEffect(() => {
            if (value !== undefined) {
                setSelectedValue(value);
            }
        }, [value]);

        const handleValueChange = (newValue: string) => {
            setSelectedValue(newValue);
            onValueChange?.(newValue);
        };

        return (
            <div ref={ref} className="space-y-3">
                {(label || description) && (
                    <div>
                        {label && (
                            <label className="block text-sm font-medium text-slate-700">
                                {label}
                                {props.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                        )}
                        {description && (
                            <p className="mt-1 text-xs text-slate-500">{description}</p>
                        )}
                    </div>
                )}

                <div
                    className={cn(
                        "space-y-3",
                        orientation === 'horizontal' && "flex flex-wrap gap-4 space-y-0"
                    )}
                    role="radiogroup"
                    aria-labelledby={label ? undefined : "radiogroup"}
                >
                    {options.map((option) => (
                        <Radio
                            key={option.value}
                            name={name}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onValueChange={handleValueChange}
                            disabled={disabled || option.disabled}
                            label={option.label}
                            description={option.description}
                            {...props}
                        />
                    ))}
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

RadioGroup.displayName = "RadioGroup";

// Enhanced RadioField component
export interface RadioFieldProps extends RadioGroupProps {
    label: string;
    fieldDescription?: string;
}

const RadioField = React.forwardRef<HTMLDivElement, RadioFieldProps>(
    ({ label, fieldDescription, error, helperText, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {fieldDescription && (
                    <p className="text-sm text-slate-700">{fieldDescription}</p>
                )}
                <RadioGroup
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

RadioField.displayName = "RadioField";

// Card-style radio group for enhanced visual selection
export interface RadioCardProps extends RadioOption {
    icon?: React.ReactNode;
    badge?: string;
    selected?: boolean;
    onSelect?: () => void;
}

const RadioCard = React.forwardRef<HTMLDivElement, RadioCardProps>(
    (
        {
            value,
            label,
            description,
            disabled,
            icon,
            badge,
            selected,
            onSelect,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex cursor-pointer rounded-lg border p-4 transition-all",
                    selected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={!disabled ? onSelect : undefined}
            >
                <div className="flex items-start w-full">
                    {icon && (
                        <div className="flex-shrink-0 mr-3">
                            {icon}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-slate-900">
                                {label}
                                {badge && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                        {badge}
                                    </span>
                                )}
                            </div>

                            <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex-shrink-0",
                                selected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300"
                            )}>
                                {selected && (
                                    <div className="h-2 w-2 rounded-full bg-white m-0.5" />
                                )}
                            </div>
                        </div>

                        {description && (
                            <p className="mt-1 text-xs text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

RadioCard.displayName = "RadioCard";

export { Radio, RadioGroup, RadioField, RadioCard, radioVariants };
