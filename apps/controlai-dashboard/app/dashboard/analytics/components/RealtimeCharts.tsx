import React from 'react'
/**
 * Real-time Charts Component - Live Data Visualization
 */
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    Activity, Zap, Clock, Users, Server, Wifi, AlertTriangle,
    TrendingUp, TrendingDown, BarChart3, LineChart, Pause, Play
} from 'lucide-react'

interface RealtimeChartsProps {
    realTimeData: any
    enabled: boolean
    refreshInterval: number
    fullView?: boolean
}

export function RealtimeCharts({
    realTimeData,
    enabled,
    refreshInterval,
    fullView = false
}: RealtimeChartsProps) {
    const [isPaused, setIsPaused] = useState(false)
    const [historicalData, setHistoricalData] = useState<any[]>([])
    const [activeChart, setActiveChart] = useState('overview')

    // Mock real-time data generation
    useEffect(() => {
        if (!enabled || isPaused) return

        const interval = setInterval(() => {
            const now = new Date()
            const newDataPoint = {
                timestamp: now.toISOString(),
                activeUsers: realTimeData.activeUsers + Math.floor(Math.random() * 20 - 10),
                responseTime: realTimeData.responseTime + Math.floor(Math.random() * 100 - 50),
                systemLoad: Math.max(0, Math.min(100, realTimeData.currentLoad + Math.floor(Math.random() * 20 - 10))),
                errorRate: Math.max(0, realTimeData.errorRate + (Math.random() * 0.01 - 0.005)),
                throughput: 100 + Math.floor(Math.random() * 50),
                memoryUsage: 60 + Math.floor(Math.random() * 30)
            }

            setHistoricalData(prev => {
                const updated = [...prev, newDataPoint]
                return updated.slice(-50) // Keep last 50 data points
            })
        }, refreshInterval)

        return () => clearInterval(interval)
    }, [enabled, isPaused, refreshInterval, realTimeData])

    const chartTypes = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'performance', label: 'Performance', icon: TrendingUp },
        { id: 'system', label: 'System', icon: Server },
        { id: 'users', label: 'Users', icon: Users }
    ]

    const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
        if (value <= thresholds.good) return 'text-green-500'
        if (value <= thresholds.warning) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getStatusBg = (value: number, thresholds: { good: number; warning: number }) => {
        if (value <= thresholds.good) return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
        if (value <= thresholds.warning) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Activity className="w-7 h-7 mr-3 text-blue-500" />
                        Real-time Analytics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Live system monitoring and performance tracking
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {/* Status Indicator */}
                    <div className={`flex items-center px-3 py-2 rounded-lg border ${enabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                            'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className={`text-sm font-medium ${enabled ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                            {enabled ? 'Live' : 'Offline'}
                        </span>
                    </div>

                    {/* Pause/Play Button */}
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        disabled={!enabled}
                        className={`p-2 rounded-lg transition-all duration-200 ${!enabled ? 'opacity-50 cursor-not-allowed' :
                                isPaused ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            }`}
                    >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>

                    {/* Chart Type Selector */}
                    {fullView && (
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                            {chartTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setActiveChart(type.id)}
                                    className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center ${activeChart === type.id
                                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <type.icon className="w-4 h-4 mr-2" />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Real-time Metrics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* Active Users */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {historicalData.length > 0 ? historicalData[historicalData.length - 1]?.activeUsers : realTimeData.activeUsers}
                            </p>
                        </div>
                    </div>
                    <div className="h-16 flex items-end space-x-1">
                        {historicalData.slice(-12).map((point, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-blue-200 to-blue-400 rounded-sm transition-all duration-300"
                                style={{
                                    height: `${Math.max(10, (point.activeUsers / 200) * 100)}%`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Response Time */}
                <div className={`p-6 rounded-2xl border ${getStatusBg(
                    historicalData.length > 0 ? historicalData[historicalData.length - 1]?.responseTime : realTimeData.responseTime,
                    { good: 200, warning: 500 }
                )}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                            <p className={`text-2xl font-bold ${getStatusColor(
                                historicalData.length > 0 ? historicalData[historicalData.length - 1]?.responseTime : realTimeData.responseTime,
                                { good: 200, warning: 500 }
                            )}`}>
                                {historicalData.length > 0 ? historicalData[historicalData.length - 1]?.responseTime : realTimeData.responseTime}ms
                            </p>
                        </div>
                    </div>
                    <div className="h-16 flex items-end space-x-1">
                        {historicalData.slice(-12).map((point, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-green-200 to-green-400 rounded-sm transition-all duration-300"
                                style={{
                                    height: `${Math.max(10, (point.responseTime / 1000) * 100)}%`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* System Load */}
                <div className={`p-6 rounded-2xl border ${getStatusBg(
                    historicalData.length > 0 ? historicalData[historicalData.length - 1]?.systemLoad : realTimeData.currentLoad,
                    { good: 60, warning: 80 }
                )}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                            <Server className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">System Load</p>
                            <p className={`text-2xl font-bold ${getStatusColor(
                                historicalData.length > 0 ? historicalData[historicalData.length - 1]?.systemLoad : realTimeData.currentLoad,
                                { good: 60, warning: 80 }
                            )}`}>
                                {historicalData.length > 0 ? historicalData[historicalData.length - 1]?.systemLoad : realTimeData.currentLoad}%
                            </p>
                        </div>
                    </div>
                    <div className="h-16 flex items-end space-x-1">
                        {historicalData.slice(-12).map((point, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-orange-200 to-orange-400 rounded-sm transition-all duration-300"
                                style={{
                                    height: `${Math.max(10, point.systemLoad)}%`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Error Rate */}
                <div className={`p-6 rounded-2xl border ${getStatusBg(
                    (historicalData.length > 0 ? historicalData[historicalData.length - 1]?.errorRate : realTimeData.errorRate) * 100,
                    { good: 1, warning: 3 }
                )}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                            <p className={`text-2xl font-bold ${getStatusColor(
                                (historicalData.length > 0 ? historicalData[historicalData.length - 1]?.errorRate : realTimeData.errorRate) * 100,
                                { good: 1, warning: 3 }
                            )}`}>
                                {((historicalData.length > 0 ? historicalData[historicalData.length - 1]?.errorRate : realTimeData.errorRate) * 100).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div className="h-16 flex items-end space-x-1">
                        {historicalData.slice(-12).map((point, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-red-200 to-red-400 rounded-sm transition-all duration-300"
                                style={{
                                    height: `${Math.max(10, point.errorRate * 1000)}%`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Large Chart Area */}
            {fullView && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {chartTypes.find(c => c.id === activeChart)?.label} Chart
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Wifi className="w-4 h-4" />
                            <span>Updates every {refreshInterval / 1000}s</span>
                        </div>
                    </div>

                    <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Real-time Chart Visualization</p>
                            <p>Interactive charts will be implemented with Recharts</p>
                            <p className="text-sm mt-2">
                                Data points: {historicalData.length} | Active: {activeChart}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* System Status Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        System Health Overview
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">All systems operational</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">99.97%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Throughput</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {historicalData.length > 0 ? historicalData[historicalData.length - 1]?.throughput : 125} req/s
                                </p>
                            </div>
                            <Zap className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {historicalData.length > 0 ? historicalData[historicalData.length - 1]?.memoryUsage : 72}%
                                </p>
                            </div>
                            <Server className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Data Update Indicator */}
            {enabled && !isPaused && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-20 right-6 z-40"
                >
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                            <span className="text-blue-800 dark:text-blue-200 text-xs font-medium">
                                Data updating...
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

