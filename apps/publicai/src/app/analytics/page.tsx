'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Users, Eye,
  Calendar, Clock, MessageSquare, Vote, FileText, Download,
  Filter, RefreshCw, ArrowUp, ArrowDown, Minus, Target,
  PieChart, LineChart, Globe, MapPin, Building2, Heart,
  Shield, Car, TreePine, School, Hospital, Home, Briefcase,
  Zap, Award, DollarSign, CheckCircle, AlertTriangle
} from 'lucide-react'

interface AnalyticsMetric {
  id: string
  title: string
  value: string
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  description: string
  trend: number[]
}

interface CategoryData {
  name: string
  value: number
  percentage: number
  color: string
  icon: any
  change: number
}

interface TimeSeriesData {
  date: string
  citizens: number
  feedback: number
  events: number
  satisfaction: number
}

interface DemographicData {
  ageGroup: string
  count: number
  percentage: number
  engagement: number
}

interface GeographicData {
  district: string
  population: number
  activeUsers: number
  engagementRate: number
  topIssues: string[]
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('engagement')
  const [viewType, setViewType] = useState('overview')

  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'total-engagement',
      title: 'Total Engagement',
      value: '847,623',
      change: 18.3,
      changeType: 'positive',
      icon: Activity,
      color: 'from-teal-500 to-cyan-500',
      description: 'Total citizen interactions across all platforms',
      trend: [450, 523, 634, 712, 789, 847]
    },
    {
      id: 'participation-rate',
      title: 'Participation Rate',
      value: '67.4%',
      change: 5.2,
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      description: 'Percentage of eligible citizens actively participating',
      trend: [58, 61, 63, 65, 66, 67]
    },
    {
      id: 'satisfaction-score',
      title: 'Satisfaction Score',
      value: '89.2%',
      change: 2.1,
      changeType: 'positive',
      icon: Heart,
      color: 'from-cyan-500 to-blue-500',
      description: 'Overall citizen satisfaction with public services',
      trend: [84, 85, 87, 88, 89, 89]
    },
    {
      id: 'response-efficiency',
      title: 'Response Efficiency',
      value: '2.3 days',
      change: -15.6,
      changeType: 'positive',
      icon: Clock,
      color: 'from-indigo-500 to-purple-500',
      description: 'Average time to respond to citizen requests',
      trend: [3.2, 2.9, 2.7, 2.5, 2.4, 2.3]
    }
  ])

  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([
    { name: 'Transportation', value: 2847, percentage: 28.4, color: 'bg-teal-500', icon: Car, change: 12.3 },
    { name: 'Environment', value: 2156, percentage: 21.5, color: 'bg-blue-500', icon: TreePine, change: 18.7 },
    { name: 'Education', value: 1934, percentage: 19.3, color: 'bg-cyan-500', icon: School, change: 8.9 },
    { name: 'Healthcare', value: 1423, percentage: 14.2, color: 'bg-indigo-500', icon: Hospital, change: 15.4 },
    { name: 'Safety', value: 892, percentage: 8.9, color: 'bg-purple-500', icon: Shield, change: -3.2 },
    { name: 'Housing', value: 756, percentage: 7.5, color: 'bg-teal-400', icon: Home, change: 22.1 }
  ])

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([
    { date: '2025-08-01', citizens: 23456, feedback: 234, events: 12, satisfaction: 87.2 },
    { date: '2025-08-02', citizens: 23687, feedback: 267, events: 8, satisfaction: 87.8 },
    { date: '2025-08-03', citizens: 23934, feedback: 198, events: 15, satisfaction: 88.1 },
    { date: '2025-08-04', citizens: 24156, feedback: 312, events: 11, satisfaction: 88.7 },
    { date: '2025-08-05', citizens: 24423, feedback: 278, events: 9, satisfaction: 89.0 },
    { date: '2025-08-06', citizens: 24687, feedback: 345, events: 14, satisfaction: 89.2 },
    { date: '2025-08-07', citizens: 24847, feedback: 289, events: 7, satisfaction: 89.2 }
  ])

  const [demographicData, setDemographicData] = useState<DemographicData[]>([
    { ageGroup: '18-24', count: 4567, percentage: 18.4, engagement: 72.3 },
    { ageGroup: '25-34', count: 6234, percentage: 25.1, engagement: 78.9 },
    { ageGroup: '35-44', count: 5789, percentage: 23.3, engagement: 74.2 },
    { ageGroup: '45-54', count: 4234, percentage: 17.0, engagement: 69.8 },
    { ageGroup: '55-64', count: 2678, percentage: 10.8, engagement: 65.4 },
    { ageGroup: '65+', count: 1345, percentage: 5.4, engagement: 58.7 }
  ])

  const [geographicData, setGeographicData] = useState<GeographicData[]>([
    {
      district: 'Downtown',
      population: 45623,
      activeUsers: 31287,
      engagementRate: 68.5,
      topIssues: ['Transportation', 'Housing', 'Environment']
    },
    {
      district: 'Riverside',
      population: 38954,
      activeUsers: 26134,
      engagementRate: 67.1,
      topIssues: ['Environment', 'Safety', 'Education']
    },
    {
      district: 'Westside',
      population: 42156,
      activeUsers: 28423,
      engagementRate: 67.4,
      topIssues: ['Education', 'Transportation', 'Healthcare']
    },
    {
      district: 'Northgate',
      population: 35789,
      activeUsers: 23956,
      engagementRate: 66.9,
      topIssues: ['Healthcare', 'Housing', 'Safety']
    },
    {
      district: 'Industrial',
      population: 28934,
      activeUsers: 19267,
      engagementRate: 66.6,
      topIssues: ['Transportation', 'Environment', 'Safety']
    }
  ])

  const timeRanges = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 3 Months' },
    { id: '1y', label: 'Last Year' }
  ]

  const viewTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'geographic', label: 'Geographic', icon: MapPin },
    { id: 'performance', label: 'Performance', icon: Target }
  ]

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-500" />
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-500" />
    return <Minus className="w-3 h-3 text-gray-500" />
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setAnalyticsMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.id === 'total-engagement'
          ? (parseInt(metric.value.replace(/,/g, '')) + Math.floor(Math.random() * 10)).toLocaleString()
          : metric.value
      })))
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Enhanced Header */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-teal-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  PublicAI Analytics
                </h1>
                <p className="text-sm text-gray-600">Data Insights & Engagement Metrics</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Type Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-1">
            <div className="flex space-x-1 overflow-x-auto">
              {viewTypes.map((view) => {
                const Icon = view.icon
                return (
                  <button
                    key={view.id}
                    onClick={() => setViewType(view.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${viewType === view.id
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{view.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Overview */}
        {viewType === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsMetrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        {getChangeIcon(metric.change)}
                        <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    <p className="text-gray-600 text-sm">{metric.description}</p>

                    {/* Mini Chart */}
                    <div className="mt-4 h-16 flex items-end space-x-1">
                      {metric.trend.map((value, idx) => (
                        <div
                          key={idx}
                          className={`bg-gradient-to-t ${metric.color} rounded-t opacity-70 flex-1`}
                          style={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Engagement by Category</h2>
                <div className="space-y-4">
                  {categoryBreakdown.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <motion.div
                        key={category.name}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.value.toLocaleString()} interactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{category.percentage}%</p>
                          <p className={`text-sm ${category.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {category.change >= 0 ? '+' : ''}{category.change}%
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Engagement Timeline</h2>
                <div className="space-y-4">
                  {timeSeriesData.slice(-5).map((data, index) => (
                    <motion.div
                      key={data.date}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </h3>
                        <p className="text-sm text-gray-600">{data.citizens.toLocaleString()} citizens</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{data.feedback} feedback</p>
                        <p className="text-sm text-gray-600">{data.satisfaction}% satisfaction</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white"
                whileHover={{ scale: 1.02 }}
              >
                <MessageSquare className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Active Discussions</h3>
                <p className="text-2xl font-bold mb-1">3,926</p>
                <p className="text-teal-100 text-sm">+24.7% this month</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
                whileHover={{ scale: 1.02 }}
              >
                <Vote className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Public Polls</h3>
                <p className="text-2xl font-bold mb-1">47</p>
                <p className="text-blue-100 text-sm">15 active, 32 completed</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
                whileHover={{ scale: 1.02 }}
              >
                <Calendar className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Events Hosted</h3>
                <p className="text-2xl font-bold mb-1">89</p>
                <p className="text-indigo-100 text-sm">12 upcoming events</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Demographics View */}
        {viewType === 'demographics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Demographics Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
                  <div className="space-y-4">
                    {demographicData.map((demo, index) => (
                      <motion.div
                        key={demo.ageGroup}
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{demo.ageGroup}</span>
                          <span className="text-sm text-gray-600">
                            {demo.count.toLocaleString()} ({demo.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${demo.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          Engagement Rate: {demo.engagement}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Heatmap</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => (
                      <motion.div
                        key={i}
                        className="aspect-square rounded bg-gradient-to-r from-teal-100 to-blue-100 hover:from-teal-300 hover:to-blue-300 transition-colors"
                        style={{
                          opacity: Math.random() * 0.8 + 0.2,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Engagement activity over the last 5 weeks
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Geographic View */}
        {viewType === 'geographic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Geographic Distribution</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {geographicData.map((district, index) => (
                  <motion.div
                    key={district.district}
                    className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{district.district}</h3>
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Population</span>
                        <span className="font-medium">{district.population.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-medium">{district.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement Rate</span>
                        <span className="font-medium">{district.engagementRate}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-teal-200/50">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Top Issues</h4>
                      <div className="flex flex-wrap gap-1">
                        {district.topIssues.map((issue) => (
                          <span
                            key={issue}
                            className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Other views placeholder */}
        {!['overview', 'demographics', 'geographic'].includes(viewType) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{viewType} Analytics</h3>
            <p className="text-gray-600 mb-6">Advanced {viewType} analytics are being implemented.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
              Coming Soon
            </button>
          </motion.div>
        )}
      </div>

      {/* Export Options */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
              <p className="text-gray-600 text-sm">Download detailed reports and data visualizations</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                PDF Report
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                CSV Data
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                Full Report
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Footer */}
      <motion.footer
        className="bg-white/80 backdrop-blur-sm border-t border-teal-200/50 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <BarChart3 className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Data-Driven Insights</h3>
              <p className="text-teal-100 text-sm">Making informed decisions with comprehensive analytics.</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Performance Tracking</h3>
              <p className="text-blue-100 text-sm">Continuous monitoring of engagement and satisfaction metrics.</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <Target className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Strategic Optimization</h3>
              <p className="text-indigo-100 text-sm">Using data to optimize public services and citizen engagement.</p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
