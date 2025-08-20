import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";

const breadcrumbVariants = cva(
    "flex flex-wrap items-center text-sm",
    {
        variants: {
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
            variant: {
                default: "text-slate-600",
                subtle: "text-slate-500",
                prominent: "text-slate-700 font-medium",
            },
            app: {
                codai: "data-[current=true]:text-blue-600",
                memorai: "data-[current=true]:text-purple-600",
                bancai: "data-[current=true]:text-green-600",
                romai: "data-[current=true]:text-red-600",
                ajutai: "data-[current=true]:text-orange-600",
                controlai: "data-[current=true]:text-indigo-600",
                studiai: "data-[current=true]:text-teal-600",
                sociai: "data-[current=true]:text-pink-600",
                cumparai: "data-[current=true]:text-cyan-600",
                donai: "data-[current=true]:text-emerald-600",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

const breadcrumbItemVariants = cva(
    "transition-colors hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
    {
        variants: {
            variant: {
                default: "",
                clickable: "hover:underline cursor-pointer",
                current: "font-medium cursor-default",
            },
            app: {
                codai: "focus:ring-blue-500 hover:text-blue-700",
                memorai: "focus:ring-purple-500 hover:text-purple-700",
                bancai: "focus:ring-green-500 hover:text-green-700",
                romai: "focus:ring-red-500 hover:text-red-700",
                ajutai: "focus:ring-orange-500 hover:text-orange-700",
                controlai: "focus:ring-indigo-500 hover:text-indigo-700",
                studiai: "focus:ring-teal-500 hover:text-teal-700",
                sociai: "focus:ring-pink-500 hover:text-pink-700",
                cumparai: "focus:ring-cyan-500 hover:text-cyan-700",
                donai: "focus:ring-emerald-500 hover:text-emerald-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const breadcrumbSeparatorVariants = cva(
    "mx-2 text-slate-400 select-none flex-shrink-0",
    {
        variants: {
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

export interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    current?: boolean;
    disabled?: boolean;
}

export interface BreadcrumbProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
    app?: AppName;
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    maxItems?: number;
    homeItem?: BreadcrumbItem;
    showHomeIcon?: boolean;
    collapseFrom?: number;
    onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
    (
        {
            className,
            items,
            size,
            variant,
            app,
            separator = <ChevronRight className="w-4 h-4" />,
            maxItems,
            homeItem,
            showHomeIcon = false,
            collapseFrom = 3,
            onItemClick,
            ...props
        },
        ref
    ) => {
        const [showCollapsed, setShowCollapsed] = React.useState(false);

        // Prepare items with home item if provided
        const allItems = React.useMemo(() => {
            const itemsToRender = [...items];
            if (homeItem) {
                itemsToRender.unshift(homeItem);
            }
            return itemsToRender;
        }, [items, homeItem]);

        // Handle item collapsing
        const { displayItems, hasCollapsed } = React.useMemo(() => {
            if (!maxItems || allItems.length <= maxItems) {
                return { displayItems: allItems, hasCollapsed: false };
            }

            if (showCollapsed) {
                return { displayItems: allItems, hasCollapsed: false };
            }

            // Always show first item, collapsed indicator, and last few items
            const firstItems = allItems.slice(0, 1);
            const lastItems = allItems.slice(-(maxItems - 2));

            return {
                displayItems: [...firstItems, ...lastItems],
                hasCollapsed: true,
            };
        }, [allItems, maxItems, showCollapsed]);

        const handleItemClick = (item: BreadcrumbItem, index: number) => {
            if (item.disabled || item.current) return;

            if (item.onClick) {
                item.onClick();
            }
            onItemClick?.(item, index);
        };

        const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
            const isClickable = !item.disabled && !item.current && (item.href || item.onClick);
            const itemVariant = item.current ? "current" : isClickable ? "clickable" : "default";

            const content = (
                <>
                    {item.icon && (
                        <span className="mr-1 flex-shrink-0">
                            {item.icon}
                        </span>
                    )}
                    {item.label}
                </>
            );

            if (item.href && !item.disabled && !item.current) {
                return (
                    <a
                        key={index}
                        href={item.href}
                        className={cn(breadcrumbItemVariants({ variant: itemVariant, app }))}
                        onClick={(e) => {
                            if (item.onClick) {
                                e.preventDefault();
                                handleItemClick(item, index);
                            }
                        }}
                        aria-current={item.current ? "page" : undefined}
                    >
                        {content}
                    </a>
                );
            }

            if (isClickable) {
                return (
                    <button
                        key={index}
                        className={cn(breadcrumbItemVariants({ variant: itemVariant, app }))}
                        onClick={() => handleItemClick(item, index)}
                        disabled={item.disabled}
                        aria-current={item.current ? "page" : undefined}
                        type="button"
                    >
                        {content}
                    </button>
                );
            }

            return (
                <span
                    key={index}
                    className={cn(
                        breadcrumbItemVariants({ variant: itemVariant, app }),
                        item.disabled && "opacity-50 cursor-not-allowed",
                        item.current && "text-slate-900"
                    )}
                    aria-current={item.current ? "page" : undefined}
                >
                    {content}
                </span>
            );
        };

        return (
            <nav
                ref={ref}
                className={cn(breadcrumbVariants({ size, variant, app, className }))}
                aria-label="Breadcrumb"
                {...props}
            >
                <ol className="flex flex-wrap items-center">
                    {displayItems.map((item, index) => {
                        const isLast = index === displayItems.length - 1;
                        const showHomeIconForItem = showHomeIcon && index === 0 && homeItem;

                        return (
                            <li key={`${item.label}-${index}`} className="flex items-center">
                                {renderBreadcrumbItem(
                                    showHomeIconForItem
                                        ? { ...item, icon: item.icon || <Home className="w-4 h-4" /> }
                                        : item,
                                    index
                                )}

                                {!isLast && (
                                    <span
                                        className={cn(breadcrumbSeparatorVariants({ size }))}
                                        aria-hidden="true"
                                    >
                                        {separator}
                                    </span>
                                )}

                                {/* Collapsed indicator */}
                                {hasCollapsed && index === 0 && (
                                    <>
                                        <span
                                            className={cn(breadcrumbSeparatorVariants({ size }))}
                                            aria-hidden="true"
                                        >
                                            {separator}
                                        </span>
                                        <button
                                            className={cn(
                                                breadcrumbItemVariants({ variant: "clickable", app }),
                                                "px-1"
                                            )}
                                            onClick={() => setShowCollapsed(true)}
                                            aria-label="Show all breadcrumb items"
                                            type="button"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        <span
                                            className={cn(breadcrumbSeparatorVariants({ size }))}
                                            aria-hidden="true"
                                        >
                                            {separator}
                                        </span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        );
    }
);

Breadcrumb.displayName = "Breadcrumb";

// Simple breadcrumb with just text items
export interface SimpleBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
    items: string[];
    currentIndex?: number;
}

const SimpleBreadcrumb = React.forwardRef<HTMLElement, SimpleBreadcrumbProps>(
    (
        {
            items,
            currentIndex = items.length - 1,
            ...props
        },
        ref
    ) => {
        const breadcrumbItems: BreadcrumbItem[] = items.map((item, index) => ({
            label: item,
            current: index === currentIndex,
        }));

        return <Breadcrumb ref={ref} items={breadcrumbItems} {...props} />;
    }
);

SimpleBreadcrumb.displayName = "SimpleBreadcrumb";

// Interactive breadcrumb with routing
export interface RouteBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
    routes: Array<{
        path: string;
        label: string;
        icon?: React.ReactNode;
    }>;
    currentPath: string;
    onNavigate?: (path: string) => void;
}

const RouteBreadcrumb = React.forwardRef<HTMLElement, RouteBreadcrumbProps>(
    (
        {
            routes,
            currentPath,
            onNavigate,
            ...props
        },
        ref
    ) => {
        const breadcrumbItems: BreadcrumbItem[] = routes.map((route) => ({
            label: route.label,
            icon: route.icon,
            href: route.path,
            current: route.path === currentPath,
            onClick: onNavigate ? () => onNavigate(route.path) : undefined,
        }));

        return <Breadcrumb ref={ref} items={breadcrumbItems} {...props} />;
    }
);

RouteBreadcrumb.displayName = "RouteBreadcrumb";

// File path breadcrumb
export interface FilePathBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
    path: string;
    separator?: string;
    onPathClick?: (path: string) => void;
    showFileIcon?: boolean;
}

const FilePathBreadcrumb = React.forwardRef<HTMLElement, FilePathBreadcrumbProps>(
    (
        {
            path,
            separator: pathSeparator = "/",
            onPathClick,
            showFileIcon = false,
            ...props
        },
        ref
    ) => {
        const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
            const parts = path.split(pathSeparator).filter(Boolean);

            return parts.map((part, index) => {
                const fullPath = parts.slice(0, index + 1).join(pathSeparator);
                const isLast = index === parts.length - 1;

                return {
                    label: part,
                    current: isLast,
                    onClick: onPathClick ? () => onPathClick(fullPath) : undefined,
                };
            });
        }, [path, pathSeparator, onPathClick]);

        return (
            <Breadcrumb
                ref={ref}
                items={breadcrumbItems}
                separator={pathSeparator}
                {...props}
            />
        );
    }
);

FilePathBreadcrumb.displayName = "FilePathBreadcrumb";

// Structured data breadcrumb for SEO
export interface StructuredBreadcrumbProps extends BreadcrumbProps {
    enableStructuredData?: boolean;
    baseUrl?: string;
}

const StructuredBreadcrumb = React.forwardRef<HTMLElement, StructuredBreadcrumbProps>(
    (
        {
            enableStructuredData = false,
            baseUrl = "",
            items,
            ...props
        },
        ref
    ) => {
        const structuredData = React.useMemo(() => {
            if (!enableStructuredData) return null;

            const listItems = items.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.label,
                item: item.href ? `${baseUrl}${item.href}` : undefined,
            }));

            return {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: listItems,
            };
        }, [enableStructuredData, baseUrl, items]);

        return (
            <>
                {structuredData && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                    />
                )}
                <Breadcrumb ref={ref} items={items} {...props} />
            </>
        );
    }
);

StructuredBreadcrumb.displayName = "StructuredBreadcrumb";

export {
    Breadcrumb,
    SimpleBreadcrumb,
    RouteBreadcrumb,
    FilePathBreadcrumb,
    StructuredBreadcrumb,
    breadcrumbVariants
};
