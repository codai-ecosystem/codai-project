/**
 * HubDashboard - Integration Center Analytics & Monitoring Dashboard
 * Comprehensive microservice monitoring, API gateway analytics, and system health tracking
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Activity,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Star,
  GitBranch,
  Package,
  Terminal,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Shield,
  Database,
  Server,
  Network,
  Mail,
  Bell,
  MessageSquare,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  Link,
  Timer,
  Target,
  Layers,
  Gauge
} from 'lucide-react'

// Integration Center Metrics interface
interface ServiceMetrics {
  id: string
  name: string
  type: 'microservice' | 'api_gateway' | 'database' | 'external_api' | 'webhook'
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
  responseTime: number
  requestCount: number
  errorRate: number
  throughput: number
  lastDeployment: Date
  version: string
  health: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  dependencies: string[]
  alerts: number
}

// API Gateway Analytics interface
interface APIGatewayMetrics {
  totalRequests: number
  requestsPerSecond: number
  averageResponseTime: number
  errorRate: number
  topEndpoints: {
    path: string
    requests: number
    latency: number
    errors: number
  }[]
  rateLimitHits: number
  authenticationFailures: number
  activeConnections: number
  bandwidthUsage: number
}

// Integration Activity interface
interface IntegrationActivity {
  id: string
  type: 'deployment' | 'integration_added' | 'webhook_failure' | 'api_limit_reached' | 'service_restart' | 'alert_triggered'
  title: string
  description: string
  service: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  timestamp: Date
  metadata?: Record<string, any>
}

// System Health interface
interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  services: {
    total: number
    healthy: number
    warning: number
    critical: number
    offline: number
  }
  infrastructure: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  alerts: {
    critical: number
    warning: number
    info: number
  }
}

export default function HubDashboard() {
  const [activeTimeRange, setActiveTimeRange] = useState('24h')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [dashboardView, setDashboardView] = useState<'overview' | 'services' | 'analytics' | 'activity'>('overview')

  // Mock data - would come from actual monitoring APIs
  const systemHealth: SystemHealth = {
    overall: 'healthy',
    services: {
      total: 29,
      healthy: 24,
      warning: 4,
      critical: 1,
      offline: 0
    },
    infrastructure: {
      cpu: 68,
      memory: 82,
      storage: 45,
      network: 95
    },
    alerts: {
      critical: 2,
      warning: 8,
      info: 15
    }
  }

  const apiGatewayMetrics: APIGatewayMetrics = {
    totalRequests: 2847392,
    requestsPerSecond: 156.7,
    averageResponseTime: 234,
    errorRate: 0.23,
    topEndpoints: [
      { path: '/api/v1/users', requests: 450123, latency: 89, errors: 12 },
      { path: '/api/v1/projects', requests: 389456, latency: 156, errors: 8 },
      { path: '/api/v1/auth', requests: 298374, latency: 67, errors: 45 },
      { path: '/api/v1/analytics', requests: 234890, latency: 278, errors: 3 },
      { path: '/api/v1/integrations', requests: 198567, latency: 145, errors: 7 }
    ],
    rateLimitHits: 1247,
    authenticationFailures: 89,
    activeConnections: 2847,
    bandwidthUsage: 12.4
  }

  const serviceMetrics: ServiceMetrics[] = [
    {
      id: '1',
      name: 'User Management Service',
      type: 'microservice',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 89,
      requestCount: 450123,
      errorRate: 0.03,
      throughput: 156.7,
      lastDeployment: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      version: 'v2.4.1',
      health: { cpu: 45, memory: 67, disk: 23, network: 89 },
      dependencies: ['auth-service', 'database-cluster'],
      alerts: 0
    },
    {
      id: '2',
      name: 'API Gateway',
      type: 'api_gateway',
      status: 'warning',
      uptime: 99.87,
      responseTime: 234,
      requestCount: 2847392,
      errorRate: 0.23,
      throughput: 456.3,
      lastDeployment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      version: 'v3.1.2',
      health: { cpu: 78, memory: 85, disk: 34, network: 92 },
      dependencies: ['load-balancer', 'rate-limiter'],
      alerts: 2
    },
    {
      id: '3',
      name: 'Analytics Engine',
      type: 'microservice',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 278,
      requestCount: 234890,
      errorRate: 0.01,
      throughput: 89.4,
      lastDeployment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      version: 'v1.8.3',
      health: { cpu: 56, memory: 74, disk: 45, network: 95 },
      dependencies: ['data-warehouse', 'redis-cluster'],
      alerts: 0
    },
    {
      id: '4',
      name: 'Notification Service',
      type: 'microservice',
      status: 'critical',
      uptime: 97.23,
      responseTime: 1200,
      requestCount: 123456,
      errorRate: 5.67,
      throughput: 23.1,
      lastDeployment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      version: 'v1.2.9',
      health: { cpu: 95, memory: 89, disk: 78, network: 67 },
      dependencies: ['email-provider', 'sms-gateway'],
      alerts: 5
    },
    {
      id: '5',
      name: 'Database Cluster',
      type: 'database',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 12,
      requestCount: 1567890,
      errorRate: 0.001,
      throughput: 789.2,
      lastDeployment: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      version: 'PostgreSQL 15.4',
      health: { cpu: 23, memory: 67, disk: 89, network: 78 },
      dependencies: ['backup-service'],
      alerts: 0
    }
  ]

  const integrationActivities: IntegrationActivity[] = [
    {
      id: '1',
      type: 'deployment',
      title: 'Analytics Engine v1.8.3 Deployed',
      description: 'Successfully deployed new version with performance improvements',
      service: 'Analytics Engine',
      severity: 'info',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'alert_triggered',
      title: 'High CPU Usage Alert',
      description: 'Notification Service CPU usage exceeded 95% threshold',
      service: 'Notification Service',
      severity: 'critical',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'integration_added',
      title: 'New Slack Integration Added',
      description: 'Slack notification integration configured for team alerts',
      service: 'Integration Manager',
      severity: 'info',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'webhook_failure',
      title: 'Payment Webhook Failed',
      description: 'Payment processing webhook failed with 5xx error',
      service: 'Payment Service',
      severity: 'error',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'api_limit_reached',
      title: 'Rate Limit Threshold Reached',
      description: 'API gateway rate limit reached for user analytics endpoint',
      service: 'API Gateway',
      severity: 'warning',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      case 'offline': return 'text-gray-500'
      case 'degraded': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'degraded': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'info': return 'text-blue-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getSeverityBadge = (severity: string): string => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'critical': return 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'microservice': return <Package className="w-4 h-4" />
      case 'api_gateway': return <Globe className="w-4 h-4" />
      case 'database': return <Database className="w-4 h-4" />
      case 'external_api': return <Link className="w-4 h-4" />
      case 'webhook': return <Zap className="w-4 h-4" />
      default: return <Server className="w-4 h-4" />
    }
  }

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'deployment': return <Upload className="w-4 h-4" />
      case 'integration_added': return <Plus className="w-4 h-4" />
      case 'webhook_failure': return <AlertTriangle className="w-4 h-4" />
      case 'api_limit_reached': return <Shield className="w-4 h-4" />
      case 'service_restart': return <RefreshCw className="w-4 h-4" />
      case 'alert_triggered': return <Bell className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Integration Center Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive monitoring and analytics for microservices and integrations
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={activeTimeRange}
            onChange={(e) => setActiveTimeRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'System Overview', icon: Monitor },
            { id: 'services', label: 'Services', icon: Server },
            { id: 'analytics', label: 'API Analytics', icon: BarChart3 },
            { id: 'activity', label: 'Activity Feed', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setDashboardView(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${dashboardView === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* System Overview */}
      {dashboardView === 'overview' && (
        <div className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                  <p className={`text-2xl font-semibold mt-2 ${getStatusColor(systemHealth.overall)}`}>
                    {systemHealth.overall === 'healthy' ? 'Healthy' :
                      systemHealth.overall === 'degraded' ? 'Degraded' : 'Critical'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${systemHealth.overall === 'healthy' ? 'bg-green-100 dark:bg-green-900/20' :
                    systemHealth.overall === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-red-100 dark:bg-red-900/20'
                  }`}>
                  <Gauge className={`w-6 h-6 ${getStatusColor(systemHealth.overall)}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{systemHealth.services.healthy} Healthy</span>
                  <span className="text-yellow-600">{systemHealth.services.warning} Warning</span>
                  <span className="text-red-600">{systemHealth.services.critical} Critical</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                    {formatNumber(apiGatewayMetrics.totalRequests)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span>{apiGatewayMetrics.requestsPerSecond.toFixed(1)} req/s</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                    {apiGatewayMetrics.averageResponseTime}ms
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                  <span>12% improvement</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                    {apiGatewayMetrics.errorRate}%
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4 text-blue-500 mr-1" />
                  <span>Target: &lt;0.5%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Infrastructure Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'CPU Usage', value: systemHealth.infrastructure.cpu, icon: Cpu, color: 'blue' },
                { label: 'Memory Usage', value: systemHealth.infrastructure.memory, icon: HardDrive, color: 'green' },
                { label: 'Storage Usage', value: systemHealth.infrastructure.storage, icon: Database, color: 'purple' },
                { label: 'Network Usage', value: systemHealth.infrastructure.network, icon: Wifi, color: 'orange' }
              ].map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.label} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 text-${metric.color}-500`} />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}%</span>
                        <span className={`text-sm ${metric.value > 80 ? 'text-red-500' :
                            metric.value > 60 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                          {metric.value > 80 ? 'High' : metric.value > 60 ? 'Medium' : 'Normal'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${metric.value > 80 ? 'bg-red-500' :
                              metric.value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alerts Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h3>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-2 text-sm text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{systemHealth.alerts.critical} Critical</span>
                </span>
                <span className="flex items-center space-x-2 text-sm text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{systemHealth.alerts.warning} Warning</span>
                </span>
                <span className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{systemHealth.alerts.info} Info</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{systemHealth.alerts.critical}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Critical Alerts</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{systemHealth.alerts.warning}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Warning Alerts</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{systemHealth.alerts.info}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Info Alerts</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
