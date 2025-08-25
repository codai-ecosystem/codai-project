'use client'

import React from 'react'
/**
 * Project Navigation Component - View mode switcher and options
 */

import { motion } from 'framer-motion'
import {
    Grid3X3, List, Columns, Calendar, BarChart3,
    SortAsc, SortDesc, Filter, Download, Share2
} from 'lucide-react'

interface ProjectNavigationProps {
    activeView: 'grid' | 'list' | 'kanban' | 'timeline' | 'analytics'
    onViewChange: (view: 'grid' | 'list' | 'kanban' | 'timeline' | 'analytics') => void
}

export function ProjectNavigation({ activeView, onViewChange }: ProjectNavigationProps) {
    const viewOptions = [
        {
            id: 'grid' as const,
            label: 'Grid',
            icon: Grid3X3,
            description: 'Card view with detailed project information'
        },
        {
            id: 'list' as const,
            label: 'List',
            icon: List,
            description: 'Compact list view for quick scanning'
        },
        {
            id: 'kanban' as const,
            label: 'Kanban',
            icon: Columns,
            description: 'Status-based board view'
        },
        {
            id: 'timeline' as const,
            label: 'Timeline',
            icon: Calendar,
            description: 'Gantt chart view with dependencies'
        },
        {
            id: 'analytics' as const,
            label: 'Analytics',
            icon: BarChart3,
            description: 'Detailed analytics and reporting'
        }
    ]

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    {/* View switcher */}
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        {viewOptions.map((option) => {
                            const Icon = option.icon
                            const isActive = activeView === option.id

                            return (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onViewChange(option.id)}
                                    className={`relative flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    title={option.description}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {option.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeView"
                                            className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-md -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30
                                            }}
                                        />
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Sort options */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                            <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="updated">Last Updated</option>
                                <option value="created">Created Date</option>
                                <option value="name">Name</option>
                                <option value="deadline">Deadline</option>
                                <option value="priority">Priority</option>
                                <option value="budget">Budget</option>
                            </select>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                                <SortDesc className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* View description */}
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pb-4"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewOptions.find(option => option.id === activeView)?.description}
                    </p>
                </motion.div>

                {/* Additional navigation for specific views */}
                {activeView === 'kanban' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                    >
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Board Options:
                            </span>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    defaultChecked
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Show swimlanes
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    defaultChecked
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Auto-refresh
                                </span>
                            </label>
                        </div>
                    </motion.div>
                )}

                {activeView === 'timeline' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                    >
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Timeline View:
                            </span>
                            <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="month">Month</option>
                                <option value="quarter">Quarter</option>
                                <option value="year">Year</option>
                            </select>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    defaultChecked
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Show dependencies
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Show milestones
                                </span>
                            </label>
                        </div>
                    </motion.div>
                )}

                {activeView === 'analytics' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                    >
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Analytics Options:
                            </span>
                            <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="overview">Overview</option>
                                <option value="performance">Performance</option>
                                <option value="budget">Budget Analysis</option>
                                <option value="timeline">Timeline Analysis</option>
                                <option value="team">Team Performance</option>
                            </select>
                            <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                <option value="week">Last 7 days</option>
                                <option value="month">Last 30 days</option>
                                <option value="quarter">Last 3 months</option>
                                <option value="year">Last year</option>
                            </select>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}


