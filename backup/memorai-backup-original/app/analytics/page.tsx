'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import MemoryAnalyticsDashboard from '../../components/analytics/MemoryAnalyticsDashboard'
import { MemoryPerformanceChart } from '../../components/dashboard/DashboardComponents'
import MemorAIService from '../../services/memoraiService'
import {
  BarChart3,
  TrendingUp,
  Brain,
  Clock,
  Zap,
  Target,
  Eye,
  Search,
  Network,
  Database,
  Activity,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  FileText,
  Code,
  GitBranch,
  PieChart,
  LineChart,
  BarChart,
  Map
} from 'lucide-react'

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
  memoryTypes: {
    type: string
    count: number
    percentage: number
    growth: number
    averageImportance: number
  }[]
  timelineData: {
    date: string
    created: number
    accessed: number
    connected: number
    insights: number
  }[]
  searchAnalytics: {
    totalQueries: number
    averageResultCount: number
    topQueries: { query: string; count: number }[]
    searchSuccess: number
  }
  connectionPatterns: {
    strongestConnections: { source: string; target: string; strength: number }[]
    clusterAnalysis: { cluster: string; nodes: number; density: number }[]
    bridgeNodes: { node: string; bridgeStrength: number }[]
  }
  insights: {
    trend: string
    description: string
    impact: 'high' | 'medium' | 'low'
    recommendation: string
    confidence: number
  }[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedTab, setSelectedTab] = useState<'overview' | 'dashboard' | 'memories' | 'connections' | 'search' | 'insights'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const memoraiService = MemorAIService.getInstance()

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'memories', label: 'Memories', icon: Brain },
    { id: 'connections', label: 'Connections', icon: Network },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeRange])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const data = await memoraiService.getDetailedAnalytics({
        timeRange: selectedTimeRange,
        includeInsights: true
      })
      setAnalyticsData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    const sign = num > 0 ? '+' : ''
    return `${sign}${num.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-400" />
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-slate-400" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-400'
    if (value < 0) return 'text-red-400'
    return 'text-slate-400'
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-emerald-400'
      default: return 'text-slate-400'
    }
  }

  if (isLoading || !analyticsData) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="flex items-center space-x-3 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-lg font-medium">Analyzing Memory Patterns...</span>
          </motion.div>
        </div>
      </MemorAILayout>
    )
  }

  return (
    <MemorAILayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Memory Analytics 📊
            </h1>
            <p className="text-slate-300">
              Insights and patterns from your knowledge repository
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="relative">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-8"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value} className="bg-slate-800">
                    {range.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={loadAnalytics}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${selectedTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Content based on selected tab */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {selectedTab === 'dashboard' && (
            <MemoryAnalyticsDashboard />
          )}

          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    {getTrendIcon(analyticsData.overview.memoryGrowth)}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analyticsData.overview.totalMemories)}
                  </div>
                  <div className="text-slate-400 text-sm mb-2">Total Memories</div>
                  <div className={`text-sm ${getTrendColor(analyticsData.overview.memoryGrowth)}`}>
                    {formatPercentage(analyticsData.overview.memoryGrowth)} vs last period
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    {getTrendIcon(analyticsData.overview.connectionGrowth)}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analyticsData.overview.totalConnections)}
                  </div>
                  <div className="text-slate-400 text-sm mb-2">Connections</div>
                  <div className={`text-sm ${getTrendColor(analyticsData.overview.connectionGrowth)}`}>
                    {formatPercentage(analyticsData.overview.connectionGrowth)} vs last period
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    {getTrendIcon(analyticsData.overview.accessFrequency)}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analyticsData.overview.searchQueries)}
                  </div>
                  <div className="text-slate-400 text-sm mb-2">Search Queries</div>
                  <div className={`text-sm ${getTrendColor(analyticsData.overview.accessFrequency)}`}>
                    {formatPercentage(analyticsData.overview.accessFrequency)} vs last period
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    {getTrendIcon(analyticsData.overview.insightGeneration)}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analyticsData.overview.insightGeneration)}
                  </div>
                  <div className="text-slate-400 text-sm mb-2">AI Insights</div>
                  <div className={`text-sm ${getTrendColor(analyticsData.overview.insightGeneration)}`}>
                    {formatPercentage(analyticsData.overview.insightGeneration)} generated
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <MemoryPerformanceChart />

              {/* Quick Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4">Memory Distribution</h3>
                  <div className="space-y-3">
                    {analyticsData.memoryTypes.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-400' :
                            index === 1 ? 'bg-blue-400' :
                              index === 2 ? 'bg-emerald-400' :
                                index === 3 ? 'bg-yellow-400' :
                                  'bg-red-400'
                            }`} />
                          <span className="text-slate-300 capitalize">{type.type}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-white font-medium">{type.count}</span>
                          <span className="text-slate-400 text-sm">{type.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4">Top Search Queries</h3>
                  <div className="space-y-3">
                    {analyticsData.searchAnalytics.topQueries.slice(0, 5).map((query, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-300 truncate flex-1 mr-4">{query.query}</span>
                        <span className="text-white font-medium">{query.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'memories' && (
            <div className="space-y-6">
              {/* Memory Type Analysis */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-lg mb-6">Memory Type Analysis</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData.memoryTypes.map((type, index) => (
                    <div key={type.type} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium capitalize">{type.type}</h4>
                        <span className={`text-sm ${getTrendColor(type.growth)}`}>
                          {formatPercentage(type.growth)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Count</span>
                          <span className="text-white">{type.count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Percentage</span>
                          <span className="text-white">{type.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Avg Importance</span>
                          <span className="text-white">{(type.averageImportance * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            index === 1 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              index === 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                index === 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Timeline */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-lg mb-6">Memory Creation Timeline</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.timelineData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                      <div className="w-full flex flex-col space-y-1">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t"
                          style={{ height: `${(data.created / Math.max(...analyticsData.timelineData.map(d => d.created))) * 200}px` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 text-center">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'connections' && (
            <div className="space-y-6">
              {/* Connection Patterns */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4">Strongest Connections</h3>
                  <div className="space-y-3">
                    {analyticsData.connectionPatterns.strongestConnections.slice(0, 5).map((connection, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <GitBranch className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-slate-300 truncate text-sm">
                            {connection.source} ↔ {connection.target}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${connection.strength * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-medium">
                            {Math.round(connection.strength * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4">Cluster Analysis</h3>
                  <div className="space-y-3">
                    {analyticsData.connectionPatterns.clusterAnalysis.slice(0, 5).map((cluster, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">{cluster.cluster}</span>
                          <span className="text-white text-sm">{cluster.nodes} nodes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm">Density:</span>
                          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${cluster.density * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{Math.round(cluster.density * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bridge Nodes */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-lg mb-4">Bridge Nodes</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Memories that connect different knowledge clusters
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.connectionPatterns.bridgeNodes.map((bridge, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{bridge.node}</span>
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-sm">Bridge Strength:</span>
                        <span className="text-emerald-400 font-medium">
                          {Math.round(bridge.bridgeStrength * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'search' && (
            <div className="space-y-6">
              {/* Search Metrics */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(analyticsData.searchAnalytics.totalQueries)}
                  </div>
                  <div className="text-slate-400 text-sm">Total Queries</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {analyticsData.searchAnalytics.averageResultCount.toFixed(1)}
                  </div>
                  <div className="text-slate-400 text-sm">Avg Results</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {Math.round(analyticsData.searchAnalytics.searchSuccess)}%
                  </div>
                  <div className="text-slate-400 text-sm">Success Rate</div>
                </div>
              </div>

              {/* Top Queries */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold text-lg mb-6">Most Popular Queries</h3>
                <div className="space-y-4">
                  {analyticsData.searchAnalytics.topQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-slate-300">{query.query}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{
                              width: `${(query.count / Math.max(...analyticsData.searchAnalytics.topQueries.map(q => q.count))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-white font-medium w-12 text-right">{query.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'insights' && (
            <div className="space-y-6">
              {/* AI Generated Insights */}
              <div className="space-y-4">
                {analyticsData.insights.map((insight, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${insight.impact === 'high' ? 'bg-red-400' :
                          insight.impact === 'medium' ? 'bg-yellow-400' :
                            'bg-emerald-400'
                          }`} />
                        <span className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-sm">Confidence:</span>
                        <span className="text-white text-sm font-medium">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <h4 className="text-white font-semibold text-lg mb-3">{insight.trend}</h4>
                    <p className="text-slate-300 mb-4">{insight.description}</p>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h5 className="text-purple-400 font-medium mb-2">Recommendation:</h5>
                      <p className="text-slate-300 text-sm">{insight.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="text-center text-slate-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Last updated: {lastUpdated.toLocaleString()}
        </motion.div>
      </div>
    </MemorAILayout>
  )
}
