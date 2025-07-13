'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  Eye,
  MousePointer,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Calendar,
  Download,
  Maximize2,
  MoreVertical,
  RefreshCw,
  Settings,
  Share2,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Mail,
  MessageSquare,
  Phone,
  Heart,
  Bookmark,
  Award
} from 'lucide-react'
import DashLayout from './DashLayout'

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<any>
  color: string
  description: string
  target?: number
  targetLabel?: string
}

interface ChartWidget {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'treemap' | 'funnel'
  data: any[]
  config: any
  description?: string
  height?: number
}

interface AlertItem {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  dismissed: boolean
}

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  timestamp: Date
  avatar?: string
}

const DashDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [charts, setCharts] = useState<ChartWidget[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const colors = {
    primary: ['#3B82F6', '#1D4ED8', '#1E40AF'],
    success: ['#10B981', '#059669', '#047857'],
    warning: ['#F59E0B', '#D97706', '#B45309'],
    error: ['#EF4444', '#DC2626', '#B91C1C'],
    purple: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    indigo: ['#6366F1', '#4F46E5', '#4338CA'],
    pink: ['#EC4899', '#DB2777', '#BE185D'],
    cyan: ['#06B6D4', '#0891B2', '#0E7490']
  }

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const loadDashboardData = async () => {
    setIsLoading(true)

    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Load metrics
      setMetrics([
        {
          id: 'total-users',
          title: 'Total Users',
          value: '12,456',
          change: 12.5,
          changeType: 'increase',
          icon: Users,
          color: 'blue',
          description: 'Active users in the last 30 days',
          target: 15000,
          targetLabel: 'Monthly Target'
        },
        {
          id: 'revenue',
          title: 'Revenue',
          value: '$89,432',
          change: 8.2,
          changeType: 'increase',
          icon: DollarSign,
          color: 'green',
          description: 'Total revenue this month',
          target: 100000,
          targetLabel: 'Monthly Goal'
        },
        {
          id: 'orders',
          title: 'Orders',
          value: '1,234',
          change: -2.4,
          changeType: 'decrease',
          icon: ShoppingCart,
          color: 'purple',
          description: 'Orders processed today',
          target: 1500,
          targetLabel: 'Daily Target'
        },
        {
          id: 'conversion',
          title: 'Conversion Rate',
          value: '3.2%',
          change: 0.8,
          changeType: 'increase',
          icon: Target,
          color: 'indigo',
          description: 'Visitor to customer conversion'
        },
        {
          id: 'bounce-rate',
          title: 'Bounce Rate',
          value: '42.3%',
          change: -1.2,
          changeType: 'decrease',
          icon: Activity,
          color: 'orange',
          description: 'Percentage of single-page visits'
        },
        {
          id: 'avg-session',
          title: 'Avg Session',
          value: '4m 32s',
          change: 15.3,
          changeType: 'increase',
          icon: Clock,
          color: 'cyan',
          description: 'Average session duration'
        }
      ])

      // Load chart data
      setCharts([
        {
          id: 'revenue-trend',
          title: 'Revenue Trend',
          type: 'line',
          data: generateTimeSeriesData('revenue', 30),
          config: {
            xKey: 'date',
            yKey: 'value',
            color: colors.primary[0]
          },
          description: 'Daily revenue over the last 30 days'
        },
        {
          id: 'user-acquisition',
          title: 'User Acquisition',
          type: 'area',
          data: generateTimeSeriesData('users', 30),
          config: {
            xKey: 'date',
            yKey: 'value',
            color: colors.success[0]
          },
          description: 'New user registrations'
        },
        {
          id: 'traffic-sources',
          title: 'Traffic Sources',
          type: 'pie',
          data: [
            { name: 'Organic Search', value: 45, color: colors.primary[0] },
            { name: 'Direct', value: 25, color: colors.success[0] },
            { name: 'Social Media', value: 15, color: colors.warning[0] },
            { name: 'Email', value: 10, color: colors.purple[0] },
            { name: 'Referral', value: 5, color: colors.indigo[0] }
          ],
          config: {},
          description: 'Where your visitors come from'
        },
        {
          id: 'device-breakdown',
          title: 'Device Breakdown',
          type: 'bar',
          data: [
            { device: 'Desktop', users: 8945, sessions: 12340 },
            { device: 'Mobile', users: 6789, sessions: 9876 },
            { device: 'Tablet', users: 2345, sessions: 3456 }
          ],
          config: {
            xKey: 'device',
            yKeys: ['users', 'sessions'],
            colors: [colors.primary[0], colors.success[0]]
          },
          description: 'User distribution across devices'
        },
        {
          id: 'performance-metrics',
          title: 'Performance Metrics',
          type: 'radar',
          data: [
            {
              metric: 'Speed',
              currentValue: 85,
              benchmark: 90,
              fullMark: 100
            },
            {
              metric: 'Reliability',
              currentValue: 92,
              benchmark: 88,
              fullMark: 100
            },
            {
              metric: 'Security',
              currentValue: 78,
              benchmark: 85,
              fullMark: 100
            },
            {
              metric: 'UX Score',
              currentValue: 88,
              benchmark: 82,
              fullMark: 100
            },
            {
              metric: 'SEO',
              currentValue: 95,
              benchmark: 90,
              fullMark: 100
            },
            {
              metric: 'Accessibility',
              currentValue: 87,
              benchmark: 80,
              fullMark: 100
            }
          ],
          config: {},
          description: 'Overall platform performance'
        },
        {
          id: 'conversion-funnel',
          title: 'Conversion Funnel',
          type: 'funnel',
          data: [
            { name: 'Visitors', value: 10000, fill: colors.primary[0] },
            { name: 'Product Views', value: 7500, fill: colors.primary[1] },
            { name: 'Add to Cart', value: 4500, fill: colors.primary[2] },
            { name: 'Checkout', value: 2000, fill: colors.success[0] },
            { name: 'Purchase', value: 800, fill: colors.success[1] }
          ],
          config: {},
          description: 'User journey through the sales process'
        }
      ])

      // Load alerts
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Server memory usage is at 85%. Consider scaling resources.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          dismissed: false
        },
        {
          id: '2',
          type: 'success',
          title: 'Backup Completed',
          message: 'Daily database backup completed successfully.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          dismissed: false
        },
        {
          id: '3',
          type: 'info',
          title: 'New Feature Released',
          message: 'Dashboard v2.1 with enhanced analytics is now live.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          dismissed: false
        }
      ])

      // Load activities
      setActivities([
        {
          id: '1',
          user: 'John Doe',
          action: 'created a new dashboard',
          target: 'Q4 Sales Report',
          timestamp: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          id: '2',
          user: 'Jane Smith',
          action: 'updated widget settings',
          target: 'Revenue Chart',
          timestamp: new Date(Date.now() - 25 * 60 * 1000)
        },
        {
          id: '3',
          user: 'Mike Johnson',
          action: 'shared dashboard',
          target: 'Marketing Analytics',
          timestamp: new Date(Date.now() - 45 * 60 * 1000)
        },
        {
          id: '4',
          user: 'Sarah Wilson',
          action: 'connected data source',
          target: 'PostgreSQL Production',
          timestamp: new Date(Date.now() - 60 * 60 * 1000)
        },
        {
          id: '5',
          user: 'Alex Brown',
          action: 'exported report',
          target: 'Monthly Summary',
          timestamp: new Date(Date.now() - 90 * 60 * 1000)
        }
      ])

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSeriesData = (type: string, days: number) => {
    const data = []
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      let value = 0

      switch (type) {
        case 'revenue':
          value = 1000 + Math.random() * 2000 + Math.sin(i * 0.2) * 500
          break
        case 'users':
          value = 50 + Math.random() * 100 + Math.sin(i * 0.15) * 25
          break
        default:
          value = Math.random() * 100
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }

    return data
  }

  const renderChart = (chart: ChartWidget) => {
    const commonProps = {
      width: '100%',
      height: chart.height || 300,
      data: chart.data
    }

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey={chart.config.xKey}
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line
                type="monotone"
                dataKey={chart.config.yKey}
                stroke={chart.config.color}
                strokeWidth={3}
                dot={{ fill: chart.config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: chart.config.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey={chart.config.xKey} stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Area
                type="monotone"
                dataKey={chart.config.yKey}
                stroke={chart.config.color}
                fillOpacity={0.6}
                fill={chart.config.color}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey={chart.config.xKey} stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              {chart.config.yKeys?.map((key: string, index: number) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chart.config.colors[index]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chart.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
              />
              <Radar
                name="Current"
                dataKey="currentValue"
                stroke={colors.primary[0]}
                fill={colors.primary[0]}
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke={colors.success[0]}
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )

      case 'funnel':
        return (
          <ResponsiveContainer {...commonProps}>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Funnel
                dataKey="value"
                data={chart.data}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Unsupported chart type</div>
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return AlertTriangle
      case 'info': return Eye
      default: return Eye
    }
  }

  const getAlertColor = (type: AlertItem['type']) => {
    switch (type) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'info': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <DashLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</span>
          </div>
        </div>
      </DashLayout>
    )
  }

  return (
    <DashLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </motion.button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {metrics.map((metric) => {
            const IconComponent = metric.icon
            const progress = metric.target ? (parseFloat(metric.value.toString().replace(/[^0-9.]/g, '')) / metric.target) * 100 : 0

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                    <IconComponent className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                  <div className={`flex items-center space-x-1 ${metric.changeType === 'increase' ? 'text-green-500' :
                      metric.changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : metric.changeType === 'decrease' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    <span className="text-sm font-medium">
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {metric.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {metric.description}
                  </p>

                  {metric.target && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>{metric.targetLabel}</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {chart.title}
                  </h3>
                  {chart.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chart.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>

              <div className="h-64">
                {renderChart(chart)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Row: Alerts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Alerts
              </h3>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs rounded-full">
                {alerts.filter(a => !a.dismissed).length} active
              </span>
            </div>

            <div className="space-y-3">
              {alerts.filter(a => !a.dismissed).map((alert) => {
                const AlertIcon = getAlertIcon(alert.type)
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <AlertIcon className={`w-5 h-5 mt-0.5 ${getAlertColor(alert.type)}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </motion.button>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashLayout>
  )
}

export default DashDashboard
