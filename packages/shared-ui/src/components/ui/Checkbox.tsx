import * as React from "react";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const checkboxVariants = cva(
    "peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
    {
        variants: {
            size: {
                sm: "h-3 w-3",
                md: "h-4 w-4",
                lg: "h-5 w-5",
                xl: "h-6 w-6",
            },
            variant: {
                default: "border-slate-200 focus-visible:ring-slate-950 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50",
                destructive: "border-red-500 focus-visible:ring-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white",
                success: "border-green-500 focus-visible:ring-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white",
                warning: "border-yellow-500 focus-visible:ring-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-white",
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

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
    app?: AppName;
    label?: string;
    description?: string;
    error?: string;
    helperText?: string;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
            indeterminate = false,
            checked,
            defaultChecked,
            onCheckedChange,
            onChange,
            disabled,
            ...props
        },
        ref
    ) => {
        const [isChecked, setIsChecked] = React.useState(checked || defaultChecked || false);
        const inputRef = React.useRef<HTMLInputElement>(null);

        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        React.useEffect(() => {
            if (inputRef.current) {
                inputRef.current.indeterminate = indeterminate;
            }
        }, [indeterminate]);

        React.useEffect(() => {
            if (checked !== undefined) {
                setIsChecked(checked);
            }
        }, [checked]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newChecked = e.target.checked;
            setIsChecked(newChecked);
            onChange?.(e);
            onCheckedChange?.(newChecked);
        };

        const effectiveVariant = error ? "destructive" : variant;
        const fieldId = React.useId();

        return (
            <div className="flex items-start space-x-3">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id={fieldId}
                        ref={inputRef}
                        className="sr-only"
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={disabled}
                        {...props}
                    />
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            checkboxVariants({ size, variant: effectiveVariant, app, className }),
                            "cursor-pointer",
                            disabled && "cursor-not-allowed"
                        )}
                        data-state={indeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked"}
                    >
                        {(isChecked || indeterminate) && (
                            <div className="flex items-center justify-center text-current">
                                {indeterminate ? (
                                    <div className="h-2 w-2 bg-current rounded-sm" />
                                ) : (
                                    <Check className={cn(
                                        size === "sm" && "h-2.5 w-2.5",
                                        size === "md" && "h-3 w-3",
                                        size === "lg" && "h-3.5 w-3.5",
                                        size === "xl" && "h-4 w-4"
                                    )} />
                                )}
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

Checkbox.displayName = "Checkbox";

// CheckboxGroup component for multiple checkboxes
export interface CheckboxOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface CheckboxGroupProps
    extends Omit<CheckboxProps, 'label' | 'description' | 'value' | 'checked' | 'defaultChecked' | 'onCheckedChange'> {
    options: CheckboxOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (values: string[]) => void;
    label?: string;
    description?: string;
    orientation?: 'horizontal' | 'vertical';
    maxSelected?: number;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
    (
        {
            options,
            value,
            defaultValue,
            onValueChange,
            label,
            description,
            orientation = 'vertical',
            maxSelected,
            error,
            helperText,
            disabled,
            ...props
        },
        ref
    ) => {
        const [selectedValues, setSelectedValues] = React.useState<string[]>(
            value || defaultValue || []
        );

        React.useEffect(() => {
            if (value !== undefined) {
                setSelectedValues(value);
            }
        }, [value]);

        const handleCheckedChange = (optionValue: string, checked: boolean) => {
            let newValues: string[];

            if (checked) {
                if (maxSelected && selectedValues.length >= maxSelected) return;
                newValues = [...selectedValues, optionValue];
            } else {
                newValues = selectedValues.filter(v => v !== optionValue);
            }

            setSelectedValues(newValues);
            onValueChange?.(newValues);
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

                <div className={cn(
                    "space-y-3",
                    orientation === 'horizontal' && "flex flex-wrap gap-4 space-y-0"
                )}>
                    {options.map((option) => (
                        <Checkbox
                            key={option.value}
                            checked={selectedValues.includes(option.value)}
                            onCheckedChange={(checked) => handleCheckedChange(option.value, checked)}
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

CheckboxGroup.displayName = "CheckboxGroup";

// Enhanced CheckboxField component
export interface CheckboxFieldProps extends CheckboxProps {
    label: string;
    fieldDescription?: string;
}

const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
    ({ label, fieldDescription, error, helperText, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {fieldDescription && (
                    <p className="text-sm text-slate-700">{fieldDescription}</p>
                )}
                <Checkbox
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

CheckboxField.displayName = "CheckboxField";

export { Checkbox, CheckboxGroup, CheckboxField, checkboxVariants };
