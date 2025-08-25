/**
 * @fileoverview Mobile Components Creator
 * @description Creates mobile-optimized React components for CODAI applications
 */

const fs = require('fs');
const path = require('path');

/**
 * @fileoverview Mobile Components Creator
 * @description Creates mobile-optimized React components
 */

import fs from 'fs';
import path from 'path';

export default function createMobileComponents(dirs, appName) {
    // Ensure mobile components directory exists
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    createMobileNavigation(componentsDir);
    createResponsiveContainer(componentsDir);
    createTouchButton(componentsDir);
    createMobileDrawer(componentsDir);
    createMobileCard(componentsDir);
}

function createMobileNavigation(componentsDir) {
    const mobileNavContent = `'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MobileNavigationProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: Array<{
        label: string;
        href: string;
        icon?: React.ReactNode;
    }>;
}

export default function MobileNavigation({ isOpen, onClose, navItems }: MobileNavigationProps) {
    const router = useRouter();
    const [activeItem, setActiveItem] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActiveItem(window.location.pathname);
        }
    }, []);

    const handleNavClick = (href: string) => {
        router.push(href);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={\`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 \${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }\`}
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Mobile Navigation Drawer */}
            <nav 
                className={\`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out \${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }\`}
                aria-label="Mobile navigation"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Navigation
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors touch-target"
                        aria-label="Close navigation"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="py-4">
                    {navItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavClick(item.href)}
                            className={\`w-full flex items-center px-6 py-4 text-left transition-colors touch-target \${
                                activeItem === item.href
                                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'
                            }\`}
                        >
                            {item.icon && (
                                <span className="mr-3 text-xl">
                                    {item.icon}
                                </span>
                            )}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'MobileNavigation.tsx'), mobileNavContent);
}

function createResponsiveContainer(componentsDir) {
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
    maxWidth = 'xl',
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
        sm: 'px-4 sm:px-6',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12'
    };

    return (
        <div 
            className={\`w-full mx-auto \${maxWidthClasses[maxWidth]} \${paddingClasses[padding]} \${className}\`}
        >
            {children}
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'ResponsiveContainer.tsx'), containerContent);
}

function createTouchButton(componentsDir) {
    const touchButtonContent = `'use client';

import React, { useState } from 'react';

interface TouchButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    hapticFeedback?: boolean;
}

export default function TouchButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    hapticFeedback = true
}: TouchButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const handleTouchStart = () => {
        setIsPressed(true);
        if (hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    const handleTouchEnd = () => {
        setIsPressed(false);
    };

    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100',
        ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200'
    };

    const sizeClasses = {
        sm: 'min-h-[40px] px-3 py-2 text-sm',
        md: 'min-h-[44px] px-4 py-3 text-base', 
        lg: 'min-h-[48px] px-6 py-4 text-lg'
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabledClasses} \${
                isPressed ? 'scale-95' : 'scale-100'
            } \${className}\`}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            disabled={disabled}
            style={{ touchAction: 'manipulation' }}
        >
            {children}
        </button>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'TouchButton.tsx'), touchButtonContent);
}

function createMobileDrawer(componentsDir) {
    const drawerContent = `'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    position?: 'bottom' | 'top' | 'left' | 'right';
    children: React.ReactNode;
    title?: string;
}

export default function MobileDrawer({
    isOpen,
    onClose,
    position = 'bottom',
    children,
    title
}: MobileDrawerProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const positionClasses = {
        bottom: 'bottom-0 left-0 right-0 rounded-t-xl max-h-[85vh]',
        top: 'top-0 left-0 right-0 rounded-b-xl max-h-[85vh]',
        left: 'left-0 top-0 bottom-0 rounded-r-xl max-w-[85vw] w-80',
        right: 'right-0 top-0 bottom-0 rounded-l-xl max-w-[85vw] w-80'
    };

    const translateClasses = {
        bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
        top: isOpen ? 'translate-y-0' : '-translate-y-full',
        left: isOpen ? 'translate-x-0' : '-translate-x-full',
        right: isOpen ? 'translate-x-0' : 'translate-x-full'
    };

    const drawer = (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
                className={\`absolute inset-0 bg-black transition-opacity duration-300 \${
                    isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
                }\`}
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div 
                className={\`absolute bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-out \${positionClasses[position]} \${translateClasses[position]}\`}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors touch-target"
                            aria-label="Close drawer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className={\`overflow-y-auto \${position === 'bottom' || position === 'top' ? 'max-h-[calc(85vh-4rem)]' : 'h-full'}\`}>
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(drawer, document.body);
}`;

    fs.writeFileSync(path.join(componentsDir, 'MobileDrawer.tsx'), drawerContent);
}

function createMobileCard(componentsDir) {
    const cardContent = `'use client';

import React, { useState } from 'react';

interface MobileCardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
    elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export default function MobileCard({
    children,
    className = '',
    interactive = false,
    onClick,
    elevation = 'sm'
}: MobileCardProps) {
    const [isPressed, setIsPressed] = useState(false);

    const elevationClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg'
    };

    const baseClasses = \`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 \${elevationClasses[elevation]}\`;

    const interactiveClasses = interactive 
        ? \`cursor-pointer transition-all duration-200 hover:shadow-md active:shadow-sm \${
            isPressed ? 'scale-[0.98]' : 'scale-100'
          } touch-target\`
        : '';

    const handleTouchStart = () => {
        if (interactive) {
            setIsPressed(true);
        }
    };

    const handleTouchEnd = () => {
        if (interactive) {
            setIsPressed(false);
        }
    };

    const handleClick = () => {
        if (interactive && onClick) {
            onClick();
        }
    };

    return (
        <div
            className={\`\${baseClasses} \${interactiveClasses} \${className}\`}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            style={{ touchAction: interactive ? 'manipulation' : 'auto' }}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
        >
            {children}
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'MobileCard.tsx'), cardContent);
}