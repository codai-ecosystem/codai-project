/**
 * Advanced Analytics Dashboard Page
 * Phase 2 Enhancement - Comprehensive Analytics Visualization
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react'

import { useAdvancedAnalytics, useRealTimeAnalytics, useAnalyticsExport } from '../../lib/hooks/useAdvancedAnalytics'
import { useRealTimeAnalytics as useWebSocketAnalytics } from '../../lib/hooks/useWebSocket'
import {
  ProjectTrendsChart,
  AgentPerformanceRadar,
  ResourceUtilizationGauge,
  ProjectTimelineChart,
  RiskAssessmentChart,
  PredictiveAnalyticsChart,
  TaskDistributionChart,
  MetricCard,
  ChartSkeleton
} from '../../components/charts/AdvancedAnalyticsCharts'

// Types
interface TimeRange {
  start: string
  end: string
  label: string
}

interface FilterOptions {
  timeRange: TimeRange
  metrics: string[]
  projects: string[]
  agents: string[]
}

// Time range options
const timeRanges: TimeRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 7 days'
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 30 days'
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 3 months'
  },
  {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last year'
  }
]

// Available metrics
const availableMetrics = [
  { id: 'project_trends', label: 'Project Trends', icon: TrendingUp },
  { id: 'agent_performance', label: 'Agent Performance', icon: Users },
  { id: 'resource_utilization', label: 'Resource Utilization', icon: Activity },
  { id: 'predictive_analysis', label: 'Predictive Analysis', icon: Target }
]

export default function AdvancedAnalyticsPage() {
  // State management
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: timeRanges[1], // Default to last 30 days
    metrics: ['project_trends', 'agent_performance', 'resource_utilization', 'predictive_analysis'],
    projects: [],
    agents: []
  })

  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Hooks
  const workspaceId = 'e:\\GitHub\\codai-project' // This would come from context

  const {
    analytics,
    loading,
    error,
    refresh
  } = useAdvancedAnalytics(workspaceId, {
    metrics: filters.metrics,
    timeRange: filters.timeRange,
    refreshInterval: isRealTimeEnabled ? 5000 : 30000
  })

  const {
    data: realTimeData,
    connect: connectRealTime
  } = useRealTimeAnalytics(workspaceId)

  // WebSocket real-time integration
  const {
    analyticsData: wsAnalyticsData,
    isConnected: wsConnected,
    isSubscribed: wsSubscribed,
    error: wsError
  } = useWebSocketAnalytics(workspaceId)

  const {
    exportToCSV,
    exportToJSON
  } = useAnalyticsExport()

  // Merge WebSocket real-time data with standard analytics
  const displayData = wsAnalyticsData || realTimeData || analytics

  // Effects
  useEffect(() => {
    if (isRealTimeEnabled) {
      const disconnect = connectRealTime()
      return disconnect
    }
  }, [isRealTimeEnabled, connectRealTime])

  // Event handlers
  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setFilters(prev => ({ ...prev, timeRange }))
  }, [])

  const handleMetricToggle = useCallback((metricId: string) => {
    setFilters(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }))
  }, [])

  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (!analytics) return

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `controlai-analytics-${timestamp}`

    if (format === 'csv') {
      exportToCSV(analytics.chartData.projectCompletion, filename)
    } else {
      exportToJSON(analytics, filename)
    }
  }, [analytics, exportToCSV, exportToJSON])

  // Loading state
  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <ChartSkeleton key={i} height={120} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <ChartSkeleton key={i} height={400} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading analytics data</h3>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                  {error?.message || 'Unable to fetch analytics data. Please try again.'}
                </p>
                <button
                  onClick={refresh}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2 inline" />
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Advanced Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive project insights and performance metrics
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Real-time toggle */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isRealTimeEnabled}
                  onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRealTimeEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                  <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRealTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Real-time
                </span>
              </label>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2 inline" />
                Filters
              </button>

              {/* Export menu */}
              <div className="relative">
                <button
                  onClick={() => handleExport('json')}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={refresh}
                disabled={loading}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Range
                </label>
                <select
                  value={timeRanges.findIndex(tr => tr.label === filters.timeRange.label)}
                  onChange={(e) => handleTimeRangeChange(timeRanges[parseInt(e.target.value)])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {timeRanges.map((range, index) => (
                    <option key={index} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metrics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metrics
                </label>
                <div className="space-y-2">
                  {availableMetrics.map((metric) => (
                    <label key={metric.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.metrics.includes(metric.id)}
                        onChange={() => handleMetricToggle(metric.id)}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600"
                      />
                      <metric.icon className="w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {metric.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        {analytics?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Projects"
              value={analytics.summary.totalProjects}
              icon={FolderKanban}
              color="blue"
            />
            <MetricCard
              title="Avg Completion"
              value={analytics.summary.averageCompletion}
              format="percentage"
              icon={CheckCircle2}
              color="green"
              trend={{ value: 5.2, positive: true }}
            />
            <MetricCard
              title="Active Agents"
              value={analytics.summary.activeAgents}
              icon={Users}
              color="purple"
            />
            <MetricCard
              title="Resource Utilization"
              value={analytics.summary.resourceUtilization}
              format="percentage"
              icon={Activity}
              color="orange"
              trend={{ value: 2.1, positive: false }}
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Trends */}
          {filters.metrics.includes('project_trends') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Project Trends
                </h3>
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <ProjectTrendsChart
                data={analytics?.chartData.projectCompletion || []}
                height={300}
              />
            </motion.div>
          )}

          {/* Agent Performance Radar */}
          {filters.metrics.includes('agent_performance') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Agent Performance
                </h3>
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <AgentPerformanceRadar
                data={analytics?.chartData.agentPerformance || []}
                height={300}
              />
            </motion.div>
          )}

          {/* Resource Utilization */}
          {filters.metrics.includes('resource_utilization') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resource Utilization
                </h3>
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex justify-center">
                <ResourceUtilizationGauge
                  utilization={analytics?.summary.resourceUtilization || 0}
                  size={250}
                />
              </div>
            </motion.div>
          )}

          {/* Predictive Analytics */}
          {filters.metrics.includes('predictive_analysis') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Predictive Analysis
                </h3>
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <PredictiveAnalyticsChart
                data={[
                  { date: '2025-08-01', actual: 45, predicted: 47, optimistic: 52, pessimistic: 42 },
                  { date: '2025-08-02', actual: 52, predicted: 54, optimistic: 59, pessimistic: 48 },
                  { date: '2025-08-03', actual: 58, predicted: 61, optimistic: 67, pessimistic: 54 },
                  { date: '2025-08-04', actual: null, predicted: 68, optimistic: 75, pessimistic: 61 },
                  { date: '2025-08-05', actual: null, predicted: 75, optimistic: 83, pessimistic: 68 }
                ]}
                height={300}
              />
            </motion.div>
          )}
        </div>

        {/* Real-time status */}
        {isRealTimeEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                Real-time updates enabled - Data refreshes every 5 seconds
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
