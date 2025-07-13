'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Database,
  Brain,
  Zap,
  Activity,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Download,
  Share,
  Filter,
  Calendar,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Layers,
  GitBranch,
  FileText,
  Settings
} from 'lucide-react'
import AnalizAIService from '../services/AnalizAIService'

const analizaiService = new AnalizAIService()

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
  description: string
}

interface ChartData {
  name: string
  value: number
  revenue?: number
  users?: number
  orders?: number
  date?: string
}

export default function AnalizAIDashboard() {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [realtimeData, setRealtimeData] = useState<Record<string, number>>({})
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [pipelines, setPipelines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadRealtimeData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load initial data
      const [metricsData, insightsData, modelsData, pipelinesData] = await Promise.all([
        analizaiService.getAnalyticsMetrics(),
        analizaiService.getAnalyticsInsights(),
        analizaiService.getMLModels(),
        analizaiService.getDataPipelines()
      ])

      // Transform metrics to cards
      const metricCards: MetricCard[] = [
        {
          id: 'revenue',
          title: 'Total Revenue',
          value: '$2.45M',
          change: 125000,
          changePercent: 5.4,
          trend: 'up',
          icon: <DollarSign className="w-6 h-6" />,
          color: 'emerald',
          description: 'Monthly revenue growth'
        },
        {
          id: 'users',
          title: 'Active Users',
          value: '45.6K',
          change: 2340,
          changePercent: 5.4,
          trend: 'up',
          icon: <Users className="w-6 h-6" />,
          color: 'blue',
          description: 'Active user base'
        },
        {
          id: 'processing',
          title: 'Processing Speed',
          value: '1.25 GB/s',
          change: -50,
          changePercent: -3.8,
          trend: 'down',
          icon: <Activity className="w-6 h-6" />,
          color: 'orange',
          description: 'Data processing rate'
        },
        {
          id: 'accuracy',
          title: 'Model Accuracy',
          value: '94.7%',
          change: 0.1,
          changePercent: 0.1,
          trend: 'stable',
          icon: <Target className="w-6 h-6" />,
          color: 'purple',
          description: 'ML model performance'
        }
      ]

      setMetrics(metricCards)
      setInsights(insightsData.slice(0, 5))
      setModels(modelsData)
      setPipelines(pipelinesData)

      // Generate sample chart data
      setChartData(generateChartData())

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealtimeData = async () => {
    try {
      const data = await analizaiService.getRealtimeMetrics()
      setRealtimeData(data)
    } catch (error) {
      console.error('Error loading realtime data:', error)
    }
  }

  const generateChartData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
      value: Math.floor(Math.random() * 1000000) + 500000,
      revenue: Math.floor(Math.random() * 1000000) + 500000,
      users: Math.floor(Math.random() * 10000) + 20000,
      orders: Math.floor(Math.random() * 5000) + 2000
    }))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-emerald-400" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-slate-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-400'
      case 'down': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: 'from-emerald-500 to-emerald-600 border-emerald-500/20',
      blue: 'from-blue-500 to-blue-600 border-blue-500/20',
      orange: 'from-orange-500 to-orange-600 border-orange-500/20',
      purple: 'from-purple-500 to-purple-600 border-purple-500/20',
      indigo: 'from-indigo-500 to-indigo-600 border-indigo-500/20',
      cyan: 'from-cyan-500 to-cyan-600 border-cyan-500/20'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            AI-powered insights and real-time analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-lg transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(metric.color)} border`}>
                {metric.icon}
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm ${getTrendColor(metric.trend)}`}>
                  {Math.abs(metric.changePercent)}%
                </span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50"
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/50">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <LineChart className="w-4 h-4" /> },
            { id: 'models', label: 'ML Models', icon: <Brain className="w-4 h-4" /> },
            { id: 'pipelines', label: 'Pipelines', icon: <GitBranch className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Revenue Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                      Revenue Trend
                    </h3>
                    <div className="h-64 bg-slate-800/30 rounded-lg flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Revenue Chart</p>
                        <p className="text-sm">Interactive chart would be here</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-blue-400" />
                      User Distribution
                    </h3>
                    <div className="h-64 bg-slate-800/30 rounded-lg flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Distribution Chart</p>
                        <p className="text-sm">Interactive chart would be here</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Activity */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-400" />
                    Real-time Activity
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{realtimeData.activeUsers || 847}</p>
                      <p className="text-sm text-slate-400">Active Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{realtimeData.processingJobs || 23}</p>
                      <p className="text-sm text-slate-400">Processing Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{realtimeData.dataIngestionRate || 1250}/s</p>
                      <p className="text-sm text-slate-400">Data Ingestion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-400">{realtimeData.modelPredictions || 94}</p>
                      <p className="text-sm text-slate-400">Predictions/min</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Analytics Performance</h3>
                    <div className="h-80 bg-slate-800/30 rounded-lg flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Advanced Analytics Chart</p>
                        <p className="text-sm">Multi-dimensional data visualization</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Insights</h3>
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div key={insight.id} className="p-3 bg-slate-800/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-white">{insight.type}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${insight.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                              }`}>
                              {insight.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{insight.title}</p>
                          <p className="text-xs text-slate-400">{insight.description.slice(0, 100)}...</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'models' && (
              <motion.div
                key="models"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {models.map((model, index) => (
                    <div key={model.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{model.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${model.status === 'deployed' ? 'bg-emerald-500/20 text-emerald-400' :
                            model.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                              model.status === 'ready' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-slate-500/20 text-slate-400'
                          }`}>
                          {model.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{model.type}</p>
                      {model.accuracy && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Accuracy</span>
                            <span className="text-white">{(model.accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                              style={{ width: `${model.accuracy * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {model.features?.length || 0} features
                        </span>
                        <div className="flex space-x-2">
                          <button className="p-1 text-slate-400 hover:text-white transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'pipelines' && (
              <motion.div
                key="pipelines"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {pipelines.map((pipeline, index) => (
                    <div key={pipeline.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-white">{pipeline.name}</h4>
                          <p className="text-sm text-slate-400">{pipeline.steps.length} steps</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-xs rounded-full ${pipeline.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                              pipeline.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                pipeline.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                  'bg-slate-500/20 text-slate-400'
                            }`}>
                            {pipeline.status}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            {pipeline.status === 'running' ?
                              <Pause className="w-4 h-4" /> :
                              <Play className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pipeline.steps.map((step, stepIndex) => (
                          <div key={step.id} className="bg-slate-800/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{step.name}</span>
                              <div className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-emerald-400' :
                                  step.status === 'running' ? 'bg-blue-400 animate-pulse' :
                                    step.status === 'failed' ? 'bg-red-400' :
                                      'bg-slate-400'
                                }`} />
                            </div>
                            <p className="text-xs text-slate-400">{step.type}</p>
                            {step.duration && (
                              <p className="text-xs text-slate-500 mt-1">
                                {Math.round(step.duration / 1000)}s
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* System Status Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-emerald-400">All Systems Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">Processing {realtimeData.processingJobs || 23} jobs</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
