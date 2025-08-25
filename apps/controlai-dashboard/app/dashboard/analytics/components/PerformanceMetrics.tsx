'use client'

import React from 'react'
/**
 * Performance Metrics Component - Detailed Performance Analysis
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    TrendingUp, TrendingDown, BarChart3, LineChart, PieChart,
    Target, Zap, Clock, Users, DollarSign, AlertTriangle,
    CheckCircle2, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react'

interface PerformanceMetricsProps {
    metrics: any[]
    chartData: any
    timeRange: any
    detailed?: boolean
}

export function PerformanceMetrics({
    metrics,
    chartData,
    timeRange,
    detailed = false
}: PerformanceMetricsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'cards' | 'chart' | 'table'>('cards')

    const categories = [
        { id: 'all', label: 'All Metrics', icon: BarChart3 },
        { id: 'projects', label: 'Projects', icon: Target },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'financial', label: 'Financial', icon: DollarSign },
        { id: 'team', label: 'Team', icon: Users }
    ]

    const filteredMetrics = selectedCategory === 'all'
        ? metrics
        : metrics.filter(metric => metric.category === selectedCategory)

    const getPerformanceLevel = (value: number | string, target?: number) => {
        if (!target) return 'good'
        const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value
        const percentage = (numValue / target) * 100
        if (percentage >= 95) return 'excellent'
        if (percentage >= 80) return 'good'
        if (percentage >= 60) return 'fair'
        return 'poor'
    }

    const getPerformanceColor = (level: string) => {
        switch (level) {
            case 'excellent': return 'text-green-600 dark:text-green-400'
            case 'good': return 'text-blue-600 dark:text-blue-400'
            case 'fair': return 'text-yellow-600 dark:text-yellow-400'
            case 'poor': return 'text-red-600 dark:text-red-400'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getPerformanceIcon = (level: string) => {
        switch (level) {
            case 'excellent': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            case 'good': return <TrendingUp className="w-5 h-5 text-blue-500" />
            case 'fair': return <Clock className="w-5 h-5 text-yellow-500" />
            case 'poor': return <AlertTriangle className="w-5 h-5 text-red-500" />
            default: return <BarChart3 className="w-5 h-5 text-gray-500" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Performance Metrics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Detailed analysis of key performance indicators for {timeRange.label.toLowerCase()}
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {/* Category Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {[
                            { id: 'cards', icon: BarChart3 },
                            { id: 'chart', icon: LineChart },
                            { id: 'table', icon: PieChart }
                        ].map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id as any)}
                                className={`p-2 rounded-md transition-all duration-200 ${viewMode === mode.id
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <mode.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'cards' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredMetrics.map((metric, index) => {
                        const performanceLevel = getPerformanceLevel(metric.value, metric.target)
                        const PerformanceIcon = getPerformanceIcon(performanceLevel)

                        return (
                            <motion.div
                                key={metric.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{metric.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{metric.category}</p>
                                    </div>
                                    {PerformanceIcon}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-baseline mb-2">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {metric.value}
                                            </span>
                                            {metric.target && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                    / {metric.target}{metric.unit === 'percentage' ? '%' : ''}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`flex items-center text-sm ${metric.change > 0 ? 'text-green-600 dark:text-green-400' :
                                                metric.change < 0 ? 'text-red-600 dark:text-red-400' :
                                                    'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {metric.change > 0 ? (
                                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                            ) : metric.change < 0 ? (
                                                <ArrowDownRight className="w-4 h-4 mr-1" />
                                            ) : null}
                                            <span className="font-medium">
                                                {Math.abs(metric.change).toFixed(1)}%
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400 ml-1">vs prev</span>
                                        </div>
                                    </div>

                                    {/* Progress bar for targets */}
                                    {metric.target && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">Progress to target</span>
                                                <span className={getPerformanceColor(performanceLevel)}>
                                                    {performanceLevel.charAt(0).toUpperCase() + performanceLevel.slice(1)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${performanceLevel === 'excellent' ? 'bg-green-500' :
                                                            performanceLevel === 'good' ? 'bg-blue-500' :
                                                                performanceLevel === 'fair' ? 'bg-yellow-500' :
                                                                    'bg-red-500'
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

                                    {/* Mini chart */}
                                    {detailed && metric.historical && (
                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Trend</span>
                                                <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                                                        metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                                                            'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}
                                                </span>
                                            </div>
                                            <div className="h-12 flex items-end space-x-1">
                                                {metric.historical.slice(-7).map((point: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 bg-gradient-to-t rounded-sm transition-all duration-300 ${metric.trend === 'up' ? 'from-green-200 to-green-400' :
                                                                metric.trend === 'down' ? 'from-red-200 to-red-400' :
                                                                    'from-gray-200 to-gray-400'
                                                            }`}
                                                        style={{
                                                            height: `${(point.value / Math.max(...metric.historical.map((h: any) => h.value))) * 100}%`
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                                        {metric.description}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            )}

            {viewMode === 'chart' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                    <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Chart visualization will be implemented with Recharts</p>
                            <p className="text-sm mt-2">Data: {filteredMetrics.length} metrics selected</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {viewMode === 'table' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Performance Data Table
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Metric
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Change
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Target
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Performance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredMetrics.map((metric) => {
                                    const performanceLevel = getPerformanceLevel(metric.value, metric.target)
                                    return (
                                        <tr key={metric.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {metric.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {metric.category}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {metric.value}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center text-sm ${metric.change > 0 ? 'text-green-600 dark:text-green-400' :
                                                        metric.change < 0 ? 'text-red-600 dark:text-red-400' :
                                                            'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {metric.change > 0 ? (
                                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                                    ) : metric.change < 0 ? (
                                                        <ArrowDownRight className="w-4 h-4 mr-1" />
                                                    ) : null}
                                                    {Math.abs(metric.change).toFixed(1)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {metric.target ? `${metric.target}${metric.unit === 'percentage' ? '%' : ''}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getPerformanceIcon(performanceLevel)}
                                                    <span className={`ml-2 text-sm font-medium ${getPerformanceColor(performanceLevel)}`}>
                                                        {performanceLevel.charAt(0).toUpperCase() + performanceLevel.slice(1)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Performance Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 via-green-50 to-teal-50 dark:from-blue-900/20 dark:via-green-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {filteredMetrics.filter(m => getPerformanceLevel(m.value, m.target) === 'excellent').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Excellent</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {filteredMetrics.filter(m => getPerformanceLevel(m.value, m.target) === 'good').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Good</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {filteredMetrics.filter(m => getPerformanceLevel(m.value, m.target) === 'fair').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Fair</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {filteredMetrics.filter(m => getPerformanceLevel(m.value, m.target) === 'poor').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Needs Attention</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


