import React from 'react'
/**
 * Analytics Overview Component - Key Metrics Summary
 */
'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
    Target, CheckCircle2, AlertTriangle, Clock, Zap
} from 'lucide-react'

interface AnalyticsOverviewProps {
    metrics: any[]
    summary: any
    realTimeData: any
    timeRange: any
    compareMode: boolean
}

export function AnalyticsOverview({
    metrics,
    summary,
    realTimeData,
    timeRange,
    compareMode
}: AnalyticsOverviewProps) {
    const getTrendIcon = (trend: string, change: number) => {
        if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-500" />
        if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-500" />
        return <Minus className="w-5 h-5 text-gray-400" />
    }

    const getTrendColor = (trend: string) => {
        if (trend === 'up') return 'text-green-600 dark:text-green-400'
        if (trend === 'down') return 'text-red-600 dark:text-red-400'
        return 'text-gray-500 dark:text-gray-400'
    }

    const getChangeIcon = (change: number) => {
        if (change > 0) return <ArrowUpRight className="w-4 h-4" />
        if (change < 0) return <ArrowDownRight className="w-4 h-4" />
        return <Minus className="w-4 h-4" />
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Metrics</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{summary.totalMetrics}</p>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">Active metrics tracked</p>
                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            Updated {timeRange.label.toLowerCase()}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Improving</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">{summary.improvingMetrics}</p>
                        <p className="text-green-700 dark:text-green-300 text-sm">Metrics showing growth</p>
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {Math.round((summary.improvingMetrics / summary.totalMetrics) * 100)}% of total
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Declining</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{summary.decliningMetrics}</p>
                        <p className="text-orange-700 dark:text-orange-300 text-sm">Metrics needing attention</p>
                        <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            {summary.decliningMetrics > 0 ? 'Requires review' : 'All stable'}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Performance</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{summary.avgChange.toFixed(1)}%</p>
                        <p className="text-purple-700 dark:text-purple-300 text-sm">Average change rate</p>
                        <div className={`flex items-center text-xs ${getTrendColor(summary.avgChange > 0 ? 'up' : summary.avgChange < 0 ? 'down' : 'stable')}`}>
                            {getChangeIcon(summary.avgChange)}
                            <span className="ml-1">
                                {summary.avgChange > 0 ? 'Positive trend' : summary.avgChange < 0 ? 'Negative trend' : 'Stable'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{metric.name}</h3>
                            {getTrendIcon(metric.trend, metric.change)}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {metric.value}
                                </span>
                                {metric.unit === 'percentage' && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1 text-lg">%</span>
                                )}
                            </div>

                            <div className={`flex items-center text-sm ${getTrendColor(metric.trend)}`}>
                                {getChangeIcon(metric.change)}
                                <span className="ml-1 font-medium">
                                    {Math.abs(metric.change).toFixed(1)}%
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">vs prev period</span>
                            </div>

                            {metric.target && (
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Target: {metric.target}{metric.unit === 'percentage' ? '%' : ''}</span>
                                        <span>
                                            {typeof metric.value === 'number'
                                                ? `${((metric.value / metric.target) * 100).toFixed(0)}%`
                                                : `${((parseInt(metric.value.toString().replace('%', '')) / metric.target) * 100).toFixed(0)}%`
                                            }
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-300 ${metric.trend === 'up' ? 'bg-green-500' :
                                                    metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                                                }`}
                                            style={{
                                                width: `${Math.min(100, typeof metric.value === 'number'
                                                    ? (metric.value / metric.target) * 100
                                                    : (parseInt(metric.value.toString().replace('%', '')) / metric.target) * 100
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {metric.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Real-time Data Bar */}
            {realTimeData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            Real-time System Status
                        </h3>
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                            Live data
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeData.activeUsers}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">System Load</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeData.currentLoad}%</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{realTimeData.responseTime}ms</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(realTimeData.errorRate * 100).toFixed(2)}%</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

