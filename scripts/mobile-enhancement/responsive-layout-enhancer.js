/**
 * @fileoverview Responsive Layout Enhancer
 * @description Enhances application layouts with mobile-first responsive design
 */

const fs = require('fs');
const path = require('path');

function enhanceResponsiveLayouts(layoutsDir) {
    const layoutPath = path.join(layoutsDir, 'layout.tsx');

    if (fs.existsSync(layoutPath)) {
        enhanceExistingLayout(layoutPath);
    }

    createMobileLayoutComponents(layoutsDir);
    enhanceGlobalStyles(layoutsDir);
}

function enhanceExistingLayout(layoutPath) {
    let content = fs.readFileSync(layoutPath, 'utf8');

    // Add viewport meta tag if not exists
    if (!content.includes('viewport')) {
        content = content.replace(
            /export const metadata.*?};/s,
            (match) => {
                if (!match.includes('viewport:')) {
                    return match.replace(
                        /};$/,
                        `,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CODAI App'
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false
  }
};`
                    );
                }
                return match;
            }
        );
    }

    // Add mobile-optimized body classes
    if (!content.includes('safe-area-inset')) {
        content = content.replace(
            /<body[^>]*>/,
            (match) => {
                const existingClasses = match.match(/className=["'][^"']*["']/);
                if (existingClasses) {
                    return match.replace(
                        existingClasses[0],
                        existingClasses[0].slice(0, -1) + ' safe-area-inset-top safe-area-inset-bottom antialiased"'
                    );
                } else {
                    return match.replace('>', ' className="safe-area-inset-top safe-area-inset-bottom antialiased">');
                }
            }
        );
    }

    fs.writeFileSync(layoutPath, content);
}

function createMobileLayoutComponents(layoutsDir) {
    const componentsDir = path.join(path.dirname(layoutsDir), 'components', 'layout');
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    createMobileLayoutWrapper(componentsDir);
    createResponsiveHeader(componentsDir);
    createMobileFooter(componentsDir);
}

function createMobileLayoutWrapper(componentsDir) {
    const wrapperContent = `'use client';

import React, { useState, useEffect } from 'react';

interface MobileLayoutWrapperProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    sidebar?: React.ReactNode;
}

export default function MobileLayoutWrapper({
    children,
    header,
    footer,
    sidebar
}: MobileLayoutWrapperProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            {header && (
                <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 shadow-sm">
                    {header}
                </header>
            )}

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {sidebar && (
                    <>
                        {/* Desktop Sidebar */}
                        <aside className="hidden md:flex md:flex-shrink-0">
                            <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
                                {sidebar}
                            </div>
                        </aside>

                        {/* Mobile Sidebar */}
                        <div className={\\`fixed inset-0 z - 50 md: hidden \\${ sidebarOpen ? 'block' : 'hidden' } \\`}>
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-xl">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-lg font-semibold">Menu</span>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {sidebar}
                            </div>
                        </div>
                    </>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            {footer && (
                <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                    {footer}
                </footer>
            )}

            {/* Mobile Menu Button */}
            {sidebar && isMobile && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed bottom-4 left-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg md:hidden touch-target"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'MobileLayoutWrapper.tsx'), wrapperContent);
}

function createResponsiveHeader(componentsDir) {
    const headerContent = `'use client';

import React, { useState } from 'react';

interface ResponsiveHeaderProps {
    title: string;
    logo?: React.ReactNode;
    navigation?: Array<{
        label: string;
        href: string;
        current?: boolean;
    }>;
    actions?: React.ReactNode;
    onMenuClick?: () => void;
}

export default function ResponsiveHeader({
    title,
    logo,
    navigation = [],
    actions,
    onMenuClick
}: ResponsiveHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left section */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu button */}
                        {onMenuClick && (
                            <button
                                onClick={onMenuClick}
                                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 touch-target"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}

                        {/* Logo */}
                        {logo && (
                            <div className="flex-shrink-0">
                                {logo}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">
                            {title}
                        </h1>
                    </div>

                    {/* Desktop navigation */}
                    {navigation.length > 0 && (
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={\\`px-3 py - 2 text - sm font - medium rounded - lg transition - colors \\${
        item.current
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700'
    } \\`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    )}

                    {/* Right section */}
                    <div className="flex items-center space-x-2">
                        {actions && (
                            <div className="flex items-center space-x-2">
                                {actions}
                            </div>
                        )}

                        {/* Mobile navigation button */}
                        {navigation.length > 0 && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 touch-target"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile navigation menu */}
                {mobileMenuOpen && navigation.length > 0 && (
                    <div className="md:hidden border-t border-gray-200 dark:border-slate-700">
                        <div className="py-2 space-y-1">
                            {navigation.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={\\`block px - 4 py - 3 text - base font - medium transition - colors touch - target \\${
        item.current
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700'
    } \\`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'ResponsiveHeader.tsx'), headerContent);
}

function createMobileFooter(componentsDir) {
    const footerContent = `'use client';

import React from 'react';

interface MobileFooterProps {
    companyName?: string;
    version?: string;
    links?: Array<{
        label: string;
        href: string;
    }>;
    showVersion?: boolean;
    className?: string;
}

export default function MobileFooter({
    companyName = 'CODAI',
    version,
    links = [],
    showVersion = true,
    className = ''
}: MobileFooterProps) {
    return (
        <footer className={\\`bg-white dark: bg - slate - 800 border - t border - gray - 200 dark: border - slate - 700 \\${ className } \\`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4">
                    {/* Links - Desktop */}
                    {links.length > 0 && (
                        <div className="hidden sm:flex justify-center space-x-6 mb-4">
                            {links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Links - Mobile */}
                    {links.length > 0 && (
                        <div className="sm:hidden flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
                            {links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors touch-target"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Copyright and version */}
                    <div className="flex flex-col sm:flex-row justify-center items-center text-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            © {new Date().getFullYear()} {companyName}. All rights reserved.
                        </div>
                        {showVersion && version && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                                Version {version}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'MobileFooter.tsx'), footerContent);
}

function enhanceGlobalStyles(layoutsDir) {
    const globalsCssPath = path.join(layoutsDir, 'globals.css');

    if (fs.existsSync(globalsCssPath)) {
        let content = fs.readFileSync(globalsCssPath, 'utf8');

        const mobileStyles = `
/* Mobile-first responsive enhancements */
@media (max-width: 768px) {
    /* Improve touch targets */
    button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
    }
    
    /* Optimize text for mobile */
    body {
        font-size: 16px; /* Prevent zoom on iOS */
        line-height: 1.5;
    }
    
    /* Smooth scrolling on mobile */
    * {
        -webkit-overflow-scrolling: touch;
    }
}

/* Safe area support for devices with notches */
@supports (padding: env(safe-area-inset-top)) {
    .safe-area-top {
        padding-top: env(safe-area-inset-top);
    }
    
    .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
    }
}

/* Touch-friendly interactions */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem;
}

.touch-action {
    touch-action: manipulation;
}

/* Mobile-optimized scrolling */
.scroll-smooth-mobile {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* Responsive text utilities */
@media (max-width: 640px) {
    .text-responsive-sm {
        font-size: 0.875rem;
    }
    
    .text-responsive-base {
        font-size: 1rem;
    }
    
    .text-responsive-lg {
        font-size: 1.125rem;
    }
}`;

        if (!content.includes('touch-target')) {
            content += mobileStyles;
            fs.writeFileSync(globalsCssPath, content);
        }
    }
}

module.exports = enhanceResponsiveLayouts;