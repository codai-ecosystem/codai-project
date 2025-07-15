'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Brain,
  Clock,
  Target,
  Zap,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  Star,
  MessageSquare,
  Share2,
  Search,
  Database,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface AnalyticsDashboardProps {
  className?: string
  dateRange?: {
    start: Date
    end: Date
  }
  onDateRangeChange?: (range: { start: Date; end: Date }) => void
  onExport?: (type: 'pdf' | 'csv' | 'json') => void
}

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
  description?: string
}

interface ChartData {
  label: string
  value: number
  category?: string
}

export function AnalyticsDashboard({
  className,
  dateRange,
  onDateRangeChange,
  onExport
}: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('7d')
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>(['all'])
  const [isLoading, setIsLoading] = React.useState(false)

  // Mock data - in real app, this would come from API
  const metricCards: MetricCard[] = [
    {
      id: 'total-memories',
      title: 'Total Memories',
      value: '2,847',
      change: 12.5,
      changeType: 'increase',
      icon: <Brain className="w-5 h-5" />,
      color: 'blue',
      description: 'All memories stored in the system'
    },
    {
      id: 'active-users',
      title: 'Active Users',
      value: '1,234',
      change: 8.2,
      changeType: 'increase',
      icon: <Users className="w-5 h-5" />,
      color: 'green',
      description: 'Users who accessed memories this period'
    },
    {
      id: 'search-queries',
      title: 'Search Queries',
      value: '15,632',
      change: -3.1,
      changeType: 'decrease',
      icon: <Search className="w-5 h-5" />,
      color: 'purple',
      description: 'Total search operations performed'
    },
    {
      id: 'avg-response-time',
      title: 'Avg Response Time',
      value: '247ms',
      change: -15.8,
      changeType: 'increase',
      icon: <Zap className="w-5 h-5" />,
      color: 'orange',
      description: 'Average system response time'
    },
    {
      id: 'memory-accuracy',
      title: 'Memory Accuracy',
      value: '94.7%',
      change: 2.3,
      changeType: 'increase',
      icon: <Target className="w-5 h-5" />,
      color: 'emerald',
      description: 'Accuracy of memory retrieval'
    },
    {
      id: 'storage-used',
      title: 'Storage Used',
      value: '847GB',
      change: 18.9,
      changeType: 'increase',
      icon: <Database className="w-5 h-5" />,
      color: 'red',
      description: 'Total storage space utilized'
    }
  ]

  const memoryTypesData: ChartData[] = [
    { label: 'Personal Notes', value: 1247, category: 'personal' },
    { label: 'Documents', value: 892, category: 'document' },
    { label: 'Images', value: 543, category: 'image' },
    { label: 'Tasks', value: 165, category: 'task' }
  ]

  const usageTrendsData: ChartData[] = [
    { label: 'Mon', value: 245 },
    { label: 'Tue', value: 312 },
    { label: 'Wed', value: 278 },
    { label: 'Thu', value: 389 },
    { label: 'Fri', value: 456 },
    { label: 'Sat', value: 234 },
    { label: 'Sun', value: 198 }
  ]

  const topSearchTerms = [
    { term: 'project planning', count: 234, change: 12 },
    { term: 'meeting notes', count: 189, change: -5 },
    { term: 'code snippets', count: 156, change: 23 },
    { term: 'travel itinerary', count: 134, change: 8 },
    { term: 'recipes', count: 98, change: -12 }
  ]

  const systemHealth = [
    { metric: 'API Uptime', value: '99.97%', status: 'excellent', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    { metric: 'Database Health', value: 'Optimal', status: 'good', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    { metric: 'Memory Sync', value: 'Active', status: 'good', icon: <Activity className="w-4 h-4 text-blue-500" /> },
    { metric: 'Security Status', value: 'Secure', status: 'excellent', icon: <Shield className="w-4 h-4 text-green-500" /> },
    { metric: 'Backup Status', value: 'Recent', status: 'warning', icon: <AlertCircle className="w-4 h-4 text-yellow-500" /> }
  ]

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const formatChange = (change: number, changeType: string) => {
    const isPositive = changeType === 'increase' ? change > 0 : change < 0
    const icon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
    const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

    return (
      <div className={cn('flex items-center space-x-1', colorClass)}>
        {icon}
        <span className="text-sm font-medium">{Math.abs(change)}%</span>
      </div>
    )
  }

  return (
    <div className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor system performance and user engagement
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="time-range-selector"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            data-testid="refresh-analytics"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </motion.button>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExport?.('pdf')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="export-analytics"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            data-testid={`metric-card-${metric.id}`}
          >
            <div className="flex items-center justify-between">
              <div className={cn('p-3 rounded-lg', getColorClasses(metric.color))}>
                {metric.icon}
              </div>
              {formatChange(metric.change, metric.changeType)}
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
              {metric.description && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {metric.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Types Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Memory Types Distribution
          </h3>

          <div className="space-y-3">
            {memoryTypesData.map((item, index) => {
              const percentage = (item.value / memoryTypesData.reduce((sum, d) => sum + d.value, 0)) * 100
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Usage Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Usage Trends (This Week)
          </h3>

          <div className="flex items-end justify-between h-32 space-x-2">
            {usageTrendsData.map((item, index) => {
              const maxValue = Math.max(...usageTrendsData.map(d => d.value))
              const height = (item.value / maxValue) * 100

              return (
                <div key={item.label} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-full bg-green-500 dark:bg-green-400 rounded-t-md min-h-[4px]"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Search Terms */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Top Search Terms
          </h3>

          <div className="space-y-3">
            {topSearchTerms.map((term, index) => (
              <motion.div
                key={term.term}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {term.term}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {term.count}
                  </span>
                  <div className={cn(
                    'flex items-center text-xs',
                    term.change >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}>
                    {term.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(term.change)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            System Health
          </h3>

          <div className="space-y-4">
            {systemHealth.map((health, index) => (
              <motion.div
                key={health.metric}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {health.icon}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {health.metric}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {health.value}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
              <span className="text-gray-900 dark:text-gray-100">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
