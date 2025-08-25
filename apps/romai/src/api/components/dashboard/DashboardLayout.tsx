/**
 * Dashboard Layout Component - Shared Layout for RomAI Dashboards
 * Microsoft React patterns with consistent styling and responsive design
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
    tabs = [],
    activeTab,
    onTabChange,
    headerActions,
    children,
    className = ''
}: DashboardLayoutProps) {
    return (
        <div className={`p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen ${className}`}>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            {title}
                        </motion.h1>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-600 text-lg"
                            >
                                {subtitle}
                            </motion.p>
                        )}
                    </div>

                    {headerActions && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-shrink-0"
                        >
                            {headerActions}
                        </motion.div>
                    )}
                </div>

                {/* Tabs Navigation */}
                {tabs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm"
                    >
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange?.(tab.id)}
                                    className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                        }
                  `}
                                    aria-current={activeTab === tab.id ? 'page' : undefined}
                                >
                                    <span className="flex items-center gap-2">
                                        {tab.icon && <span className="text-lg">{tab.icon}</span>}
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`
          ${tabs.length > 0 ? 'bg-white rounded-b-lg shadow-sm' : 'bg-white rounded-lg shadow-sm'}
          p-6
        `}
            >
                {children}
            </motion.div>
        </div>
    );
}