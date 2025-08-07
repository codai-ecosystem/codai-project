import React from 'react'
/**
 * Advanced Analytics Dashboard Page - Enhanced ControlAI Analytics Center
 * Real-time analytics and comprehensive reporting with ML-powered insights
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  // Core Analytics Icons
  BarChart3, TrendingUp, TrendingDown, Users, FolderKanban, Activity, Award,
  Target, CheckCircle2, Clock, AlertCircle, Settings, RefreshCw, Download,
  Filter, Calendar, Search, Eye, ExternalLink, Info, BookOpen, Database,

  // Chart & Visualization Icons
  PieChart, LineChart, AreaChart, ScatterChart, Radar, Gauge, Monitor,
  FileText, Grid, List, Table, Columns, Layout, Maximize2, Minimize2,

  // Data & Analysis Icons
  Brain, Cpu, Zap, Lightbulb, Star, Flame, Shield, Rocket, Globe,

  // Action & Control Icons
  Play, Pause, SkipForward, SkipBack, Plus, Minus, Edit3, Save,
  Share, Copy, Link, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,

  // Status & State Icons
  Circle, Square, Triangle, Hexagon, Layers, Package, Server,
  Wifi, WifiOff, Signal, Bluetooth, CloudLightning
} from 'lucide-react'

// Enhanced Types
interface AnalyticsState {
  activeView: 'overview' | 'trends' | 'performance' | 'predictive' | 'reports' | 'realtime' | 'insights'
  timeRange: TimeRange
  selectedMetrics: string[]
  filters: AnalyticsFilters
  realTimeEnabled: boolean
  autoRefresh: boolean
  refreshInterval: number
  viewMode: 'grid' | 'list' | 'detailed'
  darkMode: boolean
  comparisonMode: boolean
  exportFormat: 'csv' | 'json' | 'pdf'
}

interface TimeRange {
  start: string
  end: string
  label: string
  granularity: 'hour' | 'day' | 'week' | 'month'
}

interface AnalyticsFilters {
  projects: string[]
  agents: string[]
  priorities: string[]
  statuses: string[]
  tags: string[]
}

interface AnalyticsMetric {
  id: string
  label: string
  icon: any
  category: 'performance' | 'efficiency' | 'quality' | 'predictive'
  value: number | string
  trend?: { value: number; positive: boolean; period: string }
  description: string
  unit?: string
}

interface ChartData {
  projectTrends: any[]
  agentPerformance: any[]
  resourceUtilization: any[]
  taskDistribution: any[]
  predictiveAnalysis: any[]
  qualityMetrics: any[]
  riskAssessment: any[]
  efficiencyTrends: any[]
}

// Enhanced Time Ranges
const timeRanges: TimeRange[] = [
  { start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString(), label: 'Last 24 hours', granularity: 'hour' },
  { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString(), label: 'Last 7 days', granularity: 'day' },
  { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString(), label: 'Last 30 days', granularity: 'day' },
  { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString(), label: 'Last 3 months', granularity: 'week' },
  { start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString(), label: 'Last year', granularity: 'month' }
]

// Analytics Metrics Configuration
const analyticsMetrics: AnalyticsMetric[] = [
  {
    id: 'project_velocity',
    label: 'Project Velocity',
    icon: Rocket,
    category: 'performance',
    value: '12.5',
    unit: 'projects/week',
    trend: { value: 15.3, positive: true, period: 'this month' },
    description: 'Average project completion rate'
  },
  {
    id: 'agent_efficiency',
    label: 'Agent Efficiency',
    icon: Brain,
    category: 'efficiency',
    value: '94.2',
    unit: '%',
    trend: { value: 3.7, positive: true, period: 'this week' },
    description: 'Overall agent task completion efficiency'
  },
  {
    id: 'quality_score',
    label: 'Quality Score',
    icon: Award,
    category: 'quality',
    value: '4.8',
    unit: '/5.0',
    trend: { value: 2.1, positive: true, period: 'this quarter' },
    description: 'Average project quality rating'
  },
  {
    id: 'prediction_accuracy',
    label: 'Prediction Accuracy',
    icon: Target,
    category: 'predictive',
    value: '87.3',
    unit: '%',
    trend: { value: 5.2, positive: true, period: 'this month' },
    description: 'ML model prediction accuracy'
  },
  {
    id: 'resource_optimization',
    label: 'Resource Optimization',
    icon: Cpu,
    category: 'efficiency',
    value: '91.7',
    unit: '%',
    trend: { value: 8.4, positive: true, period: 'this week' },
    description: 'Resource utilization efficiency'
  },
  {
    id: 'risk_mitigation',
    label: 'Risk Mitigation',
    icon: Shield,
    category: 'quality',
    value: '96.1',
    unit: '%',
    trend: { value: 1.9, positive: true, period: 'this month' },
    description: 'Successful risk identification and prevention'
  }
]

// Mock hooks (these would be real implementations)
const useDashboard = () => ({
  data: {}, loading: false, error: null, refresh: () => { }
})

const useAnalytics = () => ({
  analytics: {
    summary: {
      totalProjects: 156,
      activeProjects: 42,
      completedProjects: 98,
      averageCompletion: 87.3,
      activeAgents: 23,
      resourceUtilization: 78.5,
      performanceScore: 94.2
    },
    chartData: {
      projectTrends: [],
      agentPerformance: [],
      resourceUtilization: [],
      taskDistribution: [],
      predictiveAnalysis: [],
      qualityMetrics: [],
      riskAssessment: [],
      efficiencyTrends: []
    } as ChartData
  },
  loading: false,
  error: null,
  refresh: () => { }
})

export default function AnalyticsPage() {
  // Enhanced state management
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    activeView: 'overview',
    timeRange: timeRanges[2], // Default to last 30 days
    selectedMetrics: analyticsMetrics.map(m => m.id),
    filters: {
      projects: [],
      agents: [],
      priorities: [],
      statuses: [],
      tags: []
    },
    realTimeEnabled: false,
    autoRefresh: true,
    refreshInterval: 30000,
    viewMode: 'grid',
    darkMode: false,
    comparisonMode: false,
    exportFormat: 'json'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Data hooks with enhanced error handling and loading states
  const { analytics, loading, error, refresh } = useAnalytics()

  // Computed analytics insights
  const analyticsInsights = useMemo(() => {
    if (!analytics) return null

    const insights = {
      totalValue: analyticsMetrics.reduce((sum, m) => {
        const value = typeof m.value === 'string' ? parseFloat(m.value) : m.value
        return sum + (isNaN(value) ? 0 : value)
      }, 0),
      averageEfficiency: analyticsMetrics
        .filter(m => m.category === 'efficiency')
        .reduce((sum, m, _, arr) => {
          const value = typeof m.value === 'string' ? parseFloat(m.value) : m.value
          return sum + (isNaN(value) ? 0 : value) / arr.length
        }, 0),
      trendingUp: analyticsMetrics.filter(m => m.trend?.positive).length,
      criticalMetrics: analyticsMetrics.filter(m => {
        const value = typeof m.value === 'string' ? parseFloat(m.value) : m.value
        return m.category === 'quality' && value > 90
      }).length
    }

    return insights
  }, [analytics])

  // Enhanced effects
  useEffect(() => {
    // Initialize dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)

    setAnalyticsState(prev => ({ ...prev, darkMode: isDark }))

    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    // Set up auto-refresh when enabled
    if (analyticsState.autoRefresh && analyticsState.refreshInterval > 0) {
      const interval = setInterval(refresh, analyticsState.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [analyticsState.autoRefresh, analyticsState.refreshInterval, refresh])

  // Enhanced handlers
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !analyticsState.darkMode
    setAnalyticsState(prev => ({ ...prev, darkMode: newDarkMode }))
    localStorage.setItem('darkMode', newDarkMode.toString())

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [analyticsState.darkMode])

  const handleViewChange = useCallback((view: AnalyticsState['activeView']) => {
    setAnalyticsState(prev => ({ ...prev, activeView: view }))
  }, [])

  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setAnalyticsState(prev => ({ ...prev, timeRange }))
  }, [])

  const handleMetricToggle = useCallback((metricId: string) => {
    setAnalyticsState(prev => ({
      ...prev,
      selectedMetrics: prev.selectedMetrics.includes(metricId)
        ? prev.selectedMetrics.filter(m => m !== metricId)
        : [...prev.selectedMetrics, metricId]
    }))
  }, [])

  const toggleRealTime = useCallback(() => {
    setAnalyticsState(prev => ({ ...prev, realTimeEnabled: !prev.realTimeEnabled }))
  }, [])

  const handleExport = useCallback((format: 'csv' | 'json' | 'pdf') => {
    if (!analytics) return

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `controlai-analytics-${timestamp}`

    // Export logic would be implemented here
    console.log(`Exporting analytics as ${format}:`, filename)

    // Mock download trigger
    const dataStr = JSON.stringify(analytics, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${filename}.${format}`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [analytics])

  // Enhanced navigation items with new views
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Comprehensive analytics overview' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, description: 'Historical trends and patterns' },
    { id: 'performance', label: 'Performance', icon: Activity, description: 'Agent and project performance' },
    { id: 'predictive', label: 'Predictive', icon: Brain, description: 'ML-powered predictions and forecasts' },
    { id: 'realtime', label: 'Real-time', icon: Zap, description: 'Live data and monitoring' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, description: 'AI-generated insights and recommendations' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Detailed reports and exports' }
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Header with gradient and comprehensive analytics info */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="p-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl mr-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Advanced Analytics Center
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {analyticsInsights && (
                    <>
                      {analyticsInsights.criticalMetrics} high-performance metrics •
                      {analyticsInsights.trendingUp} trending up •
                      {analyticsInsights.averageEfficiency.toFixed(1)}% avg efficiency
                    </>
                  )}
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-3">
              {/* Real-time indicator */}
              {analyticsState.realTimeEnabled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center text-green-600 dark:text-green-400 text-sm mr-4"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Live Analytics
                </motion.div>
              )}

              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['grid', 'list', 'detailed'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAnalyticsState(prev => ({ ...prev, viewMode: mode }))}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${analyticsState.viewMode === mode
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {mode === 'grid' && <Grid className="w-3 h-3" />}
                    {mode === 'list' && <List className="w-3 h-3" />}
                    {mode === 'detailed' && <Table className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${showFilters
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>

              {/* Real-time toggle */}
              <button
                onClick={toggleRealTime}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${analyticsState.realTimeEnabled
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Real-time
              </button>

              {/* Export */}
              <div className="relative">
                <button
                  onClick={() => handleExport(analyticsState.exportFormat)}
                  className="flex items-center px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Settings */}
              <button className="flex items-center px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Time Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Time Range
                  </label>
                  <select
                    value={timeRanges.findIndex(tr => tr.label === analyticsState.timeRange.label)}
                    onChange={(e) => handleTimeRangeChange(timeRanges[parseInt(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timeRanges.map((range, index) => (
                      <option key={index} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metrics Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Metrics Categories
                  </label>
                  <div className="space-y-2">
                    {['performance', 'efficiency', 'quality', 'predictive'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={analyticsMetrics.filter(m => m.category === category).every(m =>
                            analyticsState.selectedMetrics.includes(m.id)
                          )}
                          onChange={() => {
                            const categoryMetrics = analyticsMetrics.filter(m => m.category === category).map(m => m.id)
                            const allSelected = categoryMetrics.every(id => analyticsState.selectedMetrics.includes(id))

                            setAnalyticsState(prev => ({
                              ...prev,
                              selectedMetrics: allSelected
                                ? prev.selectedMetrics.filter(id => !categoryMetrics.includes(id))
                                : [...prev.selectedMetrics, ...categoryMetrics.filter(id => !prev.selectedMetrics.includes(id))]
                            }))
                          }}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Export Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    {(['csv', 'json', 'pdf'] as const).map((format) => (
                      <label key={format} className="flex items-center">
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format}
                          checked={analyticsState.exportFormat === format}
                          onChange={() => setAnalyticsState(prev => ({ ...prev, exportFormat: format }))}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">
                          {format}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Advanced Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={analyticsState.comparisonMode}
                        onChange={(e) => setAnalyticsState(prev => ({ ...prev, comparisonMode: e.target.checked }))}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Comparison Mode
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={analyticsState.autoRefresh}
                        onChange={(e) => setAnalyticsState(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Auto Refresh
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Stats Overview with detailed metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {analyticsMetrics
            .filter(metric => analyticsState.selectedMetrics.includes(metric.id))
            .map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <StatsCard
                  title={metric.label}
                  value={`${metric.value}${metric.unit || ''}`}
                  subtitle={metric.description}
                  icon={metric.icon}
                  color={
                    metric.category === 'performance' ? 'blue' :
                      metric.category === 'efficiency' ? 'green' :
                        metric.category === 'quality' ? 'purple' :
                          'orange'
                  }
                  loading={loading}
                  trend={metric.trend}
                  actions={
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3 h-3" />
                    </button>
                  }
                />
              </motion.div>
            ))}
        </div>
      </div>

      {/* Enhanced Navigation with descriptive cards */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map(({ id, label, icon: Icon, description }) => (
              <motion.button
                key={id}
                onClick={() => handleViewChange(id as AnalyticsState['activeView'])}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${analyticsState.activeView === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                title={description}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with enhanced animations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={analyticsState.activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveView()}
        </motion.div>
      </main>

      {/* Real-time status indicator */}
      {analyticsState.realTimeEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-xl">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                Real-time analytics active
              </span>
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

      {/* Footer with comprehensive analytics info */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 sm:mb-0">
              <button className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <BookOpen className="w-4 h-4 mr-2" />
                Analytics Guide
              </button>
              <button className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Database className="w-4 h-4 mr-2" />
                Data Sources
              </button>
              <button className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Globe className="w-4 h-4 mr-2" />
                API Status
              </button>
            </div>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Analytics updated: {new Date().toLocaleTimeString()}</span>
              {analyticsState.realTimeEnabled && (
                <span className="ml-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  Live data streaming
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Enhanced Component Functions
function renderActiveView() {
  // This function would contain the view rendering logic
  // For now, returning a placeholder
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Analytics View Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced analytics visualization will be implemented here.
        </p>
      </div>
    </div>
  )
}

// Enhanced Button Component with variants and animations
function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm',
    outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  )
}

// Enhanced Card Component with hover effects and animations
function Card({
  children,
  className = '',
  onClick,
  hover = false,
  gradient = false,
  ...props
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  gradient?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={`
        ${gradient
          ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900'
          : 'bg-white dark:bg-gray-800'
        }
        rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm
        ${onClick ? 'cursor-pointer' : ''}
        ${hover || onClick ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover || onClick ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Enhanced Stats Card Component with trend indicators and animations
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
  onClick,
  subtitle,
  actions
}: {
  title: string
  value: string | number
  icon: any
  trend?: { value: number; positive: boolean; period?: string }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'indigo'
  loading?: boolean
  onClick?: () => void
  subtitle?: string
  actions?: React.ReactNode
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
  }

  return (
    <Card
      className="p-6 group"
      onClick={onClick}
      hover={!!onClick}
      gradient
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            {actions && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {actions}
              </div>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ) : (
            <>
              <motion.p
                className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {value}
              </motion.p>

              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {subtitle}
                </p>
              )}

              {trend && (
                <motion.div
                  className={`flex items-center text-xs ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {trend.positive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trend.positive ? '+' : ''}{trend.value}%
                  {trend.period && <span className="ml-1">{trend.period}</span>}
                </motion.div>
              )}
            </>
          )}
        </div>

        <motion.div
          className={`p-3 rounded-xl ${colorClasses[color]} flex-shrink-0`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </Card>
  )
}

