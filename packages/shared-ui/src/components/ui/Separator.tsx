import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const separatorVariants = cva(
    "shrink-0 bg-slate-200",
    {
        variants: {
            orientation: {
                horizontal: "h-[1px] w-full",
                vertical: "w-[1px] h-full",
            },
            size: {
                xs: "data-[orientation=horizontal]:h-[0.5px] data-[orientation=vertical]:w-[0.5px]",
                sm: "data-[orientation=horizontal]:h-[1px] data-[orientation=vertical]:w-[1px]",
                md: "data-[orientation=horizontal]:h-[2px] data-[orientation=vertical]:w-[2px]",
                lg: "data-[orientation=horizontal]:h-[3px] data-[orientation=vertical]:w-[3px]",
                xl: "data-[orientation=horizontal]:h-[4px] data-[orientation=vertical]:w-[4px]",
            },
            variant: {
                default: "bg-slate-200",
                dashed: "border-dashed border-t border-slate-200 bg-transparent data-[orientation=vertical]:border-l data-[orientation=vertical]:border-t-0",
                dotted: "border-dotted border-t border-slate-200 bg-transparent data-[orientation=vertical]:border-l data-[orientation=vertical]:border-t-0",
                gradient: "bg-gradient-to-r from-transparent via-slate-200 to-transparent data-[orientation=vertical]:bg-gradient-to-b",
                double: "border-double border-t-4 border-slate-200 bg-transparent data-[orientation=vertical]:border-l-4 data-[orientation=vertical]:border-t-0",
            },
            app: {
                codai: "data-[variant=gradient]:via-blue-200",
                memorai: "data-[variant=gradient]:via-purple-200",
                bancai: "data-[variant=gradient]:via-green-200",
                romai: "data-[variant=gradient]:via-red-200",
                ajutai: "data-[variant=gradient]:via-orange-200",
                controlai: "data-[variant=gradient]:via-indigo-200",
                studiai: "data-[variant=gradient]:via-teal-200",
                sociai: "data-[variant=gradient]:via-pink-200",
                cumparai: "data-[variant=gradient]:via-cyan-200",
                donai: "data-[variant=gradient]:via-emerald-200",
            },
        },
        defaultVariants: {
            orientation: "horizontal",
            size: "sm",
            variant: "default",
        },
    }
);

export interface SeparatorProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
    app?: AppName;
    decorative?: boolean;
    label?: string;
    icon?: React.ReactNode;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    (
        {
            className,
            orientation,
            size,
            variant,
            app,
            decorative = true,
            label,
            icon,
            ...props
        },
        ref
    ) => {
        // If there's a label or icon, we need a different layout
        if (label || icon) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        "flex items-center",
                        orientation === "vertical" ? "flex-col h-full" : "w-full",
                        className
                    )}
                    data-orientation={orientation}
                    data-variant={variant}
                    role={decorative ? "none" : "separator"}
                    aria-orientation={orientation}
                    {...props}
                >
                    <div
                        className={cn(
                            separatorVariants({ orientation, size, variant, app }),
                            orientation === "vertical" ? "flex-1" : "flex-1"
                        )}
                    />

                    {(label || icon) && (
                        <div className={cn(
                            "flex items-center justify-center px-3 py-1 text-sm text-slate-500",
                            orientation === "vertical" ? "my-2" : "mx-3"
                        )}>
                            {icon && <span className="mr-2">{icon}</span>}
                            {label && <span>{label}</span>}
                        </div>
                    )}

                    <div
                        className={cn(
                            separatorVariants({ orientation, size, variant, app }),
                            orientation === "vertical" ? "flex-1" : "flex-1"
                        )}
                    />
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(separatorVariants({ orientation, size, variant, app, className }))}
                data-orientation={orientation}
                data-variant={variant}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                {...props}
            />
        );
    }
);

Separator.displayName = "Separator";

// Section Separator with title
export interface SectionSeparatorProps extends SeparatorProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center' | 'right';
}

const SectionSeparator = React.forwardRef<HTMLDivElement, SectionSeparatorProps>(
    (
        {
            title,
            subtitle,
            align = 'center',
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex items-center py-4",
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        separatorVariants({
                            orientation: "horizontal",
                            size: props.size,
                            variant: props.variant,
                            app: props.app
                        }),
                        align === 'left' && "w-8",
                        align === 'center' && "flex-1",
                        align === 'right' && "flex-1"
                    )}
                />

                <div className={cn(
                    "px-4 text-center",
                    align === 'left' && "text-left pr-0",
                    align === 'right' && "text-right pl-0"
                )}>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                    )}
                </div>

                <div
                    className={cn(
                        separatorVariants({
                            orientation: "horizontal",
                            size: props.size,
                            variant: props.variant,
                            app: props.app
                        }),
                        align === 'left' && "flex-1",
                        align === 'center' && "flex-1",
                        align === 'right' && "w-8"
                    )}
                />
            </div>
        );
    }
);

SectionSeparator.displayName = "SectionSeparator";

// Breadcrumb separator
export interface BreadcrumbSeparatorProps extends Omit<SeparatorProps, 'orientation'> {
    children?: React.ReactNode;
}

const BreadcrumbSeparator = React.forwardRef<HTMLDivElement, BreadcrumbSeparatorProps>(
    (
        {
            children = "/",
            className,
            ...props
        },
        ref
    ) => {
        return (
            <span
                ref={ref}
                className={cn(
                    "mx-2 text-slate-400 select-none",
                    className
                )}
                role="presentation"
                {...props}
            >
                {children}
            </span>
        );
    }
);

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// Menu separator for dropdown menus
export interface MenuSeparatorProps extends Omit<SeparatorProps, 'orientation'> { }

const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
    (
        {
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    separatorVariants({ orientation: "horizontal", size: "sm" }),
                    "my-1 mx-2",
                    className
                )}
                role="separator"
                {...props}
            />
        );
    }
);

MenuSeparator.displayName = "MenuSeparator";

// Space separator for adding space between elements
export interface SpaceSeparatorProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

const SpaceSeparator = React.forwardRef<HTMLDivElement, SpaceSeparatorProps>(
    (
        {
            size = 'md',
            orientation = 'vertical',
            className,
        },
        ref
    ) => {
        const spacingClasses = {
            xs: 'w-1 h-1',
            sm: 'w-2 h-2',
            md: 'w-4 h-4',
            lg: 'w-6 h-6',
            xl: 'w-8 h-8',
            '2xl': 'w-12 h-12',
            '3xl': 'w-16 h-16',
            '4xl': 'w-20 h-20',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    spacingClasses[size],
                    orientation === 'horizontal' && "w-full h-auto",
                    orientation === 'vertical' && "h-full w-auto",
                    className
                )}
                aria-hidden="true"
            />
        );
    }
);

SpaceSeparator.displayName = "SpaceSeparator";

// Visual separator with decorative elements
export interface DecorativeSeparatorProps extends SeparatorProps {
    pattern?: 'dots' | 'stars' | 'diamonds' | 'waves';
    density?: 'sparse' | 'normal' | 'dense';
}

const DecorativeSeparator = React.forwardRef<HTMLDivElement, DecorativeSeparatorProps>(
    (
        {
            pattern = 'dots',
            density = 'normal',
            className,
            ...props
        },
        ref
    ) => {
        const patterns = {
            dots: '• • • • •',
            stars: '★ ★ ★ ★ ★',
            diamonds: '◆ ◆ ◆ ◆ ◆',
            waves: '～ ～ ～ ～ ～',
        };

        const densitySpacing = {
            sparse: 'tracking-[1em]',
            normal: 'tracking-[0.5em]',
            dense: 'tracking-[0.25em]',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center justify-center py-4",
                    className
                )}
                role={props.decorative ? "none" : "separator"}
                {...props}
            >
                <span
                    className={cn(
                        "text-slate-300 select-none text-sm",
                        densitySpacing[density]
                    )}
                >
                    {patterns[pattern]}
                </span>
            </div>
        );
    }
);

DecorativeSeparator.displayName = "DecorativeSeparator";

export {
    Separator,
    SectionSeparator,
    BreadcrumbSeparator,
    MenuSeparator,
    SpaceSeparator,
    DecorativeSeparator,
    separatorVariants
};
