'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Users,
  BarChart3,
  Settings,
  FileText,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Lock,
  Activity,
  Database,
  AlertTriangle,
  UserCheck,
  Eye,
  Calendar,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Filter,
  RefreshCw,
  LogOut,
  User,
  HelpCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Wifi,
  Server,
  Monitor
} from 'lucide-react'
import AdminService from '../lib/admin-service'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [adminService] = useState(() => AdminService)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      const [alertsData, healthData] = await Promise.all([
        adminService.getSystemAlerts({ limit: 5 }),
        adminService.getSystemHealth()
      ])

      setSystemAlerts(alertsData.alerts)
      setSystemHealth(healthData)
    } catch (error) {
      console.error('Failed to load system data:', error)
    }
  }

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'System overview and metrics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage users, roles, and permissions',
      subItems: [
        { id: 'users-list', label: 'All Users', icon: <Users className="w-4 h-4" /> },
        { id: 'users-roles', label: 'Roles & Permissions', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'users-activity', label: 'User Activity', icon: <Activity className="w-4 h-4" /> }
      ]
    },
    {
      id: 'security',
      label: 'Security Center',
      icon: <Shield className="w-5 h-5" />,
      description: 'Security monitoring and controls',
      subItems: [
        { id: 'security-alerts', label: 'Security Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'security-audit', label: 'Audit Logs', icon: <Eye className="w-4 h-4" /> },
        { id: 'security-config', label: 'Security Config', icon: <Lock className="w-4 h-4" /> }
      ]
    },
    {
      id: 'system',
      label: 'System Monitor',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Performance and health monitoring',
      subItems: [
        { id: 'system-health', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
        { id: 'system-metrics', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'system-logs', label: 'System Logs', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      id: 'backup',
      label: 'Backup & Recovery',
      icon: <Database className="w-5 h-5" />,
      description: 'Data backup and recovery management',
      subItems: [
        { id: 'backup-status', label: 'Backup Status', icon: <CheckCircle className="w-4 h-4" /> },
        { id: 'backup-schedule', label: 'Backup Schedule', icon: <Calendar className="w-4 h-4" /> },
        { id: 'backup-restore', label: 'Restore Data', icon: <Upload className="w-4 h-4" /> }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <FileText className="w-5 h-5" />,
      description: 'Generate and manage reports',
      subItems: [
        { id: 'reports-list', label: 'All Reports', icon: <FileText className="w-4 h-4" /> },
        { id: 'reports-scheduled', label: 'Scheduled Reports', icon: <Calendar className="w-4 h-4" /> },
        { id: 'reports-custom', label: 'Custom Reports', icon: <Plus className="w-4 h-4" /> }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'System configuration and preferences',
      subItems: [
        { id: 'settings-general', label: 'General Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'settings-email', label: 'Email Settings', icon: <Globe className="w-4 h-4" /> },
        { id: 'settings-api', label: 'API Configuration', icon: <Server className="w-4 h-4" /> }
      ]
    }
  ]

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/30 text-red-400'
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      case 'info': return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-400/10 via-transparent to-transparent"></div>

      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="fixed top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl"
      />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 h-full w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 z-40"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    <p className="text-sm text-gray-400">System Management</p>
                  </div>
                </div>
              </div>

              {/* System Health Status */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">System Health</span>
                  {systemHealth && getHealthStatusIcon(systemHealth.status)}
                </div>
                {systemHealth && (
                  <div className="space-y-2">
                    {systemHealth.checks.slice(0, 3).map((check: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{check.name}</span>
                        <div className={`w-2 h-2 rounded-full ${check.status === 'pass' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeSection === item.id
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <div className={`${activeSection === item.id ? 'text-red-400' : 'text-gray-500 group-hover:text-red-400'
                        } transition-colors`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      {item.subItems && (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </motion.button>

                    {/* Sub Items */}
                    {item.subItems && activeSection === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-2 ml-4 space-y-1"
                      >
                        {item.subItems.map((subItem) => (
                          <motion.button
                            key={subItem.id}
                            whileHover={{ x: 2 }}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                          >
                            {subItem.icon}
                            <span className="text-sm">{subItem.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="p-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    title="Refresh System"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    title="System Backup"
                  >
                    <Download className="w-4 h-4 text-gray-400 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    title="Emergency Mode"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 mx-auto" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search admin panel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-green-400 animate-pulse' :
                    systemHealth?.status === 'warning' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400 animate-pulse'
                  }`}></div>
                <span className={`text-sm font-medium ${getHealthStatusColor(systemHealth?.status || 'unknown')}`}>
                  {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {systemAlerts.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-80 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold text-white">System Alerts</h3>
                        <p className="text-sm text-gray-400">{systemAlerts.length} active alerts</p>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {systemAlerts.slice(0, 5).map((alert, index) => (
                          <div key={alert.id} className="p-4 border-b border-white/5 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${alert.severity === 'critical' ? 'bg-red-400' :
                                  alert.severity === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                                }`}></div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white text-sm">{alert.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500">
                                    {alert.timestamp.toLocaleTimeString()}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${getAlertSeverityColor(alert.severity)}`}>
                                    {alert.severity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <button className="w-full text-center text-sm text-red-400 hover:text-red-300 transition-colors">
                          View All Alerts
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-48 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="font-medium text-white">System Admin</p>
                        <p className="text-sm text-gray-400">admin@codai.com</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <User className="w-4 h-4" />
                          <span className="text-sm">Profile Settings</span>
                        </button>
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-sm">Help & Support</span>
                        </button>
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Click outside to close menus */}
      {(userMenuOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setUserMenuOpen(false)
            setNotificationsOpen(false)
          }}
        />
      )}
    </div>
  )
}
