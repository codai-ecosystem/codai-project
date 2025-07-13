'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Monitor,
  Settings,
  Plus,
  Grid3X3,
  Filter,
  Download,
  Share2,
  Eye,
  Edit3,
  Trash2,
  Bell,
  Calendar,
  Database,
  Refresh,
  Maximize2,
  Minimize2,
  MoreVertical,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

interface DashLayoutProps {
  children?: React.ReactNode
  className?: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href?: string
  children?: SidebarItem[]
  badge?: number
  active?: boolean
}

interface QuickStat {
  id: string
  label: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<any>
  color: string
}

interface RecentActivity {
  id: string
  action: string
  target: string
  user: string
  timestamp: Date
  type: 'create' | 'update' | 'delete' | 'view' | 'share'
}

const DashLayout: React.FC<DashLayoutProps> = ({ children, className = '' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeView, setActiveView] = useState('dashboards')
  const [quickStats, setQuickStats] = useState<QuickStat[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [notifications, setNotifications] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: BarChart3,
      active: activeView === 'dashboards'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: LineChart,
      children: [
        { id: 'overview', label: 'Overview', icon: Monitor },
        { id: 'metrics', label: 'Metrics', icon: Activity },
        { id: 'reports', label: 'Reports', icon: Calendar }
      ]
    },
    {
      id: 'data',
      label: 'Data Sources',
      icon: Database,
      badge: 12
    },
    {
      id: 'widgets',
      label: 'Widget Library',
      icon: Grid3X3
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: notifications
    },
    {
      id: 'users',
      label: 'Users & Access',
      icon: Users
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ]

  useEffect(() => {
    // Load quick stats
    setQuickStats([
      {
        id: 'total-dashboards',
        label: 'Total Dashboards',
        value: 24,
        change: 12,
        changeType: 'increase',
        icon: BarChart3,
        color: 'blue'
      },
      {
        id: 'active-users',
        label: 'Active Users',
        value: '1.2K',
        change: 8.5,
        changeType: 'increase',
        icon: Users,
        color: 'green'
      },
      {
        id: 'data-sources',
        label: 'Data Sources',
        value: 12,
        change: 2,
        changeType: 'increase',
        icon: Database,
        color: 'purple'
      },
      {
        id: 'alerts',
        label: 'Active Alerts',
        value: 3,
        change: -1,
        changeType: 'decrease',
        icon: AlertTriangle,
        color: 'orange'
      }
    ])

    // Load recent activity
    setRecentActivity([
      {
        id: '1',
        action: 'Created dashboard',
        target: 'Sales Performance Q4',
        user: 'John Doe',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'create'
      },
      {
        id: '2',
        action: 'Updated widget',
        target: 'Revenue Chart',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        type: 'update'
      },
      {
        id: '3',
        action: 'Shared dashboard',
        target: 'Marketing Metrics',
        user: 'Mike Johnson',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        type: 'share'
      },
      {
        id: '4',
        action: 'Connected data source',
        target: 'PostgreSQL Production',
        user: 'Sarah Wilson',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'create'
      }
    ])

    setNotifications(3)
  }, [])

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'create': return Plus
      case 'update': return Edit3
      case 'delete': return Trash2
      case 'view': return Eye
      case 'share': return Share2
      default: return Activity
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

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>

              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dash Analytics</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Visual Dashboard Platform</p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Global Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Refresh Data"
                >
                  <Refresh className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Filters"
                >
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </motion.button>
              </div>

              {/* Primary Actions */}
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Dashboard</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {!isFullscreen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: sidebarCollapsed ? -230 : 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 ${sidebarCollapsed ? 'w-16' : 'w-64'
                }`}
            >
              <div className="flex flex-col h-full">
                {/* Quick Stats */}
                {!sidebarCollapsed && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {quickStats.map((stat) => {
                        const IconComponent = stat.icon
                        return (
                          <motion.div
                            key={stat.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <IconComponent className={`w-4 h-4 text-${stat.color}-500`} />
                              <span className={`text-xs ${stat.changeType === 'increase' ? 'text-green-500' :
                                  stat.changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {stat.change > 0 ? '+' : ''}{stat.change}%
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {stat.value}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {stat.label}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {sidebarItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <div key={item.id}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveView(item.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${item.active
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            {!sidebarCollapsed && (
                              <span className="font-medium">{item.label}</span>
                            )}
                          </div>
                          {!sidebarCollapsed && item.badge && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </motion.button>

                        {/* Sub-items */}
                        {!sidebarCollapsed && item.children && (
                          <div className="ml-8 mt-2 space-y-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon
                              return (
                                <motion.button
                                  key={child.id}
                                  whileHover={{ scale: 1.02 }}
                                  className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                >
                                  <ChildIcon className="w-4 h-4" />
                                  <span>{child.label}</span>
                                </motion.button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>

                {/* Recent Activity */}
                {!sidebarCollapsed && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Recent Activity</span>
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {recentActivity.slice(0, 4).map((activity) => {
                        const ActivityIcon = getActivityIcon(activity.type)
                        return (
                          <motion.div
                            key={activity.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                          >
                            <div className="flex items-start space-x-2">
                              <ActivityIcon className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-900 dark:text-white truncate">
                                  {activity.action}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                  {activity.target}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${isFullscreen ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}
          style={{ marginTop: '4rem' }}
        >
          <div className="p-6">
            {/* Content Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and visualize your data with powerful analytics
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 z-30">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>System Status: Operational</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span>Real-time Updates: Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              <span>Data Sync: 99.9%</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            <span>Version 2.1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashLayout
