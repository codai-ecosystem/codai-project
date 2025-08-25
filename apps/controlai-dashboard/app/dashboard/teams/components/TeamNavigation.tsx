'use client'

import React from 'react'
/**
 * TeamNavigation Component - View mode navigation
 */

import { motion } from 'framer-motion'
import { Grid, List, MessageSquare, BarChart3 } from 'lucide-react'

interface TeamNavigationProps {
    activeView: 'grid' | 'list' | 'communication' | 'analytics'
    onViewChange: (view: 'grid' | 'list' | 'communication' | 'analytics') => void
}

export function TeamNavigation({ activeView, onViewChange }: TeamNavigationProps) {
    const navigationItems = [
        { id: 'grid', label: 'Team Grid', icon: Grid, description: 'Visual team member cards' },
        { id: 'list', label: 'Member List', icon: List, description: 'Detailed team member list' },
        { id: 'communication', label: 'Communication', icon: MessageSquare, description: 'Team chat and collaboration' },
        { id: 'analytics', label: 'Team Analytics', icon: BarChart3, description: 'Performance metrics and insights' }
    ] as const

    return (
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-20 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-1 overflow-x-auto">
                    {navigationItems.map(({ id, label, icon: Icon, description }) => (
                        <motion.button
                            key={id}
                            onClick={() => onViewChange(id)}
                            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${activeView === id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                }`}
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 0 }}
                            title={description}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {label}
                        </motion.button>
                    ))}
                </div>
            </div>
        </nav>
    )
}


