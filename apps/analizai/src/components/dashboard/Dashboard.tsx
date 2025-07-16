'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Eye,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  PieChart,
  LineChart,
  Zap,
  Brain,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react'

export default function AnalizaiDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [insights, setInsights] = useState({
    totalUsers: 12847,
    activeUsers: 8654,
    conversionRate: 3.8,
    revenue: 284750,
    growth: 24.5,
    satisfaction: 4.7,
    anomalies: 3,
    predictions: 156
  })

  const [realTimeData, setRealTimeData] = useState({
    currentVisitors: 1247,
    pageViews: 5643,
    bounceRate: 2.4,
    avgSessionTime: 245
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        currentVisitors: prev.currentVisitors + Math.floor(Math.random() * 20 - 10),
        pageViews: prev.pageViews + Math.floor(Math.random() * 50),
        bounceRate: Math.max(0, prev.bounceRate + (Math.random() - 0.5) * 0.5),
        avgSessionTime: Math.max(60, prev.avgSessionTime + Math.floor(Math.random() * 30 - 15))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setInsights(prev => ({
      ...prev,
      growth: prev.growth + (Math.random() - 0.5) * 5,
      satisfaction: Math.min(5, Math.max(1, prev.satisfaction + (Math.random() - 0.5) * 0.5))
    }))
    setRefreshing(false)
  }

  const analyticsCards = [
    {
      title: "Total Users",
      value: insights.totalUsers.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      trend: "up"
    },
    {
      title: "Revenue",
      value: `$${insights.revenue.toLocaleString()}`,
      change: `+${insights.growth.toFixed(1)}%`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: `${insights.conversionRate}%`,
      change: "+0.8%",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      trend: "up"
    },
    {
      title: "Satisfaction",
      value: insights.satisfaction.toFixed(1),
      change: "+0.3",
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      trend: "up"
    }
  ]

  const realTimeCards = [
    {
      title: "Live Visitors",
      value: realTimeData.currentVisitors.toLocaleString(),
      icon: Eye,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Page Views",
      value: realTimeData.pageViews.toLocaleString(),
      icon: BarChart3,
      color: "from-teal-500 to-teal-600"
    },
    {
      title: "Bounce Rate",
      value: `${realTimeData.bounceRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "from-rose-500 to-rose-600"
    },
    {
      title: "Avg Session",
      value: `${Math.floor(realTimeData.avgSessionTime / 60)}:${(realTimeData.avgSessionTime % 60).toString().padStart(2, '0')}`,
      icon: Activity,
      color: "from-cyan-500 to-cyan-600"
    }
  ]

  const analysisTools = [
    {
      title: "Trend Analysis",
      description: "Identify patterns and trends in your data",
      icon: LineChart,
      color: "bg-gradient-to-r from-blue-50 to-blue-100",
      actionColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Anomaly Detection",
      description: "Spot unusual patterns and outliers",
      icon: AlertTriangle,
      color: "bg-gradient-to-r from-yellow-50 to-yellow-100",
      actionColor: "bg-yellow-600 hover:bg-yellow-700",
      badge: insights.anomalies
    },
    {
      title: "Predictive Analytics",
      description: "Forecast future trends and behaviors",
      icon: Brain,
      color: "bg-gradient-to-r from-purple-50 to-purple-100",
      actionColor: "bg-purple-600 hover:bg-purple-700",
      badge: insights.predictions
    },
    {
      title: "Segmentation",
      description: "Analyze user groups and behaviors",
      icon: PieChart,
      color: "bg-gradient-to-r from-green-50 to-green-100",
      actionColor: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Performance Insights",
      description: "Monitor system and app performance",
      icon: Zap,
      color: "bg-gradient-to-r from-orange-50 to-orange-100",
      actionColor: "bg-orange-600 hover:bg-orange-700"
    },
    {
      title: "Custom Queries",
      description: "Build and run custom analytics queries",
      icon: Search,
      color: "bg-gradient-to-r from-indigo-50 to-indigo-100",
      actionColor: "bg-indigo-600 hover:bg-indigo-700"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">ANALIZAI Dashboard</h1>
            <p className="text-indigo-100 text-lg">Advanced Analytics & Insights Platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <BarChart3 className="h-16 w-16 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-0">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <span className="text-green-600 text-sm font-medium">{card.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Real-time Data */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Real-time Analytics</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {realTimeCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`bg-gradient-to-r ${card.color} p-2 rounded-lg`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-lg font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Analysis Tools */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <div key={index} className={`${tool.color} p-6 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  {tool.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <button className={`${tool.actionColor} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full`}>
                  Launch Tool
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Download className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Export Data</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
            <Filter className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium">Apply Filters</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <Search className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Advanced Search</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <Settings className="h-6 w-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}