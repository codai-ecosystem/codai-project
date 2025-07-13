'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Database,
  Brain,
  Zap,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Activity,
  Target,
  Layers,
  GitBranch,
  Eye,
  Calendar,
  FileText
} from 'lucide-react'

interface AnalizAILayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
  isActive?: boolean
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error'
  message: string
  lastUpdate: Date
}

export default function AnalizAILayout({ children }: AnalizAILayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    message: 'All systems operational',
    lastUpdate: new Date()
  })
  const [realtimeData, setRealtimeData] = useState({
    activeAnalytics: 847,
    processingJobs: 23,
    dataIngestion: 1250,
    modelAccuracy: 94.7
  })

  // Navigation items for AnalizAI
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/dashboard',
      isActive: activeSection === 'dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <LineChart className="w-5 h-5" />,
      path: '/analytics',
      isActive: activeSection === 'analytics'
    },
    {
      id: 'datasets',
      label: 'Data Sources',
      icon: <Database className="w-5 h-5" />,
      path: '/datasets',
      badge: 12,
      isActive: activeSection === 'datasets'
    },
    {
      id: 'models',
      label: 'ML Models',
      icon: <Brain className="w-5 h-5" />,
      path: '/models',
      badge: 5,
      isActive: activeSection === 'models'
    },
    {
      id: 'pipelines',
      label: 'Data Pipelines',
      icon: <GitBranch className="w-5 h-5" />,
      path: '/pipelines',
      isActive: activeSection === 'pipelines'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      path: '/reports',
      badge: 3,
      isActive: activeSection === 'reports'
    },
    {
      id: 'visualizations',
      label: 'Visualizations',
      icon: <PieChart className="w-5 h-5" />,
      path: '/visualizations',
      isActive: activeSection === 'visualizations'
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: <Zap className="w-5 h-5" />,
      path: '/insights',
      badge: 8,
      isActive: activeSection === 'insights'
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: <Activity className="w-5 h-5" />,
      path: '/monitoring',
      isActive: activeSection === 'monitoring'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings',
      isActive: activeSection === 'settings'
    }
  ]

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        activeAnalytics: prev.activeAnalytics + Math.floor(Math.random() * 10) - 5,
        processingJobs: Math.max(0, prev.processingJobs + Math.floor(Math.random() * 6) - 3),
        dataIngestion: prev.dataIngestion + Math.floor(Math.random() * 100) - 50,
        modelAccuracy: Math.min(100, Math.max(85, prev.modelAccuracy + (Math.random() - 0.5) * 0.2))
      }))

      // Simulate system status updates
      if (Math.random() < 0.1) {
        const statuses = [
          { status: 'healthy' as const, message: 'All systems operational' },
          { status: 'warning' as const, message: 'High data processing load' },
          { status: 'healthy' as const, message: 'Model training completed' }
        ]
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
        setSystemStatus({
          ...randomStatus,
          lastUpdate: new Date()
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400'
      case 'warning': return 'text-amber-400'
      case 'error': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-full bg-slate-900/50 backdrop-blur-xl border-r border-purple-500/20 z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
          }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      AnalizAI
                    </h1>
                    <p className="text-xs text-slate-400">Analytics Platform</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Layers className="w-5 h-5 text-purple-400" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${item.isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-white'
                  : 'hover:bg-purple-500/10 text-slate-300 hover:text-white'
                }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={`${item.isActive ? 'text-purple-400' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center justify-between flex-1"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>

        {/* System Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-3 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/20"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={getStatusColor(systemStatus.status)}>
                    {getStatusIcon(systemStatus.status)}
                  </div>
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{systemStatus.message}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Active:</span>
                    <span className="text-purple-400 ml-1">{realtimeData.activeAnalytics}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Jobs:</span>
                    <span className="text-indigo-400 ml-1">{realtimeData.processingJobs}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rate:</span>
                    <span className="text-emerald-400 ml-1">{realtimeData.dataIngestion}/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-cyan-400 ml-1">{realtimeData.modelAccuracy.toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Header */}
        <header className="bg-slate-900/30 backdrop-blur-xl border-b border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">
                    AI Analytics Platform
                  </h2>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-400">Port 4056</span>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search analytics..."
                  className="pl-10 pr-4 py-2 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/70 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-slate-800/50 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-purple-400" />
                </button>
                <button className="p-2 bg-slate-800/50 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-indigo-400" />
                </button>
                <button className="p-2 bg-slate-800/50 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                </button>
                <button className="p-2 bg-slate-800/50 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors relative">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    3
                  </span>
                </button>
              </div>

              {/* Real-time Indicators */}
              <div className="flex items-center space-x-4 pl-4 border-l border-purple-500/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-300">Live Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400">{realtimeData.processingJobs} jobs</span>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Active Analytics</p>
                  <p className="text-lg font-bold text-purple-400">{realtimeData.activeAnalytics.toLocaleString()}</p>
                </div>
                <Users className="w-6 h-6 text-purple-400/60" />
              </div>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Processing Jobs</p>
                  <p className="text-lg font-bold text-indigo-400">{realtimeData.processingJobs}</p>
                </div>
                <RefreshCw className="w-6 h-6 text-indigo-400/60" />
              </div>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Data Ingestion</p>
                  <p className="text-lg font-bold text-emerald-400">{realtimeData.dataIngestion}/s</p>
                </div>
                <Database className="w-6 h-6 text-emerald-400/60" />
              </div>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Model Accuracy</p>
                  <p className="text-lg font-bold text-cyan-400">{realtimeData.modelAccuracy.toFixed(1)}%</p>
                </div>
                <Target className="w-6 h-6 text-cyan-400/60" />
              </div>
            </div>
          </motion.div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="min-h-[calc(100vh-200px)]"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Play className="w-6 h-6 text-white" />
      </motion.button>

      {/* Data Stream Visualization */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/20 via-indigo-500/40 to-purple-500/20 overflow-hidden">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

export { AnalizAILayout }
