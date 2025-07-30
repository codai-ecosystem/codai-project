'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import {
    Brain,
    Search,
    Users,
    Clock,
    TrendingUp,
    Database,
    Zap,
    Target,
    Eye,
    Activity,
    BookOpen,
    Lightbulb
} from 'lucide-react'
import { advancedSearch } from '../../lib/search/advanced-search'
import { collaborationEngine } from '../../lib/collaboration/real-time-collaboration'
import { logAnalytics } from '../../lib/logger'

interface AnalyticsData {
    memoryStats: {
        total: number
        byType: Record<string, number>
        byCategory: Record<string, number>
        growth: number
    }
    searchStats: {
        totalQueries: number
        avgResponseTime: number
        popularQueries: Array<{ query: string; count: number }>
        successRate: number
    }
    collaborationStats: {
        activeSessions: number
        totalUsers: number
        conflictsResolved: number
        uptime: number
    }
    performanceMetrics: {
        memoryEfficiency: number
        searchAccuracy: number
        responseTime: number
        cacheHitRate: number
    }
    timeSeriesData: Array<{
        date: string
        memories: number
        searches: number
        users: number
    }>
}

const MemoryAnalyticsDashboard: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAnalytics()
        const interval = setInterval(loadAnalytics, 30000) // Update every 30 seconds
        return () => clearInterval(interval)
    }, [timeRange])

    const loadAnalytics = async () => {
        try {
            setLoading(true)

            // Simulate analytics data - in real implementation, this would come from your analytics service
            const mockData: AnalyticsData = {
                memoryStats: {
                    total: 2847,
                    byType: {
                        'memory': 1240,
                        'knowledge': 850,
                        'document': 520,
                        'note': 237
                    },
                    byCategory: {
                        'technical': 1200,
                        'business': 800,
                        'personal': 500,
                        'research': 347
                    },
                    growth: 15.4
                },
                searchStats: {
                    totalQueries: 8234,
                    avgResponseTime: 45,
                    popularQueries: [
                        { query: 'AI memory architecture', count: 156 },
                        { query: 'machine learning best practices', count: 98 },
                        { query: 'database optimization', count: 87 },
                        { query: 'React performance', count: 76 },
                        { query: 'API security', count: 65 }
                    ],
                    successRate: 94.7
                },
                collaborationStats: {
                    activeSessions: 12,
                    totalUsers: 156,
                    conflictsResolved: 23,
                    uptime: 99.8
                },
                performanceMetrics: {
                    memoryEfficiency: 85.2,
                    searchAccuracy: 91.5,
                    responseTime: 120,
                    cacheHitRate: 78.3
                },
                timeSeriesData: generateTimeSeriesData(timeRange)
            }

            // Get real search engine analytics
            const searchAnalytics = advancedSearch.getAnalytics()
            mockData.searchStats.totalQueries = searchAnalytics.indexSize * 10 // Simulate queries

            // Get real collaboration analytics
            const collabAnalytics = collaborationEngine.getAnalytics()
            mockData.collaborationStats.activeSessions = collabAnalytics.activeUsers

            setAnalyticsData(mockData)

            await logAnalytics('dashboard-viewed', {
                timeRange,
                memoryCount: mockData.memoryStats.total,
                searchQueries: mockData.searchStats.totalQueries
            })

        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateTimeSeriesData = (range: string) => {
        const days = range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90
        const data = []

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                memories: Math.floor(Math.random() * 50) + 20,
                searches: Math.floor(Math.random() * 200) + 100,
                users: Math.floor(Math.random() * 20) + 5
            })
        }

        return data
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
        return num.toString()
    }

    const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

    if (loading || !analyticsData) {
        return (
            <div className="p-6 space-y-6">
                <div className="text-center">
                    <motion.div
                        className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-slate-300 mt-4">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Memory Analytics</h1>
                    <p className="text-slate-300">Comprehensive insights into your memory system performance</p>
                </div>

                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20">
                    {(['1d', '7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-purple-500 text-white'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {range === '1d' ? '24h' : range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Memories</p>
                            <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.memoryStats.total)}</p>
                            <p className="text-green-400 text-sm flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +{analyticsData.memoryStats.growth}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Search Queries</p>
                            <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.searchStats.totalQueries)}</p>
                            <p className="text-blue-400 text-sm flex items-center mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {analyticsData.searchStats.avgResponseTime}ms avg
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Search className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Active Users</p>
                            <p className="text-2xl font-bold text-white">{analyticsData.collaborationStats.totalUsers}</p>
                            <p className="text-emerald-400 text-sm flex items-center mt-1">
                                <Activity className="w-3 h-3 mr-1" />
                                {analyticsData.collaborationStats.activeSessions} sessions
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">System Efficiency</p>
                            <p className="text-2xl font-bold text-white">{analyticsData.performanceMetrics.memoryEfficiency}%</p>
                            <p className="text-yellow-400 text-sm flex items-center mt-1">
                                <Zap className="w-3 h-3 mr-1" />
                                {analyticsData.performanceMetrics.cacheHitRate}% cache hit
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Series Chart */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" />
                        Activity Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }}
                            />
                            <Area type="monotone" dataKey="memories" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="searches" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="users" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Memory Types Distribution */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-purple-400" />
                        Memory Types
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={Object.entries(analyticsData.memoryStats.byType).map(([type, count]) => ({
                                    name: type,
                                    value: count
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {Object.entries(analyticsData.memoryStats.byType).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Popular Searches & Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Searches */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Search className="w-5 h-5 mr-2 text-emerald-400" />
                        Popular Searches
                    </h3>
                    <div className="space-y-3">
                        {analyticsData.searchStats.popularQueries.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-emerald-500/20 rounded text-emerald-400 text-xs flex items-center justify-center font-medium">
                                        {index + 1}
                                    </div>
                                    <span className="text-slate-300 text-sm">{item.query}</span>
                                </div>
                                <span className="text-slate-400 text-sm">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                        Performance Metrics
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Memory Efficiency', value: analyticsData.performanceMetrics.memoryEfficiency, color: 'bg-purple-500' },
                            { label: 'Search Accuracy', value: analyticsData.performanceMetrics.searchAccuracy, color: 'bg-blue-500' },
                            { label: 'Cache Hit Rate', value: analyticsData.performanceMetrics.cacheHitRate, color: 'bg-emerald-500' },
                            { label: 'System Uptime', value: analyticsData.collaborationStats.uptime, color: 'bg-yellow-500' }
                        ].map((metric, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300 text-sm">{metric.label}</span>
                                    <span className="text-white font-medium">{metric.value}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <motion.div
                                        className={`h-2 rounded-full ${metric.color}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.value}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* System Health Status */}
            <motion.div
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-400" />
                    System Health Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BookOpen className="w-8 h-8 text-green-400" />
                        </div>
                        <h4 className="text-white font-medium">Memory System</h4>
                        <p className="text-green-400 text-sm">Operational</p>
                        <p className="text-slate-400 text-xs mt-1">All services running normally</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search className="w-8 h-8 text-blue-400" />
                        </div>
                        <h4 className="text-white font-medium">Search Engine</h4>
                        <p className="text-blue-400 text-sm">Optimized</p>
                        <p className="text-slate-400 text-xs mt-1">Index size: {advancedSearch.getAnalytics().indexSize} items</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-white font-medium">Collaboration</h4>
                        <p className="text-purple-400 text-sm">Active</p>
                        <p className="text-slate-400 text-xs mt-1">{analyticsData.collaborationStats.conflictsResolved} conflicts resolved</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default MemoryAnalyticsDashboard
