'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Sun,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Battery,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings,
  Share2,
  Maximize2
} from 'lucide-react'

interface EnergyData {
  timestamp: string
  production: number
  consumption: number
  efficiency: number
  weather: string
}

interface PerformanceMetrics {
  period: string
  totalProduction: number
  averageProduction: number
  peakProduction: number
  efficiency: number
  savings: number
  co2Avoided: number
  systemUptime: number
  weatherImpact: number
}

interface SystemPerformance {
  systemId: string
  name: string
  production: number
  efficiency: number
  status: 'optimal' | 'good' | 'warning' | 'maintenance'
  trend: 'up' | 'down' | 'stable'
  contribution: number
}

export default function SolarAnalytics() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')
  const [selectedSystem, setSelectedSystem] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Performance metrics data
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    period: 'This Month',
    totalProduction: 1247.8,
    averageProduction: 41.6,
    peakProduction: 67.2,
    efficiency: 94.2,
    savings: 1840,
    co2Avoided: 15.8,
    systemUptime: 99.2,
    weatherImpact: 87.5
  })

  // System performance data
  const [systemPerformance] = useState<SystemPerformance[]>([
    {
      systemId: '1',
      name: 'Main Residential System',
      production: 524.7,
      efficiency: 94.2,
      status: 'optimal',
      trend: 'up',
      contribution: 42.1
    },
    {
      systemId: '2',
      name: 'Commercial Building A',
      production: 587.3,
      efficiency: 91.8,
      status: 'optimal',
      trend: 'up',
      contribution: 47.1
    },
    {
      systemId: '3',
      name: 'Backup Solar Array',
      production: 135.8,
      efficiency: 87.5,
      status: 'good',
      trend: 'stable',
      contribution: 10.9
    }
  ])

  // Historical data for charts
  const [historicalData] = useState<EnergyData[]>([
    { timestamp: '2025-07-01', production: 45.2, consumption: 38.7, efficiency: 92.1, weather: 'sunny' },
    { timestamp: '2025-07-02', production: 52.8, consumption: 41.3, efficiency: 94.5, weather: 'sunny' },
    { timestamp: '2025-07-03', production: 38.9, consumption: 39.2, efficiency: 88.7, weather: 'cloudy' },
    { timestamp: '2025-07-04', production: 48.6, consumption: 42.1, efficiency: 91.3, weather: 'partly_cloudy' },
    { timestamp: '2025-07-05', production: 56.1, consumption: 44.8, efficiency: 95.2, weather: 'sunny' },
    { timestamp: '2025-07-06', production: 42.3, consumption: 40.5, efficiency: 89.8, weather: 'cloudy' },
    { timestamp: '2025-07-07', production: 49.7, consumption: 43.2, efficiency: 92.6, weather: 'sunny' }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'production', name: 'Production Trends', icon: TrendingUp },
    { id: 'efficiency', name: 'Efficiency Analysis', icon: Target },
    { id: 'systems', name: 'System Performance', icon: Activity },
    { id: 'forecasting', name: 'AI Forecasting', icon: Eye },
    { id: 'reports', name: 'Reports', icon: Settings }
  ]

  const timeRanges = [
    { id: 'day', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'year', name: 'This Year' }
  ]

  const systems = [
    { id: 'all', name: 'All Systems' },
    { id: '1', name: 'Main Residential' },
    { id: '2', name: 'Commercial Building A' },
    { id: '3', name: 'Backup Solar Array' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-emerald-500'
      case 'good': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'maintenance': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return CheckCircle
      case 'good': return CheckCircle
      case 'warning': return AlertCircle
      case 'maintenance': return Settings
      default: return Info
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUpRight
      case 'down': return ArrowDownRight
      case 'stable': return Activity
      default: return Activity
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-500'
      case 'down': return 'text-red-500'
      case 'stable': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-yellow-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Solar Analytics
                  </h1>
                  <p className="text-sm text-gray-600">Energy Production Analysis</p>
                </div>
              </Link>
            </div>

            {/* Analytics Metrics */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">
                  {performanceMetrics.totalProduction.toFixed(1)} kWh
                </div>
                <div className="text-xs text-gray-500">Total Production</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  {performanceMetrics.efficiency.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Avg Efficiency</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600">
                  ${performanceMetrics.savings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Savings</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters
                    ? 'text-yellow-600 bg-yellow-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/60 backdrop-blur-sm border-b border-yellow-200/50 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Time Range Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Time Range:</label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      {timeRanges.map((range) => (
                        <option key={range.id} value={range.id}>{range.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* System Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">System:</label>
                    <select
                      value={selectedSystem}
                      onChange={(e) => setSelectedSystem(e.target.value)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      {systems.map((system) => (
                        <option key={system.id} value={system.id}>{system.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Refresh Data</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-yellow-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {performanceMetrics.totalProduction.toFixed(1)} kWh
                      </div>
                      <div className="text-sm text-gray-600">Total Production</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+12.5% vs last month</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {performanceMetrics.efficiency.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Average Efficiency</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+2.1% optimization</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-amber-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {performanceMetrics.peakProduction.toFixed(1)} kW
                      </div>
                      <div className="text-sm text-gray-600">Peak Production</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm ml-1">At 12:30 PM</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {performanceMetrics.systemUptime.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">System Uptime</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm ml-1">Excellent reliability</span>
                  </div>
                </motion.div>
              </div>

              {/* Production Chart and System Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Production Trend Chart */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Energy Production Trends</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Last 7 Days</span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chart Placeholder with Sample Data Visualization */}
                  <div className="h-64 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg p-4">
                    <div className="h-full flex items-end justify-between space-x-2">
                      {historicalData.map((data, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-yellow-400 to-orange-400 rounded-t-lg min-h-[20px] relative group cursor-pointer"
                            style={{ height: `${(data.production / 60) * 180}px` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {data.production} kWh
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 transform rotate-45">
                            {new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Performance Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">System Performance</h3>
                    <Link
                      href="/maintenance"
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {systemPerformance.map((system) => {
                      const StatusIcon = getStatusIcon(system.status)
                      const TrendIcon = getTrendIcon(system.trend)
                      return (
                        <div key={system.systemId} className="p-4 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(system.status)}`} />
                              <span className="font-medium text-gray-800 text-sm">{system.name}</span>
                            </div>
                            <TrendIcon className={`w-4 h-4 ${getTrendColor(system.trend)}`} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Production:</span>
                              <span className="font-semibold text-yellow-600 ml-1">{system.production} kWh</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Efficiency:</span>
                              <span className="font-semibold text-orange-600 ml-1">{system.efficiency}%</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Contribution</span>
                              <span>{system.contribution}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${system.contribution}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Insights and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Insights</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-blue-800 text-sm">Peak Performance Window</div>
                        <div className="text-blue-600 text-xs">Your systems perform best between 11 AM - 2 PM with 95%+ efficiency</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-800 text-sm">Optimization Opportunity</div>
                        <div className="text-green-600 text-xs">System 3 can be optimized for 8% better performance</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-yellow-800 text-sm">Weather Impact</div>
                        <div className="text-yellow-600 text-xs">Cloud coverage will reduce production by 15% tomorrow</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Impact</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{performanceMetrics.co2Avoided} tons</div>
                      <div className="text-sm text-gray-600">CO₂ Emissions Avoided</div>
                      <div className="text-xs text-green-600 mt-1">Equivalent to planting 18 trees</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">$1,840</div>
                        <div className="text-xs text-gray-600">Money Saved</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">92%</div>
                        <div className="text-xs text-gray-600">Grid Independence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'production' && (
            <motion.div
              key="production"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Detailed Production Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Production Analysis</h3>
                <div className="h-80 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Advanced Production Analytics</p>
                    <p className="text-sm">Detailed charts and trends will be displayed here</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add other tab content as needed */}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-yellow-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="w-6 h-6" />
                <h4 className="font-semibold">Advanced Analytics</h4>
              </div>
              <p className="text-sm opacity-90">Comprehensive energy production analysis and forecasting</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6" />
                <h4 className="font-semibold">Performance Optimization</h4>
              </div>
              <p className="text-sm opacity-90">AI-powered system optimization and efficiency improvements</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Eye className="w-6 h-6" />
                <h4 className="font-semibold">Predictive Insights</h4>
              </div>
              <p className="text-sm opacity-90">AI forecasting and predictive maintenance recommendations</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
