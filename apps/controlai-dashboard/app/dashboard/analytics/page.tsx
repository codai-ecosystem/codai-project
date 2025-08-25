'use client'

import React from 'react'
/**
 * Enhanced Analytics Dashboard Page - Advanced Reporting and Data Insights
 * Comprehensive analytics with real-time monitoring and AI-powered insights
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, PieChart, Activity, Calendar, Filter,
    Download, Share2, RefreshCw, Settings, Eye, Target,
    Users, DollarSign, Clock, AlertTriangle, CheckCircle2,
    Zap, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react'

// Import modular components
import { AnalyticsHeader } from './components/AnalyticsHeader'
import { AnalyticsOverview } from './components/AnalyticsOverview'
import { PerformanceMetrics } from './components/PerformanceMetrics'
import { RealtimeCharts } from './components/RealtimeCharts'
import { CustomReports } from './components/CustomReports'
import { DataVisualization } from './components/DataVisualization'
import { InsightsPanel } from './components/InsightsPanel'
import { ExportControls } from './components/ExportControls'
import { AnalyticsFooter } from './components/AnalyticsFooter'

// Enhanced Types
interface AnalyticsState {
    activeView: 'overview' | 'performance' | 'charts' | 'reports' | 'insights'
    timeRange: TimeRange
    selectedMetrics: string[]
    filters: AnalyticsFilters
    realTimeEnabled: boolean
    autoRefresh: boolean
    refreshInterval: number
    customDateRange: DateRange
    compareMode: boolean
    comparisonPeriod: string
}

interface TimeRange {
    label: string
    value: string
    days: number
    preset: boolean
}

interface AnalyticsFilters {
    projects: string[]
    teams: string[]
    statuses: string[]
    priorities: string[]
    dateRange: DateRange
    categories: string[]
}

interface DateRange {
    start: string | null
    end: string | null
    preset: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

interface MetricData {
    id: string
    name: string
    value: number | string
    change: number
    trend: 'up' | 'down' | 'stable'
    target?: number
    unit: string
    category: string
    description: string
    historical: Array<{ date: string; value: number }>
}

interface ChartData {
    labels: string[]
    datasets: Array<{
        label: string
        data: number[]
        backgroundColor?: string | string[]
        borderColor?: string
        borderWidth?: number
        fill?: boolean
    }>
}

// Mock analytics data
const mockMetrics: MetricData[] = [
    {
        id: 'total-projects',
        name: 'Total Projects',
        value: 47,
        change: 12.5,
        trend: 'up',
        target: 50,
        unit: 'count',
        category: 'projects',
        description: 'Total number of active projects',
        historical: [
            { date: '2025-01-01', value: 35 },
            { date: '2025-02-01', value: 38 },
            { date: '2025-03-01', value: 42 },
            { date: '2025-04-01', value: 45 },
            { date: '2025-05-01', value: 47 }
        ]
    },
    {
        id: 'completion-rate',
        name: 'Completion Rate',
        value: '87%',
        change: 5.2,
        trend: 'up',
        target: 90,
        unit: 'percentage',
        category: 'performance',
        description: 'Project completion success rate',
        historical: [
            { date: '2025-01-01', value: 82 },
            { date: '2025-02-01', value: 84 },
            { date: '2025-03-01', value: 85 },
            { date: '2025-04-01', value: 86 },
            { date: '2025-05-01', value: 87 }
        ]
    },
    {
        id: 'budget-efficiency',
        name: 'Budget Efficiency',
        value: '92%',
        change: -2.1,
        trend: 'down',
        target: 95,
        unit: 'percentage',
        category: 'financial',
        description: 'Budget utilization efficiency',
        historical: [
            { date: '2025-01-01', value: 95 },
            { date: '2025-02-01', value: 94 },
            { date: '2025-03-01', value: 93 },
            { date: '2025-04-01', value: 92 },
            { date: '2025-05-01', value: 92 }
        ]
    },
    {
        id: 'team-productivity',
        name: 'Team Productivity',
        value: '94%',
        change: 8.7,
        trend: 'up',
        target: 95,
        unit: 'percentage',
        category: 'team',
        description: 'Overall team productivity score',
        historical: [
            { date: '2025-01-01', value: 87 },
            { date: '2025-02-01', value: 89 },
            { date: '2025-03-01', value: 91 },
            { date: '2025-04-01', value: 93 },
            { date: '2025-05-01', value: 94 }
        ]
    }
]

// Time range presets
const timeRanges: TimeRange[] = [
    { label: 'Last 24 Hours', value: '24h', days: 1, preset: true },
    { label: 'Last 7 Days', value: '7d', days: 7, preset: true },
    { label: 'Last 30 Days', value: '30d', days: 30, preset: true },
    { label: 'Last 90 Days', value: '90d', days: 90, preset: true },
    { label: 'Last Year', value: '1y', days: 365, preset: true },
    { label: 'Custom Range', value: 'custom', days: 0, preset: false }
]

// Mock hooks
const useAnalytics = (timeRange: TimeRange, filters: AnalyticsFilters) => ({
    metrics: mockMetrics,
    loading: false,
    error: null,
    refreshData: () => console.log('Refreshing analytics data'),
    exportData: (format: string) => console.log('Exporting data:', format),
    realTimeData: {
        activeUsers: 156,
        currentLoad: 78,
        responseTime: 245,
        errorRate: 0.02
    }
})

export default function AnalyticsPage() {
    // Enhanced state management
    const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
        activeView: 'overview',
        timeRange: timeRanges[2], // Last 30 days
        selectedMetrics: ['total-projects', 'completion-rate', 'budget-efficiency', 'team-productivity'],
        filters: {
            projects: [],
            teams: [],
            statuses: [],
            priorities: [],
            dateRange: { start: null, end: null, preset: 'month' },
            categories: []
        },
        realTimeEnabled: true,
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        customDateRange: { start: null, end: null, preset: 'custom' },
        compareMode: false,
        comparisonPeriod: 'previous'
    })

    // Data hooks
    const { metrics, loading, error, refreshData, exportData, realTimeData } = useAnalytics(
        analyticsState.timeRange,
        analyticsState.filters
    )

    // Auto-refresh logic
    useEffect(() => {
        if (analyticsState.autoRefresh && analyticsState.realTimeEnabled) {
            const interval = setInterval(() => {
                refreshData()
            }, analyticsState.refreshInterval)

            return () => clearInterval(interval)
        }
    }, [analyticsState.autoRefresh, analyticsState.realTimeEnabled, analyticsState.refreshInterval, refreshData])

    // Filtered metrics based on selected categories
    const filteredMetrics = useMemo(() => {
        if (analyticsState.filters.categories.length === 0) {
            return metrics.filter(metric => analyticsState.selectedMetrics.includes(metric.id))
        }
        return metrics.filter(metric =>
            analyticsState.selectedMetrics.includes(metric.id) &&
            analyticsState.filters.categories.includes(metric.category)
        )
    }, [metrics, analyticsState.selectedMetrics, analyticsState.filters.categories])

    // Analytics summary
    const analyticsSummary = useMemo(() => {
        const totalMetrics = filteredMetrics.length
        const improvingMetrics = filteredMetrics.filter(m => m.trend === 'up').length
        const decliningMetrics = filteredMetrics.filter(m => m.trend === 'down').length
        const stableMetrics = filteredMetrics.filter(m => m.trend === 'stable').length
        const avgChange = totalMetrics > 0
            ? filteredMetrics.reduce((sum, m) => sum + m.change, 0) / totalMetrics
            : 0

        return {
            totalMetrics,
            improvingMetrics,
            decliningMetrics,
            stableMetrics,
            avgChange,
            healthScore: Math.round(((improvingMetrics + stableMetrics) / totalMetrics) * 100) || 0
        }
    }, [filteredMetrics])

    // Chart data preparation
    const chartData = useMemo(() => {
        const labels = filteredMetrics[0]?.historical.map(h => h.date) || []
        const datasets = filteredMetrics.map((metric, index) => ({
            label: metric.name,
            data: metric.historical.map(h => h.value),
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(index * 60) % 360}, 70%, 50%, 0.1)`,
            borderWidth: 2,
            fill: false
        }))

        return { labels, datasets }
    }, [filteredMetrics])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <AnalyticsHeader
                analyticsState={analyticsState}
                onStateChange={setAnalyticsState}
                timeRanges={timeRanges}
                summary={analyticsSummary}
                realTimeData={realTimeData}
            />

            <AnalyticsOverview
                metrics={filteredMetrics}
                summary={analyticsSummary}
                realTimeData={realTimeData}
                timeRange={analyticsState.timeRange}
                compareMode={analyticsState.compareMode}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    key={analyticsState.activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {analyticsState.activeView === 'overview' && (
                        <div className="space-y-8">
                            <PerformanceMetrics
                                metrics={filteredMetrics}
                                chartData={chartData}
                                timeRange={analyticsState.timeRange}
                            />
                            <RealtimeCharts
                                realTimeData={realTimeData}
                                enabled={analyticsState.realTimeEnabled}
                                refreshInterval={analyticsState.refreshInterval}
                            />
                        </div>
                    )}

                    {analyticsState.activeView === 'performance' && (
                        <PerformanceMetrics
                            metrics={filteredMetrics}
                            chartData={chartData}
                            timeRange={analyticsState.timeRange}
                            detailed={true}
                        />
                    )}

                    {analyticsState.activeView === 'charts' && (
                        <RealtimeCharts
                            realTimeData={realTimeData}
                            enabled={analyticsState.realTimeEnabled}
                            refreshInterval={analyticsState.refreshInterval}
                            fullView={true}
                        />
                    )}

                    {analyticsState.activeView === 'reports' && (
                        <CustomReports
                            metrics={filteredMetrics}
                            timeRange={analyticsState.timeRange}
                            onExport={exportData}
                        />
                    )}

                    {analyticsState.activeView === 'insights' && (
                        <InsightsPanel
                            metrics={filteredMetrics}
                            summary={analyticsSummary}
                            timeRange={analyticsState.timeRange}
                        />
                    )}
                </motion.div>

                <DataVisualization
                    chartData={chartData}
                    metrics={filteredMetrics}
                    viewMode={analyticsState.activeView}
                />

                <ExportControls
                    onExport={exportData}
                    metrics={filteredMetrics}
                    timeRange={analyticsState.timeRange}
                />
            </main>

            {/* Analytics Footer */}
            <AnalyticsFooter
                onNavigate={(page) => console.log('Navigate to:', page)}
                currentView={analyticsState.activeView}
                lastUpdated={new Date().toISOString()}
                totalMetrics={filteredMetrics.length}
                activeUsers={1247}
            />

            {/* Real-time status indicator */}
            {analyticsState.realTimeEnabled && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                            <div>
                                <span className="text-green-800 dark:text-green-200 text-sm font-medium block">
                                    Real-time Analytics Active
                                </span>
                                <span className="text-green-600 dark:text-green-400 text-xs">
                                    Updates every {analyticsState.refreshInterval / 1000}s
                                </span>
                            </div>
                            <button
                                onClick={() => setAnalyticsState(prev => ({ ...prev, realTimeEnabled: false }))}
                                className="ml-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Loading overlay */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center space-x-4">
                            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                            <span className="text-gray-900 dark:text-white font-medium">
                                Updating analytics data...
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

