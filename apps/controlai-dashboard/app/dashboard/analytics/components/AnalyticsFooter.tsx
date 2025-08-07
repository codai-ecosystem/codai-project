import React from 'react'
/**
 * Analytics Footer Component - Navigation and Actions for Analytics Dashboard
 */
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    ArrowLeft, ArrowRight, BarChart3, TrendingUp, Activity,
    Settings, Share2, RefreshCw, Download, Bookmark,
    Calendar, Clock, Users, Zap, Star, ChevronUp
} from 'lucide-react'

interface AnalyticsFooterProps {
    onNavigate: (page: string) => void
    currentView: string
    lastUpdated: string
    totalMetrics: number
    activeUsers: number
}

export function AnalyticsFooter({
    onNavigate,
    currentView,
    lastUpdated,
    totalMetrics,
    activeUsers
}: AnalyticsFooterProps) {
    const [showQuickStats, setShowQuickStats] = useState(false)

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'agents', label: 'Agents', icon: Users },
        { id: 'tasks', label: 'Tasks', icon: Activity },
        { id: 'teams', label: 'Teams', icon: Users },
        { id: 'projects', label: 'Projects', icon: TrendingUp },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, active: true },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'integrations', label: 'Integrations', icon: Zap },
        { id: 'reports', label: 'Reports', icon: Download }
    ]

    const quickActions = [
        { id: 'refresh', label: 'Refresh Data', icon: RefreshCw, color: 'blue' },
        { id: 'export', label: 'Export Report', icon: Download, color: 'green' },
        { id: 'share', label: 'Share Analytics', icon: Share2, color: 'purple' },
        { id: 'bookmark', label: 'Save View', icon: Bookmark, color: 'orange' }
    ]

    const systemMetrics = [
        { label: 'Total Metrics', value: totalMetrics.toLocaleString(), icon: BarChart3, trend: '+12%' },
        { label: 'Active Users', value: activeUsers.toLocaleString(), icon: Users, trend: '+5%' },
        { label: 'Response Time', value: '1.2ms', icon: Zap, trend: '-8%' },
        { label: 'Uptime', value: '99.9%', icon: Activity, trend: '+0.1%' }
    ]

    const getCurrentNavIndex = () => {
        return navigationItems.findIndex(item => item.active) || 5
    }

    const handleNavigateToPage = (direction: 'prev' | 'next') => {
        const currentIndex = getCurrentNavIndex()
        let targetIndex

        if (direction === 'prev') {
            targetIndex = currentIndex > 0 ? currentIndex - 1 : navigationItems.length - 1
        } else {
            targetIndex = currentIndex < navigationItems.length - 1 ? currentIndex + 1 : 0
        }

        const targetPage = navigationItems[targetIndex]
        onNavigate(targetPage.id)
    }

    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8"
        >
            {/* Quick Stats Toggle */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: showQuickStats ? 'auto' : 0 }}
                className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
            >
                <div className="px-6 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {systemMetrics.map((metric) => {
                            const Icon = metric.icon
                            return (
                                <div
                                    key={metric.label}
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon className="w-5 h-5 text-blue-500" />
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${metric.trend.startsWith('+')
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                            }`}>
                                            {metric.trend}
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {metric.value}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {metric.label}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Main Footer Content */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    {/* Navigation Controls */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => handleNavigateToPage('prev')}
                            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="hidden md:flex items-center space-x-2">
                            {navigationItems.slice(getCurrentNavIndex() - 1, getCurrentNavIndex() + 2).map((item, index) => {
                                const Icon = item.icon
                                const isActive = item.active
                                const position = index - 1 // -1, 0, 1

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onNavigate(item.id)}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : position === 0
                                                    ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => handleNavigateToPage('next')}
                            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                    {/* Analytics Info */}
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">Analytics</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Current View: {currentView}</div>
                            </div>
                            <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="text-center">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-end space-x-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <button
                                    key={action.id}
                                    className={`p-2 rounded-lg transition-all duration-200 tooltip-trigger ${action.color === 'blue' ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                                            action.color === 'green' ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' :
                                                action.color === 'purple' ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                                                    'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                        }`}
                                    title={action.label}
                                >
                                    <Icon className="w-5 h-5" />
                                </button>
                            )
                        })}

                        <button
                            onClick={() => setShowQuickStats(!showQuickStats)}
                            className={`p-2 rounded-lg transition-all duration-200 ${showQuickStats
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            title="Toggle Quick Stats"
                        >
                            <ChevronUp className={`w-5 h-5 transform transition-transform ${showQuickStats ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb and Status */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>ControlAI Dashboard</span>
                        <span>/</span>
                        <span className="text-blue-600 dark:text-blue-400">Analytics</span>
                        {currentView !== 'overview' && (
                            <>
                                <span>/</span>
                                <span className="capitalize">{currentView}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>System Online</span>
                        </div>
                        <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            <span>{activeUsers} active</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Analytics Dashboard</span>
                        </div>
                        <div className="text-sm opacity-90">
                            Real-time insights and performance monitoring
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>Performance: Excellent</span>
                        </div>
                        <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            <span>Response: 1.2ms</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.footer>
    )
}

