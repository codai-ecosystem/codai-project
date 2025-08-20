import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const scrollAreaVariants = cva(
    "relative overflow-hidden",
    {
        variants: {
            size: {
                sm: "max-h-48",
                md: "max-h-64",
                lg: "max-h-96",
                xl: "max-h-[32rem]",
                "2xl": "max-h-[40rem]",
                auto: "h-auto",
                full: "h-full",
            },
            rounded: {
                none: "rounded-none",
                sm: "rounded-sm",
                md: "rounded-md",
                lg: "rounded-lg",
                xl: "rounded-xl",
                full: "rounded-full",
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
            size: "md",
            rounded: "md",
        },
    }
);

const scrollBarVariants = cva(
    "flex touch-none select-none transition-colors",
    {
        variants: {
            orientation: {
                vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
                horizontal: "w-full h-2.5 border-t border-t-transparent p-[1px]",
            },
            app: {
                codai: "hover:bg-blue-50",
                memorai: "hover:bg-purple-50",
                bancai: "hover:bg-green-50",
                romai: "hover:bg-red-50",
                ajutai: "hover:bg-orange-50",
                controlai: "hover:bg-indigo-50",
                studiai: "hover:bg-teal-50",
                sociai: "hover:bg-pink-50",
                cumparai: "hover:bg-cyan-50",
                donai: "hover:bg-emerald-50",
            },
        },
        defaultVariants: {
            orientation: "vertical",
        },
    }
);

const scrollThumbVariants = cva(
    "relative flex-1 rounded-full transition-colors",
    {
        variants: {
            app: {
                codai: "bg-blue-200 hover:bg-blue-300",
                memorai: "bg-purple-200 hover:bg-purple-300",
                bancai: "bg-green-200 hover:bg-green-300",
                romai: "bg-red-200 hover:bg-red-300",
                ajutai: "bg-orange-200 hover:bg-orange-300",
                controlai: "bg-indigo-200 hover:bg-indigo-300",
                studiai: "bg-teal-200 hover:bg-teal-300",
                sociai: "bg-pink-200 hover:bg-pink-300",
                cumparai: "bg-cyan-200 hover:bg-cyan-300",
                donai: "bg-emerald-200 hover:bg-emerald-300",
            },
        },
        defaultVariants: {},
    }
);

export interface ScrollAreaProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scrollAreaVariants> {
    app?: AppName;
    hideScrollbar?: boolean;
    scrollHideDelay?: number;
    orientation?: "vertical" | "horizontal" | "both";
    thumbColor?: string;
    trackColor?: string;
    onScrollChange?: (scrollTop: number, scrollLeft: number) => void;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    (
        {
            className,
            children,
            size,
            rounded,
            app,
            hideScrollbar = false,
            scrollHideDelay = 600,
            orientation = "vertical",
            thumbColor,
            trackColor,
            onScrollChange,
            ...props
        },
        ref
    ) => {
        const [isScrolling, setIsScrolling] = React.useState(false);
        const [showScrollbar, setShowScrollbar] = React.useState(true);
        const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
        const scrollRef = React.useRef<HTMLDivElement>(null);

        const handleScroll = React.useCallback(
            (e: React.UIEvent<HTMLDivElement>) => {
                const target = e.currentTarget;
                onScrollChange?.(target.scrollTop, target.scrollLeft);

                if (hideScrollbar) {
                    setIsScrolling(true);
                    setShowScrollbar(true);

                    if (scrollTimeout.current) {
                        clearTimeout(scrollTimeout.current);
                    }

                    scrollTimeout.current = setTimeout(() => {
                        setIsScrolling(false);
                        setShowScrollbar(false);
                    }, scrollHideDelay);
                }
            },
            [onScrollChange, hideScrollbar, scrollHideDelay]
        );

        React.useEffect(() => {
            return () => {
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }
            };
        }, []);

        const scrollbarStyle = React.useMemo(() => {
            const baseStyle: React.CSSProperties = {};

            if (hideScrollbar && !showScrollbar) {
                baseStyle.scrollbarWidth = 'none';
                baseStyle.msOverflowStyle = 'none';
            }

            if (thumbColor || trackColor) {
                const thumbColorValue = thumbColor || (app ? `oklch(var(--${app}-400))` : 'oklch(var(--slate-400))');
                const trackColorValue = trackColor || (app ? `oklch(var(--${app}-100))` : 'oklch(var(--slate-100))');

                baseStyle.scrollbarColor = `${thumbColorValue} ${trackColorValue}`;
            }

            return baseStyle;
        }, [hideScrollbar, showScrollbar, thumbColor, trackColor, app]);

        const scrollClasses = React.useMemo(() => {
            const classes = [];

            if (orientation === "vertical" || orientation === "both") {
                classes.push("overflow-y-auto");
            } else {
                classes.push("overflow-y-hidden");
            }

            if (orientation === "horizontal" || orientation === "both") {
                classes.push("overflow-x-auto");
            } else {
                classes.push("overflow-x-hidden");
            }

            if (hideScrollbar && !showScrollbar) {
                classes.push("scrollbar-hide");
            }

            return classes.join(" ");
        }, [orientation, hideScrollbar, showScrollbar]);

        return (
            <div
                ref={ref}
                className={cn(scrollAreaVariants({ size, rounded, app, className }))}
                {...props}
            >
                <div
                    ref={scrollRef}
                    className={cn(
                        "h-full w-full",
                        scrollClasses
                    )}
                    style={scrollbarStyle}
                    onScroll={handleScroll}
                >
                    {children}
                </div>

                {/* Custom scrollbar styling */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `
                }} />
            </div>
        );
    }
);

ScrollArea.displayName = "ScrollArea";

// Horizontal scroll area for carousels and horizontal lists
export interface HorizontalScrollAreaProps extends Omit<ScrollAreaProps, 'orientation'> {
    snapToItems?: boolean;
    itemWidth?: string;
    gap?: string;
}

const HorizontalScrollArea = React.forwardRef<HTMLDivElement, HorizontalScrollAreaProps>(
    (
        {
            children,
            snapToItems = false,
            itemWidth,
            gap = "1rem",
            className,
            ...props
        },
        ref
    ) => {
        return (
            <ScrollArea
                ref={ref}
                orientation="horizontal"
                className={cn(
                    "w-full",
                    snapToItems && "snap-x snap-mandatory",
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        "flex",
                        snapToItems && "snap-x snap-mandatory"
                    )}
                    style={{
                        gap,
                        minWidth: itemWidth ? `calc(${itemWidth} * var(--item-count, 1))` : "100%"
                    }}
                >
                    {React.Children.map(children, (child, index) => (
                        <div
                            key={index}
                            className={cn(
                                snapToItems && "snap-start",
                                itemWidth && "flex-shrink-0"
                            )}
                            style={{ width: itemWidth }}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        );
    }
);

HorizontalScrollArea.displayName = "HorizontalScrollArea";

// Vertical scroll area with header and footer
export interface ScrollAreaWithHeaderProps extends ScrollAreaProps {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    headerSticky?: boolean;
    footerSticky?: boolean;
}

const ScrollAreaWithHeader = React.forwardRef<HTMLDivElement, ScrollAreaWithHeaderProps>(
    (
        {
            children,
            header,
            footer,
            headerSticky = false,
            footerSticky = false,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col h-full",
                    className
                )}
            >
                {header && (
                    <div
                        className={cn(
                            "flex-shrink-0",
                            headerSticky && "sticky top-0 z-10 bg-white border-b border-slate-200"
                        )}
                    >
                        {header}
                    </div>
                )}

                <ScrollArea
                    size="full"
                    className="flex-1 min-h-0"
                    {...props}
                >
                    {children}
                </ScrollArea>

                {footer && (
                    <div
                        className={cn(
                            "flex-shrink-0",
                            footerSticky && "sticky bottom-0 z-10 bg-white border-t border-slate-200"
                        )}
                    >
                        {footer}
                    </div>
                )}
            </div>
        );
    }
);

ScrollAreaWithHeader.displayName = "ScrollAreaWithHeader";

// Virtual scroll area for large lists
export interface VirtualScrollAreaProps extends ScrollAreaProps {
    itemHeight: number;
    itemCount: number;
    overscan?: number;
    renderItem: (index: number, style: React.CSSProperties) => React.ReactNode;
}

const VirtualScrollArea = React.forwardRef<HTMLDivElement, VirtualScrollAreaProps>(
    (
        {
            itemHeight,
            itemCount,
            overscan = 5,
            renderItem,
            className,
            ...props
        },
        ref
    ) => {
        const [scrollTop, setScrollTop] = React.useState(0);
        const containerHeight = React.useMemo(() => {
            const maxHeight = props.size === "sm" ? 192 :
                props.size === "md" ? 256 :
                    props.size === "lg" ? 384 :
                        props.size === "xl" ? 512 :
                            props.size === "2xl" ? 640 : 256;
            return Math.min(itemHeight * itemCount, maxHeight);
        }, [itemHeight, itemCount, props.size]);

        const totalHeight = itemHeight * itemCount;
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            itemCount - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );

        const visibleItems = [];
        for (let i = startIndex; i <= endIndex; i++) {
            const itemStyle: React.CSSProperties = {
                position: 'absolute',
                top: i * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
            };
            visibleItems.push(renderItem(i, itemStyle));
        }

        return (
            <ScrollArea
                ref={ref}
                className={cn("relative", className)}
                style={{ height: containerHeight }}
                onScrollChange={(scrollTop) => setScrollTop(scrollTop)}
                {...props}
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {visibleItems}
                </div>
            </ScrollArea>
        );
    }
);

VirtualScrollArea.displayName = "VirtualScrollArea";

// Scroll area with shadows to indicate scrollable content
export interface ScrollAreaWithShadowsProps extends ScrollAreaProps {
    shadowColor?: string;
    shadowIntensity?: 'light' | 'medium' | 'strong';
}

const ScrollAreaWithShadows = React.forwardRef<HTMLDivElement, ScrollAreaWithShadowsProps>(
    (
        {
            children,
            shadowColor,
            shadowIntensity = 'medium',
            className,
            app,
            ...props
        },
        ref
    ) => {
        const [isAtTop, setIsAtTop] = React.useState(true);
        const [isAtBottom, setIsAtBottom] = React.useState(false);
        const [isAtLeft, setIsAtLeft] = React.useState(true);
        const [isAtRight, setIsAtRight] = React.useState(false);
        const containerRef = React.useRef<HTMLDivElement>(null);

        const handleScrollChange = React.useCallback((scrollTop: number, scrollLeft: number) => {
            const scrollElement = containerRef.current?.querySelector('[data-scroll-content]') as HTMLElement;
            if (!scrollElement) return;

            setIsAtTop(scrollTop <= 1);
            setIsAtBottom(scrollTop >= scrollElement.scrollHeight - scrollElement.clientHeight - 1);
            setIsAtLeft(scrollLeft <= 1);
            setIsAtRight(scrollLeft >= scrollElement.scrollWidth - scrollElement.clientWidth - 1);

            props.onScrollChange?.(scrollTop, scrollLeft);
        }, [props]);

        const shadowOpacity = {
            light: '0.05',
            medium: '0.1',
            strong: '0.2',
        }[shadowIntensity];

        const shadowColorValue = shadowColor || (app ? `oklch(var(--${app}-900) / ${shadowOpacity})` : `oklch(var(--slate-900) / ${shadowOpacity})`);

        return (
            <div
                ref={containerRef}
                className={cn("relative", className)}
            >
                {/* Top shadow */}
                {!isAtTop && (
                    <div
                        className="absolute top-0 left-0 right-0 h-4 pointer-events-none z-10"
                        style={{
                            background: `linear-gradient(to bottom, ${shadowColorValue}, transparent)`,
                        }}
                    />
                )}

                {/* Bottom shadow */}
                {!isAtBottom && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none z-10"
                        style={{
                            background: `linear-gradient(to top, ${shadowColorValue}, transparent)`,
                        }}
                    />
                )}

                {/* Left shadow */}
                {!isAtLeft && (
                    <div
                        className="absolute top-0 left-0 bottom-0 w-4 pointer-events-none z-10"
                        style={{
                            background: `linear-gradient(to right, ${shadowColorValue}, transparent)`,
                        }}
                    />
                )}

                {/* Right shadow */}
                {!isAtRight && (
                    <div
                        className="absolute top-0 right-0 bottom-0 w-4 pointer-events-none z-10"
                        style={{
                            background: `linear-gradient(to left, ${shadowColorValue}, transparent)`,
                        }}
                    />
                )}

                <ScrollArea
                    onScrollChange={handleScrollChange}
                    app={app}
                    {...props}
                >
                    <div data-scroll-content>
                        {children}
                    </div>
                </ScrollArea>
            </div>
        );
    }
);

ScrollAreaWithShadows.displayName = "ScrollAreaWithShadows";

export {
    ScrollArea,
    HorizontalScrollArea,
    ScrollAreaWithHeader,
    VirtualScrollArea,
    ScrollAreaWithShadows,
    scrollAreaVariants
};
