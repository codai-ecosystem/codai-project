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
      // Set fallback data to prevent app from crashing
      setStats({
        totalLogs: 0,
        logsByLevel: { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 },
        logsByService: {},
        logsByEnvironment: { development: 0, staging: 0, production: 0 },
        errorRate: 0,
        avgResponseTime: 0,
        timeRange: { start: new Date(), end: new Date() },
        trends: { hourly: [], daily: [] }
      })
      setAlerts([])
      setServiceHealth([])
    } finally {
      setLoading(false)
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

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              Enterprise intelligent log management and analysis with AI-driven insights
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Experience the power of AI-driven technology with our advanced platform designed for modern businesses and developers.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-pulse">
                  <div className="h-12 bg-white/10 rounded mb-4"></div>
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              [
                {
                  icon: Users,
                  label: 'Total Logs',
                  value: stats ? (stats.totalLogs / 1000).toFixed(1) + 'K' : '0',
                  change: stats ? `${stats.errorRate.toFixed(1)}% errors` : 'No data',
                  color: 'blue'
                },
                {
                  icon: TrendingUp,
                  label: 'Active Services',
                  value: serviceHealth ? serviceHealth.filter(s => s.status === 'healthy').length.toString() : '0',
                  change: serviceHealth ? `${serviceHealth.length} total` : 'No data',
                  color: 'green'
                },
                {
                  icon: Shield,
                  label: 'System Health',
                  value: serviceHealth && serviceHealth.length > 0 ? 
                    `${Math.round(serviceHealth.reduce((acc, s) => acc + s.metrics.uptime, 0) / serviceHealth.length)}%` : '0%',
                  change: 'uptime',
                  color: 'blue'
                },
                {
                  icon: Bell,
                  label: 'Active Alerts',
                  value: alerts ? alerts.filter(a => a.isActive).length.toString() : '0',
                  change: alerts ? `${alerts.length} total` : 'No data',
                  color: alerts && alerts.filter(a => a.isActive).length > 0 ? 'red' : 'purple'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-300 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Status Message */}
          <motion.div
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">LogAI is Online and Working!</span>
            </div>
            <p className="text-green-300 text-sm">AI-powered log analysis system is operational</p>
          </motion.div>
        </div>
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
