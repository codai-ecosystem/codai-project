import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const tabsListVariants = cva(
    "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500",
    {
        variants: {
            size: {
                sm: "h-8 p-0.5",
                md: "h-10 p-1",
                lg: "h-12 p-1.5",
                xl: "h-14 p-2",
            },
            variant: {
                default: "bg-slate-100",
                card: "bg-white border border-slate-200 shadow-sm",
                line: "bg-transparent border-b border-slate-200 p-0 h-auto rounded-none",
                pills: "bg-slate-50 rounded-full",
            },
            app: {
                codai: "data-[variant=default]:bg-blue-50",
                memorai: "data-[variant=default]:bg-purple-50",
                bancai: "data-[variant=default]:bg-green-50",
                romai: "data-[variant=default]:bg-red-50",
                ajutai: "data-[variant=default]:bg-orange-50",
                controlai: "data-[variant=default]:bg-indigo-50",
                studiai: "data-[variant=default]:bg-teal-50",
                sociai: "data-[variant=default]:bg-pink-50",
                cumparai: "data-[variant=default]:bg-cyan-50",
                donai: "data-[variant=default]:bg-emerald-50",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

const tabsTriggerVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm",
    {
        variants: {
            size: {
                sm: "px-2 py-1 text-xs h-6",
                md: "px-3 py-1.5 text-sm h-8",
                lg: "px-4 py-2 text-base h-10",
                xl: "px-5 py-2.5 text-lg h-12",
            },
            variant: {
                default: "data-[state=active]:bg-white data-[state=active]:text-slate-950",
                card: "data-[state=active]:bg-slate-100",
                line: "rounded-none border-b-2 border-transparent data-[state=active]:border-slate-950 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                pills: "data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full",
            },
            app: {
                codai: "focus-visible:ring-blue-500 data-[variant=line]:data-[state=active]:border-blue-500 data-[variant=default]:data-[state=active]:text-blue-950",
                memorai: "focus-visible:ring-purple-500 data-[variant=line]:data-[state=active]:border-purple-500 data-[variant=default]:data-[state=active]:text-purple-950",
                bancai: "focus-visible:ring-green-500 data-[variant=line]:data-[state=active]:border-green-500 data-[variant=default]:data-[state=active]:text-green-950",
                romai: "focus-visible:ring-red-500 data-[variant=line]:data-[state=active]:border-red-500 data-[variant=default]:data-[state=active]:text-red-950",
                ajutai: "focus-visible:ring-orange-500 data-[variant=line]:data-[state=active]:border-orange-500 data-[variant=default]:data-[state=active]:text-orange-950",
                controlai: "focus-visible:ring-indigo-500 data-[variant=line]:data-[state=active]:border-indigo-500 data-[variant=default]:data-[state=active]:text-indigo-950",
                studiai: "focus-visible:ring-teal-500 data-[variant=line]:data-[state=active]:border-teal-500 data-[variant=default]:data-[state=active]:text-teal-950",
                sociai: "focus-visible:ring-pink-500 data-[variant=line]:data-[state=active]:border-pink-500 data-[variant=default]:data-[state=active]:text-pink-950",
                cumparai: "focus-visible:ring-cyan-500 data-[variant=line]:data-[state=active]:border-cyan-500 data-[variant=default]:data-[state=active]:text-cyan-950",
                donai: "focus-visible:ring-emerald-500 data-[variant=line]:data-[state=active]:border-emerald-500 data-[variant=default]:data-[state=active]:text-emerald-950",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

const tabsContentVariants = cva(
    "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "mt-2",
                card: "mt-4 p-4 bg-white border border-slate-200 rounded-md shadow-sm",
                line: "mt-4",
                pills: "mt-4",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface TabItem {
    value: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    badge?: string | number;
    closable?: boolean;
}

export interface TabsProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'>,
    VariantProps<typeof tabsListVariants> {
    app?: AppName;
    tabs: TabItem[];
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    onTabClose?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    activationMode?: 'automatic' | 'manual';
    loop?: boolean;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    (
        {
            className,
            size,
            variant,
            app,
            tabs,
            defaultValue,
            value,
            onValueChange,
            onTabClose,
            orientation = 'horizontal',
            activationMode = 'automatic',
            loop = true,
            ...props
        },
        ref
    ) => {
        const [activeTab, setActiveTab] = React.useState(value || defaultValue || tabs[0]?.value || "");
        const [focusedTab, setFocusedTab] = React.useState<string | null>(null);

        React.useEffect(() => {
            if (value !== undefined) {
                setActiveTab(value);
            }
        }, [value]);

        const handleTabChange = (tabValue: string) => {
            setActiveTab(tabValue);
            onValueChange?.(tabValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
            const currentIndex = tabs.findIndex(tab => tab.value === tabValue);
            let nextIndex = currentIndex;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    nextIndex = loop ? (currentIndex + 1) % tabs.length : Math.min(currentIndex + 1, tabs.length - 1);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    nextIndex = loop ? (currentIndex - 1 + tabs.length) % tabs.length : Math.max(currentIndex - 1, 0);
                    break;
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    nextIndex = tabs.length - 1;
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (activationMode === 'manual') {
                        handleTabChange(tabValue);
                    }
                    return;
            }

            const nextTab = tabs[nextIndex];
            if (nextTab && !nextTab.disabled) {
                setFocusedTab(nextTab.value);
                if (activationMode === 'automatic') {
                    handleTabChange(nextTab.value);
                }
            }
        };

        const handleTabClose = (e: React.MouseEvent, tabValue: string) => {
            e.stopPropagation();
            onTabClose?.(tabValue);
        };

        const activeTabContent = tabs.find(tab => tab.value === activeTab)?.content;

        return (
            <div
                ref={ref}
                className={cn("w-full", className)}
                data-orientation={orientation}
                {...props}
            >
                <div
                    className={cn(
                        tabsListVariants({ size, variant, app }),
                        orientation === 'vertical' && "flex-col h-auto w-auto"
                    )}
                    role="tablist"
                    aria-orientation={orientation}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.value}
                            aria-controls={`content-${tab.value}`}
                            id={`tab-${tab.value}`}
                            tabIndex={activeTab === tab.value ? 0 : -1}
                            disabled={tab.disabled}
                            data-state={activeTab === tab.value ? "active" : "inactive"}
                            data-variant={variant}
                            className={cn(tabsTriggerVariants({ size, variant, app }))}
                            onClick={() => handleTabChange(tab.value)}
                            onKeyDown={(e) => handleKeyDown(e, tab.value)}
                            onFocus={() => setFocusedTab(tab.value)}
                        >
                            <div className="flex items-center gap-2">
                                {tab.icon && (
                                    <span className="flex-shrink-0">{tab.icon}</span>
                                )}
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded-full min-w-[16px] h-4">
                                        {tab.badge}
                                    </span>
                                )}
                                {tab.closable && onTabClose && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleTabClose(e, tab.value)}
                                        className="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-slate-950"
                                        aria-label={`Close ${tab.label} tab`}
                                    >
                                        <span className="h-3 w-3 text-slate-500">×</span>
                                    </button>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div
                    id={`content-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                    tabIndex={0}
                    className={cn(tabsContentVariants({ variant }))}
                >
                    {activeTabContent}
                </div>
            </div>
        );
    }
);

Tabs.displayName = "Tabs";

// Controlled Tabs component for external state management
export interface ControlledTabsProps extends Omit<TabsProps, 'defaultValue'> {
    value: string;
    onValueChange: (value: string) => void;
}

const ControlledTabs = React.forwardRef<HTMLDivElement, ControlledTabsProps>(
    (props, ref) => {
        return <Tabs ref={ref} {...props} />;
    }
);

ControlledTabs.displayName = "ControlledTabs";

// Lazy Tabs component for performance optimization
export interface LazyTabsProps extends TabsProps {
    lazy?: boolean;
    keepMounted?: string[]; // tabs to keep mounted even when inactive
}

const LazyTabs = React.forwardRef<HTMLDivElement, LazyTabsProps>(
    (
        {
            lazy = true,
            keepMounted = [],
            tabs,
            ...props
        },
        ref
    ) => {
        const [mountedTabs, setMountedTabs] = React.useState<Set<string>>(
            new Set([props.value || props.defaultValue || tabs[0]?.value, ...keepMounted])
        );

        React.useEffect(() => {
            const currentTab = props.value || props.defaultValue || tabs[0]?.value;
            if (currentTab) {
                setMountedTabs(prev => new Set([...prev, currentTab]));
            }
        }, [props.value, props.defaultValue, tabs]);

        const lazyTabs = tabs.map(tab => ({
            ...tab,
            content: (lazy && !mountedTabs.has(tab.value) && !keepMounted.includes(tab.value))
                ? <div>Loading...</div>
                : tab.content
        }));

        return <Tabs ref={ref} {...props} tabs={lazyTabs} />;
    }
);

LazyTabs.displayName = "LazyTabs";

// Animated Tabs component with smooth transitions
export interface AnimatedTabsProps extends TabsProps {
    animate?: boolean;
    animationDuration?: number;
}

const AnimatedTabs = React.forwardRef<HTMLDivElement, AnimatedTabsProps>(
    (
        {
            animate = true,
            animationDuration = 200,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <Tabs
                ref={ref}
                className={cn(
                    animate && "transition-all duration-200 ease-in-out",
                    className
                )}
                {...props}
            />
        );
    }
);

AnimatedTabs.displayName = "AnimatedTabs";

export {
    Tabs,
    ControlledTabs,
    LazyTabs,
    AnimatedTabs,
    tabsListVariants,
    tabsTriggerVariants,
    tabsContentVariants
};
