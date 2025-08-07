import React from 'react'
/**
 * Project Header Component - Enhanced header with search and actions
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FolderKanban, Plus, Search, Filter, Settings, Download,
    Bell, RefreshCw, MoreHorizontal, Eye, EyeOff, Activity
} from 'lucide-react'

interface ProjectHeaderProps {
    analytics: {
        totalProjects: number
        activeProjects: number
        completedProjects: number
        overdueProjects: number
        avgProgress: number
    }
    searchQuery: string
    onSearchChange: (query: string) => void
    showCompleted: boolean
    onShowCompletedChange: (show: boolean) => void
    realTimeUpdates: boolean
    onRealTimeToggle: (enabled: boolean) => void
}

export function ProjectHeader({
    analytics,
    searchQuery,
    onSearchChange,
    showCompleted,
    onShowCompletedChange,
    realTimeUpdates,
    onRealTimeToggle
}: ProjectHeaderProps) {
    const [showFilters, setShowFilters] = useState(false)

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-6">
                    {/* Left section - Title and breadcrumb */}
                    <div className="flex items-center space-x-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center"
                        >
                            <div className="bg-gradient-to-br from-blue-500 to-green-600 p-3 rounded-xl shadow-lg">
                                <FolderKanban className="w-8 h-8 text-white" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-green-800 dark:from-white dark:via-blue-200 dark:to-green-200 bg-clip-text text-transparent">
                                    Projects
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Manage and track your project portfolio
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right section - Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </motion.div>

                        {/* Filters toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </motion.button>

                        {/* Show completed toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onShowCompletedChange(!showCompleted)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showCompleted
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {showCompleted ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                            {showCompleted ? 'Hide Completed' : 'Show Completed'}
                        </motion.button>

                        {/* Real-time updates toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onRealTimeToggle(!realTimeUpdates)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${realTimeUpdates
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Activity className={`w-4 h-4 mr-2 ${realTimeUpdates ? 'animate-pulse' : ''}`} />
                            Live Updates
                        </motion.button>

                        {/* Create project button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Project
                        </motion.button>

                        {/* More actions */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Quick stats */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-6 pb-4"
                >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{analytics.totalProjects}</span> total projects
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{analytics.activeProjects}</span> active
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-green-600 dark:text-green-400">{analytics.completedProjects}</span> completed
                    </div>
                    {analytics.overdueProjects > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-red-600 dark:text-red-400">{analytics.overdueProjects}</span> overdue
                        </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{Math.round(analytics.avgProgress)}%</span> avg progress
                    </div>
                </motion.div>

                {/* Filters panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700 py-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option value="">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="planning">Planning</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="review">Review</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Priority
                                </label>
                                <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option value="">All priorities</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Technology
                                </label>
                                <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option value="">All technologies</option>
                                    <option value="react">React</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="python">Python</option>
                                    <option value="ai-ml">AI/ML</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date Range
                                </label>
                                <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                    <option value="all">All time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This week</option>
                                    <option value="month">This month</option>
                                    <option value="quarter">This quarter</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

