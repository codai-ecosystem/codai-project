'use client';

import React, { useState } from 'react';

interface MobileNavigationProps {
    menuItems: Array<{
        label: string;
        href: string;
        icon?: React.ReactNode;
    }>;
    onMenuToggle?: (isOpen: boolean) => void;
}

export default function MobileNavigation({ menuItems, onMenuToggle }: MobileNavigationProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        onMenuToggle?.(newState);
    };

    return (
        <>
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
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-800 shadow-xl">
                        <div className="p-4">
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
}