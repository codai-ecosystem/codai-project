/**
 * Dashboard Layout - Shared Layout Component for ID Service
 * Microsoft React patterns with consistent layout structure
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon?: string;
}

interface DashboardLayoutProps {
    title: string;
    subtitle?: string;
    tabs?: Tab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    headerActions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export default function DashboardLayout({
    title,
    subtitle,
    tabs,
    activeTab,
    onTabChange,
    headerActions,
    children,
    className = ''
}: DashboardLayoutProps) {
    return (
        <div className={`bg-gray-50 ${className}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl text-white">🆔</span>
                                </div>
                                <div>
                                    <motion.h1
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl font-bold text-gray-900"
                                    >
                                        {title}
                                    </motion.h1>
                                    {subtitle && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-sm text-gray-600 mt-1"
                                        >
                                            {subtitle}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            {headerActions && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {headerActions}
                                </motion.div>
                            )}
                        </div>

                        {/* Tabs */}
                        {tabs && tabs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-6"
                            >
                                <div className="border-b border-gray-200">
                                    <nav className="flex space-x-8" aria-label="Tabs">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => onTabChange?.(tab.id)}
                                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                                aria-current={activeTab === tab.id ? 'page' : undefined}
                                            >
                                                <span className="flex items-center space-x-2">
                                                    {tab.icon && <span>{tab.icon}</span>}
                                                    <span>{tab.label}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}