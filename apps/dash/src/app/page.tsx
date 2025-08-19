'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Eye,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Share2,
  Filter,
  Calendar,
  Bell,
  Settings,
  Search,
  ChevronRight,
  PieChart,
  LineChart,
  BarChart,
  Globe,
  Clock,
  Layers,
  Database
} from 'lucide-react'

// TypeScript interfaces for analytics data
interface AnalyticsMetrics {
  totalRevenue: number
  totalUsers: number
  conversionRate: number
  totalOrders: number
  avgOrderValue: number
  bounceRate: number
  sessionDuration: number
  pageViews: number
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    fill?: boolean
    tension?: number
  }[]
}

interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'payment' | 'view' | 'conversion'
  description: string
  timestamp: string
  value?: number
  status: 'success' | 'pending' | 'failed'
}

interface DataSource {
  id: string
  name: string
  type: 'database' | 'api' | 'file' | 'stream'
  status: 'connected' | 'disconnected' | 'syncing'
  lastSync: string
  records: number
}

export default function DashDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 284750,
    totalUsers: 15489,
    conversionRate: 3.24,
    totalOrders: 2847,
    avgOrderValue: 89.50,
    bounceRate: 42.3,
    sessionDuration: 285,
    pageViews: 45892
  })

  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 1247,
    currentSessions: 892,
    liveEvents: 23,
    serverLoad: 67
  })

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'order',
      description: 'New order #5829 placed by customer',
      timestamp: '2 minutes ago',
      value: 145.99,
      status: 'success'
    },
    {
      id: '2',
      type: 'user',
      description: 'New user registration from Romania',
      timestamp: '5 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'payment',
      description: 'Payment processed for order #5827',
      timestamp: '8 minutes ago',
      value: 89.50,
      status: 'success'
    },
    {
      id: '4',
      type: 'conversion',
      description: 'Conversion goal completed: Newsletter signup',
      timestamp: '12 minutes ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'view',
      description: 'Product page viewed: Premium Analytics Plan',
      timestamp: '15 minutes ago',
      status: 'success'
    }
  ])

  const [dataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: 'PostgreSQL Database',
      type: 'database',
      status: 'connected',
      lastSync: '1 minute ago',
      records: 125489
    },
    {
      id: '2',
      name: 'REST API Endpoint',
      type: 'api',
      status: 'connected',
      lastSync: '3 minutes ago',
      records: 45892
    },
    {
      id: '3',
      name: 'Google Analytics',
      type: 'api',
      status: 'syncing',
      lastSync: '5 minutes ago',
      records: 89234
    },
    {
      id: '4',
      name: 'CSV Data Import',
      type: 'file',
      status: 'connected',
      lastSync: '1 hour ago',
      records: 15678
    }
  ])

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        activeUsers: prev.activeUsers + Math.floor((Math.random() - 0.5) * 20),
        currentSessions: prev.currentSessions + Math.floor((Math.random() - 0.5) * 10),
        liveEvents: prev.liveEvents + Math.floor(Math.random() * 5),
        serverLoad: Math.max(45, Math.min(85, prev.serverLoad + (Math.random() - 0.5) * 10))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <DollarSign className="w-4 h-4 text-green-500" />
      case 'user': return <Users className="w-4 h-4 text-blue-500" />
      case 'payment': return <Target className="w-4 h-4 text-purple-500" />
      case 'conversion': return <TrendingUp className="w-4 h-4 text-orange-500" />
      case 'view': return <Eye className="w-4 h-4 text-gray-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'syncing': return 'text-yellow-600 bg-yellow-100'
      case 'disconnected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 shadow-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">DASH Analytics Platform</h1>
                <p className="text-blue-100">Advanced Analytics & Business Intelligence Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Real-time Active Users</div>
                <div className="text-2xl font-bold">{formatNumber(realtimeData.activeUsers)}</div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-100 text-sm">Live Sessions</div>
                  <div className="text-2xl font-bold">{formatNumber(realtimeData.currentSessions)}</div>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-100 text-sm">Live Events</div>
                  <div className="text-2xl font-bold">{realtimeData.liveEvents}</div>
                </div>
                <Zap className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-100 text-sm">Server Load</div>
                  <div className="text-2xl font-bold">{realtimeData.serverLoad}%</div>
                </div>
                <Database className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-100 text-sm">Data Points</div>
                  <div className="text-2xl font-bold">2.4M</div>
                </div>
                <Globe className="w-8 h-8 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabbed Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-1 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" />, count: 8 },
              { id: 'realtime', label: 'Real-time', icon: <Activity className="w-4 h-4" />, count: realtimeData.liveEvents },
              { id: 'reports', label: 'Reports', icon: <LineChart className="w-4 h-4" />, count: 12 },
              { id: 'sources', label: 'Data Sources', icon: <Database className="w-4 h-4" />, count: dataSources.length },
              { id: 'insights', label: 'AI Insights', icon: <Zap className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
                {tab.count && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main KPI Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatCurrency(metrics.totalRevenue)}
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">+12.5% from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatNumber(metrics.totalUsers)}
                    </div>
                    <div className="flex items-center text-blue-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">+8.2% from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {metrics.conversionRate}%
                    </div>
                    <div className="flex items-center text-red-600">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">-0.8% from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatNumber(metrics.totalOrders)}
                    </div>
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">+15.3% from last month</span>
                    </div>
                  </div>
                </div>

                {/* Quick Analytics Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                    <div className="flex space-x-2">
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                      <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive chart visualization</p>
                      <p className="text-sm text-gray-500">Revenue trend over {timeRange}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 text-blue-500 mr-2" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            {activity.value && (
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(activity.value)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export Report</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2">
                      <Share2 className="w-4 h-4" />
                      <span>Share Dashboard</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Configure Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Data Sources</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Add Source</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataSources.map((source) => (
                  <div key={source.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{source.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                        {source.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium text-gray-900 capitalize">{source.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Records</span>
                        <span className="font-medium text-gray-900">{formatNumber(source.records)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Sync</span>
                        <span className="font-medium text-gray-900">{source.lastSync}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Configure
                      </button>
                      <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                        Sync Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['analytics', 'realtime', 'reports', 'insights'].includes(activeTab) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2 capitalize">{activeTab} Dashboard</h4>
                <p className="text-gray-600">Advanced {activeTab} features coming soon with comprehensive data visualization and insights.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <BarChart3 className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-blue-100 text-sm mb-4">
                Dive deep into your data with comprehensive analytics and visualizations
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Explore Analytics
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Zap className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Insights</h3>
              <p className="text-blue-100 text-sm mb-4">
                Monitor your business performance with live data and instant alerts
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                View Live Data
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Database className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Data Integration</h3>
              <p className="text-blue-100 text-sm mb-4">
                Connect multiple data sources for unified analytics and reporting
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Manage Sources
              </button>
            </motion.div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-white/20">
            <p className="text-blue-100">
              © 2025 DASH Analytics Platform - Advanced Business Intelligence. Part of the CODAI Ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

