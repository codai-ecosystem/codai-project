import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const switchVariants = cva(
    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                sm: "h-4 w-7",
                md: "h-6 w-11",
                lg: "h-7 w-12",
                xl: "h-8 w-14",
            },
            variant: {
                default: "data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-slate-200 focus-visible:ring-slate-950",
                destructive: "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-200 focus-visible:ring-red-500",
                success: "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-200 focus-visible:ring-green-500",
                warning: "data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-slate-200 focus-visible:ring-yellow-500",
            },
            app: {
                codai: "data-[state=checked]:bg-blue-500 focus-visible:ring-blue-500",
                memorai: "data-[state=checked]:bg-purple-500 focus-visible:ring-purple-500",
                bancai: "data-[state=checked]:bg-green-500 focus-visible:ring-green-500",
                romai: "data-[state=checked]:bg-red-500 focus-visible:ring-red-500",
                ajutai: "data-[state=checked]:bg-orange-500 focus-visible:ring-orange-500",
                controlai: "data-[state=checked]:bg-indigo-500 focus-visible:ring-indigo-500",
                studiai: "data-[state=checked]:bg-teal-500 focus-visible:ring-teal-500",
                sociai: "data-[state=checked]:bg-pink-500 focus-visible:ring-pink-500",
                cumparai: "data-[state=checked]:bg-cyan-500 focus-visible:ring-cyan-500",
                donai: "data-[state=checked]:bg-emerald-500 focus-visible:ring-emerald-500",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

const switchThumbVariants = cva(
    "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
    {
        variants: {
            size: {
                sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
                md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
                lg: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
                xl: "h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

export interface SwitchProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof switchVariants> {
    app?: AppName;
    label?: string;
    description?: string;
    error?: string;
    helperText?: string;
    onCheckedChange?: (checked: boolean) => void;
    thumbIcon?: React.ReactNode;
    loading?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
            defaultChecked,
            onCheckedChange,
            onChange,
            disabled,
            thumbIcon,
            loading = false,
            ...props
        },
        ref
    ) => {
        const [isChecked, setIsChecked] = React.useState(checked || defaultChecked || false);
        const inputRef = React.useRef<HTMLInputElement>(null);

        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

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
                        role="switch"
                        id={fieldId}
                        ref={inputRef}
                        className="sr-only"
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={disabled || loading}
                        {...props}
                    />
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            switchVariants({ size, variant: effectiveVariant, app, className }),
                            disabled && "cursor-not-allowed",
                            loading && "cursor-not-allowed opacity-50"
                        )}
                        data-state={isChecked ? "checked" : "unchecked"}
                    >
                        <span
                            className={cn(switchThumbVariants({ size }))}
                            data-state={isChecked ? "checked" : "unchecked"}
                        >
                            {thumbIcon && !loading && (
                                <div className="flex items-center justify-center h-full w-full text-slate-500">
                                    {thumbIcon}
                                </div>
                            )}
                            {loading && (
                                <div className="flex items-center justify-center h-full w-full">
                                    <div className={cn(
                                        "animate-spin rounded-full border-2 border-slate-300 border-t-slate-600",
                                        size === "sm" && "h-2 w-2 border",
                                        size === "md" && "h-3 w-3 border-2",
                                        size === "lg" && "h-3 w-3 border-2",
                                        size === "xl" && "h-4 w-4 border-2"
                                    )} />
                                </div>
                            )}
                        </span>
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

Switch.displayName = "Switch";

// Enhanced SwitchField component
export interface SwitchFieldProps extends SwitchProps {
    label: string;
    fieldDescription?: string;
}

const SwitchField = React.forwardRef<HTMLInputElement, SwitchFieldProps>(
    ({ label, fieldDescription, error, helperText, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {fieldDescription && (
                    <p className="text-sm text-slate-700">{fieldDescription}</p>
                )}
                <Switch
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

SwitchField.displayName = "SwitchField";

// Card-style switch for enhanced visual selection
export interface SwitchCardProps extends SwitchProps {
    icon?: React.ReactNode;
    badge?: string;
    title?: string;
}

const SwitchCard = React.forwardRef<HTMLInputElement, SwitchCardProps>(
    (
        {
            icon,
            badge,
            title,
            label,
            description,
            checked,
            onCheckedChange,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white transition-all",
                disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-300"
            )}>
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {icon && (
                        <div className="flex-shrink-0 mt-0.5">
                            {icon}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {title && (
                                <h4 className="text-sm font-medium text-slate-900">
                                    {title}
                                </h4>
                            )}
                            {badge && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                    {badge}
                                </span>
                            )}
                        </div>

                        {label && (
                            <p className="text-sm text-slate-700 mt-1">
                                {label}
                            </p>
                        )}

                        {description && (
                            <p className="text-xs text-slate-500 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                    <Switch
                        ref={ref}
                        checked={checked}
                        onCheckedChange={onCheckedChange}
                        disabled={disabled}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

SwitchCard.displayName = "SwitchCard";

// Toggle group for multiple switches
export interface SwitchOption {
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
    checked?: boolean;
}

export interface SwitchGroupProps extends Omit<SwitchProps, 'label' | 'description' | 'checked' | 'onCheckedChange'> {
    options: SwitchOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (values: string[]) => void;
    label?: string;
    description?: string;
    orientation?: 'horizontal' | 'vertical';
}

const SwitchGroup = React.forwardRef<HTMLDivElement, SwitchGroupProps>(
    (
        {
            options,
            value,
            defaultValue,
            onValueChange,
            label,
            description,
            orientation = 'vertical',
            error,
            helperText,
            disabled,
            ...props
        },
        ref
    ) => {
        const [selectedValues, setSelectedValues] = React.useState<string[]>(
            value || defaultValue || options.filter(opt => opt.checked).map(opt => opt.id)
        );

        React.useEffect(() => {
            if (value !== undefined) {
                setSelectedValues(value);
            }
        }, [value]);

        const handleCheckedChange = (optionId: string, checked: boolean) => {
            let newValues: string[];

            if (checked) {
                newValues = [...selectedValues, optionId];
            } else {
                newValues = selectedValues.filter(v => v !== optionId);
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
                        <Switch
                            key={option.id}
                            checked={selectedValues.includes(option.id)}
                            onCheckedChange={(checked) => handleCheckedChange(option.id, checked)}
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

SwitchGroup.displayName = "SwitchGroup";

export { Switch, SwitchField, SwitchCard, SwitchGroup, switchVariants, switchThumbVariants };
