'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Server,
  Monitor,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Eye,
  UserCheck,
  Lock,
  FileText,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  Calendar,
  Globe,
  Zap,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import AdminService from '../lib/admin-service'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  trend?: 'up' | 'down' | 'neutral'
}

const MetricCard = ({ title, value, change, icon, color, trend }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {change !== undefined && (
          <div className="flex items-center mt-2 space-x-1">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
            {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400" />}
            <span className={`text-sm ${trend === 'up' ? 'text-green-400' :
                trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
)

interface AlertItemProps {
  alert: {
    id: string
    type: string
    severity: string
    title: string
    message: string
    timestamp: Date
    acknowledged: boolean
  }
  onAcknowledge: (id: string) => void
}

const AlertItem = ({ alert, onAcknowledge }: AlertItemProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/30 text-red-400'
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      case 'info': return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />
      case 'performance': return <Activity className="w-4 h-4" />
      case 'system': return <Server className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${alert.acknowledged ? 'opacity-60' : ''
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            {getTypeIcon(alert.type)}
          </div>
          <div>
            <h4 className="font-medium text-white">{alert.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-gray-400">
                {alert.timestamp.toLocaleString()}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-white/10">
                {alert.type}
              </span>
            </div>
          </div>
        </div>
        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </motion.div>
  )
}

interface SystemStatusProps {
  status: 'healthy' | 'warning' | 'critical'
  checks: Array<{
    name: string
    status: 'pass' | 'fail'
    message?: string
  }>
}

const SystemStatus = ({ status, checks }: SystemStatusProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'critical': return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">System Health</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <span className="font-medium capitalize">{status}</span>
        </div>
      </div>

      <div className="space-y-4">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${check.status === 'pass' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              <span className="text-white font-medium">{check.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {check.status === 'pass' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${check.status === 'pass' ? 'text-green-400' : 'text-red-400'
                }`}>
                {check.status === 'pass' ? 'Healthy' : 'Failed'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Status</span>
        </button>
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [adminService] = useState(() => AdminService)
  const [metrics, setMetrics] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [securityMetrics, setSecurityMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [
        metricsData,
        healthData,
        alertsData,
        usersData,
        performanceMetrics,
        securityData
      ] = await Promise.all([
        adminService.getSystemMetrics(),
        adminService.getSystemHealth(),
        adminService.getSystemAlerts({ limit: 5 }),
        adminService.getUsers({ limit: 5 }),
        adminService.getPerformanceMetrics(selectedTimeframe),
        adminService.getSecurityMetrics()
      ])

      setMetrics(metricsData)
      setSystemHealth(healthData)
      setRecentAlerts(alertsData.alerts)
      setRecentUsers(usersData.users)
      setPerformanceData(performanceMetrics)
      setSecurityMetrics(securityData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await adminService.acknowledgeAlert(alertId)
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return bytes + ' B'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">System overview and management controls</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500/50"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={formatNumber(metrics?.totalUsers || 0)}
          change={8.2}
          trend="up"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500/20"
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(metrics?.activeUsers || 0)}
          change={-2.1}
          trend="down"
          icon={<UserCheck className="w-6 h-6 text-white" />}
          color="bg-green-500/20"
        />
        <MetricCard
          title="System Uptime"
          value={`${metrics?.systemUptime?.toFixed(1) || 0}%`}
          change={0.1}
          trend="up"
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-purple-500/20"
        />
        <MetricCard
          title="Revenue"
          value={`$${(metrics?.revenue || 0).toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-yellow-500/20"
        />
      </div>

      {/* System Status and Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        {systemHealth && (
          <SystemStatus
            status={systemHealth.status}
            checks={systemHealth.checks}
          />
        )}

        {/* Resource Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Resource Usage</h3>

          <div className="space-y-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">CPU Usage</span>
                </div>
                <span className="text-sm text-gray-400">{metrics?.cpuUsage?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics?.cpuUsage || 0}%` }}
                  transition={{ duration: 1 }}
                  className="bg-blue-400 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Memory Usage</span>
                </div>
                <span className="text-sm text-gray-400">{metrics?.memoryUsage?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics?.memoryUsage || 0}%` }}
                  transition={{ duration: 1 }}
                  className="bg-green-400 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">Disk Usage</span>
                </div>
                <span className="text-sm text-gray-400">{metrics?.diskUsage?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics?.diskUsage || 0}%` }}
                  transition={{ duration: 1 }}
                  className="bg-purple-400 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Network Traffic */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-white">Network Traffic</span>
                </div>
                <span className="text-sm text-gray-400">{formatBytes(metrics?.networkTraffic || 0)}/s</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metrics?.networkTraffic || 0) / 1000000 * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                  className="bg-orange-400 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Performance</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Response Time</p>
                <p className="text-lg font-semibold text-white">{metrics?.responseTime?.toFixed(0)}ms</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Error Rate</p>
                <p className="text-lg font-semibold text-white">{((metrics?.errorRate || 0) * 100).toFixed(2)}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Daily Logins</p>
                <p className="text-lg font-semibold text-white">{formatNumber(metrics?.dailyLogins || 0)}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-lg font-semibold text-white">{metrics?.conversionRate?.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Security Overview</h3>
            <Shield className="w-5 h-5 text-red-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Failed Logins</span>
              </div>
              <p className="text-2xl font-bold text-white">{securityMetrics?.failedLogins || 0}</p>
            </div>

            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Suspicious</span>
              </div>
              <p className="text-2xl font-bold text-white">{securityMetrics?.suspiciousActivities || 0}</p>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Blocked IPs</span>
              </div>
              <p className="text-2xl font-bold text-white">{securityMetrics?.blockedIPs || 0}</p>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Scans</span>
              </div>
              <p className="text-2xl font-bold text-white">{securityMetrics?.securityScans || 0}</p>
            </div>
          </div>

          {securityMetrics?.vulnerabilities && securityMetrics.vulnerabilities.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-white mb-3">Active Vulnerabilities</h4>
              <div className="space-y-2">
                {securityMetrics.vulnerabilities.slice(0, 3).map((vuln: any) => (
                  <div key={vuln.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-sm text-gray-300">{vuln.description}</span>
                    <span className={`text-xs px-2 py-1 rounded ${vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                      }`}>
                      {vuln.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{recentAlerts.length} alerts</span>
              <Bell className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          <div className="space-y-4">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledgeAlert}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">No active alerts</p>
                <p className="text-sm text-gray-500 mt-1">All systems operating normally</p>
              </div>
            )}
          </div>

          {recentAlerts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <button className="w-full text-center text-sm text-red-400 hover:text-red-300 transition-colors">
                View All Alerts
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Users and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Users</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>

          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                    {user.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All Users
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Manage Users</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors"
            >
              <Database className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Backup System</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors"
            >
              <Settings className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">System Config</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Generate Report</span>
            </motion.button>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last system backup</span>
              <span className="text-sm text-white">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-400">Next scheduled backup</span>
              <span className="text-sm text-white">In 22 hours</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
