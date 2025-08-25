'use client'

import React from 'react'
/**
 * Analytics Header Component - Navigation and Controls
 */

import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, Calendar, Filter, Download, RefreshCw,
    Settings, Eye, Target, Clock, Zap, MoreHorizontal, Activity
} from 'lucide-react'

interface AnalyticsHeaderProps {
    analyticsState: any
    onStateChange: (updater: (prev: any) => any) => void
    timeRanges: any[]
    summary: any
    realTimeData: any
}

export function AnalyticsHeader({
    analyticsState,
    onStateChange,
    timeRanges,
    summary,
    realTimeData
}: AnalyticsHeaderProps) {
    const views = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'performance', label: 'Performance', icon: TrendingUp },
        { id: 'charts', label: 'Charts', icon: Activity },
        { id: 'reports', label: 'Reports', icon: Target },
        { id: 'insights', label: 'Insights', icon: Zap }
    ]

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Header */}
                <div className="flex items-center justify-between py-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center"
                    >
                        <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-2xl">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 dark:from-blue-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent">
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Advanced reporting and data insights for project optimization
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-4"
                    >
                        {/* Time Range Selector */}
                        <div className="relative">
                            <select
                                value={analyticsState.timeRange.value}
                                onChange={(e) => {
                                    const selectedRange = timeRanges.find(r => r.value === e.target.value)
                                    if (selectedRange) {
                                        onStateChange(prev => ({ ...prev, timeRange: selectedRange }))
                                    }
                                }}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white"
                            >
                                {timeRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Real-time Toggle */}
                        <button
                            onClick={() => onStateChange(prev => ({ ...prev, realTimeEnabled: !prev.realTimeEnabled }))}
                            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${analyticsState.realTimeEnabled
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            <Activity className={`w-4 h-4 mr-2 ${analyticsState.realTimeEnabled ? 'animate-pulse' : ''}`} />
                            Real-time
                        </button>

                        {/* Export Button */}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>

                        {/* Settings */}
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                            <Settings className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6"
                >
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-800 dark:text-green-300 text-sm font-medium">Health Score</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.healthScore}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">Active Users</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{realTimeData.activeUsers}</p>
                            </div>
                            <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-800 dark:text-purple-300 text-sm font-medium">Response Time</p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{realTimeData.responseTime}ms</p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-800 dark:text-orange-300 text-sm font-medium">System Load</p>
                                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{realTimeData.currentLoad}%</p>
                            </div>
                            <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl"
                >
                    {views.map((view) => {
                        const Icon = view.icon
                        const isActive = analyticsState.activeView === view.id

                        return (
                            <button
                                key={view.id}
                                onClick={() => onStateChange(prev => ({ ...prev, activeView: view.id }))}
                                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-2" />
                                <span className="font-medium">{view.label}</span>
                            </button>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}


