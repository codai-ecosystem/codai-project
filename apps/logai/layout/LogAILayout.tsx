// LogAI Layout Component - AI Logging & Analytics Platform Layout

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../utils'
import {
  Activity, AlertCircle, BarChart3, Database, Eye,
  Search, Bell, User, Settings, Menu, X,
  FileText, Zap, Shield, Clock, Filter,
  Server, Bug, TrendingUp, Layers, Radio
} from 'lucide-react'

// LogAI-specific navigation items with logging platform focus
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: BarChart3, color: 'text-blue-400' },
  { name: 'Logs', href: '/logs', icon: FileText, color: 'text-green-400' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'text-purple-400' },
  { name: 'Alerts', href: '/alerts', icon: AlertCircle, color: 'text-red-400' },
  { name: 'Services', href: '/services', icon: Server, color: 'text-cyan-400' },
  { name: 'Patterns', href: '/patterns', icon: Layers, color: 'text-orange-400' },
  { name: 'Insights', href: '/insights', icon: Zap, color: 'text-yellow-400' },
  { name: 'Streams', href: '/streams', icon: Radio, color: 'text-indigo-400' }
]

// Quick action items for logging platform
const quickActions = [
  { name: 'Search Logs', icon: Search, color: 'text-blue-400', action: 'search' },
  { name: 'Create Alert', icon: AlertCircle, color: 'text-red-400', action: 'alert' },
  { name: 'View Errors', icon: Bug, color: 'text-orange-400', action: 'errors' },
  { name: 'Live Stream', icon: Radio, color: 'text-green-400', action: 'stream' }
]

interface LogAILayoutProps {
  children: React.ReactNode
}

export default function LogAILayout({ children }: LogAILayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [notifications, setNotifications] = useState(7)
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error' | 'maintenance'>('healthy')

  useEffect(() => {
    setMounted(true)

    // Simulate real-time system status updates
    const checkSystemStatus = () => {
      const statuses: Array<'healthy' | 'warning' | 'error' | 'maintenance'> = ['healthy', 'warning', 'error', 'maintenance']
      const weights = [0.7, 0.2, 0.08, 0.02] // Probability weights

      let random = Math.random()
      let selectedStatus = 'healthy'

      for (let i = 0; i < statuses.length; i++) {
        if (random < weights[i]) {
          selectedStatus = statuses[i]
          break
        }
        random -= weights[i]
      }

      setSystemStatus(selectedStatus as any)
    }

    checkSystemStatus()
    const interval = setInterval(checkSystemStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return null
  }

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      case 'maintenance': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getSystemStatusText = () => {
    switch (systemStatus) {
      case 'healthy': return 'All Systems Operational'
      case 'warning': return 'Minor Issues Detected'
      case 'error': return 'Critical Issues'
      case 'maintenance': return 'Maintenance Mode'
      default: return 'Unknown Status'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-blue-800/30 to-indigo-900/20" />

        {/* Animated data flow patterns */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-500/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Log stream pattern */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-indigo-400/30 to-cyan-500/20"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 border-b border-blue-800/30 backdrop-blur-xl bg-slate-950/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and System Status */}
            <div className="flex items-center space-x-6">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">
                    LogAI
                  </h1>
                  <p className="text-xs text-blue-300/70">Logging & Analytics</p>
                </div>
              </motion.div>

              {/* System Status */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950/50 border border-blue-800/30">
                <motion.div
                  className={cn("w-2 h-2 rounded-full", getSystemStatusColor())}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className={cn("text-xs font-medium", getSystemStatusColor())}>
                  {getSystemStatusText()}
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search logs, services, errors..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/30 border border-blue-800/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions - Desktop */}
              <div className="hidden lg:flex items-center space-x-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-slate-950/30 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-200 group"
                    title={action.name}
                  >
                    <action.icon className={cn("w-4 h-4", action.color)} />
                  </motion.button>
                ))}
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg bg-slate-950/30 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-200"
              >
                <Bell className="w-5 h-5 text-blue-400" />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-slate-950/30 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-200"
              >
                <User className="w-5 h-5 text-blue-400" />
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-950/30 border border-blue-800/30"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-blue-400" />
                ) : (
                  <Menu className="w-5 h-5 text-blue-400" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="hidden md:flex w-64 flex-col border-r border-blue-800/30 backdrop-blur-xl bg-slate-950/30"
        >
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveItem(item.name)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeItem === item.name
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "hover:bg-slate-950/50 border border-transparent hover:border-blue-800/30"
                )}
              >
                <item.icon className={cn("w-5 h-5", item.color, activeItem === item.name ? "scale-110" : "")} />
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  activeItem === item.name ? "text-blue-300" : "text-blue-200 group-hover:text-blue-300"
                )}>
                  {item.name}
                </span>
                {activeItem === item.name && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                  />
                )}
              </motion.a>
            ))}
          </nav>

          {/* System Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 border-t border-blue-800/30"
          >
            <div className="bg-gradient-to-br from-slate-950/50 to-blue-950/50 rounded-xl p-4 border border-blue-800/30">
              <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                System Metrics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-400">Total Logs</span>
                  <span className="text-sm font-bold text-blue-300">125,890</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-400">Error Rate</span>
                  <span className="text-sm font-bold text-red-400">2.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-400">Active Alerts</span>
                  <span className="text-sm font-bold text-yellow-400">5</span>
                </div>
                <div className="w-full bg-slate-950/50 rounded-full h-2 mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ delay: 0.8, duration: 1.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.aside>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 h-full bg-slate-950/95 backdrop-blur-xl border-r border-blue-800/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-blue-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-blue-300">LogAI</h1>
                      <p className="text-xs text-blue-400">Logging & Analytics</p>
                    </div>
                  </div>
                </div>

                <nav className="p-4 space-y-2">
                  {navigationItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setActiveItem(item.name)
                        setIsMenuOpen(false)
                      }}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                        activeItem === item.name
                          ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30"
                          : "hover:bg-slate-950/50 border border-transparent"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", item.color)} />
                      <span className="font-medium text-blue-200">{item.name}</span>
                    </motion.a>
                  ))}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-full overflow-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Alert Notifications */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-slate-900/90 to-blue-900/90 backdrop-blur-xl border border-blue-700/50 rounded-xl p-4 shadow-2xl shadow-blue-500/10 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-200">Alert Triggered</p>
                <p className="text-xs text-blue-300/70">High error rate detected in auth service</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
