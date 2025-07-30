'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
  BugAntIcon,
  CpuChipIcon,
  ServerIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { ProjectMetrics, ActivityEvent } from '../../lib/types/enhanced-types'

interface AnalyticsDashboardProps {
  projectId?: string
  teamId?: string
  timeframe?: '24h' | '7d' | '30d' | '90d' | '1y'
}

interface DashboardMetrics {
  // Development Metrics
  commits: { value: number; change: number; trend: 'up' | 'down' | 'stable' }
  pullRequests: { value: number; change: number; trend: 'up' | 'down' | 'stable' }
  codeReviews: { value: number; change: number; trend: 'up' | 'down' | 'stable' }
  deployments: { value: number; change: number; trend: 'up' | 'down' | 'stable' }

  // Quality Metrics
  codeQuality: { score: number; change: number }
  testCoverage: { percentage: number; change: number }
  bugReports: { value: number; change: number; severity: Record<string, number> }
  performance: { score: number; change: number }

  // Team Metrics
  activeUsers: { value: number; change: number }
  collaboration: { score: number; change: number }
  productivity: { score: number; change: number }
  satisfaction: { score: number; change: number }

  // Business Metrics
  costs: { value: number; change: number; currency: string }
  roi: { percentage: number; change: number }
  timeToMarket: { days: number; change: number }
  uptime: { percentage: number; change: number }
}

export function AnalyticsDashboard({ projectId, teamId, timeframe = '7d' }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'development' | 'quality' | 'team' | 'business'>('overview')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)

  // Mock analytics data
  useEffect(() => {
    const mockMetrics: DashboardMetrics = {
      commits: { value: 247, change: 12.5, trend: 'up' },
      pullRequests: { value: 32, change: -8.3, trend: 'down' },
      codeReviews: { value: 28, change: 15.2, trend: 'up' },
      deployments: { value: 18, change: 22.1, trend: 'up' },

      codeQuality: { score: 87, change: 3.2 },
      testCoverage: { percentage: 84, change: 1.8 },
      bugReports: { value: 12, change: -25.5, severity: { critical: 1, high: 3, medium: 5, low: 3 } },
      performance: { score: 92, change: 5.1 },

      activeUsers: { value: 24, change: 8.7 },
      collaboration: { score: 78, change: -2.1 },
      productivity: { score: 85, change: 7.3 },
      satisfaction: { score: 91, change: 4.2 },

      costs: { value: 2850, change: 12.3, currency: 'USD' },
      roi: { percentage: 285, change: 15.7 },
      timeToMarket: { days: 12, change: -18.5 },
      uptime: { percentage: 99.7, change: 0.2 }
    }

    setMetrics(mockMetrics)
    setLoading(false)

    // Mock recent activity
    setRecentActivity([
      {
        id: '1',
        type: 'deployment',
        userId: '1',
        projectId: projectId || 'default',
        title: 'Production deployment successful',
        description: 'Version 2.1.0 deployed with 0 downtime',
        action: 'deployed',
        details: { version: '2.1.0', environment: 'production', duration: '3m 24s' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        user: { id: '1', name: 'John Doe', email: 'john@example.com', status: 'online' }
      },
      {
        id: '2',
        type: 'commit',
        userId: '2',
        projectId: projectId || 'default',
        title: 'Fix critical authentication bug',
        description: 'Resolved security vulnerability in OAuth flow',
        action: 'committed',
        details: { files: 3, additions: 45, deletions: 12 },
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        user: { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'away' }
      }
    ])
  }, [projectId, selectedTimeframe])

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable' || Math.abs(change) < 1) {
      return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }

    if (change > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    } else {
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    }
  }

  const getChangeColor = (change: number, inverse = false) => {
    if (Math.abs(change) < 1) return 'text-gray-500'

    const isPositive = inverse ? change < 0 : change > 0
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  if (loading || !metrics) {
    return (
      <div className="h-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend,
    suffix = '',
    prefix = '',
    inverse = false
  }: {
    title: string
    value: string | number
    change: number
    icon: any
    trend?: 'up' | 'down' | 'stable'
    suffix?: string
    prefix?: string
    inverse?: boolean
  }) => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}{typeof value === 'number' ? formatNumber(value) : value}{suffix}
          </p>
          <div className="flex items-center mt-2 space-x-1">
            {trend && getTrendIcon(trend, change)}
            <span className={`text-sm font-medium ${getChangeColor(change, inverse)}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
          </div>
        </div>
        <div className="ml-4">
          <Icon className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'development', name: 'Development', icon: CodeBracketIcon },
    { id: 'quality', name: 'Quality', icon: ShieldCheckIcon },
    { id: 'team', name: 'Team', icon: UserGroupIcon },
    { id: 'business', name: 'Business', icon: BanknotesIcon }
  ]

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Performance insights and metrics</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Active Users"
                  value={metrics.activeUsers.value}
                  change={metrics.activeUsers.change}
                  icon={UserGroupIcon}
                  trend={metrics.activeUsers.change > 0 ? 'up' : 'down'}
                />
                <MetricCard
                  title="Code Quality"
                  value={metrics.codeQuality.score}
                  change={metrics.codeQuality.change}
                  icon={ShieldCheckIcon}
                  trend={metrics.codeQuality.change > 0 ? 'up' : 'down'}
                  suffix="/100"
                />
                <MetricCard
                  title="Deployments"
                  value={metrics.deployments.value}
                  change={metrics.deployments.change}
                  icon={RocketLaunchIcon}
                  trend={metrics.deployments.trend}
                />
                <MetricCard
                  title="Uptime"
                  value={metrics.uptime.percentage}
                  change={metrics.uptime.change}
                  icon={CheckCircleIcon}
                  trend={metrics.uptime.change > 0 ? 'up' : 'down'}
                  suffix="%"
                />
              </div>

              {/* Charts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart Placeholder */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trend</h3>
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUpIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Performance chart visualization</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {activity.type === 'deployment' && <RocketLaunchIcon className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'commit' && <CodeBracketIcon className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {activity.timestamp.toLocaleTimeString()} by {activity.user.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'development' && (
            <motion.div
              key="development"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Commits"
                  value={metrics.commits.value}
                  change={metrics.commits.change}
                  icon={CodeBracketIcon}
                  trend={metrics.commits.trend}
                />
                <MetricCard
                  title="Pull Requests"
                  value={metrics.pullRequests.value}
                  change={metrics.pullRequests.change}
                  icon={DocumentTextIcon}
                  trend={metrics.pullRequests.trend}
                />
                <MetricCard
                  title="Code Reviews"
                  value={metrics.codeReviews.value}
                  change={metrics.codeReviews.change}
                  icon={EyeIcon}
                  trend={metrics.codeReviews.trend}
                />
                <MetricCard
                  title="Deployments"
                  value={metrics.deployments.value}
                  change={metrics.deployments.change}
                  icon={RocketLaunchIcon}
                  trend={metrics.deployments.trend}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'quality' && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Code Quality"
                  value={metrics.codeQuality.score}
                  change={metrics.codeQuality.change}
                  icon={ShieldCheckIcon}
                  suffix="/100"
                />
                <MetricCard
                  title="Test Coverage"
                  value={metrics.testCoverage.percentage}
                  change={metrics.testCoverage.change}
                  icon={CheckCircleIcon}
                  suffix="%"
                />
                <MetricCard
                  title="Bug Reports"
                  value={metrics.bugReports.value}
                  change={metrics.bugReports.change}
                  icon={BugAntIcon}
                  inverse={true}
                />
                <MetricCard
                  title="Performance"
                  value={metrics.performance.score}
                  change={metrics.performance.change}
                  icon={CpuChipIcon}
                  suffix="/100"
                />
              </div>

              {/* Bug Severity Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bug Severity Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(metrics.bugReports.severity).map(([severity, count]) => (
                    <div key={severity} className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${severity === 'critical' ? 'bg-red-100 text-red-600' :
                          severity === 'high' ? 'bg-orange-100 text-orange-600' :
                            severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                        }`}>
                        {count}
                      </div>
                      <p className="text-sm capitalize font-medium text-gray-700 dark:text-gray-300">{severity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Active Users"
                  value={metrics.activeUsers.value}
                  change={metrics.activeUsers.change}
                  icon={UserGroupIcon}
                />
                <MetricCard
                  title="Collaboration Score"
                  value={metrics.collaboration.score}
                  change={metrics.collaboration.change}
                  icon={UserGroupIcon}
                  suffix="/100"
                />
                <MetricCard
                  title="Productivity"
                  value={metrics.productivity.score}
                  change={metrics.productivity.change}
                  icon={TrendingUpIcon}
                  suffix="/100"
                />
                <MetricCard
                  title="Satisfaction"
                  value={metrics.satisfaction.score}
                  change={metrics.satisfaction.change}
                  icon={CheckCircleIcon}
                  suffix="/100"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Monthly Costs"
                  value={formatCurrency(metrics.costs.value, metrics.costs.currency)}
                  change={metrics.costs.change}
                  icon={BanknotesIcon}
                />
                <MetricCard
                  title="ROI"
                  value={metrics.roi.percentage}
                  change={metrics.roi.change}
                  icon={TrendingUpIcon}
                  suffix="%"
                />
                <MetricCard
                  title="Time to Market"
                  value={metrics.timeToMarket.days}
                  change={metrics.timeToMarket.change}
                  icon={ClockIcon}
                  suffix=" days"
                  inverse={true}
                />
                <MetricCard
                  title="Uptime"
                  value={metrics.uptime.percentage}
                  change={metrics.uptime.change}
                  icon={ServerIcon}
                  suffix="%"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Export alias for compatibility
export { AnalyticsDashboard as EnhancedAnalyticsDashboard }
