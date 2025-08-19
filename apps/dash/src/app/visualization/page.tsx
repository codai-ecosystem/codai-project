'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    BarChart3,
    LineChart,
    PieChart,
    TrendingUp,
    Settings,
    Download,
    Share2,
    Maximize2,
    Filter,
    Calendar,
    RefreshCw,
    Zap,
    Target,
    Activity,
    Eye,
    Grid3X3,
    Layout,
    MousePointer,
    Palette,
    Database,
    Clock,
    Users,
    DollarSign,
    ShoppingCart,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    ChevronDown,
    Plus,
    Edit,
    Copy,
    Trash2,
    Star,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react'

// TypeScript interfaces for data visualization
interface ChartData {
    id: string
    name: string
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel'
    data: any[]
    config: ChartConfig
    lastUpdated: string
    views: number
    favorite: boolean
    category: 'performance' | 'financial' | 'user' | 'marketing' | 'operational'
}

interface ChartConfig {
    title: string
    xAxis?: string
    yAxis?: string
    colors: string[]
    interactive: boolean
    realTime: boolean
    animated: boolean
    responsive: boolean
}

interface VisualizationTemplate {
    id: string
    name: string
    description: string
    chartType: string
    complexity: 'simple' | 'intermediate' | 'advanced'
    category: string
    estimatedSetup: string
    preview: string
}

interface RealtimeMetric {
    id: string
    label: string
    value: number
    unit: string
    change: number
    trend: 'up' | 'down' | 'stable'
    color: string
}

export default function DataVisualizationPage() {
    const [activeTab, setActiveTab] = useState('gallery')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedChartType, setSelectedChartType] = useState('all')
    const [viewMode, setViewMode] = useState('grid')
    const [isRealTimeActive, setIsRealTimeActive] = useState(true)

    // Sample chart data
    const [charts] = useState<ChartData[]>([
        {
            id: '1',
            name: 'Revenue Trends',
            type: 'line',
            data: [
                { month: 'Jan', revenue: 65000, target: 70000 },
                { month: 'Feb', revenue: 72000, target: 75000 },
                { month: 'Mar', revenue: 68000, target: 70000 },
                { month: 'Apr', revenue: 84000, target: 80000 },
                { month: 'May', revenue: 91000, target: 85000 },
                { month: 'Jun', revenue: 88000, target: 90000 }
            ],
            config: {
                title: 'Monthly Revenue vs Target',
                xAxis: 'Month',
                yAxis: 'Revenue ($)',
                colors: ['#3B82F6', '#10B981'],
                interactive: true,
                realTime: false,
                animated: true,
                responsive: true
            },
            lastUpdated: '2 hours ago',
            views: 245,
            favorite: true,
            category: 'financial'
        },
        {
            id: '2',
            name: 'User Demographics',
            type: 'pie',
            data: [
                { category: '18-24', value: 15, count: 1500 },
                { category: '25-34', value: 35, count: 3500 },
                { category: '35-44', value: 28, count: 2800 },
                { category: '45-54', value: 15, count: 1500 },
                { category: '55+', value: 7, count: 700 }
            ],
            config: {
                title: 'User Age Distribution',
                colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
                interactive: true,
                realTime: true,
                animated: true,
                responsive: true
            },
            lastUpdated: '15 minutes ago',
            views: 189,
            favorite: false,
            category: 'user'
        },
        {
            id: '3',
            name: 'Performance Metrics',
            type: 'bar',
            data: [
                { metric: 'Page Load', value: 2.3, benchmark: 3.0 },
                { metric: 'API Response', value: 450, benchmark: 500 },
                { metric: 'Database Query', value: 120, benchmark: 200 },
                { metric: 'Memory Usage', value: 65, benchmark: 80 },
                { metric: 'CPU Usage', value: 45, benchmark: 70 }
            ],
            config: {
                title: 'System Performance vs Benchmarks',
                xAxis: 'Metrics',
                yAxis: 'Value',
                colors: ['#3B82F6', '#E5E7EB'],
                interactive: true,
                realTime: true,
                animated: true,
                responsive: true
            },
            lastUpdated: '5 minutes ago',
            views: 156,
            favorite: true,
            category: 'performance'
        },
        {
            id: '4',
            name: 'Marketing Funnel',
            type: 'funnel',
            data: [
                { stage: 'Awareness', value: 10000, conversion: 100 },
                { stage: 'Interest', value: 7500, conversion: 75 },
                { stage: 'Consideration', value: 4200, conversion: 42 },
                { stage: 'Intent', value: 2800, conversion: 28 },
                { stage: 'Purchase', value: 1650, conversion: 16.5 }
            ],
            config: {
                title: 'Marketing Conversion Funnel',
                colors: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE'],
                interactive: true,
                realTime: false,
                animated: true,
                responsive: true
            },
            lastUpdated: '1 hour ago',
            views: 203,
            favorite: false,
            category: 'marketing'
        },
        {
            id: '5',
            name: 'Geographic Distribution',
            type: 'heatmap',
            data: [
                { region: 'North America', value: 45, intensity: 0.9 },
                { region: 'Europe', value: 30, intensity: 0.7 },
                { region: 'Asia Pacific', value: 15, intensity: 0.4 },
                { region: 'South America', value: 7, intensity: 0.2 },
                { region: 'Africa', value: 3, intensity: 0.1 }
            ],
            config: {
                title: 'Global User Distribution',
                colors: ['#EDE9FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#6D28D9'],
                interactive: true,
                realTime: true,
                animated: true,
                responsive: true
            },
            lastUpdated: '30 minutes ago',
            views: 178,
            favorite: true,
            category: 'user'
        },
        {
            id: '6',
            name: 'Sales Performance',
            type: 'gauge',
            data: [
                { metric: 'Quarterly Goal', current: 847000, target: 1000000, percentage: 84.7 }
            ],
            config: {
                title: 'Q4 Sales Progress',
                colors: ['#10B981', '#F59E0B', '#EF4444'],
                interactive: false,
                realTime: true,
                animated: true,
                responsive: true
            },
            lastUpdated: '10 minutes ago',
            views: 134,
            favorite: false,
            category: 'financial'
        }
    ])

    // Visualization templates
    const [templates] = useState<VisualizationTemplate[]>([
        {
            id: '1',
            name: 'Revenue Dashboard',
            description: 'Comprehensive revenue tracking with trends and forecasts',
            chartType: 'Multi-chart',
            complexity: 'advanced',
            category: 'Financial',
            estimatedSetup: '15 minutes',
            preview: '/previews/revenue-dashboard.png'
        },
        {
            id: '2',
            name: 'User Analytics',
            description: 'User behavior and demographic analysis',
            chartType: 'Pie + Bar',
            complexity: 'intermediate',
            category: 'Analytics',
            estimatedSetup: '10 minutes',
            preview: '/previews/user-analytics.png'
        },
        {
            id: '3',
            name: 'Performance Monitor',
            description: 'Real-time system performance tracking',
            chartType: 'Line + Gauge',
            complexity: 'simple',
            category: 'Performance',
            estimatedSetup: '5 minutes',
            preview: '/previews/performance-monitor.png'
        },
        {
            id: '4',
            name: 'Marketing Funnel',
            description: 'Conversion tracking and funnel analysis',
            chartType: 'Funnel',
            complexity: 'intermediate',
            category: 'Marketing',
            estimatedSetup: '8 minutes',
            preview: '/previews/marketing-funnel.png'
        }
    ])

    // Real-time metrics
    const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetric[]>([
        { id: '1', label: 'Active Users', value: 2847, unit: '', change: 12.5, trend: 'up', color: '#10B981' },
        { id: '2', label: 'Revenue Today', value: 15840, unit: '$', change: -3.2, trend: 'down', color: '#EF4444' },
        { id: '3', label: 'Conversion Rate', value: 3.7, unit: '%', change: 0.8, trend: 'up', color: '#3B82F6' },
        { id: '4', label: 'Page Views', value: 18562, unit: '', change: 5.4, trend: 'up', color: '#8B5CF6' },
        { id: '5', label: 'Bounce Rate', value: 32.1, unit: '%', change: -2.1, trend: 'down', color: '#10B981' },
        { id: '6', label: 'Avg Session', value: 4.3, unit: 'min', change: 1.2, trend: 'up', color: '#F59E0B' }
    ])

    // Simulate real-time updates
    useEffect(() => {
        if (!isRealTimeActive) return

        const interval = setInterval(() => {
            setRealtimeMetrics(prev => prev.map(metric => ({
                ...metric,
                value: metric.value + (Math.random() - 0.5) * (metric.value * 0.02),
                change: (Math.random() - 0.5) * 10
            })))
        }, 3000)

        return () => clearInterval(interval)
    }, [isRealTimeActive])

    const getChartIcon = (type: string) => {
        switch (type) {
            case 'line': return <LineChart className="w-5 h-5" />
            case 'bar': return <BarChart3 className="w-5 h-5" />
            case 'pie': return <PieChart className="w-5 h-5" />
            case 'area': return <TrendingUp className="w-5 h-5" />
            case 'scatter': return <Target className="w-5 h-5" />
            case 'heatmap': return <Grid3X3 className="w-5 h-5" />
            case 'gauge': return <Activity className="w-5 h-5" />
            case 'funnel': return <Filter className="w-5 h-5" />
            default: return <BarChart3 className="w-5 h-5" />
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'financial': return 'text-green-600 bg-green-100'
            case 'user': return 'text-blue-600 bg-blue-100'
            case 'performance': return 'text-purple-600 bg-purple-100'
            case 'marketing': return 'text-orange-600 bg-orange-100'
            case 'operational': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'simple': return 'text-green-600 bg-green-100'
            case 'intermediate': return 'text-yellow-600 bg-yellow-100'
            case 'advanced': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const filteredCharts = charts.filter(chart => {
        const matchesCategory = selectedCategory === 'all' || chart.category === selectedCategory
        const matchesType = selectedChartType === 'all' || chart.type === selectedChartType
        return matchesCategory && matchesType
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Data Visualization</h1>
                                    <p className="text-blue-100">Interactive charts and advanced analytics visualizations</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
                                className={`px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors ${isRealTimeActive
                                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100'
                                        : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                {isRealTimeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isRealTimeActive ? 'Pause Live' : 'Start Live'}</span>
                            </button>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>New Chart</span>
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Real-time Metrics Bar */}
                {isRealTimeActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Live Metrics</h2>
                            <div className="flex items-center space-x-2 text-sm text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Live Updates</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {realtimeMetrics.map((metric) => (
                                <div key={metric.id} className="text-center">
                                    <div className="text-2xl font-bold" style={{ color: metric.color }}>
                                        {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                                    </div>
                                    <div className="text-sm text-gray-600">{metric.label}</div>
                                    <div className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-8"
                >
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-1 p-1">
                            {[
                                { id: 'gallery', label: 'Chart Gallery', icon: Grid3X3 },
                                { id: 'templates', label: 'Templates', icon: Layout },
                                { id: 'builder', label: 'Chart Builder', icon: Plus },
                                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart Gallery Tab */}
                    {activeTab === 'gallery' && (
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="financial">Financial</option>
                                        <option value="user">User Analytics</option>
                                        <option value="performance">Performance</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="operational">Operational</option>
                                    </select>
                                </div>
                                <select
                                    value={selectedChartType}
                                    onChange={(e) => setSelectedChartType(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Chart Types</option>
                                    <option value="line">Line Charts</option>
                                    <option value="bar">Bar Charts</option>
                                    <option value="pie">Pie Charts</option>
                                    <option value="area">Area Charts</option>
                                    <option value="scatter">Scatter Plots</option>
                                    <option value="heatmap">Heatmaps</option>
                                    <option value="gauge">Gauges</option>
                                    <option value="funnel">Funnels</option>
                                </select>
                                <div className="flex items-center space-x-2 ml-auto">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Layout className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                                }`}>
                                {filteredCharts.map((chart) => (
                                    <motion.div
                                        key={chart.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                        {getChartIcon(chart.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{chart.name}</h3>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(chart.category)}`}>
                                                                {chart.category}
                                                            </span>
                                                            {chart.config.realTime && (
                                                                <div className="flex items-center space-x-1 text-green-600">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <span className="text-xs">Live</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {chart.favorite && (
                                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    )}
                                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                                        <Maximize2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Chart Preview Area */}
                                            <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                                                <div className="text-center text-gray-500">
                                                    {getChartIcon(chart.type)}
                                                    <div className="text-sm mt-2">{chart.config.title}</div>
                                                </div>
                                            </div>

                                            {/* Chart Info */}
                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                <span>Updated: {chart.lastUpdated}</span>
                                                <span>{chart.views} views</span>
                                            </div>

                                            {/* Chart Features */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {chart.config.interactive && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Interactive</span>
                                                )}
                                                {chart.config.animated && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Animated</span>
                                                )}
                                                {chart.config.responsive && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Responsive</span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                        <Share2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Templates Tab */}
                    {activeTab === 'templates' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {templates.map((template) => (
                                    <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                            <div className="text-center text-gray-600">
                                                <Layout className="w-8 h-8 mx-auto mb-2" />
                                                <div className="text-sm">{template.chartType}</div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(template.complexity)}`}>
                                                    {template.complexity}
                                                </span>
                                                <span className="text-xs text-gray-500">{template.estimatedSetup}</span>
                                            </div>
                                            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                                                Use Template
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chart Builder Tab */}
                    {activeTab === 'builder' && (
                        <div className="p-6">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chart Builder</h3>
                                <p className="text-gray-600 mb-6">Create custom visualizations with our intuitive chart builder</p>
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                                    Start Building
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="p-6">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                                <p className="text-gray-600 mb-6">Deep dive into your data with advanced analytical tools</p>
                                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                                    Explore Analytics
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
