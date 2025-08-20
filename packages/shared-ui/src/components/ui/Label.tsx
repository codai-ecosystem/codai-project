import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    {
        variants: {
            size: {
                xs: "text-xs",
                sm: "text-sm",
                md: "text-base",
                lg: "text-lg",
                xl: "text-xl",
            },
            variant: {
                default: "text-slate-900",
                muted: "text-slate-500",
                destructive: "text-red-500",
                success: "text-green-500",
                warning: "text-yellow-500",
            },
            weight: {
                normal: "font-normal",
                medium: "font-medium",
                semibold: "font-semibold",
                bold: "font-bold",
            },
            app: {
                codai: "text-blue-900",
                memorai: "text-purple-900",
                bancai: "text-green-900",
                romai: "text-red-900",
                ajutai: "text-orange-900",
                controlai: "text-indigo-900",
                studiai: "text-teal-900",
                sociai: "text-pink-900",
                cumparai: "text-cyan-900",
                donai: "text-emerald-900",
            },
        },
        defaultVariants: {
            size: "sm",
            variant: "default",
            weight: "medium",
        },
    }
);

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
    app?: AppName;
    required?: boolean;
    optional?: boolean;
    description?: string;
    error?: string;
    tooltip?: string;
    asChild?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    (
        {
            className,
            size,
            variant,
            weight,
            app,
            required,
            optional,
            description,
            error,
            tooltip,
            children,
            ...props
        },
        ref
    ) => {
        const effectiveVariant = error ? "destructive" : variant;

        return (
            <div className="space-y-1">
                <label
                    ref={ref}
                    className={cn(labelVariants({ size, variant: effectiveVariant, weight, app, className }))}
                    {...props}
                >
                    {children}
                    {required && <span className="text-red-500 ml-1">*</span>}
                    {optional && !required && (
                        <span className="text-slate-500 ml-1 font-normal">(optional)</span>
                    )}
                    {tooltip && (
                        <span className="ml-1 text-slate-400 cursor-help" title={tooltip}>
                            ?
                        </span>
                    )}
                </label>

                {description && (
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                )}

                {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Label.displayName = "Label";

// FieldLabel component for form fields
export interface FieldLabelProps extends LabelProps {
    htmlFor: string;
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
    (props, ref) => {
        return <Label ref={ref} {...props} />;
    }
);

FieldLabel.displayName = "FieldLabel";

// Section label for grouping form elements
export interface SectionLabelProps extends Omit<LabelProps, 'htmlFor'> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'legend';
    divider?: boolean;
}

const SectionLabel = React.forwardRef<HTMLElement, SectionLabelProps>(
    (
        {
            as: Component = 'h3',
            className,
            size = 'lg',
            weight = 'semibold',
            divider = false,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div className="space-y-2">
                <Component
                    ref={ref as any}
                    className={cn(labelVariants({ size, weight, className }))}
                    {...(props as any)}
                >
                    {children}
                </Component>
                {divider && <hr className="border-slate-200" />}
            </div>
        );
    }
);

SectionLabel.displayName = "SectionLabel";

// Badge label for status indicators
export interface BadgeLabelProps extends LabelProps {
    badge?: string;
    badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

const BadgeLabel = React.forwardRef<HTMLLabelElement, BadgeLabelProps>(
    (
        {
            badge,
            badgeVariant = 'default',
            children,
            className,
            ...props
        },
        ref
    ) => {
        const badgeStyles = {
            default: "bg-slate-900 text-slate-50",
            secondary: "bg-slate-100 text-slate-900",
            destructive: "bg-red-500 text-white",
            outline: "border border-slate-200 bg-white text-slate-900",
            success: "bg-green-500 text-white",
            warning: "bg-yellow-500 text-white",
        };

        return (
            <Label ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
                {children}
                {badge && (
                    <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        badgeStyles[badgeVariant]
                    )}>
                        {badge}
                    </span>
                )}
            </Label>
        );
    }
);

BadgeLabel.displayName = "BadgeLabel";

// Icon label with leading icon
export interface IconLabelProps extends LabelProps {
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

const IconLabel = React.forwardRef<HTMLLabelElement, IconLabelProps>(
    (
        {
            icon,
            iconPosition = 'left',
            children,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <Label
                ref={ref}
                className={cn(
                    "flex items-center gap-2",
                    iconPosition === 'right' && "flex-row-reverse",
                    className
                )}
                {...props}
            >
                {icon && (
                    <span className="flex-shrink-0">
                        {icon}
                    </span>
                )}
                {children}
            </Label>
        );
    }
);

IconLabel.displayName = "IconLabel";

// Form group label with helper text
export interface FormGroupLabelProps extends LabelProps {
    helperText?: string;
    showCounter?: boolean;
    maxLength?: number;
    currentLength?: number;
}

const FormGroupLabel = React.forwardRef<HTMLLabelElement, FormGroupLabelProps>(
    (
        {
            helperText,
            showCounter,
            maxLength,
            currentLength = 0,
            children,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <Label ref={ref} className={className} {...props}>
                        {children}
                    </Label>

                    {showCounter && maxLength && (
                        <span className={cn(
                            "text-xs",
                            currentLength > maxLength ? "text-red-500" : "text-slate-500"
                        )}>
                            {currentLength}/{maxLength}
                        </span>
                    )}
                </div>

                {helperText && (
                    <p className="text-xs text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

FormGroupLabel.displayName = "FormGroupLabel";

// Animated label for floating label inputs
export interface FloatingLabelProps extends LabelProps {
    floating?: boolean;
    focused?: boolean;
    hasValue?: boolean;
}

const FloatingLabel = React.forwardRef<HTMLLabelElement, FloatingLabelProps>(
    (
        {
            floating = false,
            focused = false,
            hasValue = false,
            className,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <Label
                ref={ref}
                className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none",
                    floating && (focused || hasValue)
                        ? "top-1 text-xs text-slate-500"
                        : "top-3 text-sm text-slate-400",
                    className
                )}
                {...props}
            >
                {children}
            </Label>
        );
    }
);

FloatingLabel.displayName = "FloatingLabel";

export {
    Label,
    FieldLabel,
    SectionLabel,
    BadgeLabel,
    IconLabel,
    FormGroupLabel,
    FloatingLabel,
    labelVariants
};
