/**
 * HUB - Integration Center Dashboard
 * Comprehensive monitoring and analytics for microservices and integrations
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wifi,
  Database,
  Cpu,
  HardDrive,
  MemoryStick,
  Users,
  TrendingUp,
  RefreshCw,
  Settings,
  Bell,
  Shield,
  Zap,
  Cloud,
  Upload,
  MessageSquare,
  Plus
} from 'lucide-react'

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  healthy: number
  warning: number
  critical: number
}

interface Metrics {
  totalRequests: string
  requestsPerSecond: string
  avgResponseTime: string
  errorRate: string
}

interface InfrastructureUsage {
  cpu: number
  memory: number
  storage: number
  network: number
}

interface ServiceStatus {
  name: string
  version: string
  uptime: string
  status: 'healthy' | 'warning' | 'critical'
}

interface Alert {
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  time: string
  icon: any
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    healthy: 24,
    warning: 4,
    critical: 1
  })

  const [metrics, setMetrics] = useState<Metrics>({
    totalRequests: '2.8M',
    requestsPerSecond: '156.7',
    avgResponseTime: '234ms',
    errorRate: '0.23%'
  })

  const [infrastructure, setInfrastructure] = useState<InfrastructureUsage>({
    cpu: 68,
    memory: 82,
    storage: 45,
    network: 95
  })

  const [services] = useState<ServiceStatus[]>([
    { name: 'User Management Service', version: 'v2.4.1', uptime: '99.98%', status: 'healthy' },
    { name: 'API Gateway', version: 'v3.1.2', uptime: '99.87%', status: 'warning' },
    { name: 'Analytics Engine', version: 'v1.8.3', uptime: '99.95%', status: 'healthy' },
    { name: 'Notification Service', version: 'v1.2.9', uptime: '97.23%', status: 'critical' }
  ])

  const [recentActivity] = useState<Alert[]>([
    {
      type: 'info',
      title: 'Analytics Engine v1.8.3 Deployed',
      description: 'Successfully deployed new version with performance improvements',
      time: '1 hour ago',
      icon: Upload
    },
    {
      type: 'critical',
      title: 'High CPU Usage Alert',
      description: 'Notification Service CPU usage exceeded 95% threshold',
      time: '2 hours ago',
      icon: AlertTriangle
    },
    {
      type: 'info',
      title: 'New Slack Integration Added',
      description: 'Slack notification integration configured for team alerts',
      time: '4 hours ago',
      icon: Plus
    },
    {
      type: 'warning',
      title: 'Payment Webhook Failed',
      description: 'Payment processing webhook failed with 5xx error',
      time: '6 hours ago',
      icon: AlertTriangle
    }
  ])

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate real-time data updates
    const dataInterval = setInterval(() => {
      if (isLiveMode) {
        // Update metrics with slight variations
        setMetrics(prev => ({
          ...prev,
          requestsPerSecond: (parseFloat(prev.requestsPerSecond) + (Math.random() - 0.5) * 20).toFixed(1),
          avgResponseTime: Math.max(150, Math.min(350, parseInt(prev.avgResponseTime) + Math.floor((Math.random() - 0.5) * 20))) + 'ms'
        }))

        // Update infrastructure usage
        setInfrastructure(prev => ({
          cpu: Math.max(20, Math.min(95, prev.cpu + Math.floor((Math.random() - 0.5) * 10))),
          memory: Math.max(50, Math.min(95, prev.memory + Math.floor((Math.random() - 0.5) * 5))),
          storage: Math.max(30, Math.min(80, prev.storage + Math.floor((Math.random() - 0.5) * 3))),
          network: Math.max(70, Math.min(100, prev.network + Math.floor((Math.random() - 0.5) * 8)))
        }))
      }
    }, 3000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [isLiveMode])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500'
    if (usage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getUsageStatus = (usage: number) => {
    if (usage < 50) return 'Normal'
    if (usage < 80) return 'Medium'
    return 'High'
  }

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
      case 'info': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
      default: return 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800'
    }
  }

  const getAlertIconBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20'
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20'
      case 'info': return 'bg-blue-100 dark:bg-blue-900/20'
      default: return 'bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getAlertIconColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Server className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hub
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-500 pb-1">Overview</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">Services</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">Analytics</a>
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">Activity</a>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiveMode(!isLiveMode)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-lg transition-all"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLiveMode ? 'animate-spin' : ''}`} />
                <span className="text-sm">{isLiveMode ? 'Live' : 'Paused'}</span>
              </motion.button>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Integration Center Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Comprehensive monitoring and analytics for microservices and integrations
          </p>
        </motion.div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                <motion.p
                  key={systemHealth.status}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`text-2xl font-semibold mt-2 ${getStatusColor(systemHealth.status)} capitalize`}
                >
                  {systemHealth.status}
                </motion.p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`p-3 ${systemHealth.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'} rounded-full`}
              >
                <div className={`w-6 h-6 ${getStatusBg(systemHealth.status)} rounded-full relative`}>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 ${getStatusBg(systemHealth.status)} rounded-full`}
                  />
                </div>
              </motion.div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{systemHealth.healthy} Healthy</span>
                <span className="text-yellow-600">{systemHealth.warning} Warning</span>
                <span className="text-red-600">{systemHealth.critical} Critical</span>
              </div>
            </div>
          </motion.div>

          {/* Total Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <motion.p
                  key={metrics.totalRequests}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-semibold text-gray-900 dark:text-white mt-2"
                >
                  {metrics.totalRequests}
                </motion.p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <motion.span
                  key={metrics.requestsPerSecond}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {metrics.requestsPerSecond} req/s
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Response Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <motion.p
                  key={metrics.avgResponseTime}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-semibold text-gray-900 dark:text-white mt-2"
                >
                  {metrics.avgResponseTime}
                </motion.p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span>12% improvement</span>
              </div>
            </div>
          </motion.div>

          {/* Error Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{metrics.errorRate}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-1" />
                <span>Target: &lt;0.5%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Infrastructure Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Infrastructure Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <motion.span
                    key={infrastructure.cpu}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-semibold text-gray-900 dark:text-white"
                  >
                    {infrastructure.cpu}%
                  </motion.span>
                  <span className={`text-sm ${getStatusColor(getUsageStatus(infrastructure.cpu))}`}>
                    {getUsageStatus(infrastructure.cpu)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${infrastructure.cpu}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${getUsageColor(infrastructure.cpu)} relative overflow-hidden`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <motion.span
                    key={infrastructure.memory}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-semibold text-gray-900 dark:text-white"
                  >
                    {infrastructure.memory}%
                  </motion.span>
                  <span className={`text-sm ${getStatusColor(getUsageStatus(infrastructure.memory))}`}>
                    {getUsageStatus(infrastructure.memory)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${infrastructure.memory}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${getUsageColor(infrastructure.memory)} relative overflow-hidden`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <motion.span
                    key={infrastructure.storage}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-semibold text-gray-900 dark:text-white"
                  >
                    {infrastructure.storage}%
                  </motion.span>
                  <span className={`text-sm ${getStatusColor(getUsageStatus(infrastructure.storage))}`}>
                    {getUsageStatus(infrastructure.storage)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${infrastructure.storage}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${getUsageColor(infrastructure.storage)} relative overflow-hidden`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Network Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Network Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <motion.span
                    key={infrastructure.network}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-semibold text-gray-900 dark:text-white"
                  >
                    {infrastructure.network}%
                  </motion.span>
                  <span className={`text-sm ${getStatusColor(getUsageStatus(infrastructure.network))}`}>
                    {getUsageStatus(infrastructure.network)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${infrastructure.network}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-2 rounded-full ${getUsageColor(infrastructure.network)} relative overflow-hidden`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h3>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2 text-sm text-red-600">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                <span>2 Critical</span>
              </span>
              <span className="flex items-center space-x-2 text-sm text-yellow-600">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                  className="w-2 h-2 bg-yellow-500 rounded-full"
                />
                <span>8 Warning</span>
              </span>
              <span className="flex items-center space-x-2 text-sm text-blue-600">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <span>15 Info</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800"
            >
              <div className="text-3xl font-bold text-red-600 mb-2">2</div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Critical Alerts</div>
              <div className="text-xs text-red-500 mt-1">Requires immediate attention</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800"
            >
              <div className="text-3xl font-bold text-yellow-600 mb-2">8</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Warning Alerts</div>
              <div className="text-xs text-yellow-500 mt-1">Monitor closely</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Info Alerts</div>
              <div className="text-xs text-blue-500 mt-1">Informational only</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Service Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Services */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Service Health Status</h3>
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      className={`w-3 h-3 ${getStatusBg(service.status)} rounded-full`}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.version} • {service.uptime} uptime</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 ${service.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      service.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    } rounded-full text-xs font-medium capitalize`}>
                    {service.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertBg(activity.type)}`}
                >
                  <div className={`w-8 h-8 ${getAlertIconBg(activity.type)} rounded-full flex items-center justify-center`}>
                    <activity.icon className={`w-4 h-4 ${getAlertIconColor(activity.type)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{activity.title}</div>
                    <div className="text-sm text-gray-500">{activity.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}