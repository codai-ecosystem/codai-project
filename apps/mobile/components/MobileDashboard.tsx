'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Tablet,
  Monitor,
  Activity,
  TrendingUp,
  Users,
  Download,
  Star,
  Battery,
  Wifi,
  Signal,
  Globe,
  Shield,
  Zap,
  Clock,
  MapPin,
  Camera,
  Mic,
  Bell,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Share,
  Heart,
  MessageCircle,
  Bookmark,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Loader,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Upload
} from 'lucide-react'
import MobileService from '../services/MobileService'

interface DashboardMetrics {
  totalDevices: number
  activeDevices: number
  newDevices: number
  totalApps: number
  appDownloads: number
  avgSessionTime: number
  crashRate: number
  userSatisfaction: number
}

interface DeviceInfo {
  id: string
  name: string
  os: string
  version: string
  isActive: boolean
  lastSeen: Date
  batteryLevel: number
  networkType: string
  location?: string
}

interface AppMetrics {
  id: string
  name: string
  category: string
  downloads: number
  rating: number
  reviews: number
  crashRate: number
  retention: {
    day1: number
    day7: number
    day30: number
  }
  performance: {
    launchTime: number
    memoryUsage: number
    batteryImpact: number
  }
}

interface UserFlow {
  id: string
  name: string
  steps: string[]
  completionRate: number
  avgTime: number
  dropoffPoints: Array<{
    step: string
    dropoffRate: number
  }>
}

interface NotificationStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  conversionRate: number
}

const MetricCard = ({
  title,
  value,
  change,
  icon,
  color = 'purple',
  format = 'number'
}: {
  title: string
  value: number
  change?: number
  icon: React.ReactNode
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red'
  format?: 'number' | 'percentage' | 'time' | 'bytes'
}) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'time':
        return `${val.toFixed(1)}s`
      case 'bytes':
        return `${(val / 1024 / 1024).toFixed(1)}MB`
      default:
        return val.toLocaleString()
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-cyan-500'
      case 'green':
        return 'from-green-500 to-emerald-500'
      case 'orange':
        return 'from-orange-500 to-yellow-500'
      case 'red':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-purple-500 to-indigo-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(color)} bg-opacity-20`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
            <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-1">
          {formatValue(value, format)}
        </h3>
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    </motion.div>
  )
}

const DevicesList = ({ devices }: { devices: DeviceInfo[] }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const getDeviceIcon = (os: string) => {
    if (os.toLowerCase().includes('ios')) return <Smartphone className="w-5 h-5" />
    if (os.toLowerCase().includes('android')) return <Smartphone className="w-5 h-5" />
    if (os.toLowerCase().includes('tablet')) return <Tablet className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getStatusColor = (isActive: boolean, lastSeen: Date) => {
    if (isActive) return 'text-green-400'
    const timeDiff = Date.now() - lastSeen.getTime()
    if (timeDiff < 3600000) return 'text-yellow-400' // 1 hour
    return 'text-red-400'
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-400'
    if (level > 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Connected Devices</h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all ${viewMode === 'list' ? 'flex items-center justify-between' : ''
              }`}
          >
            <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'mb-3' : ''}`}>
              {getDeviceIcon(device.os)}
              <div>
                <h4 className="text-white font-medium">{device.name}</h4>
                <p className="text-gray-400 text-sm">{device.os} {device.version}</p>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'justify-between' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${device.isActive ? 'bg-green-400' : 'bg-gray-500'
                }`} />

              <div className="flex items-center gap-1">
                <Battery className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`} />
                <span className={`text-xs ${getBatteryColor(device.batteryLevel)}`}>
                  {device.batteryLevel}%
                </span>
              </div>

              <div className="flex items-center gap-1">
                {device.networkType === 'wifi' ? (
                  <Wifi className="w-4 h-4 text-blue-400" />
                ) : (
                  <Signal className="w-4 h-4 text-green-400" />
                )}
                <span className="text-xs text-gray-400">{device.networkType}</span>
              </div>

              {viewMode === 'list' && (
                <span className={`text-xs ${getStatusColor(device.isActive, device.lastSeen)}`}>
                  {device.isActive ? 'Active' : `Last seen ${device.lastSeen.toLocaleDateString()}`}
                </span>
              )}
            </div>

            {viewMode === 'grid' && (
              <div className="text-xs text-gray-400">
                {device.isActive ? 'Active now' : `Last seen ${device.lastSeen.toLocaleDateString()}`}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const AppPerformanceChart = ({ apps }: { apps: AppMetrics[] }) => {
  const [selectedMetric, setSelectedMetric] = useState<'downloads' | 'rating' | 'retention'>('downloads')

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">App Performance</h3>
        <div className="flex gap-2">
          {['downloads', 'rating', 'retention'].map((metric) => (
            <motion.button
              key={metric}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMetric(metric as any)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedMetric === metric
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {apps.slice(0, 5).map((app, index) => {
          const getValue = () => {
            switch (selectedMetric) {
              case 'downloads':
                return app.downloads
              case 'rating':
                return app.rating * 20 // Convert to percentage for bar
              case 'retention':
                return app.retention.day7
              default:
                return 0
            }
          }

          const getMaxValue = () => {
            switch (selectedMetric) {
              case 'downloads':
                return Math.max(...apps.map(a => a.downloads))
              case 'rating':
                return 100
              case 'retention':
                return 100
              default:
                return 100
            }
          }

          const value = getValue()
          const maxValue = getMaxValue()
          const percentage = (value / maxValue) * 100

          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-24 text-sm text-gray-400 truncate">{app.name}</div>

              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                />
              </div>

              <div className="w-16 text-sm text-white text-right">
                {selectedMetric === 'downloads'
                  ? (value / 1000).toFixed(1) + 'K'
                  : selectedMetric === 'rating'
                    ? (value / 20).toFixed(1) + '★'
                    : value.toFixed(1) + '%'
                }
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const UserFlowAnalysis = ({ flows }: { flows: UserFlow[] }) => {
  const [selectedFlow, setSelectedFlow] = useState<UserFlow | null>(flows[0] || null)

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-6">User Flow Analysis</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flow Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Select Flow</h4>
          <div className="space-y-2">
            {flows.map((flow) => (
              <motion.button
                key={flow.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFlow(flow)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${selectedFlow?.id === flow.id
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{flow.name}</span>
                  <span className="text-sm text-gray-400">{flow.completionRate.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Avg time: {flow.avgTime.toFixed(1)}s
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Flow Visualization */}
        {selectedFlow && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Flow Steps</h4>
            <div className="space-y-3">
              {selectedFlow.steps.map((step, index) => {
                const dropoff = selectedFlow.dropoffPoints.find(d => d.step === step)
                const stepCompletion = 100 - (dropoff?.dropoffRate || 0)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepCompletion > 80 ? 'bg-green-500' :
                        stepCompletion > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="text-white text-sm">{step}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-1">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${stepCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-12">
                          {stepCompletion.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const RealTimeActivity = () => {
  const [activities, setActivities] = useState([
    { id: 1, type: 'app_launch', message: 'User launched CodAI app', timestamp: new Date(), device: 'iPhone 15' },
    { id: 2, type: 'notification', message: 'Push notification sent', timestamp: new Date(Date.now() - 60000), device: 'Samsung Galaxy' },
    { id: 3, type: 'crash', message: 'App crash detected', timestamp: new Date(Date.now() - 120000), device: 'iPad Pro' },
    { id: 4, type: 'install', message: 'New app installation', timestamp: new Date(Date.now() - 180000), device: 'Pixel 8' },
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'app_launch': return <Play className="w-4 h-4 text-green-400" />
      case 'notification': return <Bell className="w-4 h-4 text-blue-400" />
      case 'crash': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'install': return <Download className="w-4 h-4 text-purple-400" />
      default: return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Real-time Activity</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
            >
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-white text-sm">{activity.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span>{activity.device}</span>
                  <span>•</span>
                  <span>{activity.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function MobileDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDevices: 15420,
    activeDevices: 12680,
    newDevices: 342,
    totalApps: 28,
    appDownloads: 89234,
    avgSessionTime: 8.4,
    crashRate: 0.3,
    userSatisfaction: 4.7
  })

  const [devices] = useState<DeviceInfo[]>([
    { id: '1', name: 'iPhone 15 Pro', os: 'iOS', version: '17.2', isActive: true, lastSeen: new Date(), batteryLevel: 85, networkType: 'wifi', location: 'San Francisco' },
    { id: '2', name: 'Samsung Galaxy S24', os: 'Android', version: '14', isActive: true, lastSeen: new Date(), batteryLevel: 67, networkType: '5g', location: 'New York' },
    { id: '3', name: 'iPad Pro', os: 'iOS', version: '17.1', isActive: false, lastSeen: new Date(Date.now() - 3600000), batteryLevel: 92, networkType: 'wifi', location: 'London' },
    { id: '4', name: 'Pixel 8 Pro', os: 'Android', version: '14', isActive: true, lastSeen: new Date(), batteryLevel: 43, networkType: '4g', location: 'Tokyo' },
  ])

  const [apps] = useState<AppMetrics[]>([
    {
      id: '1', name: 'CodAI', category: 'productivity', downloads: 45000, rating: 4.8, reviews: 2340, crashRate: 0.1,
      retention: { day1: 85, day7: 67, day30: 43 },
      performance: { launchTime: 1.2, memoryUsage: 125, batteryImpact: 2.1 }
    },
    {
      id: '2', name: 'BancAI', category: 'finance', downloads: 32000, rating: 4.6, reviews: 1890, crashRate: 0.2,
      retention: { day1: 78, day7: 58, day30: 35 },
      performance: { launchTime: 1.8, memoryUsage: 98, batteryImpact: 1.8 }
    },
    {
      id: '3', name: 'StudiAI', category: 'education', downloads: 28000, rating: 4.9, reviews: 1650, crashRate: 0.05,
      retention: { day1: 92, day7: 75, day30: 58 },
      performance: { launchTime: 1.0, memoryUsage: 87, batteryImpact: 1.5 }
    },
  ])

  const [userFlows] = useState<UserFlow[]>([
    {
      id: '1', name: 'App Onboarding', steps: ['Download', 'Sign up', 'Verify email', 'Complete profile', 'First action'],
      completionRate: 68, avgTime: 240,
      dropoffPoints: [
        { step: 'Download', dropoffRate: 5 },
        { step: 'Sign up', dropoffRate: 15 },
        { step: 'Verify email', dropoffRate: 25 },
        { step: 'Complete profile', dropoffRate: 35 },
        { step: 'First action', dropoffRate: 32 }
      ]
    },
    {
      id: '2', name: 'Purchase Flow', steps: ['Browse', 'Add to cart', 'Checkout', 'Payment', 'Confirmation'],
      completionRate: 34, avgTime: 180,
      dropoffPoints: [
        { step: 'Browse', dropoffRate: 10 },
        { step: 'Add to cart', dropoffRate: 30 },
        { step: 'Checkout', dropoffRate: 45 },
        { step: 'Payment', dropoffRate: 55 },
        { step: 'Confirmation', dropoffRate: 66 }
      ]
    }
  ])

  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d'>('7d')

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Mobile Experience Dashboard
            </h1>
            <p className="text-gray-400">Comprehensive mobile analytics and device management</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {['1d', '7d', '30d'].map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${timeRange === range
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Devices"
            value={metrics.totalDevices}
            change={12.5}
            icon={<Smartphone className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Active Devices"
            value={metrics.activeDevices}
            change={8.3}
            icon={<Activity className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="App Downloads"
            value={metrics.appDownloads}
            change={24.7}
            icon={<Download className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Avg Session Time"
            value={metrics.avgSessionTime}
            change={-2.1}
            icon={<Clock className="w-6 h-6" />}
            color="orange"
            format="time"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="New Devices"
            value={metrics.newDevices}
            change={18.9}
            icon={<Plus className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Total Apps"
            value={metrics.totalApps}
            icon={<Grid className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Crash Rate"
            value={metrics.crashRate}
            change={-15.2}
            icon={<Shield className="w-6 h-6" />}
            color="red"
            format="percentage"
          />
          <MetricCard
            title="User Satisfaction"
            value={metrics.userSatisfaction}
            change={3.4}
            icon={<Star className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Devices List - Takes 2 columns */}
          <div className="xl:col-span-2">
            <DevicesList devices={devices} />
          </div>

          {/* Real-time Activity - Takes 1 column */}
          <div>
            <RealTimeActivity />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* App Performance Chart */}
          <AppPerformanceChart apps={apps} />

          {/* User Flow Analysis */}
          <UserFlowAnalysis flows={userFlows} />
        </div>
      </div>
    </div>
  )
}
