import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { AppName } from "../../config/design-tokens";

const accordionVariants = cva(
    "w-full",
    {
        variants: {
            variant: {
                default: "space-y-2",
                bordered: "border border-slate-200 rounded-lg overflow-hidden",
                flush: "space-y-0",
                card: "space-y-4",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const accordionItemVariants = cva(
    "border-b border-slate-200",
    {
        variants: {
            variant: {
                default: "border-b border-slate-200",
                bordered: "border-b border-slate-200 last:border-b-0",
                flush: "border-b border-slate-200 last:border-b-0",
                card: "border border-slate-200 rounded-lg p-0 bg-white shadow-sm",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const accordionTriggerVariants = cva(
    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
    {
        variants: {
            size: {
                sm: "py-2 text-sm",
                md: "py-4 text-base",
                lg: "py-5 text-lg",
                xl: "py-6 text-xl",
            },
            variant: {
                default: "px-0",
                bordered: "px-4",
                flush: "px-0",
                card: "px-4",
            },
            app: {
                codai: "hover:text-blue-600 data-[state=open]:text-blue-600",
                memorai: "hover:text-purple-600 data-[state=open]:text-purple-600",
                bancai: "hover:text-green-600 data-[state=open]:text-green-600",
                romai: "hover:text-red-600 data-[state=open]:text-red-600",
                ajutai: "hover:text-orange-600 data-[state=open]:text-orange-600",
                controlai: "hover:text-indigo-600 data-[state=open]:text-indigo-600",
                studiai: "hover:text-teal-600 data-[state=open]:text-teal-600",
                sociai: "hover:text-pink-600 data-[state=open]:text-pink-600",
                cumparai: "hover:text-cyan-600 data-[state=open]:text-cyan-600",
                donai: "hover:text-emerald-600 data-[state=open]:text-emerald-600",
            },
        },
        defaultVariants: {
            size: "md",
            variant: "default",
        },
    }
);

const accordionContentVariants = cva(
    "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    {
        variants: {
            variant: {
                default: "pb-4 pt-0",
                bordered: "px-4 pb-4 pt-0",
                flush: "pb-4 pt-0",
                card: "px-4 pb-4 pt-0",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    badge?: string | number;
    defaultOpen?: boolean;
}

export interface AccordionProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'>,
    VariantProps<typeof accordionVariants> {
    app?: AppName;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    items: AccordionItem[];
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    collapsible?: boolean;
    animated?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
    (
        {
            className,
            variant,
            app,
            size,
            items,
            type = 'single',
            defaultValue,
            value,
            onValueChange,
            collapsible = true,
            animated = true,
            ...props
        },
        ref
    ) => {
        // Initialize state based on type
        const [openItems, setOpenItems] = React.useState<string[]>(() => {
            if (value !== undefined) {
                return Array.isArray(value) ? value : [value];
            }
            if (defaultValue !== undefined) {
                return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
            }
            // Auto-open items marked with defaultOpen
            return items.filter(item => item.defaultOpen).map(item => item.id);
        });

        React.useEffect(() => {
            if (value !== undefined) {
                const newOpenItems = Array.isArray(value) ? value : [value];
                setOpenItems(newOpenItems);
            }
        }, [value]);

        const handleToggle = (itemId: string) => {
            if (items.find(item => item.id === itemId)?.disabled) return;

            let newOpenItems: string[];

            if (type === 'single') {
                // Single accordion: only one item can be open
                if (openItems.includes(itemId)) {
                    newOpenItems = collapsible ? [] : [itemId];
                } else {
                    newOpenItems = [itemId];
                }
            } else {
                // Multiple accordion: multiple items can be open
                if (openItems.includes(itemId)) {
                    newOpenItems = openItems.filter(id => id !== itemId);
                } else {
                    newOpenItems = [...openItems, itemId];
                }
            }

            setOpenItems(newOpenItems);

            // Call onValueChange with appropriate format
            if (type === 'single') {
                onValueChange?.(newOpenItems[0] || "");
            } else {
                onValueChange?.(newOpenItems);
            }
        };

        return (
            <div
                ref={ref}
                className={cn(accordionVariants({ variant, className }))}
                data-orientation="vertical"
                {...props}
            >
                {items.map((item) => {
                    const isOpen = openItems.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className={cn(accordionItemVariants({ variant }))}
                            data-state={isOpen ? "open" : "closed"}
                        >
                            <h3 className="flex">
                                <button
                                    type="button"
                                    className={cn(
                                        accordionTriggerVariants({ size, variant, app }),
                                        item.disabled && "opacity-50 cursor-not-allowed",
                                        "text-left"
                                    )}
                                    data-state={isOpen ? "open" : "closed"}
                                    onClick={() => handleToggle(item.id)}
                                    disabled={item.disabled}
                                    aria-expanded={isOpen}
                                    aria-controls={`content-${item.id}`}
                                    id={`trigger-${item.id}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon && (
                                            <span className="flex-shrink-0">{item.icon}</span>
                                        )}
                                        <span className="flex-1">{item.title}</span>
                                        {item.badge && (
                                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 shrink-0 transition-transform duration-200",
                                            !animated && "transition-none"
                                        )}
                                    />
                                </button>
                            </h3>

                            <div
                                id={`content-${item.id}`}
                                role="region"
                                aria-labelledby={`trigger-${item.id}`}
                                data-state={isOpen ? "open" : "closed"}
                                className={cn(
                                    accordionContentVariants({ variant }),
                                    !animated && "transition-none",
                                    !isOpen && "hidden"
                                )}
                            >
                                <div className="text-slate-700">
                                    {item.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
);

Accordion.displayName = "Accordion";

// Controlled Accordion component
export interface ControlledAccordionProps extends Omit<AccordionProps, 'defaultValue'> {
    value: string | string[];
    onValueChange: (value: string | string[]) => void;
}

const ControlledAccordion = React.forwardRef<HTMLDivElement, ControlledAccordionProps>(
    (props, ref) => {
        return <Accordion ref={ref} {...props} />;
    }
);

ControlledAccordion.displayName = "ControlledAccordion";

// FAQ Accordion specialized for frequently asked questions
export interface FAQItem {
    id: string;
    question: string;
    answer: React.ReactNode;
    category?: string;
}

export interface FAQAccordionProps extends Omit<AccordionProps, 'items'> {
    faqs: FAQItem[];
    searchable?: boolean;
    categorized?: boolean;
}

const FAQAccordion = React.forwardRef<HTMLDivElement, FAQAccordionProps>(
    (
        {
            faqs,
            searchable = false,
            categorized = false,
            ...props
        },
        ref
    ) => {
        const [searchQuery, setSearchQuery] = React.useState("");

        const filteredFAQs = React.useMemo(() => {
            if (!searchQuery) return faqs;
            return faqs.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }, [faqs, searchQuery]);

        const categorizedFAQs = React.useMemo(() => {
            if (!categorized) return { 'All': filteredFAQs };

            return filteredFAQs.reduce((acc, faq) => {
                const category = faq.category || 'Other';
                if (!acc[category]) acc[category] = [];
                acc[category].push(faq);
                return acc;
            }, {} as Record<string, FAQItem[]>);
        }, [filteredFAQs, categorized]);

        const accordionItems = Object.entries(categorizedFAQs).flatMap(([category, categoryFAQs]) => {
            const items = categoryFAQs.map(faq => ({
                id: faq.id,
                title: faq.question,
                content: faq.answer,
            }));

            if (categorized && Object.keys(categorizedFAQs).length > 1) {
                return [
                    {
                        id: `category-${category}`,
                        title: category,
                        content: (
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="border-l-2 border-slate-200 pl-4">
                                        <div className="font-medium text-slate-900 mb-1">{item.title}</div>
                                        <div className="text-slate-600">{item.content}</div>
                                    </div>
                                ))}
                            </div>
                        ),
                    }
                ];
            }

            return items;
        });

        return (
            <div className="space-y-4">
                {searchable && (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent"
                        />
                    </div>
                )}

                <Accordion
                    ref={ref}
                    items={accordionItems}
                    type="multiple"
                    {...props}
                />
            </div>
        );
    }
);

FAQAccordion.displayName = "FAQAccordion";

// Nested Accordion for hierarchical content
export interface NestedAccordionItem extends AccordionItem {
    children?: NestedAccordionItem[];
}

export interface NestedAccordionProps extends Omit<AccordionProps, 'items'> {
    items: NestedAccordionItem[];
    maxDepth?: number;
}

const NestedAccordion = React.forwardRef<HTMLDivElement, NestedAccordionProps>(
    (
        {
            items,
            maxDepth = 3,
            ...props
        },
        ref
    ) => {
        const renderNestedItems = (nestedItems: NestedAccordionItem[], depth = 0): AccordionItem[] => {
            return nestedItems.map(item => ({
                ...item,
                content: (
                    <div className="space-y-2">
                        {item.content}
                        {item.children && item.children.length > 0 && depth < maxDepth && (
                            <div className="ml-4 mt-4 border-l-2 border-slate-200 pl-4">
                                <NestedAccordion
                                    items={item.children}
                                    maxDepth={maxDepth}
                                    variant="flush"
                                    {...props}
                                />
                            </div>
                        )}
                    </div>
                ),
            }));
        };

        const flattenedItems = renderNestedItems(items);

        return (
            <Accordion
                ref={ref}
                items={flattenedItems}
                {...props}
            />
        );
    }
);

NestedAccordion.displayName = "NestedAccordion";

export {
    Accordion,
    ControlledAccordion,
    FAQAccordion,
    NestedAccordion,
    accordionVariants,
    accordionItemVariants,
    accordionTriggerVariants,
    accordionContentVariants
};
