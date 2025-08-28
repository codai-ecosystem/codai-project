'use client';

/**
 * Main Navigation Component for RomAI AGI Platform
 * Comprehensive navigation with all sections and features
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickLanguageToggle } from '../i18n/LanguageSelector';

interface NavigationItem {
    label: string;
    href: string;
    icon: string;
    description: string;
    badge?: string;
}

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: '/',
        icon: '🏠',
        description: 'AGI System Overview'
    },
    {
        label: 'Self-Learning',
        href: '/self-learning',
        icon: '🧠',
        description: 'AI Learning Interface',
        badge: 'Live'
    },
    {
        label: 'Training Center',
        href: '/training',
        icon: '🎯',
        description: 'Advanced Reasoning Training',
        badge: 'Priority'
    },
    {
        label: 'Analytics',
        href: '/analytics',
        icon: '📊',
        description: 'Performance & Capabilities'
    },
    {
        label: 'Romanian Intelligence',
        href: '/romanian',
        icon: '🇷🇴',
        description: 'Cultural & Language AI'
    },
    {
        label: 'Conversation',
        href: '/conversation',
        icon: '💬',
        description: 'Interactive AGI Chat'
    },
    {
        label: 'Research Lab',
        href: '/research',
        icon: '🔬',
        description: 'AI Research & Development'
    },
    {
        label: 'System Monitor',
        href: '/monitor',
        icon: '⚡',
        description: 'Server & Performance'
    },
    {
        label: 'Configuration',
        href: '/settings',
        icon: '⚙️',
        description: 'System Settings'
    }
];

const MainNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        // Set initial window width
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);

            // Handle window resize
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700"
                >
                    <div className="w-6 h-6 flex flex-col justify-center items-center">
                        <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-transform ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mt-1 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 mt-1 transition-transform ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
                    </div>
                </button>
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {(isOpen || windowWidth >= 1024) && (
                    <motion.nav
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 lg:relative lg:translate-x-0"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">🧠</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        RomAI AGI
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Romanian Intelligence
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="p-4 space-y-2 overflow-y-auto">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`
                      block p-4 rounded-lg transition-all duration-200 group
                      ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent'
                                            }
                    `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-medium ${isActive ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                                                        {item.label}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm mt-1 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                            {/* Language Selector */}
                            <div className="flex justify-center">
                                <QuickLanguageToggle className="w-full" />
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                        AGI System Online
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Real Data • Production Ready
                                </p>
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                />
            )}
        </>
    );
};

export default MainNavigation;

