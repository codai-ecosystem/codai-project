'use client';

import React from 'react';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ResponsiveContainer({
    children,
    maxWidth = 'lg',
    padding = 'md', 
    className = ''
}: ResponsiveContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg',
        xl: 'max-w-xl', '2xl': 'max-w-2xl', full: 'max-w-full'
    };

    const paddingClasses = {
        none: '', sm: 'p-2 sm:p-4',
        md: 'p-4 sm:p-6', lg: 'p-6 sm:p-8'
    };

    return (
        <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
}