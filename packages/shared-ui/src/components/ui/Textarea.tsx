import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const textareaVariants = cva(
    "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors",
    {
        variants: {
            size: {
                sm: "min-h-[60px] px-2 py-1 text-xs",
                md: "min-h-[80px] px-3 py-2 text-sm",
                lg: "min-h-[100px] px-4 py-3 text-base",
                xl: "min-h-[120px] px-4 py-3 text-lg",
            },
            variant: {
                default: "border-slate-200 focus-visible:ring-slate-950",
                destructive: "border-red-500 focus-visible:ring-red-500",
                success: "border-green-500 focus-visible:ring-green-500",
                warning: "border-yellow-500 focus-visible:ring-yellow-500",
            },
            app: {
                codai: "focus-visible:ring-blue-500 focus-visible:border-blue-500",
                memorai: "focus-visible:ring-purple-500 focus-visible:border-purple-500",
                bancai: "focus-visible:ring-green-500 focus-visible:border-green-500",
                romai: "focus-visible:ring-red-500 focus-visible:border-red-500",
                ajutai: "focus-visible:ring-orange-500 focus-visible:border-orange-500",
                controlai: "focus-visible:ring-indigo-500 focus-visible:border-indigo-500",
                studiai: "focus-visible:ring-teal-500 focus-visible:border-teal-500",
                sociai: "focus-visible:ring-pink-500 focus-visible:border-pink-500",
                cumparai: "focus-visible:ring-cyan-500 focus-visible:border-cyan-500",
                donai: "focus-visible:ring-emerald-500 focus-visible:border-emerald-500",
            },
            resize: {
                none: "resize-none",
                vertical: "resize-y",
                horizontal: "resize-x",
                both: "resize",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
            resize: "none",
        },
    }
);

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
    app?: AppName;
    error?: string;
    helperText?: string;
    label?: string;
    required?: boolean;
    maxLength?: number;
    showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            size,
            variant,
            app,
            resize,
            error,
            helperText,
            label,
            required,
            maxLength,
            showCharCount,
            ...props
        },
        ref
    ) => {
        const [charCount, setCharCount] = React.useState(
            props.value?.toString().length || props.defaultValue?.toString().length || 0
        );

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            props.onChange?.(e);
        };

        const effectiveVariant = error ? "destructive" : variant;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        className={cn(textareaVariants({ size, variant: effectiveVariant, app, resize, className }))}
                        ref={ref}
                        maxLength={maxLength}
                        onChange={handleChange}
                        {...props}
                    />
                    {(showCharCount && maxLength) && (
                        <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                            {charCount}/{maxLength}
                        </div>
                    )}
                </div>
                {(error || helperText) && (
                    <div className={cn("mt-1 text-xs", error ? "text-red-500" : "text-slate-500")}>
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

// Enhanced TextareaField component with label integration
export interface TextareaFieldProps extends TextareaProps {
    label: string;
    description?: string;
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ label, description, error, helperText, ...props }, ref) => {
        const fieldId = React.useId();

        return (
            <div className="space-y-2">
                <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {description && (
                    <p className="text-xs text-slate-500">{description}</p>
                )}
                <Textarea
                    id={fieldId}
                    ref={ref}
                    error={error}
                    helperText={helperText}
                    {...props}
                />
            </div>
        );
    }
);

TextareaField.displayName = "TextareaField";

// Auto-resizing textarea component
export interface AutoResizeTextareaProps extends Omit<TextareaProps, 'resize'> {
    minRows?: number;
    maxRows?: number;
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
    ({ minRows = 3, maxRows = 10, className, ...props }, ref) => {
        const textareaRef = React.useRef<HTMLTextAreaElement>(null);

        React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

        const adjustHeight = React.useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
            const minHeight = lineHeight * minRows;
            const maxHeight = lineHeight * maxRows;

            const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
            textarea.style.height = `${newHeight}px`;
        }, [minRows, maxRows]);

        React.useEffect(() => {
            adjustHeight();
        }, [props.value, adjustHeight]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            adjustHeight();
            props.onChange?.(e);
        };

        return (
            <Textarea
                ref={textareaRef}
                className={cn("resize-none overflow-hidden", className)}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { Textarea, TextareaField, AutoResizeTextarea, textareaVariants };
