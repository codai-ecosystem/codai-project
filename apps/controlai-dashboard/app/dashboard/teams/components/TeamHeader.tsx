import React from 'react'
/**
 * TeamHeader Component - Enhanced header with search and controls
 */
'use client'

import { motion } from 'framer-motion'
import { Users, Search, Filter, Settings, UserPlus, Bell, Wifi } from 'lucide-react'

interface TeamAnalytics {
    totalMembers: number
    onlineMembers: number
    avgProductivity: number
    totalTasks: number
    completedTasks: number
    managers: number
    teamLeads: number
    completionRate: number
}

interface TeamHeaderProps {
    analytics: TeamAnalytics
    searchQuery: string
    onSearchChange: (query: string) => void
    showOffline: boolean
    onShowOfflineChange: (show: boolean) => void
    realTimeUpdates: boolean
    onRealTimeToggle: (enabled: boolean) => void
}

export function TeamHeader({
    analytics,
    searchQuery,
    onSearchChange,
    showOffline,
    onShowOfflineChange,
    realTimeUpdates,
    onRealTimeToggle
}: TeamHeaderProps) {
    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center"
                    >
                        <div className="p-3 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 rounded-xl mr-4 shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                                Team Management Center
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {analytics.totalMembers} members • {analytics.onlineMembers} online •
                                {analytics.avgProductivity.toFixed(1)}% avg productivity • {analytics.completionRate.toFixed(1)}% task completion
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex items-center space-x-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search team members..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Show Offline Toggle */}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOffline}
                                onChange={(e) => onShowOfflineChange(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOffline ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOffline ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Show Offline</span>
                        </label>

                        {/* Real-time Updates */}
                        <button
                            onClick={() => onRealTimeToggle(!realTimeUpdates)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${realTimeUpdates
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Wifi className="w-4 h-4 mr-2" />
                            Live Updates
                        </button>

                        {/* Add Member */}
                        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                        </button>

                        {/* Settings */}
                        <button className="flex items-center px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

