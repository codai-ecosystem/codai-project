// LogAI Dashboard - AI Logging & Analytics Platform Dashboard

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, AlertCircle, BarChart3, Database, Eye,
  TrendingUp, TrendingDown, Server, Bug, Clock,
  Zap, Shield, Filter, FileText, Users,
  ChevronUp, ChevronDown, ArrowRight, Search,
  Radio, Layers, Target, Bell
} from 'lucide-react'
import LogAILayout from '../layout/LogAILayout'
import { logaiService, LogEntry, LogStatistics, Alert, AnalyticsInsight, ServiceHealth } from '../services/logaiService'
import { cn } from '../utils'

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.3) rgba(15, 23, 42, 0.1);
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.1);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.5);
  }
`

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const flowVariants = {
  flow: {
    x: [-20, 20, -20],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Dashboard widgets component with enhanced glassmorphism
const DashboardWidget = ({
  title,
  children,
  className = "",
  icon: Icon,
  headerAction,
  variant = "default"
}: {
  title: string
  children: React.ReactNode
  className?: string
  icon?: any
  headerAction?: React.ReactNode
  variant?: "default" | "premium" | "danger" | "success"
}) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "premium":
        return "bg-gradient-to-br from-blue-950/60 via-indigo-950/50 to-purple-950/60 border-blue-400/30 shadow-lg shadow-blue-500/10"
      case "danger":
        return "bg-gradient-to-br from-red-950/60 via-rose-950/50 to-pink-950/60 border-red-400/30 shadow-lg shadow-red-500/10"
      case "success":
        return "bg-gradient-to-br from-green-950/60 via-emerald-950/50 to-teal-950/60 border-green-400/30 shadow-lg shadow-green-500/10"
      default:
        return "bg-gradient-to-br from-slate-950/60 via-blue-950/40 to-indigo-950/60 border-blue-500/20 shadow-lg shadow-blue-500/5"
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.005, y: -2 }}
      className={cn(
        "backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-xl",
        getVariantStyles(variant),
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {Icon && (
            <motion.div
              variants={pulseVariants}
              animate="pulse"
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
          )}
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
        {headerAction}
      </div>
      <div className="relative">
        {children}
        {/* Subtle animation overlay */}
        <motion.div
          variants={flowVariants}
          animate="flow"
          className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent rounded-full"
        />
      </div>
    </motion.div>
  )
}

// Enhanced system overview with real-time metrics
const SystemOverview = () => {
  const [stats, setStats] = useState<LogStatistics | null>(null)
  const [isRealTime, setIsRealTime] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await logaiService.getLogStatistics()
        setStats(data)
      } catch (error) {
        console.error('Error loading statistics:', error)
      }
    }

    loadStats()
    const interval = setInterval(loadStats, isRealTime ? 5000 : 30000)
    return () => clearInterval(interval)
  }, [isRealTime])

  if (!stats) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse h-24 bg-gradient-to-br from-slate-900/50 to-blue-900/50 rounded-xl" />
      ))}
    </div>
  )

  const metrics = [
    {
      label: 'Total Logs Today',
      value: stats.totalLogs.toLocaleString(),
      change: '+12.5%',
      positive: true,
      trend: [12, 19, 15, 25, 22, 18, 30],
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Error Rate',
      value: `${stats.errorRate}%`,
      change: '+0.3%',
      positive: false,
      trend: [2, 3, 2.5, 4, 3.2, 2.8, 3.5],
      icon: AlertCircle,
      color: 'red'
    },
    {
      label: 'Avg Response Time',
      value: `${stats.avgResponseTime}ms`,
      change: '-15ms',
      positive: true,
      trend: [150, 140, 155, 130, 125, 135, 120],
      icon: Zap,
      color: 'green'
    },
    {
      label: 'Active Services',
      value: Object.keys(stats.logsByService).length.toString(),
      change: '+2',
      positive: true,
      trend: [8, 9, 8, 10, 11, 10, 12],
      icon: Server,
      color: 'purple'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return { bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-400/20', text: 'text-blue-400', gradient: 'from-blue-400 to-indigo-500' }
      case 'red': return { bg: 'from-red-500/10 to-rose-500/10', border: 'border-red-400/20', text: 'text-red-400', gradient: 'from-red-400 to-rose-500' }
      case 'green': return { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-400/20', text: 'text-green-400', gradient: 'from-green-400 to-emerald-500' }
      case 'purple': return { bg: 'from-purple-500/10 to-violet-500/10', border: 'border-purple-400/20', text: 'text-purple-400', gradient: 'from-purple-400 to-violet-500' }
      default: return { bg: 'from-slate-500/10 to-gray-500/10', border: 'border-gray-400/20', text: 'text-gray-400', gradient: 'from-gray-400 to-slate-500' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: isRealTime ? 360 : 0 }}
            transition={{ duration: 2, repeat: isRealTime ? Infinity : 0, ease: "linear" }}
          >
            <Radio className="w-4 h-4 text-green-400" />
          </motion.div>
          <span className="text-sm text-green-400">Live Data</span>
        </div>
        <button
          onClick={() => setIsRealTime(!isRealTime)}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
            isRealTime
              ? "bg-green-500/20 text-green-400 border border-green-400/30"
              : "bg-gray-500/20 text-gray-400 border border-gray-400/30"
          )}
        >
          {isRealTime ? 'Real-time ON' : 'Real-time OFF'}
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const colors = getColorClasses(metric.color)
          const IconComponent = metric.icon

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={cn(
                "bg-gradient-to-br backdrop-blur-xl rounded-xl p-4 border transition-all duration-300 relative overflow-hidden",
                colors.bg, colors.border
              )}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <IconComponent className={cn("w-5 h-5", colors.text)} />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className={cn("w-2 h-2 rounded-full bg-gradient-to-r", colors.gradient)}
                  />
                </div>

                <div className={cn("text-xs font-medium uppercase tracking-wider mb-1 opacity-80", colors.text)}>
                  {metric.label}
                </div>

                <div className="text-2xl font-bold text-white mb-2">
                  {metric.value}
                </div>

                <div className="flex items-center justify-between">
                  <div className={cn(
                    "text-sm flex items-center font-medium",
                    metric.positive ? "text-green-400" : "text-red-400"
                  )}>
                    {metric.positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {metric.change}
                  </div>

                  {/* Mini sparkline */}
                  <div className="flex items-end space-x-1 h-6">
                    {metric.trend.map((value, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                        transition={{ delay: i * 0.1 }}
                        className={cn("w-1 bg-gradient-to-t rounded-full", colors.gradient)}
                        style={{ minHeight: '4px' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Real-time log streaming component
const RecentLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isStreaming, setIsStreaming] = useState(true)
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await logaiService.searchLogs({
          limit: 10,
          sortBy: 'timestamp',
          sortOrder: 'desc',
          levels: filter !== 'all' ? [filter] : undefined
        })
        setLogs(data.logs)
      } catch (error) {
        console.error('Error loading logs:', error)
      }
    }

    loadLogs()
    const interval = setInterval(loadLogs, isStreaming ? 2000 : 10000)
    return () => clearInterval(interval)
  }, [isStreaming, filter])

  const getLevelConfig = (level: LogEntry['level']) => {
    switch (level) {
      case 'debug': return {
        color: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        icon: Eye,
        pulse: 'shadow-gray-400/20'
      }
      case 'info': return {
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        icon: FileText,
        pulse: 'shadow-blue-400/20'
      }
      case 'warn': return {
        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        icon: AlertCircle,
        pulse: 'shadow-yellow-400/20'
      }
      case 'error': return {
        color: 'text-red-400 bg-red-400/10 border-red-400/20',
        icon: Bug,
        pulse: 'shadow-red-400/20'
      }
      case 'fatal': return {
        color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
        icon: AlertCircle,
        pulse: 'shadow-pink-400/20'
      }
      default: return {
        color: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
        icon: FileText,
        pulse: 'shadow-gray-400/20'
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={isStreaming ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isStreaming ? Infinity : 0, ease: "linear" }}
          >
            <Radio className={cn("w-4 h-4", isStreaming ? "text-green-400" : "text-gray-400")} />
          </motion.div>
          <span className={cn("text-sm", isStreaming ? "text-green-400" : "text-gray-400")}>
            {isStreaming ? 'Live Streaming' : 'Paused'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Level filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-slate-900/50 border border-blue-500/20 rounded-lg px-3 py-1 text-sm text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
          </select>

          {/* Stream toggle */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
              isStreaming
                ? "bg-green-500/20 text-green-400 border border-green-400/30"
                : "bg-gray-500/20 text-gray-400 border border-gray-400/30"
            )}
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {logs.map((log, index) => {
          const config = getLevelConfig(log.level)
          const IconComponent = config.icon

          return (
            <motion.div
              key={`${log.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="flex items-start space-x-3 p-4 bg-gradient-to-r from-slate-950/50 to-slate-900/30 backdrop-blur-sm rounded-xl border border-blue-500/10 hover:border-blue-400/20 transition-all duration-200 cursor-pointer group"
            >
              {/* Level indicator */}
              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  animate={isStreaming && index < 3 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase border backdrop-blur-sm",
                    config.color
                  )}
                >
                  {log.level}
                </motion.div>
                <IconComponent className={cn("w-4 h-4", config.color.split(' ')[0])} />
              </div>

              {/* Log content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">
                      {log.service}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                      {log.environment}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-blue-100 mb-2 group-hover:text-white transition-colors">
                  {log.message}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400 flex items-center">
                      <Server className="w-3 h-3 mr-1" />
                      {log.source}
                    </span>
                    {log.metadata?.userId && (
                      <span className="text-blue-400 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {log.metadata.userId}
                      </span>
                    )}
                  </div>
                  {log.metadata?.duration && (
                    <span className="text-blue-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {log.metadata.duration}ms
                    </span>
                  )}
                </div>
              </div>

              {/* Real-time indicator */}
              {isStreaming && index < 2 && (
                <motion.div
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {logs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-blue-400"
        >
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No logs found</p>
          <p className="text-sm opacity-80">
            {filter !== 'all' ? `No ${filter} level logs available` : 'Waiting for log data...'}
          </p>
        </motion.div>
      )}
    </div>
  )
}

// Active alerts component
const ActiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await logaiService.getAlerts()
        setAlerts(data.filter(alert => alert.isActive))
      } catch (error) {
        console.error('Error loading alerts:', error)
      }
    }

    loadAlerts()
  }, [])

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 5).map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-slate-950/30 rounded-lg border border-blue-800/20 hover:border-blue-600/30 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h4 className="font-medium text-blue-200">{alert.name}</h4>
            </div>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium uppercase border",
              getSeverityColor(alert.severity)
            )}>
              {alert.severity}
            </span>
          </div>

          <p className="text-sm text-blue-300/80 mb-2">
            {alert.description}
          </p>

          <div className="flex items-center justify-between text-xs text-blue-400">
            <span>Triggered {alert.triggerCount} times</span>
            {alert.lastTriggered && (
              <span>
                Last: {new Date(alert.lastTriggered).toLocaleTimeString()}
              </span>
            )}
          </div>
        </motion.div>
      ))}

      {alerts.length === 0 && (
        <div className="text-center py-8 text-blue-400">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active alerts</p>
        </div>
      )}
    </div>
  )
}

// Service health component
const ServiceHealthOverview = () => {
  const [services, setServices] = useState<ServiceHealth[]>([])

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await logaiService.getServiceHealth()
        setServices(data)
      } catch (error) {
        console.error('Error loading service health:', error)
      }
    }

    loadServices()
    const interval = setInterval(loadServices, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/10'
      case 'degraded': return 'text-yellow-400 bg-yellow-400/10'
      case 'unhealthy': return 'text-red-400 bg-red-400/10'
      case 'unknown': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-3">
      {services.map((service, index) => (
        <motion.div
          key={service.service}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg hover:bg-slate-950/50 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Server className="w-8 h-8 text-blue-400" />
              <motion.div
                className={cn(
                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full",
                  service.status === 'healthy' ? 'bg-green-400' :
                    service.status === 'degraded' ? 'bg-yellow-400' :
                      service.status === 'unhealthy' ? 'bg-red-400' : 'bg-gray-400'
                )}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <div className="font-medium text-blue-200 group-hover:text-blue-100 transition-colors">
                {service.service}
              </div>
              <div className="text-xs text-blue-400">
                Uptime: {service.metrics.uptime}%
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium uppercase",
              getStatusColor(service.status)
            )}>
              {service.status}
            </div>
            <div className="text-xs text-blue-400 mt-1">
              {service.metrics.errorRate}% error rate
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// AI insights component
const AIInsights = () => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await logaiService.getInsights()
        setInsights(data)
      } catch (error) {
        console.error('Error loading insights:', error)
      }
    }

    loadInsights()
  }, [])

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'pattern': return Layers
      case 'anomaly': return TrendingUp
      case 'trend': return BarChart3
      case 'correlation': return Target
      case 'prediction': return Eye
      default: return Zap
    }
  }

  const getImpactColor = (impact: AnalyticsInsight['impact']) => {
    switch (impact) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-blue-400'
    }
  }

  return (
    <div className="space-y-4">
      {insights.slice(0, 3).map((insight, index) => {
        const IconComponent = getInsightIcon(insight.type)

        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-lg border border-blue-500/20"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-blue-200">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={cn("text-xs font-medium", getImpactColor(insight.impact))}>
                      {insight.impact.toUpperCase()}
                    </span>
                    <span className="text-xs text-blue-400">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-blue-300/80 mb-2">
                  {insight.description}
                </p>
                <div className="text-xs text-blue-400">
                  Discovered {new Date(insight.discoveredAt).toLocaleString()}
                </div>
              </div>
            </div>

            {insight.recommendations.length > 0 && (
              <div className="bg-slate-950/30 rounded-lg p-3">
                <h5 className="text-xs font-medium text-blue-300 mb-2">Recommendations:</h5>
                <ul className="space-y-1">
                  {insight.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} className="text-xs text-blue-400 flex items-start">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default function LogAIDashboard() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <LogAILayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gradient-to-r from-slate-950/50 to-blue-950/50 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gradient-to-br from-slate-950/50 to-blue-950/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </LogAILayout>
    )
  }

  return (
    <LogAILayout>
      <style jsx global>{scrollbarStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 p-6 space-y-8"
        >
          {/* Enhanced Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                LogAI Dashboard
              </h1>
              <p className="text-blue-400 text-lg">AI-powered log analysis and system monitoring platform</p>
              <div className="flex items-center space-x-4 text-sm text-blue-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>System Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{currentTime.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick actions */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                <span>Search Logs</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Radio className="w-4 h-4" />
                <span>Live Stream</span>
              </motion.button>
            </div>
          </motion.div>

          {/* System Overview */}
          <DashboardWidget title="System Overview" icon={BarChart3} variant="premium">
            <SystemOverview />
          </DashboardWidget>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Real-time Logs - Takes up 2 columns */}
            <div className="xl:col-span-2">
              <DashboardWidget
                title="Real-time Log Stream"
                icon={Radio}
                variant="premium"
                headerAction={
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center font-medium"
                  >
                    Open in Full View <ArrowRight className="w-4 h-4 ml-1" />
                  </motion.button>
                }
              >
                <RecentLogs />
              </DashboardWidget>
            </div>

            {/* Side panels */}
            <div className="space-y-8">
              {/* Service Health */}
              <DashboardWidget title="Service Health" icon={Server} variant="success">
                <ServiceHealthOverview />
              </DashboardWidget>

              {/* Active Alerts */}
              <DashboardWidget title="Active Alerts" icon={AlertCircle} variant="danger">
                <ActiveAlerts />
              </DashboardWidget>
            </div>
          </div>

          {/* AI Insights Section */}
          <DashboardWidget
            title="AI-Powered Insights"
            icon={Zap}
            variant="premium"
            headerAction={
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center font-medium"
              >
                View All Insights <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            }
          >
            <AIInsights />
          </DashboardWidget>

          {/* Enhanced Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {[
              { name: 'Advanced Search', icon: Search, color: 'blue', description: 'Query logs with filters' },
              { name: 'Create Alert', icon: Bell, color: 'red', description: 'Set up monitoring alerts' },
              { name: 'Error Analysis', icon: Bug, color: 'orange', description: 'Analyze error patterns' },
              { name: 'Live Stream', icon: Radio, color: 'green', description: 'Real-time log monitoring' },
              { name: 'Performance', icon: TrendingUp, color: 'purple', description: 'System performance metrics' },
              { name: 'Reports', icon: FileText, color: 'indigo', description: 'Generate log reports' }
            ].map((action, index) => {
              const colorMap = {
                blue: { bg: 'from-blue-600/20 to-indigo-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
                red: { bg: 'from-red-600/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-400' },
                orange: { bg: 'from-orange-600/20 to-amber-600/20', border: 'border-orange-500/30', text: 'text-orange-400' },
                green: { bg: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30', text: 'text-green-400' },
                purple: { bg: 'from-purple-600/20 to-violet-600/20', border: 'border-purple-500/30', text: 'text-purple-400' },
                indigo: { bg: 'from-indigo-600/20 to-blue-600/20', border: 'border-indigo-500/30', text: 'text-indigo-400' }
              } as const

              const colorConfig = colorMap[action.color as keyof typeof colorMap] || colorMap.blue

              return (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 group bg-gradient-to-br text-left",
                    colorConfig.bg, colorConfig.border
                  )}
                >
                  <action.icon className={cn("w-8 h-8 mb-3", colorConfig.text)} />
                  <div className="text-sm font-semibold text-white mb-1 group-hover:text-blue-100 transition-colors">
                    {action.name}
                  </div>
                  <div className={cn("text-xs opacity-80", colorConfig.text)}>
                    {action.description}
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </LogAILayout>
  )
}
