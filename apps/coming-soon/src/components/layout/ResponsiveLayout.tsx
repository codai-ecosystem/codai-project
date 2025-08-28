'use client';

import React from 'react';

// Simple utility function to combine class names
function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Container - Responsive container component with consistent spacing
 */
interface ContainerProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

export const Container: React.FC<ContainerProps> = ({
    children,
    size = 'xl',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'max-w-screen-sm',      // 640px
        md: 'max-w-screen-md',      // 768px
        lg: 'max-w-screen-lg',      // 1024px
        xl: 'max-w-screen-xl',      // 1280px
        full: 'max-w-none'          // Full width
    };

    return (
        <div className={cn(
            'mx-auto px-4 sm:px-6 lg:px-8',
            sizeClasses[size],
            className
        )}>
            {children}
        </div>
    );
};

/**
 * Section - Semantic section component with consistent spacing
 */
interface SectionProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
    containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    background?: 'transparent' | 'primary' | 'secondary' | 'gradient';
}

export const Section: React.FC<SectionProps> = ({
    children,
    id,
    className = '',
    containerSize = 'xl',
    padding = 'lg',
    background = 'transparent'
}) => {
    const paddingClasses = {
        none: '',
        sm: 'py-8 sm:py-12',
        md: 'py-12 sm:py-16',
        lg: 'py-16 sm:py-24',
        xl: 'py-24 sm:py-32'
    };

    const backgroundClasses = {
        transparent: '',
        primary: 'bg-white dark:bg-gray-900',
        secondary: 'bg-gray-50 dark:bg-gray-800',
        gradient: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
    };

    return (
        <section
            id={id}
            className={cn(
                'relative',
                paddingClasses[padding],
                backgroundClasses[background],
                className
            )}
        >
            <Container size={containerSize}>
                {children}
            </Container>
        </section>
    );
};

/**
 * Grid - Responsive grid system using CSS Grid
 */
interface GridProps {
    children: React.ReactNode;
    cols?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
    };
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Grid: React.FC<GridProps> = ({
    children,
    cols = { default: 1, md: 2, lg: 3 },
    gap = 'md',
    className = ''
}) => {
    const gapClasses = {
        none: 'gap-0',
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12'
    };

    // Build grid column classes
    const getGridCols = () => {
        const classes = [];

        if (cols.default) classes.push(`grid-cols-${cols.default}`);
        if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
        if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
        if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
        if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
        if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);

        return classes.join(' ');
    };

    return (
        <div className={cn(
            'grid',
            getGridCols(),
            gapClasses[gap],
            className
        )}>
            {children}
        </div>
    );
};

/**
 * FlexLayout - Flexible layout component with common patterns
 */
interface FlexLayoutProps {
    children: React.ReactNode;
    direction?: 'row' | 'col';
    responsive?: {
        sm?: 'row' | 'col';
        md?: 'row' | 'col';
        lg?: 'row' | 'col';
    };
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'center' | 'end' | 'stretch';
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    wrap?: boolean;
    className?: string;
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
    children,
    direction = 'row',
    responsive,
    justify = 'start',
    align = 'start',
    gap = 'md',
    wrap = false,
    className = ''
}) => {
    const directionClasses = {
        row: 'flex-row',
        col: 'flex-col'
    };

    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
    };

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch'
    };

    const gapClasses = {
        none: 'gap-0',
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12'
    };

    // Build responsive direction classes
    const getResponsiveClasses = () => {
        if (!responsive) return '';

        const classes = [];
        if (responsive.sm) classes.push(`sm:${directionClasses[responsive.sm]}`);
        if (responsive.md) classes.push(`md:${directionClasses[responsive.md]}`);
        if (responsive.lg) classes.push(`lg:${directionClasses[responsive.lg]}`);

        return classes.join(' ');
    };

    return (
        <div className={cn(
            'flex',
            directionClasses[direction],
            getResponsiveClasses(),
            justifyClasses[justify],
            alignClasses[align],
            gapClasses[gap],
            wrap && 'flex-wrap',
            className
        )}>
            {children}
        </div>
    );
};

/**
 * Card - Modern card component with consistent styling
 */
interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    radius = 'lg',
    className = '',
    onClick,
    hover = true
}) => {
    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700',
        elevated: 'bg-white dark:bg-gray-800 shadow-lg border-0',
        outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
        glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20'
    };

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12'
    };

    const radiusClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-full'
    };

    const Component = onClick ? 'button' : 'div';

    return (
        <Component
            className={cn(
                'relative transition-all duration-300',
                variantClasses[variant],
                paddingClasses[padding],
                radiusClasses[radius],
                hover && 'hover:shadow-lg hover:-translate-y-1',
                onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                className
            )}
            onClick={onClick}
        >
            {children}
        </Component>
    );
};

/**
 * AspectRatio - Maintain consistent aspect ratios
 */
interface AspectRatioProps {
    children: React.ReactNode;
    ratio?: 'square' | 'video' | 'wide' | 'tall' | 'golden';
    className?: string;
}

export const AspectRatio: React.FC<AspectRatioProps> = ({
    children,
    ratio = 'square',
    className = ''
}) => {
    const ratioClasses = {
        square: 'aspect-square',      // 1:1
        video: 'aspect-video',        // 16:9
        wide: 'aspect-[21/9]',        // 21:9
        tall: 'aspect-[4/5]',         // 4:5
        golden: 'aspect-[1.618/1]'    // Golden ratio
    };

    return (
        <div className={cn('relative', ratioClasses[ratio], className)}>
            <div className="absolute inset-0">
                {children}
            </div>
        </div>
    );
};

export default Container;