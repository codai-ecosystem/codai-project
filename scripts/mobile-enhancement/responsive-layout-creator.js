/**
 * @fileoverview Responsive Layout Creator
 * @description Creates responsive layout patterns and components
 */

const fs = require('fs');
const path = require('path');

function createResponsiveLayouts(appDir) {
    const layoutsDir = path.join(appDir, 'src', 'components', 'layouts');
    if (!fs.existsSync(layoutsDir)) {
        fs.mkdirSync(layoutsDir, { recursive: true });
    }

    createGridLayouts(layoutsDir);
    createFlexLayouts(layoutsDir);
    createResponsiveWrappers(layoutsDir);
}

function createGridLayouts(layoutsDir) {
    const gridLayoutContent = `'use client';

import React from 'react';

interface ResponsiveGridProps {
    children: React.ReactNode;
    columns?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ResponsiveGrid({
    children,
    columns = { xs: 1, sm: 2, md: 3, lg: 4 },
    gap = 'md',
    className = ''
}: ResponsiveGridProps) {
    const gapClasses = {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6'
    };

    const getColumnClasses = () => {
        const classes = ['grid'];
        
        if (columns.xs) classes.push(\`grid-cols-\${columns.xs}\`);
        if (columns.sm) classes.push(\`sm:grid-cols-\${columns.sm}\`);
        if (columns.md) classes.push(\`md:grid-cols-\${columns.md}\`);
        if (columns.lg) classes.push(\`lg:grid-cols-\${columns.lg}\`);
        if (columns.xl) classes.push(\`xl:grid-cols-\${columns.xl}\`);
        
        return classes.join(' ');
    };

    return (
        <div className={\`\${getColumnClasses()} \${gapClasses[gap]} \${className}\`}>
            {children}
        </div>
    );
}

interface MasonryGridProps {
    children: React.ReactNode;
    columns?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
    };
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function MasonryGrid({
    children,
    columns = { xs: 1, sm: 2, md: 3, lg: 4 },
    gap = 'md',
    className = ''
}: MasonryGridProps) {
    const gapClasses = {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6'
    };

    const getColumnClasses = () => {
        const classes = ['columns-1'];
        
        if (columns.sm) classes.push(\`sm:columns-\${columns.sm}\`);
        if (columns.md) classes.push(\`md:columns-\${columns.md}\`);
        if (columns.lg) classes.push(\`lg:columns-\${columns.lg}\`);
        
        return classes.join(' ');
    };

    return (
        <div className={\`\${getColumnClasses()} \${gapClasses[gap]} \${className}\`}>
            {React.Children.map(children, (child, index) => (
                <div key={index} className="break-inside-avoid mb-4">
                    {child}
                </div>
            ))}
        </div>
    );
}`;

    fs.writeFileSync(path.join(layoutsDir, 'ResponsiveGrid.tsx'), gridLayoutContent);
}

function createFlexLayouts(layoutsDir) {
    const flexLayoutContent = `'use client';

import React from 'react';

interface FlexContainerProps {
    children: React.ReactNode;
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    gap?: 'sm' | 'md' | 'lg';
    responsive?: {
        sm?: Partial<FlexContainerProps>;
        md?: Partial<FlexContainerProps>;
        lg?: Partial<FlexContainerProps>;
    };
    className?: string;
}

export default function FlexContainer({
    children,
    direction = 'row',
    wrap = 'wrap',
    justify = 'start',
    align = 'start',
    gap = 'md',
    responsive,
    className = ''
}: FlexContainerProps) {
    const directionClasses = {
        row: 'flex-row',
        column: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'column-reverse': 'flex-col-reverse'
    };

    const wrapClasses = {
        wrap: 'flex-wrap',
        nowrap: 'flex-nowrap',
        'wrap-reverse': 'flex-wrap-reverse'
    };

    const justifyClasses = {
        start: 'justify-start',
        end: 'justify-end',
        center: 'justify-center',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
    };

    const alignClasses = {
        start: 'items-start',
        end: 'items-end',
        center: 'items-center',
        baseline: 'items-baseline',
        stretch: 'items-stretch'
    };

    const gapClasses = {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6'
    };

    const getResponsiveClasses = () => {
        let classes = '';
        
        if (responsive?.sm) {
            const { direction: smDir, justify: smJust, align: smAlign } = responsive.sm;
            if (smDir) classes += \` sm:\${directionClasses[smDir]}\`;
            if (smJust) classes += \` sm:\${justifyClasses[smJust]}\`;
            if (smAlign) classes += \` sm:\${alignClasses[smAlign]}\`;
        }
        
        if (responsive?.md) {
            const { direction: mdDir, justify: mdJust, align: mdAlign } = responsive.md;
            if (mdDir) classes += \` md:\${directionClasses[mdDir]}\`;
            if (mdJust) classes += \` md:\${justifyClasses[mdJust]}\`;
            if (mdAlign) classes += \` md:\${alignClasses[mdAlign]}\`;
        }
        
        if (responsive?.lg) {
            const { direction: lgDir, justify: lgJust, align: lgAlign } = responsive.lg;
            if (lgDir) classes += \` lg:\${directionClasses[lgDir]}\`;
            if (lgJust) classes += \` lg:\${justifyClasses[lgJust]}\`;
            if (lgAlign) classes += \` lg:\${alignClasses[lgAlign]}\`;
        }
        
        return classes;
    };

    return (
        <div 
            className={\`flex \${directionClasses[direction]} \${wrapClasses[wrap]} \${justifyClasses[justify]} \${alignClasses[align]} \${gapClasses[gap]}\${getResponsiveClasses()} \${className}\`}
        >
            {children}
        </div>
    );
}

interface FlexItemProps {
    children: React.ReactNode;
    flex?: 'none' | 'auto' | 'initial' | number;
    grow?: boolean | number;
    shrink?: boolean | number;
    order?: number;
    alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    responsive?: {
        sm?: Partial<FlexItemProps>;
        md?: Partial<FlexItemProps>;
        lg?: Partial<FlexItemProps>;
    };
    className?: string;
}

export function FlexItem({
    children,
    flex,
    grow,
    shrink,
    order,
    alignSelf,
    responsive,
    className = ''
}: FlexItemProps) {
    const getFlexClasses = () => {
        let classes = '';
        
        if (flex === 'none') classes += ' flex-none';
        else if (flex === 'auto') classes += ' flex-auto';
        else if (flex === 'initial') classes += ' flex-initial';
        else if (typeof flex === 'number') classes += \` flex-[\${flex}]\`;
        
        if (grow === true) classes += ' flex-grow';
        else if (typeof grow === 'number') classes += \` flex-grow-[\${grow}]\`;
        
        if (shrink === true) classes += ' flex-shrink';
        else if (typeof shrink === 'number') classes += \` flex-shrink-[\${shrink}]\`;
        
        if (order) classes += \` order-\${order}\`;
        
        if (alignSelf) {
            const alignSelfClasses = {
                auto: 'self-auto',
                start: 'self-start',
                end: 'self-end',
                center: 'self-center',
                baseline: 'self-baseline',
                stretch: 'self-stretch'
            };
            classes += \` \${alignSelfClasses[alignSelf]}\`;
        }
        
        return classes;
    };

    return (
        <div className={\`\${getFlexClasses()} \${className}\`}>
            {children}
        </div>
    );
}`;

    fs.writeFileSync(path.join(layoutsDir, 'FlexContainer.tsx'), flexLayoutContent);
}

function createResponsiveWrappers(layoutsDir) {
    const wrapperContent = `'use client';

import React from 'react';

interface ResponsiveWrapperProps {
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    center?: boolean;
    className?: string;
}

export default function ResponsiveWrapper({
    children,
    maxWidth = 'xl',
    padding = 'md',
    center = true,
    className = ''
}: ResponsiveWrapperProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full'
    };

    const paddingClasses = {
        none: '',
        sm: 'px-4 py-2',
        md: 'px-6 py-4',
        lg: 'px-8 py-6'
    };

    return (
        <div 
            className={\`w-full \${maxWidthClasses[maxWidth]} \${paddingClasses[padding]} \${center ? 'mx-auto' : ''} \${className}\`}
        >
            {children}
        </div>
    );
}

interface StackProps {
    children: React.ReactNode;
    spacing?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
    divider?: React.ReactNode;
    className?: string;
}

export function Stack({
    children,
    spacing = 'md',
    align = 'stretch',
    divider,
    className = ''
}: StackProps) {
    const spacingClasses = {
        sm: 'space-y-2',
        md: 'space-y-4',
        lg: 'space-y-6'
    };

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch'
    };

    const childrenArray = React.Children.toArray(children);

    return (
        <div className={\`flex flex-col \${spacingClasses[spacing]} \${alignClasses[align]} \${className}\`}>
            {divider
                ? childrenArray.map((child, index) => (
                    <React.Fragment key={index}>
                        {child}
                        {index < childrenArray.length - 1 && (
                            <div className="flex-shrink-0">
                                {divider}
                            </div>
                        )}
                    </React.Fragment>
                ))
                : children
            }
        </div>
    );
}

interface HStackProps {
    children: React.ReactNode;
    spacing?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    wrap?: boolean;
    divider?: React.ReactNode;
    className?: string;
}

export function HStack({
    children,
    spacing = 'md',
    align = 'center',
    justify = 'start',
    wrap = false,
    divider,
    className = ''
}: HStackProps) {
    const spacingClasses = {
        sm: 'space-x-2',
        md: 'space-x-4',
        lg: 'space-x-6'
    };

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch'
    };

    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
    };

    const childrenArray = React.Children.toArray(children);

    return (
        <div className={\`flex \${wrap ? 'flex-wrap' : ''} \${spacingClasses[spacing]} \${alignClasses[align]} \${justifyClasses[justify]} \${className}\`}>
            {divider
                ? childrenArray.map((child, index) => (
                    <React.Fragment key={index}>
                        {child}
                        {index < childrenArray.length - 1 && (
                            <div className="flex-shrink-0">
                                {divider}
                            </div>
                        )}
                    </React.Fragment>
                ))
                : children
            }
        </div>
    );
}`;

    fs.writeFileSync(path.join(layoutsDir, 'ResponsiveWrappers.tsx'), wrapperContent);
}

module.exports = createResponsiveLayouts;