'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    // Analytics Icons
    BarChart3,
    LineChart,
    PieChart,
    Activity,
    TrendingUp,
    TrendingDown,

    // Metrics Icons
    Target,
    Gauge,
    Zap,
    Clock,
    DollarSign,
    Percent,

    // Dashboard Icons
    Monitor,
    Grid3X3,
    Layers,
    LayoutDashboard,
    ChartBar,

    // Data Icons
    Database,
    Download,
    Upload,
    FileText,
    Calendar,
    Filter,

    // Status Icons
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,

    // Control Icons
    Play,
    Pause,
    RotateCcw,
    RefreshCw,
    Settings,

    // Export Icons
    FileDown,
    Share2,
    Printer,
    Mail,

    // Time Icons
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    Timer,

    // Navigation Icons
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Plus,
    Minus,

    // Industry Icons
    Factory,
    Cog,
    Wrench,
    HardHat,
    Truck
} from 'lucide-react'

// Enhanced Analytics Interfaces
interface PerformanceMetric {
    id: string
    name: string
    category: 'production' | 'quality' | 'efficiency' | 'cost' | 'safety' | 'maintenance'
    value: number
    unit: string
    target: number
    trend: 'up' | 'down' | 'stable'
    change: number // percentage change
    timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

    // Historical Data
    historical: {
        date: string
        value: number
    }[]

    // Status
    status: 'excellent' | 'good' | 'warning' | 'critical'
    threshold: {
        excellent: number
        good: number
        warning: number
    }

    // Analysis
    description: string
    insights: string[]
    recommendations: string[]
}

interface ProductionAnalytics {
    overview: {
        totalOutput: number
        outputTarget: number
        efficiency: number
        qualityRate: number
        downtime: number
        oee: number // Overall Equipment Effectiveness
    }

    // Production Lines Performance
    lines: {
        id: string
        name: string
        output: number
        target: number
        efficiency: number
        quality: number
        downtime: number
        status: 'optimal' | 'good' | 'attention' | 'critical'
    }[]

    // Shift Performance
    shifts: {
        shift: 'morning' | 'afternoon' | 'night'
        output: number
        efficiency: number
        quality: number
        incidents: number
        crew: number
    }[]

    // Daily Trends
    dailyTrends: {
        date: string
        output: number
        quality: number
        efficiency: number
        downtime: number
    }[]
}

interface QualityAnalytics {
    overview: {
        qualityScore: number
        defectRate: number
        firstPassYield: number
        reworkRate: number
        customerComplaints: number
        qualityCost: number
    }

    // Defect Analysis
    defects: {
        type: string
        count: number
        percentage: number
        trend: 'increasing' | 'decreasing' | 'stable'
        cost: number
    }[]

    // Quality by Product
    products: {
        name: string
        qualityScore: number
        defectRate: number
        yield: number
        volume: number
    }[]

    // Quality Trends
    trends: {
        date: string
        qualityScore: number
        defectRate: number
        yield: number
    }[]
}

interface CostAnalytics {
    overview: {
        totalCost: number
        costPerUnit: number
        laborCost: number
        materialCost: number
        overheadCost: number
        maintenanceCost: number
    }

    // Cost Breakdown
    breakdown: {
        category: string
        amount: number
        percentage: number
        trend: 'up' | 'down' | 'stable'
        target: number
    }[]

    // Cost Efficiency
    efficiency: {
        metric: string
        current: number
        target: number
        savings: number
        improvement: number
    }[]

    // Monthly Trends
    monthlyTrends: {
        month: string
        total: number
        labor: number
        material: number
        overhead: number
        maintenance: number
    }[]
}

interface CustomReport {
    id: string
    name: string
    description: string
    type: 'production' | 'quality' | 'cost' | 'efficiency' | 'safety' | 'custom'
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'

    // Configuration
    metrics: string[]
    filters: {
        dateRange: {
            start: string
            end: string
        }
        productionLines: string[]
        shifts: string[]
        products: string[]
    }

    // Schedule
    automated: boolean
    recipients: string[]
    lastGenerated: string
    nextGeneration: string

    // Status
    status: 'active' | 'paused' | 'draft'
    format: 'pdf' | 'excel' | 'csv' | 'dashboard'
}

export default function AnalyticsReporting() {
    // Analytics State
    const [selectedView, setSelectedView] = useState<'overview' | 'production' | 'quality' | 'costs' | 'reports' | 'insights'>('overview')
    const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month')
    const [realTimeMode, setRealTimeMode] = useState(true)
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['oee', 'quality', 'efficiency', 'cost'])

    // Performance Metrics Data
    const [performanceMetrics] = useState<PerformanceMetric[]>([
        {
            id: 'oee',
            name: 'Overall Equipment Effectiveness',
            category: 'efficiency',
            value: 82.4,
            unit: '%',
            target: 85,
            trend: 'up',
            change: 2.3,
            timeframe: 'monthly',
            historical: [
                { date: '2025-07-01', value: 78.2 },
                { date: '2025-07-08', value: 79.5 },
                { date: '2025-07-15', value: 81.1 },
                { date: '2025-07-22', value: 82.8 },
                { date: '2025-07-29', value: 82.4 },
                { date: '2025-08-05', value: 83.1 },
                { date: '2025-08-09', value: 82.4 }
            ],
            status: 'good',
            threshold: { excellent: 90, good: 80, warning: 70 },
            description: 'Measure of manufacturing productivity considering availability, performance, and quality',
            insights: [
                'OEE improved by 2.3% this month due to reduced downtime',
                'Quality factor remains consistently above 95%',
                'Performance rate fluctuates between 85-90%'
            ],
            recommendations: [
                'Focus on performance optimization to reach 85% target',
                'Implement predictive maintenance to improve availability',
                'Analyze shift patterns for performance variations'
            ]
        },
        {
            id: 'quality_rate',
            name: 'Quality Rate',
            category: 'quality',
            value: 96.8,
            unit: '%',
            target: 98,
            trend: 'stable',
            change: 0.2,
            timeframe: 'monthly',
            historical: [
                { date: '2025-07-01', value: 96.2 },
                { date: '2025-07-08', value: 96.5 },
                { date: '2025-07-15', value: 96.9 },
                { date: '2025-07-22', value: 96.7 },
                { date: '2025-07-29', value: 96.8 },
                { date: '2025-08-05', value: 97.1 },
                { date: '2025-08-09', value: 96.8 }
            ],
            status: 'good',
            threshold: { excellent: 98, good: 95, warning: 90 },
            description: 'Percentage of products meeting quality standards',
            insights: [
                'Quality rate stable around 96.8% target',
                'Minor variations due to raw material quality',
                'Consistent performance across all shifts'
            ],
            recommendations: [
                'Implement automated quality inspection',
                'Improve supplier quality requirements',
                'Enhanced operator training on quality standards'
            ]
        },
        {
            id: 'production_efficiency',
            name: 'Production Efficiency',
            category: 'efficiency',
            value: 94.2,
            unit: '%',
            target: 95,
            trend: 'up',
            change: 1.8,
            timeframe: 'monthly',
            historical: [
                { date: '2025-07-01', value: 91.5 },
                { date: '2025-07-08', value: 92.3 },
                { date: '2025-07-15', value: 93.1 },
                { date: '2025-07-22', value: 94.7 },
                { date: '2025-07-29', value: 94.2 },
                { date: '2025-08-05', value: 94.8 },
                { date: '2025-08-09', value: 94.2 }
            ],
            status: 'good',
            threshold: { excellent: 96, good: 90, warning: 85 },
            description: 'Ratio of actual output to theoretical maximum output',
            insights: [
                'Steady improvement in efficiency over the month',
                'Peak performance reached during mid-month',
                'Line A shows highest efficiency at 97.2%'
            ],
            recommendations: [
                'Analyze best practices from Line A',
                'Optimize changeover procedures',
                'Implement lean manufacturing principles'
            ]
        },
        {
            id: 'cost_per_unit',
            name: 'Cost per Unit',
            category: 'cost',
            value: 23.45,
            unit: '€',
            target: 22.50,
            trend: 'down',
            change: -2.1,
            timeframe: 'monthly',
            historical: [
                { date: '2025-07-01', value: 24.12 },
                { date: '2025-07-08', value: 23.89 },
                { date: '2025-07-15', value: 23.67 },
                { date: '2025-07-22', value: 23.34 },
                { date: '2025-07-29', value: 23.45 },
                { date: '2025-08-05', value: 23.28 },
                { date: '2025-08-09', value: 23.45 }
            ],
            status: 'warning',
            threshold: { excellent: 22, good: 23, warning: 24 },
            description: 'Total manufacturing cost divided by units produced',
            insights: [
                'Cost reduction of 2.1% achieved through efficiency improvements',
                'Material costs stable, labor efficiency improved',
                'Energy costs decreased by optimizing production schedules'
            ],
            recommendations: [
                'Continue focus on material waste reduction',
                'Negotiate better supplier contracts',
                'Implement energy-efficient equipment'
            ]
        }
    ])

    // Production Analytics Data
    const [productionAnalytics] = useState<ProductionAnalytics>({
        overview: {
            totalOutput: 8947,
            outputTarget: 9500,
            efficiency: 94.2,
            qualityRate: 96.8,
            downtime: 12.5,
            oee: 82.4
        },
        lines: [
            {
                id: 'line-a',
                name: 'Assembly Line A',
                output: 2847,
                target: 3000,
                efficiency: 97.2,
                quality: 98.1,
                downtime: 8.2,
                status: 'optimal'
            },
            {
                id: 'line-b',
                name: 'Fabrication Line B',
                output: 2156,
                target: 2250,
                efficiency: 92.8,
                quality: 95.7,
                downtime: 15.3,
                status: 'good'
            },
            {
                id: 'line-c',
                name: 'Packaging Line C',
                output: 2634,
                target: 2750,
                efficiency: 93.5,
                quality: 97.2,
                downtime: 11.8,
                status: 'good'
            },
            {
                id: 'line-d',
                name: 'Quality Control D',
                output: 1310,
                target: 1500,
                efficiency: 89.4,
                quality: 96.3,
                downtime: 18.7,
                status: 'attention'
            }
        ],
        shifts: [
            {
                shift: 'morning',
                output: 3240,
                efficiency: 96.1,
                quality: 97.4,
                incidents: 0,
                crew: 24
            },
            {
                shift: 'afternoon',
                output: 3058,
                efficiency: 93.2,
                quality: 96.8,
                incidents: 1,
                crew: 22
            },
            {
                shift: 'night',
                output: 2649,
                efficiency: 91.8,
                quality: 96.1,
                incidents: 0,
                crew: 18
            }
        ],
        dailyTrends: [
            { date: '2025-08-03', output: 8750, quality: 96.5, efficiency: 93.8, downtime: 14.2 },
            { date: '2025-08-04', output: 8920, quality: 96.9, efficiency: 94.1, downtime: 13.5 },
            { date: '2025-08-05', output: 9100, quality: 97.2, efficiency: 94.8, downtime: 11.8 },
            { date: '2025-08-06', output: 8890, quality: 96.7, efficiency: 94.3, downtime: 12.9 },
            { date: '2025-08-07', output: 8760, quality: 96.4, efficiency: 93.9, downtime: 13.8 },
            { date: '2025-08-08', output: 9050, quality: 97.0, efficiency: 94.6, downtime: 12.1 },
            { date: '2025-08-09', output: 8947, quality: 96.8, efficiency: 94.2, downtime: 12.5 }
        ]
    })

    // Quality Analytics Data
    const [qualityAnalytics] = useState<QualityAnalytics>({
        overview: {
            qualityScore: 96.8,
            defectRate: 3.2,
            firstPassYield: 94.1,
            reworkRate: 2.7,
            customerComplaints: 5,
            qualityCost: 15600
        },
        defects: [
            { type: 'Dimensional Variance', count: 45, percentage: 35.2, trend: 'decreasing', cost: 5400 },
            { type: 'Surface Finish', count: 32, percentage: 25.0, trend: 'stable', cost: 3840 },
            { type: 'Material Defect', count: 28, percentage: 21.9, trend: 'increasing', cost: 4200 },
            { type: 'Assembly Error', count: 18, percentage: 14.1, trend: 'decreasing', cost: 2700 },
            { type: 'Other', count: 5, percentage: 3.9, trend: 'stable', cost: 750 }
        ],
        products: [
            { name: 'Product A', qualityScore: 97.8, defectRate: 2.2, yield: 95.6, volume: 3240 },
            { name: 'Product B', qualityScore: 96.2, defectRate: 3.8, yield: 93.1, volume: 2890 },
            { name: 'Product C', qualityScore: 96.5, defectRate: 3.5, yield: 93.8, volume: 2817 }
        ],
        trends: [
            { date: '2025-08-03', qualityScore: 96.2, defectRate: 3.8, yield: 93.5 },
            { date: '2025-08-04', qualityScore: 96.5, defectRate: 3.5, yield: 93.9 },
            { date: '2025-08-05', qualityScore: 97.1, defectRate: 2.9, yield: 94.8 },
            { date: '2025-08-06', qualityScore: 96.7, defectRate: 3.3, yield: 94.2 },
            { date: '2025-08-07', qualityScore: 96.4, defectRate: 3.6, yield: 93.7 },
            { date: '2025-08-08', qualityScore: 97.0, defectRate: 3.0, yield: 94.5 },
            { date: '2025-08-09', qualityScore: 96.8, defectRate: 3.2, yield: 94.1 }
        ]
    })

    // Cost Analytics Data
    const [costAnalytics] = useState<CostAnalytics>({
        overview: {
            totalCost: 209850,
            costPerUnit: 23.45,
            laborCost: 89200,
            materialCost: 87650,
            overheadCost: 23100,
            maintenanceCost: 9900
        },
        breakdown: [
            { category: 'Labor', amount: 89200, percentage: 42.5, trend: 'stable', target: 85000 },
            { category: 'Materials', amount: 87650, percentage: 41.8, trend: 'up', target: 85000 },
            { category: 'Overhead', amount: 23100, percentage: 11.0, trend: 'down', target: 25000 },
            { category: 'Maintenance', amount: 9900, percentage: 4.7, trend: 'down', target: 12000 }
        ],
        efficiency: [
            { metric: 'Labor Efficiency', current: 94.2, target: 95.0, savings: 2100, improvement: 2.1 },
            { metric: 'Material Utilization', current: 91.8, target: 93.0, savings: 1800, improvement: 1.5 },
            { metric: 'Energy Efficiency', current: 87.3, target: 90.0, savings: 3200, improvement: 4.2 },
            { metric: 'Waste Reduction', current: 96.1, target: 97.0, savings: 1200, improvement: 0.8 }
        ],
        monthlyTrends: [
            { month: 'Jan', total: 215600, labor: 91800, material: 89200, overhead: 24800, maintenance: 9800 },
            { month: 'Feb', total: 208900, labor: 89100, material: 86500, overhead: 23600, maintenance: 9700 },
            { month: 'Mar', total: 212400, labor: 90200, material: 88100, overhead: 24200, maintenance: 9900 },
            { month: 'Apr', total: 207800, labor: 88900, material: 85800, overhead: 23300, maintenance: 9800 },
            { month: 'May', total: 211300, labor: 89800, material: 87200, overhead: 24100, maintenance: 10200 },
            { month: 'Jun', total: 206500, labor: 88200, material: 85900, overhead: 22800, maintenance: 9600 },
            { month: 'Jul', total: 210200, labor: 89500, material: 86800, overhead: 23400, maintenance: 10500 },
            { month: 'Aug', total: 209850, labor: 89200, material: 87650, overhead: 23100, maintenance: 9900 }
        ]
    })

    // Custom Reports Data
    const [customReports] = useState<CustomReport[]>([
        {
            id: 'report-001',
            name: 'Daily Production Summary',
            description: 'Comprehensive daily production metrics and quality indicators',
            type: 'production',
            frequency: 'daily',
            metrics: ['output', 'efficiency', 'quality', 'downtime'],
            filters: {
                dateRange: { start: '2025-08-09', end: '2025-08-09' },
                productionLines: ['all'],
                shifts: ['all'],
                products: ['all']
            },
            automated: true,
            recipients: ['production.manager@fabricai.com', 'plant.supervisor@fabricai.com'],
            lastGenerated: '2025-08-09T06:00:00Z',
            nextGeneration: '2025-08-10T06:00:00Z',
            status: 'active',
            format: 'pdf'
        },
        {
            id: 'report-002',
            name: 'Weekly Quality Report',
            description: 'Quality trends, defect analysis, and improvement recommendations',
            type: 'quality',
            frequency: 'weekly',
            metrics: ['quality_score', 'defect_rate', 'yield', 'customer_satisfaction'],
            filters: {
                dateRange: { start: '2025-08-03', end: '2025-08-09' },
                productionLines: ['all'],
                shifts: ['all'],
                products: ['all']
            },
            automated: true,
            recipients: ['quality.manager@fabricai.com', 'production.manager@fabricai.com'],
            lastGenerated: '2025-08-09T18:00:00Z',
            nextGeneration: '2025-08-16T18:00:00Z',
            status: 'active',
            format: 'excel'
        },
        {
            id: 'report-003',
            name: 'Monthly Cost Analysis',
            description: 'Detailed cost breakdown and efficiency opportunities',
            type: 'cost',
            frequency: 'monthly',
            metrics: ['total_cost', 'cost_per_unit', 'labor_cost', 'material_cost', 'overhead'],
            filters: {
                dateRange: { start: '2025-08-01', end: '2025-08-31' },
                productionLines: ['all'],
                shifts: ['all'],
                products: ['all']
            },
            automated: false,
            recipients: ['finance.manager@fabricai.com', 'plant.manager@fabricai.com'],
            lastGenerated: '2025-07-31T23:59:00Z',
            nextGeneration: '2025-08-31T23:59:00Z',
            status: 'active',
            format: 'dashboard'
        }
    ])

    // Real-time Updates Simulation
    useEffect(() => {
        if (realTimeMode) {
            const interval = setInterval(() => {
                // Simulate real-time metric updates
                // This would connect to actual data sources in production
            }, 5000)

            return () => clearInterval(interval)
        }
    }, [realTimeMode])

    // Navigation tabs
    const navigationTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'production', label: 'Production', icon: Factory },
        { id: 'quality', label: 'Quality', icon: Target },
        { id: 'costs', label: 'Costs', icon: DollarSign },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'insights', label: 'Insights', icon: Activity }
    ]

    // Get status color and icon
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'excellent': return { color: 'text-green-600 bg-green-100', icon: CheckCircle2, label: 'Excellent' }
            case 'good': return { color: 'text-blue-600 bg-blue-100', icon: Info, label: 'Good' }
            case 'warning': return { color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle, label: 'Warning' }
            case 'critical': return { color: 'text-red-600 bg-red-100', icon: XCircle, label: 'Critical' }
            default: return { color: 'text-gray-600 bg-gray-100', icon: Info, label: 'Unknown' }
        }
    }

    // Get trend icon and color
    const getTrendInfo = (trend: string) => {
        switch (trend) {
            case 'up': return { icon: TrendingUp, color: 'text-green-600' }
            case 'down': return { icon: TrendingDown, color: 'text-red-600' }
            default: return { icon: Activity, color: 'text-gray-600' }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Analytics & Reporting
                            </h1>
                            <p className="text-gray-600 mt-2">Manufacturing performance insights and KPI dashboards</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <select
                                value={selectedTimeframe}
                                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                                className="bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>

                            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200/50">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {realTimeMode ? 'Live Data' : 'Static Data'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setRealTimeMode(!realTimeMode)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${realTimeMode ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200/50 mb-6">
                    <div className="flex space-x-1 p-1">
                        {navigationTabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${selectedView === tab.id
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Overview Dashboard */}
                {selectedView === 'overview' && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {performanceMetrics.slice(0, 4).map((metric, index) => {
                                const statusInfo = getStatusInfo(metric.status)
                                const trendInfo = getTrendInfo(metric.trend)
                                const StatusIcon = statusInfo.icon
                                const TrendIcon = trendInfo.icon

                                return (
                                    <motion.div
                                        key={metric.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-orange-800 font-semibold text-sm">{metric.name}</h3>
                                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                <span>{statusInfo.label}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end space-x-2 mb-3">
                                            <p className="text-3xl font-bold text-orange-900">
                                                {metric.value.toFixed(1)}{metric.unit}
                                            </p>
                                            <div className={`flex items-center space-x-1 text-sm ${trendInfo.color}`}>
                                                <TrendIcon className="w-4 h-4" />
                                                <span>{Math.abs(metric.change).toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Target: {metric.target}{metric.unit}</span>
                                                <span className="font-medium">{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                                                    transition={{ duration: 1, delay: index * 0.2 }}
                                                    className={`h-2 rounded-full ${metric.value >= metric.target ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                            metric.value >= metric.target * 0.9 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                'bg-gradient-to-r from-red-400 to-red-600'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Production Lines Performance */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Production Lines */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Lines Performance</h3>
                                <div className="space-y-4">
                                    {productionAnalytics.lines.map((line, index) => (
                                        <motion.div
                                            key={line.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900">{line.name}</h4>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${line.status === 'optimal' ? 'bg-green-100 text-green-700' :
                                                        line.status === 'good' ? 'bg-blue-100 text-blue-700' :
                                                            line.status === 'attention' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4 mb-3">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Output</p>
                                                    <p className="font-semibold text-gray-900">{line.output.toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Efficiency</p>
                                                    <p className="font-semibold text-gray-900">{line.efficiency.toFixed(1)}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Quality</p>
                                                    <p className="font-semibold text-gray-900">{line.quality.toFixed(1)}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Downtime</p>
                                                    <p className="font-semibold text-gray-900">{line.downtime.toFixed(1)}h</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Target Progress</span>
                                                    <span className="font-medium">{((line.output / line.target) * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((line.output / line.target) * 100, 100)}%` }}
                                                        transition={{ duration: 1, delay: index * 0.2 }}
                                                        className={`h-2 rounded-full ${line.output >= line.target ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                                line.output >= line.target * 0.9 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Shift Performance */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Performance</h3>
                                <div className="space-y-4">
                                    {productionAnalytics.shifts.map((shift, index) => (
                                        <motion.div
                                            key={shift.shift}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 capitalize">{shift.shift} Shift</h4>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <HardHat className="w-4 h-4" />
                                                    <span>{shift.crew} workers</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Output</p>
                                                    <p className="font-semibold text-gray-900">{shift.output.toLocaleString()}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Efficiency</p>
                                                    <p className="font-semibold text-gray-900">{shift.efficiency.toFixed(1)}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Quality</p>
                                                    <p className="font-semibold text-gray-900">{shift.quality.toFixed(1)}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Incidents</p>
                                                    <p className={`font-semibold ${shift.incidents === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {shift.incidents}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other views placeholder */}
                {(['production', 'quality', 'costs', 'reports', 'insights'].includes(selectedView)) && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-orange-200/50 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Analytics
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Advanced {selectedView} analytics and detailed insights will be implemented here.
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg inline-block">
                            Coming Soon: {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Deep Analytics
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
