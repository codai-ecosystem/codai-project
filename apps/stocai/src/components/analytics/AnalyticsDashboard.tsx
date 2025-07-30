'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    FileText,
    HardDrive,
    Database,
    Zap,
    Clock,
    Download,
    Upload,
    Eye,
    Search,
    Filter,
    Calendar
} from 'lucide-react'

interface MetricData {
    name: string
    value: number
    previous: number
    trend: 'up' | 'down' | 'stable'
    unit: string
}

interface ChartData {
    date: string
    uploads: number
    downloads: number
    searches: number
    storage: number
}

interface UsagePattern {
    hour: number
    activity: number
    type: 'peak' | 'normal' | 'low'
}

const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
    const [selectedMetric, setSelectedMetric] = useState<'storage' | 'activity' | 'performance'>('storage')
    const [realTimeData, setRealTimeData] = useState<MetricData[]>([])
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAnalyticsData()
        const interval = setInterval(loadAnalyticsData, 30000) // Update every 30 seconds
        return () => clearInterval(interval)
    }, [timeRange])

    const loadAnalyticsData = async () => {
        try {
            setLoading(true)

            // Simulate real analytics data
            const metrics: MetricData[] = [
                {
                    name: 'Storage Utilization',
                    value: 2.4,
                    previous: 2.1,
                    trend: 'up',
                    unit: 'TB'
                },
                {
                    name: 'Active Users',
                    value: 1247,
                    previous: 1186,
                    trend: 'up',
                    unit: 'users'
                },
                {
                    name: 'Daily Uploads',
                    value: 847,
                    previous: 923,
                    trend: 'down',
                    unit: 'files'
                },
                {
                    name: 'Search Queries',
                    value: 95000,
                    previous: 87400,
                    trend: 'up',
                    unit: 'queries'
                },
                {
                    name: 'Response Time',
                    value: 45,
                    previous: 52,
                    trend: 'down',
                    unit: 'ms'
                },
                {
                    name: 'Bandwidth Usage',
                    value: 1.8,
                    previous: 1.6,
                    trend: 'up',
                    unit: 'GB/h'
                }
            ]

            const chart: ChartData[] = Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                uploads: Math.floor(Math.random() * 1000) + 500,
                downloads: Math.floor(Math.random() * 1500) + 800,
                searches: Math.floor(Math.random() * 20000) + 80000,
                storage: 2.4 + (Math.random() - 0.5) * 0.2
            }))

            const patterns: UsagePattern[] = Array.from({ length: 24 }, (_, hour) => ({
                hour,
                activity: Math.floor(Math.random() * 100) + (hour >= 9 && hour <= 17 ? 50 : 20),
                type: hour >= 9 && hour <= 17 ? 'peak' : hour >= 18 && hour <= 22 ? 'normal' : 'low'
            }))

            setRealTimeData(metrics)
            setChartData(chart)
            setUsagePatterns(patterns)

        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatValue = (value: number, unit: string): string => {
        if (unit === 'users' || unit === 'files' || unit === 'queries') {
            return value.toLocaleString()
        }
        return `${value.toFixed(1)} ${unit}`
    }

    const getChangePercentage = (current: number, previous: number): number => {
        return ((current - previous) / previous) * 100
    }

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return TrendingUp
            case 'down': return TrendingDown
            default: return Activity
        }
    }

    const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return 'text-green-400'
            case 'down': return 'text-red-400'
            default: return 'text-yellow-400'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-slate-300">Real-time insights into your storage ecosystem</p>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="24h" className="bg-slate-800">Last 24 Hours</option>
                        <option value="7d" className="bg-slate-800">Last 7 Days</option>
                        <option value="30d" className="bg-slate-800">Last 30 Days</option>
                        <option value="90d" className="bg-slate-800">Last 90 Days</option>
                    </select>

                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {realTimeData.map((metric, index) => {
                    const TrendIcon = getTrendIcon(metric.trend)
                    const change = getChangePercentage(metric.value, metric.previous)

                    return (
                        <motion.div
                            key={metric.name}
                            className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                            whileHover={{ scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index % 6 === 0 ? 'bg-blue-500/20' :
                                        index % 6 === 1 ? 'bg-purple-500/20' :
                                            index % 6 === 2 ? 'bg-green-500/20' :
                                                index % 6 === 3 ? 'bg-yellow-500/20' :
                                                    index % 6 === 4 ? 'bg-red-500/20' : 'bg-cyan-500/20'
                                    }`}>
                                    {index % 6 === 0 ? <HardDrive className="w-4 h-4 text-blue-400" /> :
                                        index % 6 === 1 ? <Users className="w-4 h-4 text-purple-400" /> :
                                            index % 6 === 2 ? <Upload className="w-4 h-4 text-green-400" /> :
                                                index % 6 === 3 ? <Search className="w-4 h-4 text-yellow-400" /> :
                                                    index % 6 === 4 ? <Zap className="w-4 h-4 text-red-400" /> :
                                                        <Activity className="w-4 h-4 text-cyan-400" />}
                                </div>

                                <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                                    <TrendIcon className="w-3 h-3" />
                                    <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xl font-bold text-white">{formatValue(metric.value, metric.unit)}</p>
                                <p className="text-slate-400 text-sm">{metric.name}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Metric Selector */}
            <div className="flex justify-center">
                <div className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 border border-white/10">
                    {(['storage', 'activity', 'performance'] as const).map((metric) => (
                        <button
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${selectedMetric === metric
                                    ? 'bg-white text-slate-900 shadow-lg'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {selectedMetric === 'storage' ? 'Storage Trends' :
                            selectedMetric === 'activity' ? 'User Activity' : 'Performance Metrics'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-slate-300 text-sm">Current Period</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-slate-300 text-sm">Previous Period</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between space-x-2">
                    {chartData.map((data, index) => (
                        <div key={data.date} className="flex-1 flex flex-col items-center">
                            <div className="w-full relative h-48 flex items-end justify-center space-x-1">
                                {selectedMetric === 'storage' && (
                                    <div
                                        className="bg-blue-500 rounded-t w-4 transition-all hover:bg-blue-400"
                                        style={{ height: `${(data.storage / 3) * 100}%` }}
                                    />
                                )}
                                {selectedMetric === 'activity' && (
                                    <>
                                        <div
                                            className="bg-blue-500 rounded-t w-3 transition-all hover:bg-blue-400"
                                            style={{ height: `${(data.uploads / 1000) * 100}%` }}
                                        />
                                        <div
                                            className="bg-purple-500 rounded-t w-3 transition-all hover:bg-purple-400"
                                            style={{ height: `${(data.downloads / 1500) * 100}%` }}
                                        />
                                    </>
                                )}
                                {selectedMetric === 'performance' && (
                                    <div
                                        className="bg-green-500 rounded-t w-4 transition-all hover:bg-green-400"
                                        style={{ height: `${(data.searches / 100000) * 100}%` }}
                                    />
                                )}
                            </div>
                            <span className="text-slate-400 text-xs mt-2">{data.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Daily Usage Pattern</h3>
                    <div className="space-y-2">
                        {usagePatterns.map((pattern) => (
                            <div key={pattern.hour} className="flex items-center space-x-3">
                                <span className="text-slate-400 text-sm w-8">
                                    {pattern.hour.toString().padStart(2, '0')}:00
                                </span>
                                <div className="flex-1 bg-white/10 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${pattern.type === 'peak' ? 'bg-red-500' :
                                                pattern.type === 'normal' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${pattern.activity}%` }}
                                    />
                                </div>
                                <span className="text-slate-400 text-sm w-8">{pattern.activity}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">API Response Time</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-white">45ms</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Database Connection</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-white">Healthy</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Vector Index Status</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-white">Optimal</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">Storage Capacity</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-white">24% Used</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">CDN Performance</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-white">99.9% Uptime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboard
