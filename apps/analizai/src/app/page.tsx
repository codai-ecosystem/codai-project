'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Zap,
  AlertTriangle,
  Brain,
  Database,
  Activity,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react'
import AnalizaiService, { AnalyticsMetric, AIInsight, DataSource, AnalyticsChart } from '../services/analizaiService'

// Color palette for charts
const CHART_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#8b5a2b', '#6366f1', '#ec4899',
  '#14b8a6', '#f97316'
]

// Utility function to format numbers
const formatValue = (value: number, format: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 0
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'duration':
      return `${value}ms`
    case 'number':
    default:
      return new Intl.NumberFormat('ro-RO').format(value)
  }
}

// Get icon component by name
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    TrendingUp, TrendingDown, Users, Target, Zap, AlertTriangle,
    Brain, Database, Activity, DollarSign, Eye, Clock
  }
  return icons[iconName] || Activity
}

// Metric Card Component
const MetricCard: React.FC<{ metric: AnalyticsMetric }> = ({ metric }) => {
  const IconComponent = getIconComponent(metric.icon)
  const isPositive = metric.changeType === 'increase'
  const changeColor = metric.changeType === 'increase' ? 'text-green-600' :
    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
  const bgColor = `bg-${metric.color}-50`
  const iconColor = `text-${metric.color}-600`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgColor} rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(metric.value, metric.format)}
          </p>
          <div className={`flex items-center mt-2 ${changeColor}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span className="text-sm font-medium">
              {Math.abs(metric.change)}% vs last period
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${iconColor} bg-white`}>
          <IconComponent className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}

// Chart Component
const ChartComponent: React.FC<{ chart: AnalyticsChart }> = ({ chart }) => {
  const renderChart = () => {
    const commonProps = {
      data: chart.data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (chart.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[0], r: 4 }}
              activeDot={{ r: 6, stroke: CHART_COLORS[0] }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS[1]}
              strokeWidth={2}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chart.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ label, value }) => `${label}: ${value}`}
            >
              {chart.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )

      default:
        return <div className="text-center text-gray-500">Chart type not supported</div>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{chart.title}</h3>
        {chart.description && (
          <p className="text-sm text-gray-600 mb-3">{chart.description}</p>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {chart.insights && chart.insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Brain className="h-4 w-4 mr-1 text-purple-600" />
            Key Insights
          </h4>
          <ul className="space-y-1">
            {chart.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

// AI Insight Card Component
const InsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'trend': return <TrendingUp className="h-5 w-5" />
      case 'anomaly': return <AlertTriangle className="h-5 w-5" />
      case 'prediction': return <Brain className="h-5 w-5" />
      case 'alert': return <XCircle className="h-5 w-5" />
      default: return <CheckCircle className="h-5 w-5" />
    }
  }

  const getInsightColor = () => {
    switch (insight.impact) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  const getTypeColor = () => {
    switch (insight.type) {
      case 'alert': return 'text-red-600'
      case 'anomaly': return 'text-orange-600'
      case 'prediction': return 'text-purple-600'
      case 'trend': return 'text-green-600'
      default: return 'text-blue-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${getInsightColor()} rounded-xl p-4 border shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`${getTypeColor()} flex items-center`}>
          {getInsightIcon()}
          <span className="ml-2 text-sm font-medium capitalize">{insight.type}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          {new Date(insight.timestamp).toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
        <span className={`px-2 py-1 rounded-full ${insight.impact === 'high' ? 'bg-red-100 text-red-700' :
            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
          }`}>
          {insight.impact.toUpperCase()} impact
        </span>
      </div>

      {insight.actionSuggestions && insight.actionSuggestions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-900 mb-2">Suggested Actions:</h5>
          <ul className="space-y-1">
            {insight.actionSuggestions.map((action, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start">
                <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

// Data Source Status Component
const DataSourceStatus: React.FC<{ dataSource: DataSource }> = ({ dataSource }) => {
  const getStatusColor = () => {
    switch (dataSource.status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'syncing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = () => {
    switch (dataSource.status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{dataSource.name}</h4>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-1 capitalize">{dataSource.status}</span>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium capitalize">{dataSource.type}</span>
        </div>
        <div className="flex justify-between">
          <span>Records:</span>
          <span className="font-medium">{dataSource.recordCount.toLocaleString('ro-RO')}</span>
        </div>
        <div className="flex justify-between">
          <span>Quality:</span>
          <span className="font-medium">{(dataSource.dataQuality * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Last Sync:</span>
          <span className="font-medium">
            {new Date(dataSource.lastSync).toLocaleString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function AnalizaiDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [charts, setCharts] = useState<AnalyticsChart[]>([])
  const [realTimeData, setRealTimeData] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  const analizaiService = useMemo(() => AnalizaiService.getInstance(), [])

  useEffect(() => {
    const loadDashboardData = async () => {
      const [metricsData, insightsData, dataSourcesData] = await Promise.all([
        analizaiService.getMetrics(),
        analizaiService.getInsights(),
        analizaiService.getDataSources()
      ])
      setMetrics(metricsData)
      setInsights(insightsData.slice(0, 5)) // Show top 5 insights
      setDataSources(dataSourcesData)
      setIsLoading(false)
    }

    const loadRealTimeData = async () => {
      const realTimeMetrics = await analizaiService.getRealTimeMetrics()
      setRealTimeData(realTimeMetrics)
    }

    loadDashboardData()

    // Set up real-time updates
    const interval = setInterval(loadRealTimeData, 5000)

    return () => clearInterval(interval)
  }, [analizaiService])

  const handleRefresh = async () => {
    setIsLoading(true)
    const [metricsData, insightsData, dataSourcesData] = await Promise.all([
      analizaiService.getMetrics(),
      analizaiService.getInsights(),
      analizaiService.getDataSources()
    ])
    setMetrics(metricsData)
    setInsights(insightsData.slice(0, 5))
    setDataSources(dataSourcesData)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AnalizAI Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AnalizAI Dashboard
              </h1>
              <p className="text-gray-600">
                Advanced Analytics & Business Intelligence Platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Real-time Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Real-time Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(realTimeData).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {typeof value === 'number' ?
                    (key.includes('Rate') ? `${value.toFixed(2)}%` :
                      key.includes('Time') ? `${Math.round(value)}ms` :
                        value.toLocaleString('ro-RO')) :
                    value
                  }
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Charts</h2>
              <div className="space-y-6">
                {charts.map((chart, index) => (
                  <ChartComponent key={chart.id} chart={chart} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Insights */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Insights
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {insights.slice(0, 5).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Data Sources
              </h2>
              <div className="space-y-4">
                {dataSources.map((source) => (
                  <DataSourceStatus key={source.id} dataSource={source} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}