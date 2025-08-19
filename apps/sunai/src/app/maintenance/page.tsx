'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Sun,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Wrench,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Battery,
  Thermometer,
  Gauge,
  Shield,
  Tool,
  Eye,
  Bell,
  RefreshCw,
  Download,
  Share2,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  MapPin,
  Camera,
  FileText,
  Award,
  Target,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ExternalLink,
  BookOpen
} from 'lucide-react'

interface SystemComponent {
  id: string
  name: string
  type: 'panel' | 'inverter' | 'battery' | 'monitoring' | 'wiring' | 'mounting'
  location: string
  status: 'optimal' | 'good' | 'warning' | 'critical' | 'offline'
  health: number
  lastMaintenance: string
  nextMaintenance: string
  efficiency: number
  temperature: number
  voltage: number
  alerts: number
  uptime: number
}

interface MaintenanceTask {
  id: string
  title: string
  component: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'calibration'
  scheduledDate: string
  estimatedDuration: number
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  technician: string
  description: string
}

interface PerformanceAlert {
  id: string
  component: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  impact: string
  recommendation: string
}

export default function MaintenanceMonitoring() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSystem, setSelectedSystem] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // System components data
  const [systemComponents] = useState<SystemComponent[]>([
    {
      id: '1',
      name: 'Solar Panel Array A1-A12',
      type: 'panel',
      location: 'Rooftop Section A',
      status: 'optimal',
      health: 96.8,
      lastMaintenance: '2025-07-15',
      nextMaintenance: '2025-10-15',
      efficiency: 94.2,
      temperature: 42,
      voltage: 48.2,
      alerts: 0,
      uptime: 99.8
    },
    {
      id: '2',
      name: 'Main Inverter Unit',
      type: 'inverter',
      location: 'Equipment Room',
      status: 'good',
      health: 91.5,
      lastMaintenance: '2025-06-20',
      nextMaintenance: '2025-09-20',
      efficiency: 91.8,
      temperature: 38,
      voltage: 230.5,
      alerts: 1,
      uptime: 98.9
    },
    {
      id: '3',
      name: 'Battery Storage System',
      type: 'battery',
      location: 'Battery Room',
      status: 'warning',
      health: 87.3,
      lastMaintenance: '2025-05-10',
      nextMaintenance: '2025-08-10',
      efficiency: 89.2,
      temperature: 25,
      voltage: 50.8,
      alerts: 2,
      uptime: 97.5
    },
    {
      id: '4',
      name: 'Monitoring System Hub',
      type: 'monitoring',
      location: 'Control Center',
      status: 'optimal',
      health: 98.2,
      lastMaintenance: '2025-07-01',
      nextMaintenance: '2025-12-01',
      efficiency: 99.1,
      temperature: 22,
      voltage: 12.0,
      alerts: 0,
      uptime: 99.9
    },
    {
      id: '5',
      name: 'DC Wiring System',
      type: 'wiring',
      location: 'Distribution Points',
      status: 'good',
      health: 93.7,
      lastMaintenance: '2025-06-05',
      nextMaintenance: '2025-12-05',
      efficiency: 95.8,
      temperature: 35,
      voltage: 48.5,
      alerts: 0,
      uptime: 99.2
    },
    {
      id: '6',
      name: 'Mounting Structure',
      type: 'mounting',
      location: 'Rooftop Framework',
      status: 'critical',
      health: 78.5,
      lastMaintenance: '2025-03-15',
      nextMaintenance: '2025-08-15',
      efficiency: 85.2,
      temperature: 45,
      voltage: 0,
      alerts: 3,
      uptime: 95.8
    }
  ])

  // Maintenance tasks data
  const [maintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      title: 'Battery Cell Inspection',
      component: 'Battery Storage System',
      priority: 'high',
      type: 'inspection',
      scheduledDate: '2025-08-10',
      estimatedDuration: 180,
      status: 'scheduled',
      technician: 'John Martinez',
      description: 'Comprehensive inspection of battery cells and monitoring systems'
    },
    {
      id: '2',
      title: 'Mounting Structure Reinforcement',
      component: 'Mounting Structure',
      priority: 'critical',
      type: 'repair',
      scheduledDate: '2025-08-08',
      estimatedDuration: 480,
      status: 'pending',
      technician: 'Sarah Chen',
      description: 'Emergency reinforcement of mounting bolts and structural integrity check'
    },
    {
      id: '3',
      title: 'Panel Cleaning Service',
      component: 'Solar Panel Array A1-A12',
      priority: 'medium',
      type: 'cleaning',
      scheduledDate: '2025-08-12',
      estimatedDuration: 120,
      status: 'scheduled',
      technician: 'Mike Johnson',
      description: 'Thorough cleaning of all solar panels and efficiency optimization'
    },
    {
      id: '4',
      title: 'Inverter Calibration',
      component: 'Main Inverter Unit',
      priority: 'medium',
      type: 'calibration',
      scheduledDate: '2025-08-15',
      estimatedDuration: 90,
      status: 'pending',
      technician: 'Emma Davis',
      description: 'Performance calibration and efficiency optimization'
    }
  ])

  // Performance alerts data
  const [performanceAlerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      component: 'Battery Storage System',
      severity: 'warning',
      title: 'Battery Efficiency Decline',
      description: 'Battery efficiency has dropped to 89.2%, below optimal threshold of 92%',
      timestamp: '2025-08-07T10:30:00Z',
      resolved: false,
      impact: 'Reduced energy storage capacity',
      recommendation: 'Schedule battery inspection and possible cell replacement'
    },
    {
      id: '2',
      component: 'Mounting Structure',
      severity: 'critical',
      title: 'Structural Integrity Alert',
      description: 'Mounting bolts showing signs of stress, immediate inspection required',
      timestamp: '2025-08-07T08:15:00Z',
      resolved: false,
      impact: 'Risk of panel displacement',
      recommendation: 'Emergency maintenance required within 24 hours'
    },
    {
      id: '3',
      component: 'Main Inverter Unit',
      severity: 'warning',
      title: 'Temperature Threshold Exceeded',
      description: 'Inverter operating temperature reached 38°C, above normal range',
      timestamp: '2025-08-07T14:20:00Z',
      resolved: false,
      impact: 'Potential efficiency reduction',
      recommendation: 'Check cooling system and ventilation'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: Activity },
    { id: 'components', name: 'Component Health', icon: Settings },
    { id: 'maintenance', name: 'Maintenance Tasks', icon: Wrench },
    { id: 'alerts', name: 'Performance Alerts', icon: AlertTriangle },
    { id: 'reports', name: 'Health Reports', icon: FileText },
    { id: 'scheduling', name: 'Maintenance Schedule', icon: Calendar }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500'
      case 'good': return 'text-blue-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      case 'offline': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 border-green-200'
      case 'good': return 'bg-blue-100 border-blue-200'
      case 'warning': return 'bg-yellow-100 border-yellow-200'
      case 'critical': return 'bg-red-100 border-red-200'
      case 'offline': return 'bg-gray-100 border-gray-200'
      default: return 'bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return CheckCircle
      case 'good': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return AlertTriangle
      case 'offline': return StopCircle
      default: return Info
    }
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'panel': return Sun
      case 'inverter': return Zap
      case 'battery': return Battery
      case 'monitoring': return Activity
      case 'wiring': return Signal
      case 'mounting': return Tool
      default: return Settings
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const systemStats = {
    totalComponents: systemComponents.length,
    healthyComponents: systemComponents.filter(c => c.status === 'optimal' || c.status === 'good').length,
    criticalAlerts: performanceAlerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    pendingTasks: maintenanceTasks.filter(t => t.status === 'pending' || t.status === 'overdue').length,
    averageHealth: systemComponents.reduce((sum, c) => sum + c.health, 0) / systemComponents.length,
    systemUptime: systemComponents.reduce((sum, c) => sum + c.uptime, 0) / systemComponents.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-yellow-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Maintenance & Monitoring
                  </h1>
                  <p className="text-sm text-gray-600">Equipment Health & Predictive Maintenance</p>
                </div>
              </Link>
            </div>

            {/* System Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {systemStats.healthyComponents}/{systemStats.totalComponents}
                </div>
                <div className="text-xs text-gray-500">Healthy Systems</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">
                  {systemStats.averageHealth.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Avg Health</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">
                  {systemStats.criticalAlerts}
                </div>
                <div className="text-xs text-gray-500">Critical Alerts</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters
                    ? 'text-yellow-600 bg-yellow-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-yellow-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* System Health Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {systemStats.averageHealth.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">System Health</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">Overall excellent condition</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {systemStats.systemUptime.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">System Uptime</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm ml-1">Excellent reliability</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {systemStats.criticalAlerts}
                      </div>
                      <div className="text-sm text-gray-600">Critical Alerts</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm ml-1">Immediate attention required</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {systemStats.pendingTasks}
                      </div>
                      <div className="text-sm text-gray-600">Pending Tasks</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm ml-1">Scheduled maintenance due</span>
                  </div>
                </motion.div>
              </div>

              {/* System Components Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">System Components Status</h3>
                  <Link
                    href="#components"
                    onClick={() => setActiveTab('components')}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemComponents.map((component) => {
                    const StatusIcon = getStatusIcon(component.status)
                    const ComponentIcon = getComponentIcon(component.type)
                    return (
                      <motion.div
                        key={component.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border ${getStatusBg(component.status)}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                              <ComponentIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">{component.name}</div>
                              <div className="text-xs text-gray-500">{component.location}</div>
                            </div>
                          </div>
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(component.status)}`} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Health:</span>
                            <span className={`font-semibold ml-1 ${component.health >= 90 ? 'text-green-600' : component.health >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {component.health.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Uptime:</span>
                            <span className="font-semibold text-blue-600 ml-1">{component.uptime.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Temp:</span>
                            <span className="font-semibold text-orange-600 ml-1">{component.temperature}°C</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Alerts:</span>
                            <span className={`font-semibold ml-1 ${component.alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {component.alerts}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Alerts and Maintenance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Alerts */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Alerts</h3>
                    <Link
                      href="#alerts"
                      onClick={() => setActiveTab('alerts')}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {performanceAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{alert.title}</div>
                            <div className="text-xs mt-1 opacity-75">{alert.component}</div>
                            <div className="text-xs mt-1 opacity-75">{alert.impact}</div>
                          </div>
                          <div className="text-xs opacity-75 ml-2">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Maintenance */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Upcoming Maintenance</h3>
                    <Link
                      href="#maintenance"
                      onClick={() => setActiveTab('maintenance')}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
                    >
                      View Schedule <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {maintenanceTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{task.title}</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{task.component}</div>
                            <div className="text-xs text-gray-500 mt-1">{task.technician}</div>
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {new Date(task.scheduledDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Detailed Component Health */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Component Health Details</h3>
                <div className="h-80 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Settings className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Detailed Component Analysis</p>
                    <p className="text-sm">Advanced component health monitoring interface</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add other tab content as needed */}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-yellow-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="w-6 h-6" />
                <h4 className="font-semibold">System Monitoring</h4>
              </div>
              <p className="text-sm opacity-90">Real-time equipment health tracking and performance analysis</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Wrench className="w-6 h-6" />
                <h4 className="font-semibold">Predictive Maintenance</h4>
              </div>
              <p className="text-sm opacity-90">AI-powered maintenance scheduling and failure prediction</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-6 h-6" />
                <h4 className="font-semibold">System Protection</h4>
              </div>
              <p className="text-sm opacity-90">Advanced monitoring and protection for solar infrastructure</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
