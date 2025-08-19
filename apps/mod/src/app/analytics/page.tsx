'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Download,
    RefreshCw,
    Clock,
    Zap,
    CheckCircle,
    AlertTriangle,
    Activity,
    PieChart,
    LineChart,
    BarChart2,
    Eye,
    Timer,
    Database,
    Globe,
    Cpu,
    HardDrive,
    AlertCircle
} from 'lucide-react'

// TypeScript interfaces for Analytics & Reports
interface MetricCard {
    id: string
    title: string
    value: string | number
    change: number
    changeType: 'increase' | 'decrease' | 'neutral'
    icon: React.ComponentType<any>
    color: string
    description: string
}

interface ChartData {
    id: string
    title: string
    type: 'line' | 'bar' | 'pie' | 'area'
    data: Array<{
        label: string
        value: number
        color?: string
    }>
    timeframe: string
    insight: string
}

interface ReportSummary {
    id: string
    title: string
    description: string
    generatedAt: string
    status: 'ready' | 'generating' | 'failed'
    size: string
    type: 'pdf' | 'excel' | 'csv'
}

export default function AnalyticsReports() {
    const [timeframe, setTimeframe] = useState('7d')
    const [selectedCategory, setSelectedCategory] = useState('overview')
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Key metrics
    const metrics: MetricCard[] = [
        {
            id: 'workflows-executed',
            title: 'Workflows Executed',
            value: '12,847',
            change: 15.3,
            changeType: 'increase',
            icon: Zap,
            color: 'from-blue-500 to-blue-600',
            description: 'Total workflows executed this period'
        },
        {
            id: 'success-rate',
            title: 'Success Rate',
            value: '98.2%',
            change: 2.1,
            changeType: 'increase',
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            description: 'Percentage of successful workflow executions'
        },
        {
            id: 'avg-execution-time',
            title: 'Avg Execution Time',
            value: '2.34s',
            change: -8.7,
            changeType: 'decrease',
            icon: Timer,
            color: 'from-purple-500 to-purple-600',
            description: 'Average time to complete workflows'
        },
        {
            id: 'active-integrations',
            title: 'Active Integrations',
            value: 42,
            change: 5.0,
            changeType: 'increase',
            icon: Globe,
            color: 'from-indigo-500 to-indigo-600',
            description: 'Number of active API integrations'
        },
        {
            id: 'data-processed',
            title: 'Data Processed',
            value: '847 GB',
            change: 23.4,
            changeType: 'increase',
            icon: Database,
            color: 'from-orange-500 to-orange-600',
            description: 'Total data processed through workflows'
        },
        {
            id: 'error-rate',
            title: 'Error Rate',
            value: '1.8%',
            change: 12.5,
            changeType: 'increase',
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            description: 'Percentage of failed workflow executions'
        },
        {
            id: 'cpu-usage',
            title: 'CPU Usage',
            value: '67%',
            change: -3.2,
            changeType: 'decrease',
            icon: Cpu,
            color: 'from-yellow-500 to-yellow-600',
            description: 'Average CPU utilization'
        },
        {
            id: 'memory-usage',
            title: 'Memory Usage',
            value: '4.2 GB',
            change: 8.9,
            changeType: 'increase',
            icon: HardDrive,
            color: 'from-pink-500 to-pink-600',
            description: 'Current memory consumption'
        }
    ]

    // Chart data
    const charts: ChartData[] = [
        {
            id: 'workflow-executions',
            title: 'Workflow Executions Over Time',
            type: 'line',
            data: [
                { label: 'Mon', value: 1250 },
                { label: 'Tue', value: 1890 },
                { label: 'Wed', value: 2100 },
                { label: 'Thu', value: 1750 },
                { label: 'Fri', value: 2400 },
                { label: 'Sat', value: 1600 },
                { label: 'Sun', value: 1850 }
            ],
            timeframe: 'Last 7 days',
            insight: '23% increase in weekend workflow activity'
        },
        {
            id: 'success-failure-ratio',
            title: 'Success vs Failure Rate',
            type: 'pie',
            data: [
                { label: 'Successful', value: 98.2, color: '#10b981' },
                { label: 'Failed', value: 1.8, color: '#ef4444' }
            ],
            timeframe: 'Last 30 days',
            insight: 'Maintaining excellent 98.2% success rate'
        },
        {
            id: 'integration-usage',
            title: 'Most Used Integrations',
            type: 'bar',
            data: [
                { label: 'Salesforce', value: 3421 },
                { label: 'Gmail', value: 2876 },
                { label: 'Stripe', value: 2145 },
                { label: 'Slack', value: 1987 },
                { label: 'HubSpot', value: 1654 }
            ],
            timeframe: 'Last 30 days',
            insight: 'Salesforce integration leads usage by 19%'
        },
        {
            id: 'response-times',
            title: 'API Response Times',
            type: 'area',
            data: [
                { label: '00:00', value: 245 },
                { label: '04:00', value: 198 },
                { label: '08:00', value: 312 },
                { label: '12:00', value: 287 },
                { label: '16:00', value: 356 },
                { label: '20:00', value: 298 }
            ],
            timeframe: 'Last 24 hours',
            insight: 'Peak response times during business hours'
        }
    ]

    // Reports
    const reports: ReportSummary[] = [
        {
            id: 'weekly-summary',
            title: 'Weekly Performance Summary',
            description: 'Comprehensive overview of workflow performance, integrations, and system metrics',
            generatedAt: '2024-01-20T08:30:00Z',
            status: 'ready',
            size: '2.4 MB',
            type: 'pdf'
        },
        {
            id: 'integration-audit',
            title: 'Integration Security Audit',
            description: 'Security assessment of all active API integrations and authentication methods',
            generatedAt: '2024-01-19T16:45:00Z',
            status: 'ready',
            size: '1.8 MB',
            type: 'pdf'
        },
        {
            id: 'usage-analytics',
            title: 'Usage Analytics Export',
            description: 'Detailed usage data for all workflows, modules, and integrations',
            generatedAt: '2024-01-20T09:15:00Z',
            status: 'generating',
            size: '12.5 MB',
            type: 'excel'
        }
    ]

    const timeframes = [
        { value: '1h', label: 'Last Hour' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '3m', label: 'Last 3 Months' }
    ]

    const categories = [
        { value: 'overview', label: 'Overview' },
        { value: 'performance', label: 'Performance' },
        { value: 'integrations', label: 'Integrations' },
        { value: 'security', label: 'Security' },
        { value: 'usage', label: 'Usage' }
    ]

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Simulate refresh delay
        setTimeout(() => setIsRefreshing(false), 2000)
    }

    const getChangeIcon = (changeType: string) => {
        switch (changeType) {
            case 'increase': return TrendingUp
            case 'decrease': return TrendingDown
            default: return Activity
        }
    }

    const getChangeColor = (changeType: string) => {
        switch (changeType) {
            case 'increase': return 'text-green-600'
            case 'decrease': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        Analytics & Reports
                                    </h1>
                                    <p className="text-sm text-gray-500">Performance insights and reporting</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                            >
                                {timeframes.map((tf) => (
                                    <option key={tf.value} value={tf.value}>{tf.label}</option>
                                ))}
                            </select>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <Download className="h-4 w-4 inline mr-2" />
                                Export Report
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
                        {categories.map((category) => (
                            <motion.button
                                key={category.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedCategory === category.value
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                {category.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon
                        const ChangeIcon = getChangeIcon(metric.changeType)

                        return (
                            <motion.div
                                key={metric.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`bg-gradient-to-r ${metric.color} p-3 rounded-xl`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                                        <ChangeIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {Math.abs(metric.change)}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                                    <p className="text-sm font-medium text-gray-700 mb-2">{metric.title}</p>
                                    <p className="text-xs text-gray-500">{metric.description}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Charts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {charts.map((chart, index) => (
                        <motion.div
                            key={chart.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{chart.title}</h3>
                                    <p className="text-sm text-gray-500">{chart.timeframe}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {chart.type === 'line' && <LineChart className="h-5 w-5 text-gray-400" />}
                                    {chart.type === 'bar' && <BarChart2 className="h-5 w-5 text-gray-400" />}
                                    {chart.type === 'pie' && <PieChart className="h-5 w-5 text-gray-400" />}
                                    {chart.type === 'area' && <Activity className="h-5 w-5 text-gray-400" />}
                                </div>
                            </div>

                            {/* Simplified Chart Visualization */}
                            <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mb-4">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-400 mb-2">📊</div>
                                    <div className="text-sm text-gray-500">
                                        {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {chart.data.length} data points
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-700">Insight</span>
                                </div>
                                <p className="text-sm text-blue-600 mt-1">{chart.insight}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Reports Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Generated Reports</h3>
                            <p className="text-sm text-gray-500">Download and manage your reports</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Generate New Report
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {reports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{report.title}</h4>
                                        <p className="text-sm text-gray-600">{report.description}</p>
                                        <div className="flex items-center space-x-4 mt-1">
                                            <span className="text-xs text-gray-500">
                                                Generated {formatDate(report.generatedAt)}
                                            </span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">{report.size}</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500 uppercase">{report.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'ready'
                                            ? 'bg-green-100 text-green-600'
                                            : report.status === 'generating'
                                                ? 'bg-yellow-100 text-yellow-600'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                        {report.status === 'ready' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                                        {report.status === 'generating' && <Clock className="h-3 w-3 inline mr-1" />}
                                        {report.status === 'failed' && <AlertCircle className="h-3 w-3 inline mr-1" />}
                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                    </span>

                                    {report.status === 'ready' && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
