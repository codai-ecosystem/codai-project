import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  Search,
  Brain,
  Clock,
  Users,
  Target,
  Activity,
  Database,
  Zap,
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Hash,
  BookOpen
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AnalyticsData {
  overview: {
    totalMemories: number
    totalConnections: number
    averageImportance: number
    searchQueries: number
    memoryGrowth: number
    connectionGrowth: number
    accessFrequency: number
    insightGeneration: number
  }
  memoryTypes: Array<{
    type: string
    count: number
    percentage: number
    growth: number
    averageImportance: number
  }>
  timelineData: Array<{
    date: string
    created: number
    accessed: number
    connected: number
    insights: number
  }>
  searchAnalytics: {
    totalQueries: number
    averageResultCount: number
    topQueries: Array<{ query: string; count: number }>
    searchSuccess: number
  }
  connectionPatterns: {
    strongestConnections: Array<{
      source: string
      target: string
      strength: number
    }>
    clusterAnalysis: Array<{
      cluster: string
      nodes: number
      density: number
    }>
    bridgeNodes: Array<{
      node: string
      bridgeStrength: number
    }>
  }
  insights: Array<{
    trend: string
    description: string
    impact: 'low' | 'medium' | 'high'
    recommendation: string
    confidence: number
  }>
}

interface AnalyticsDashboardProps {
  timeRange: '7d' | '30d' | '90d' | '1y'
  includeInsights?: boolean
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  timeRange = '30d',
  includeInsights = true
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string>('memories')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange, includeInsights])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/analytics/detailed?timeRange=${timeRange}&includeInsights=${includeInsights}`)
      if (!response.ok) {
        throw new Error('Failed to load analytics data')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
  }

  const exportData = async () => {
    if (!data) return

    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      analytics: data
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `memorai-analytics-${timeRange}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getGrowthColor = (growth: number): string => {
    if (growth > 10) return 'text-emerald-400'
    if (growth > 0) return 'text-blue-400'
    return 'text-red-400'
  }

  const getImpactColor = (impact: 'low' | 'medium' | 'high'): string => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <motion.div
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="ml-3 text-slate-300">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">⚠️ Error Loading Analytics</div>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">
            Insights and metrics for the last {timeRange}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportData}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Memories</p>
              <p className="text-3xl font-bold text-white">{formatNumber(data.overview.totalMemories)}</p>
              <p className={`text-sm ${getGrowthColor(data.overview.memoryGrowth)}`}>
                +{data.overview.memoryGrowth}% growth
              </p>
            </div>
            <Brain className="w-12 h-12 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Connections</p>
              <p className="text-3xl font-bold text-white">{formatNumber(data.overview.totalConnections)}</p>
              <p className={`text-sm ${getGrowthColor(data.overview.connectionGrowth)}`}>
                +{data.overview.connectionGrowth}% growth
              </p>
            </div>
            <Hash className="w-12 h-12 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Search Queries</p>
              <p className="text-3xl font-bold text-white">{formatNumber(data.searchAnalytics.totalQueries)}</p>
              <p className="text-sm text-emerald-400">
                {data.searchAnalytics.searchSuccess}% success rate
              </p>
            </div>
            <Search className="w-12 h-12 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Importance</p>
              <p className="text-3xl font-bold text-white">{(data.overview.averageImportance * 100).toFixed(0)}%</p>
              <p className="text-sm text-yellow-400">
                Quality score
              </p>
            </div>
            <Star className="w-12 h-12 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Memory Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-2 text-purple-400" />
            Memory Types Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.memoryTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, percentage }) => `${type} (${percentage}%)`}
                >
                  {data.memoryTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
            Memory Type Performance
          </h3>
          <div className="space-y-4">
            {data.memoryTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-300 capitalize">{type.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{type.count}</div>
                  <div className={`text-sm ${getGrowthColor(type.growth)}`}>
                    +{type.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Timeline Chart */}
      <motion.div
        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <LineChartIcon className="w-6 h-6 mr-2 text-emerald-400" />
          Activity Timeline
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="Created"
              />
              <Area
                type="monotone"
                dataKey="accessed"
                stackId="1"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.6}
                name="Accessed"
              />
              <Area
                type="monotone"
                dataKey="connected"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Connected"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Search Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Search className="w-6 h-6 mr-2 text-purple-400" />
            Top Search Queries
          </h3>
          <div className="space-y-3">
            {data.searchAnalytics.topQueries.map((query, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300 flex-1 truncate">{query.query}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(query.count / data.searchAnalytics.topQueries[0].count) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-white font-medium w-8 text-right">{query.count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Hash className="w-6 h-6 mr-2 text-blue-400" />
            Connection Clusters
          </h3>
          <div className="space-y-3">
            {data.connectionPatterns.clusterAnalysis.map((cluster, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-300">{cluster.cluster}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{cluster.nodes} nodes</div>
                  <div className="text-slate-400 text-sm">
                    {(cluster.density * 100).toFixed(0)}% density
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights Section */}
      {includeInsights && data.insights.length > 0 && (
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-400" />
            AI Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getImpactColor(insight.impact)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{insight.trend}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/20">
                    {(insight.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm mb-3 opacity-90">{insight.description}</p>
                <div className="text-xs opacity-75">
                  <strong>Recommendation:</strong> {insight.recommendation}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
