'use client'

import React from 'react'
/**
 * Data Visualization Component - Advanced Chart Display
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    BarChart3, LineChart, PieChart, Activity, TrendingUp, Zap,
    Maximize2, Minimize2, Settings, Filter, Download, RefreshCw
} from 'lucide-react'

interface DataVisualizationProps {
    chartData: any
    metrics: any[]
    viewMode: string
}

export function DataVisualization({ chartData, metrics, viewMode }: DataVisualizationProps) {
    const [selectedChart, setSelectedChart] = useState('line')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics.slice(0, 3).map(m => m.id))

    const chartTypes = [
        { id: 'line', label: 'Line Chart', icon: LineChart, description: 'Trend analysis over time' },
        { id: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Comparative analysis' },
        { id: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Distribution analysis' },
        { id: 'scatter', label: 'Scatter Plot', icon: Activity, description: 'Correlation analysis' }
    ]

    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ]

    const filteredMetrics = metrics.filter(metric => selectedMetrics.includes(metric.id))

    return (
        <div className="space-y-6">
            {/* Visualization Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <BarChart3 className="w-7 h-7 mr-3 text-blue-500" />
                        Data Visualization
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Interactive charts and graphs for comprehensive data analysis
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {/* Chart Type Selector */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {chartTypes.map(type => {
                            const Icon = type.icon
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedChart(type.id)}
                                    className={`p-2 rounded-md transition-all duration-200 ${selectedChart === type.id
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    title={type.description}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            )
                        })}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Select Metrics to Visualize
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Filter className="w-4 h-4" />
                        <span>{selectedMetrics.length} of {metrics.length} selected</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {metrics.map((metric, index) => {
                        const isSelected = selectedMetrics.includes(metric.id)
                        const color = colors[index % colors.length]

                        return (
                            <div
                                key={metric.id}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                onClick={() => {
                                    setSelectedMetrics(prev =>
                                        isSelected
                                            ? prev.filter(id => id !== metric.id)
                                            : [...prev, metric.id]
                                    )
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${isSelected
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                        {metric.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {metric.category}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Main Chart Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''
                    }`}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {chartTypes.find(c => c.id === selectedChart)?.label}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {chartTypes.find(c => c.id === selectedChart)?.description}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                            {isFullscreen && (
                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                >
                                    <Minimize2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`p-6 ${isFullscreen ? 'h-full' : 'h-96'} flex items-center justify-center`}>
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="mb-4">
                            {selectedChart === 'line' && <LineChart className="w-16 h-16 mx-auto opacity-50" />}
                            {selectedChart === 'bar' && <BarChart3 className="w-16 h-16 mx-auto opacity-50" />}
                            {selectedChart === 'pie' && <PieChart className="w-16 h-16 mx-auto opacity-50" />}
                            {selectedChart === 'scatter' && <Scatter className="w-16 h-16 mx-auto opacity-50" />}
                        </div>
                        <p className="text-lg font-medium mb-2">
                            {chartTypes.find(c => c.id === selectedChart)?.label} Visualization
                        </p>
                        <p className="mb-4">
                            Interactive charts will be implemented with Recharts library
                        </p>
                        <div className="text-sm space-y-1">
                            <p>Selected Metrics: {selectedMetrics.length}</p>
                            <p>Data Points: {chartData.labels?.length || 0}</p>
                            <p>Chart Type: {chartTypes.find(c => c.id === selectedChart)?.label}</p>
                        </div>
                    </div>
                </div>

                {/* Chart Legend */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                    <div className="flex flex-wrap gap-4">
                        {filteredMetrics.map((metric, index) => {
                            const color = colors[index % colors.length]
                            return (
                                <div key={metric.id} className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {metric.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Chart Analytics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredMetrics.filter(m => m.trend === 'up').length}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Improving Trends</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Metrics showing positive growth</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                            <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredMetrics.filter(m => m.target && typeof m.value === 'number' && m.value >= m.target * 0.9).length}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Near Target</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Within 90% of target values</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedMetrics.length}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Active Metrics</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Currently visualized</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                            <LineChart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {chartData.labels?.length || 0}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Data Points</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total time series points</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Chart Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Strong Correlation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Team productivity and project completion show 87% positive correlation
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Trending Pattern</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            All selected metrics show upward trend over the last 30 days
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Performance Peak</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Highest performance recorded during mid-week periods
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


