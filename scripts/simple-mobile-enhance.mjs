#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple mobile enhancement for testing
async function enhanceApp(appName = 'memorai') {
    console.log(`🚀 Enhancing ${appName} with mobile components...`);

    const appDir = path.resolve(__dirname, '..', 'apps', appName);
    const srcDir = path.join(appDir, 'src');
    const componentsDir = path.join(srcDir, 'components', 'mobile');

    // Create mobile components directory
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
        console.log(`✅ Created directory: ${componentsDir}`);
    }

    // Create a simple mobile navigation component
    const mobileNavContent = `'use client';

import React, { useState } from 'react';

interface MobileNavigationProps {
    menuItems: Array<{
        label: string;
        href: string;
        icon?: React.ReactNode;
    }>;
    onMenuToggle?: (isOpen: boolean) => void;
}

export default function MobileNavigation({ 
    menuItems, 
    onMenuToggle 
}: MobileNavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        onMenuToggle?.(newState);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md touch-target"
                aria-label="Toggle menu"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-800 shadow-xl">
                        <div className="p-4">
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 touch-target ml-auto flex"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <nav>
                                {menuItems.map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.href}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors touch-target"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'MobileNavigation.tsx'), mobileNavContent);
    console.log(`✅ Created MobileNavigation component for ${appName}`);

    // Create a basic responsive container
    const containerContent = `'use client';

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
        sm: 'max-w-sm',
        md: 'max-w-md', 
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full'
    };

    const paddingClasses = {
        none: '',
        sm: 'p-2 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
    };

    return (
        <div className={\`mx-auto w-full \${maxWidthClasses[maxWidth]} \${paddingClasses[padding]} \${className}\`}>
            {children}
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'ResponsiveContainer.tsx'), containerContent);
    console.log(`✅ Created ResponsiveContainer component for ${appName}`);

    console.log(`🎉 Mobile enhancement complete for ${appName}!`);
    return true;
}

// Run the enhancement
enhanceApp().catch(console.error);