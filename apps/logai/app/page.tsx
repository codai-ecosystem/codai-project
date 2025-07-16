'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Shield, TrendingUp, Bell, Settings, Lock, Globe, Zap, Database, AlertTriangle, Eye } from 'lucide-react'
import { LogAIService, type LogStatistics, type Alert, type ServiceHealth } from '../services/logaiService'

export default function LogaiPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<LogStatistics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRealLogData()
  }, [])

  const loadRealLogData = async () => {
    setLoading(true)
    try {
      const logService = LogAIService.getInstance()
      const [statsData, alertsData, healthData] = await Promise.all([
        logService.getLogStatistics(),
        logService.getAlerts(),
        logService.getServiceHealth()
      ])
      setStats(statsData)
      setAlerts(alertsData)
      setServiceHealth(healthData)
    } catch (error) {
      console.error('Failed to load LogAI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'monitor', label: 'Monitor', icon: Eye }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'features':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Advanced AI Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 glassmorphism">
                <Lock className="w-8 h-8 text-blue-400 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Enterprise Security</h4>
                <p className="text-gray-300">Enterprise security features with threat detection</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 glassmorphism">
                <Globe className="w-8 h-8 text-green-400 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Global Scale</h4>
                <p className="text-gray-300">Worldwide infrastructure and monitoring</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 glassmorphism">
                <Database className="w-8 h-8 text-purple-400 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">High Performance</h4>
                <p className="text-gray-300">Lightning fast data processing and analysis</p>
              </div>
            </div>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Advanced Analytics Dashboard</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h4 className="text-lg font-bold text-white mb-4">Log Processing Rate</h4>
                <div className="text-3xl font-bold text-blue-400">2.4M/sec</div>
                <p className="text-gray-300 mt-2">Real-time log processing</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h4 className="text-lg font-bold text-white mb-4">Error Detection</h4>
                <div className="text-3xl font-bold text-red-400">99.2%</div>
                <p className="text-gray-300 mt-2">Accuracy in anomaly detection</p>
              </div>
            </div>
          </div>
        )

      case 'monitor':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">System Monitoring</h3>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Real-time Monitoring</span>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">AI-Powered Insights</span>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Threat Detection</span>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">System Status</span>
                  <span className="text-green-400 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center glassmorphism"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-4">
                Enterprise intelligent log management and analysis with AI-driven insights
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Experience the power of AI-driven technology with our advanced platform designed for modern businesses and developers.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 container">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 glassmorphism animate-pulse">
                    <div className="h-12 bg-white/10 rounded mb-4"></div>
                    <div className="h-6 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                ))
              ) : stats ? [
                {
                  icon: Users,
                  label: 'Total Logs',
                  value: (stats.totalLogs / 1000).toFixed(1) + 'K',
                  change: `${stats.errorRate.toFixed(1)}% errors`,
                  color: 'blue'
                },
                {
                  icon: TrendingUp,
                  label: 'Active Services',
                  value: serviceHealth.filter(s => s.status === 'healthy').length.toString(),
                  change: `${serviceHealth.length} total`,
                  color: 'green'
                },
                {
                  icon: Shield,
                  label: 'System Health',
                  value: `${Math.round(serviceHealth.reduce((acc, s) => acc + s.metrics.uptime, 0) / serviceHealth.length * 100) / 100}%`,
                  change: 'uptime',
                  color: 'blue'
                },
                {
                  icon: Bell,
                  label: 'Active Alerts',
                  value: alerts.filter(a => a.isActive).length.toString(),
                  change: `${alerts.length} total`,
                  color: alerts.filter(a => a.isActive).length > 0 ? 'red' : 'purple'
                }
              ] : [
                { icon: Users, label: 'Total Logs', value: '0', change: 'No data', color: 'gray' },
                { icon: TrendingUp, label: 'Active Services', value: '0', change: 'No data', color: 'gray' },
                { icon: Shield, label: 'System Health', value: '0%', change: 'No data', color: 'gray' },
                { icon: Bell, label: 'Active Alerts', value: '0', change: 'No data', color: 'gray' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 glassmorphism"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <div className={`flex items-center space-x-1 ${stat.change.startsWith('+') ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      <TrendingUp className="w-4 h-4 " />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-300 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 glassmorphism">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
                  <h4 className="text-lg font-bold text-white">Alert Management</h4>
                </div>
                <p className="text-gray-300">Real-time alerts and notifications for critical events</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Critical Alerts</span>
                    <span className="text-sm text-red-400">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Warnings</span>
                    <span className="text-sm text-yellow-400">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Info</span>
                    <span className="text-sm text-blue-400">45</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 glassmorphism">
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-blue-400 mr-3" />
                  <h4 className="text-lg font-bold text-white">Monitoring Status</h4>
                </div>
                <p className="text-gray-300">System health and performance monitoring</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="text-sm text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">CPU Usage</span>
                    <span className="text-sm text-green-400">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Memory</span>
                    <span className="text-sm text-green-400">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Storage</span>
                    <span className="text-sm text-yellow-400">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  LogAI
                </h1>
                <p className="text-sm text-gray-400">AI-Powered Logging Platform</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-sm text-gray-400">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 max-w-2xl mx-auto border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${activeTab === tab.id
                  ? 'bg-blue-500/30 text-blue-300 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {renderContent()}
        </motion.div>
      </div>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
