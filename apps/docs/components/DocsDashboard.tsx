/**
 * DocsDashboard - Comprehensive Documentation Analytics & Management Dashboard
 * Advanced documentation metrics, content management, and analytics platform
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Users,
  Eye,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Tag,
  Star,
  MessageCircle,
  Edit,
  Calendar,
  Filter,
  Download,
  Share,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Plus,
  MoreHorizontal,
  ExternalLink,
  GitBranch,
  Archive,
  Settings
} from 'lucide-react'

interface DocsDashboardProps {
  className?: string
}

interface DocumentStats {
  totalDocuments: number
  publishedDocuments: number
  draftDocuments: number
  totalViews: number
  totalContributors: number
  averageRating: number
  weeklyViews: number[]
  popularDocuments: Array<{
    id: string
    title: string
    views: number
    rating: number
    category: string
    lastModified: Date
  }>
  recentActivity: Array<{
    id: string
    type: 'created' | 'updated' | 'published' | 'reviewed'
    title: string
    author: string
    timestamp: Date
  }>
  searchAnalytics: {
    totalSearches: number
    topQueries: Array<{ query: string; count: number }>
    noResultQueries: Array<{ query: string; count: number }>
  }
  categoryStats: Array<{
    name: string
    count: number
    views: number
    color: string
  }>
  contributorStats: Array<{
    name: string
    contributions: number
    avatar?: string
    role: string
  }>
}

interface MetricCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
  description?: string
}

const DocsDashboard: React.FC<DocsDashboardProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analytics' | 'contributors'>('overview')

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const mockStats: DocumentStats = {
      totalDocuments: 247,
      publishedDocuments: 198,
      draftDocuments: 49,
      totalViews: 125420,
      totalContributors: 23,
      averageRating: 4.6,
      weeklyViews: [1200, 1350, 1180, 1420, 1650, 1890, 2100],
      popularDocuments: [
        {
          id: '1',
          title: 'Getting Started with the API',
          views: 15420,
          rating: 4.8,
          category: 'API Reference',
          lastModified: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Authentication Guide',
          views: 12350,
          rating: 4.7,
          category: 'Guides',
          lastModified: new Date('2024-01-12')
        },
        {
          id: '3',
          title: 'Webhook Integration',
          views: 9870,
          rating: 4.5,
          category: 'Advanced',
          lastModified: new Date('2024-01-10')
        }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'published',
          title: 'New Payment API Documentation',
          author: 'Sarah Chen',
          timestamp: new Date('2024-01-15T10:30:00')
        },
        {
          id: '2',
          type: 'updated',
          title: 'Authentication Guide',
          author: 'Mike Johnson',
          timestamp: new Date('2024-01-15T09:15:00')
        },
        {
          id: '3',
          type: 'created',
          title: 'Mobile SDK Tutorial',
          author: 'Alex Kim',
          timestamp: new Date('2024-01-14T16:45:00')
        }
      ],
      searchAnalytics: {
        totalSearches: 8450,
        topQueries: [
          { query: 'authentication', count: 1250 },
          { query: 'webhook', count: 890 },
          { query: 'api key', count: 760 },
          { query: 'rate limiting', count: 650 }
        ],
        noResultQueries: [
          { query: 'mobile payment', count: 45 },
          { query: 'legacy api', count: 32 },
          { query: 'bulk operations', count: 28 }
        ]
      },
      categoryStats: [
        { name: 'API Reference', count: 45, views: 45200, color: '#3B82F6' },
        { name: 'Guides', count: 67, views: 38950, color: '#10B981' },
        { name: 'Tutorials', count: 34, views: 23400, color: '#F59E0B' },
        { name: 'Advanced', count: 28, views: 18870, color: '#EF4444' },
        { name: 'SDK', count: 24, views: 15600, color: '#8B5CF6' }
      ],
      contributorStats: [
        { name: 'Sarah Chen', contributions: 45, role: 'Senior Technical Writer' },
        { name: 'Mike Johnson', contributions: 38, role: 'Developer Relations' },
        { name: 'Alex Kim', contributions: 32, role: 'Product Manager' },
        { name: 'Emma Davis', contributions: 28, role: 'UX Writer' }
      ]
    }

    setStats(mockStats)
  }, [selectedTimeRange, selectedCategory])

  const refreshData = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Total Documents',
      value: stats?.totalDocuments || 0,
      change: 12,
      changeType: 'increase',
      icon: <FileText className="w-6 h-6" />,
      color: 'blue',
      description: '49 drafts, 198 published'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews?.toLocaleString() || '0',
      change: 8.5,
      changeType: 'increase',
      icon: <Eye className="w-6 h-6" />,
      color: 'green',
      description: 'Last 30 days'
    },
    {
      title: 'Contributors',
      value: stats?.totalContributors || 0,
      change: 2,
      changeType: 'increase',
      icon: <Users className="w-6 h-6" />,
      color: 'purple',
      description: 'Active this month'
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '0.0',
      change: 0.2,
      changeType: 'increase',
      icon: <Star className="w-6 h-6" />,
      color: 'yellow',
      description: 'Based on user feedback'
    },
    {
      title: 'Search Queries',
      value: stats?.searchAnalytics.totalSearches?.toLocaleString() || '0',
      change: -3.2,
      changeType: 'decrease',
      icon: <Search className="w-6 h-6" />,
      color: 'indigo',
      description: 'This month'
    },
    {
      title: 'Documentation Health',
      value: '94%',
      change: 1.5,
      changeType: 'increase',
      icon: <Activity className="w-6 h-6" />,
      color: 'emerald',
      description: 'Up-to-date content'
    }
  ]

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border' = 'bg') => {
    const colors = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200' },
      red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' }
    }
    return colors[color]?.[type] || colors.blue[type]
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documentation Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analytics and insights for your documentation platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time range:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
            { key: 'analytics', label: 'Analytics', icon: <LineChart className="w-4 h-4" /> },
            { key: 'contributors', label: 'Contributors', icon: <Users className="w-4 h-4" /> }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`
                flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${getColorClass(metric.color, 'bg')} bg-opacity-10`}>
                <div className={getColorClass(metric.color, 'text')}>
                  {metric.icon}
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${metric.changeType === 'increase' ? 'text-green-600' :
                  metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                }`}>
                {metric.changeType === 'increase' && <ArrowUp className="w-3 h-3" />}
                {metric.changeType === 'decrease' && <ArrowDown className="w-3 h-3" />}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Views Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Views
                </h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {stats.weeklyViews.map((views, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      Day {index + 1}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(views / Math.max(...stats.weeklyViews)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      {views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content by Category
                </h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <PieChart className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {stats.categoryStats.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.count} docs
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Most Popular Documents
                </h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {stats.popularDocuments.map((doc, index) => (
                  <div key={doc.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.views.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Clock className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${activity.type === 'published' ? 'bg-green-100 dark:bg-green-900/20' :
                        activity.type === 'updated' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          activity.type === 'created' ? 'bg-purple-100 dark:bg-purple-900/20' :
                            'bg-gray-100 dark:bg-gray-700'
                      }
                    `}>
                      {activity.type === 'published' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                      {activity.type === 'updated' && <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      {activity.type === 'created' && <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {activity.type === 'reviewed' && <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.author}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">
                          {activity.type === 'published' && 'published'}
                          {activity.type === 'updated' && 'updated'}
                          {activity.type === 'created' && 'created'}
                          {activity.type === 'reviewed' && 'reviewed'}
                        </span>{' '}
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Search Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Search Queries
              </h3>
              <div className="space-y-3">
                {stats.searchAnalytics.topQueries.map((query, index) => (
                  <div key={query.query} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-4">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        "{query.query}"
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {query.count.toLocaleString()} searches
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* No Results Queries */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Queries with No Results
              </h3>
              <div className="space-y-3">
                {stats.searchAnalytics.noResultQueries.map((query) => (
                  <div key={query.query} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      "{query.query}"
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {query.count} times
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'contributors' && (
          <motion.div
            key="contributors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Contributors
            </h3>
            <div className="space-y-4">
              {stats.contributorStats.map((contributor, index) => (
                <div key={contributor.name} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    {contributor.avatar ? (
                      <img src={contributor.avatar} alt={contributor.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-white font-medium">
                        {contributor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {contributor.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {contributor.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {contributor.contributions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      contributions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DocsDashboard
