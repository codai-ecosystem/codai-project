'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Globe,
  FileText,
  Zap,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Key,
  Lock,
  Unlock,
  Server,
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  Activity,
  BarChart3,
  LineChart,
  TrendingUp,
  Download,
  Upload,
  Filter,
  Search,
  MoreVertical,
  ExternalLink,
  Shield,
  AlertCircle,
  Info,
  Maximize2,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react'

interface DataConnection {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'api' | 'file' | 'webhook'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: Date
  recordCount: number
  config: ConnectionConfig
  health: {
    latency: number
    uptime: number
    errorRate: number
  }
  tags: string[]
  description?: string
}

interface ConnectionConfig {
  host?: string
  port?: number
  database?: string
  endpoint?: string
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth'
    secured: boolean
  }
  ssl: boolean
  timeout: number
  retryAttempts: number
}

interface DataPreview {
  connectionId: string
  schema: SchemaField[]
  sampleData: Record<string, any>[]
  totalRecords: number
  lastUpdated: Date
}

interface SchemaField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'
  nullable: boolean
  unique: boolean
  indexed: boolean
  description?: string
}

interface SyncJob {
  id: string
  connectionId: string
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  startTime: Date
  endTime?: Date
  recordsProcessed: number
  errors: string[]
  progress: number
}

const DashIntegrationManager: React.FC = () => {
  const [connections, setConnections] = useState<DataConnection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null)
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConnections()
    loadSyncJobs()

    // Set up real-time updates
    const interval = setInterval(() => {
      updateConnectionStatus()
      updateSyncJobs()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadConnections = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setConnections([
        {
          id: 'conn-1',
          name: 'Production PostgreSQL',
          type: 'postgresql',
          status: 'connected',
          lastSync: new Date(Date.now() - 15 * 60 * 1000),
          recordCount: 1234567,
          config: {
            host: 'prod-db.company.com',
            port: 5432,
            database: 'analytics',
            authentication: { type: 'basic', secured: true },
            ssl: true,
            timeout: 30000,
            retryAttempts: 3
          },
          health: {
            latency: 45,
            uptime: 99.9,
            errorRate: 0.1
          },
          tags: ['production', 'primary', 'analytics'],
          description: 'Main production database for analytics and reporting'
        },
        {
          id: 'conn-2',
          name: 'Stripe API',
          type: 'api',
          status: 'connected',
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          recordCount: 89456,
          config: {
            endpoint: 'https://api.stripe.com/v1',
            authentication: { type: 'bearer', secured: true },
            ssl: true,
            timeout: 15000,
            retryAttempts: 3
          },
          health: {
            latency: 120,
            uptime: 99.5,
            errorRate: 0.3
          },
          tags: ['payments', 'external', 'real-time'],
          description: 'Payment data from Stripe API'
        },
        {
          id: 'conn-3',
          name: 'MongoDB Logs',
          type: 'mongodb',
          status: 'syncing',
          lastSync: new Date(Date.now() - 2 * 60 * 1000),
          recordCount: 5678901,
          config: {
            host: 'logs-cluster.mongodb.net',
            port: 27017,
            database: 'application_logs',
            authentication: { type: 'basic', secured: true },
            ssl: true,
            timeout: 30000,
            retryAttempts: 5
          },
          health: {
            latency: 89,
            uptime: 98.7,
            errorRate: 1.2
          },
          tags: ['logs', 'monitoring', 'cloud'],
          description: 'Application logs and monitoring data'
        },
        {
          id: 'conn-4',
          name: 'Redis Cache',
          type: 'redis',
          status: 'connected',
          lastSync: new Date(Date.now() - 1 * 60 * 1000),
          recordCount: 234567,
          config: {
            host: 'cache.company.com',
            port: 6379,
            authentication: { type: 'apikey', secured: true },
            ssl: true,
            timeout: 5000,
            retryAttempts: 2
          },
          health: {
            latency: 12,
            uptime: 99.8,
            errorRate: 0.05
          },
          tags: ['cache', 'performance', 'real-time'],
          description: 'Redis cache for real-time metrics'
        },
        {
          id: 'conn-5',
          name: 'Google Analytics',
          type: 'api',
          status: 'error',
          lastSync: new Date(Date.now() - 60 * 60 * 1000),
          recordCount: 0,
          config: {
            endpoint: 'https://analyticsreporting.googleapis.com/v4',
            authentication: { type: 'oauth', secured: true },
            ssl: true,
            timeout: 30000,
            retryAttempts: 3
          },
          health: {
            latency: 0,
            uptime: 0,
            errorRate: 100
          },
          tags: ['analytics', 'external', 'web'],
          description: 'Website analytics from Google Analytics'
        },
        {
          id: 'conn-6',
          name: 'Sales Data CSV',
          type: 'file',
          status: 'disconnected',
          lastSync: new Date(Date.now() - 12 * 60 * 60 * 1000),
          recordCount: 45789,
          config: {
            authentication: { type: 'none', secured: false },
            ssl: false,
            timeout: 10000,
            retryAttempts: 1
          },
          health: {
            latency: 0,
            uptime: 0,
            errorRate: 0
          },
          tags: ['sales', 'csv', 'manual'],
          description: 'Monthly sales data CSV uploads'
        }
      ])
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncJobs = async () => {
    try {
      setSyncJobs([
        {
          id: 'job-1',
          connectionId: 'conn-3',
          status: 'running',
          startTime: new Date(Date.now() - 2 * 60 * 1000),
          recordsProcessed: 45678,
          errors: [],
          progress: 67
        },
        {
          id: 'job-2',
          connectionId: 'conn-1',
          status: 'completed',
          startTime: new Date(Date.now() - 20 * 60 * 1000),
          endTime: new Date(Date.now() - 15 * 60 * 1000),
          recordsProcessed: 123456,
          errors: [],
          progress: 100
        },
        {
          id: 'job-3',
          connectionId: 'conn-5',
          status: 'failed',
          startTime: new Date(Date.now() - 70 * 60 * 1000),
          endTime: new Date(Date.now() - 60 * 60 * 1000),
          recordsProcessed: 0,
          errors: ['Authentication failed', 'Invalid API key'],
          progress: 0
        }
      ])
    } catch (error) {
      console.error('Failed to load sync jobs:', error)
    }
  }

  const updateConnectionStatus = () => {
    setConnections(prev => prev.map(conn => {
      if (conn.status === 'syncing') {
        // Simulate sync progress
        return {
          ...conn,
          lastSync: new Date(),
          health: {
            ...conn.health,
            latency: Math.max(10, conn.health.latency + (Math.random() - 0.5) * 20)
          }
        }
      }
      return conn
    }))
  }

  const updateSyncJobs = () => {
    setSyncJobs(prev => prev.map(job => {
      if (job.status === 'running') {
        const newProgress = Math.min(100, job.progress + Math.random() * 5)
        return {
          ...job,
          progress: newProgress,
          recordsProcessed: Math.floor((newProgress / 100) * 100000),
          status: newProgress >= 100 ? 'completed' : 'running',
          endTime: newProgress >= 100 ? new Date() : undefined
        }
      }
      return job
    }))
  }

  const getConnectionIcon = (type: DataConnection['type']) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
        return Database
      case 'mongodb':
        return Server
      case 'redis':
        return Zap
      case 'elasticsearch':
        return Search
      case 'api':
        return Globe
      case 'file':
        return FileText
      case 'webhook':
        return Activity
      default:
        return Database
    }
  }

  const getStatusIcon = (status: DataConnection['status']) => {
    switch (status) {
      case 'connected':
        return CheckCircle
      case 'disconnected':
        return WifiOff
      case 'error':
        return AlertTriangle
      case 'syncing':
        return RefreshCw
      default:
        return Clock
    }
  }

  const getStatusColor = (status: DataConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-500'
      case 'disconnected':
        return 'text-gray-500'
      case 'error':
        return 'text-red-500'
      case 'syncing':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const getHealthColor = (value: number, type: 'latency' | 'uptime' | 'errorRate') => {
    switch (type) {
      case 'latency':
        if (value < 50) return 'text-green-500'
        if (value < 150) return 'text-yellow-500'
        return 'text-red-500'
      case 'uptime':
        if (value > 99) return 'text-green-500'
        if (value > 95) return 'text-yellow-500'
        return 'text-red-500'
      case 'errorRate':
        if (value < 1) return 'text-green-500'
        if (value < 5) return 'text-yellow-500'
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || conn.type === filterType
    const matchesStatus = filterStatus === 'all' || conn.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const testConnection = async (connectionId: string) => {
    setConnections(prev => prev.map(conn =>
      conn.id === connectionId ? { ...conn, status: 'syncing' } : conn
    ))

    // Simulate connection test
    setTimeout(() => {
      setConnections(prev => prev.map(conn =>
        conn.id === connectionId ? {
          ...conn,
          status: Math.random() > 0.2 ? 'connected' : 'error',
          lastSync: new Date()
        } : conn
      ))
    }, 2000)
  }

  const syncConnection = async (connectionId: string) => {
    const newJob: SyncJob = {
      id: `job-${Date.now()}`,
      connectionId,
      status: 'running',
      startTime: new Date(),
      recordsProcessed: 0,
      errors: [],
      progress: 0
    }

    setSyncJobs(prev => [newJob, ...prev])

    setConnections(prev => prev.map(conn =>
      conn.id === connectionId ? { ...conn, status: 'syncing' } : conn
    ))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading integrations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage data sources and connections</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewConnectionModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Connection</span>
        </motion.button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="redis">Redis</option>
          <option value="api">API</option>
          <option value="file">File</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="disconnected">Disconnected</option>
          <option value="error">Error</option>
          <option value="syncing">Syncing</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{connections.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Connections</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {connections.filter(c => c.status === 'connected').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {syncJobs.filter(j => j.status === 'running').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Syncing</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(connections.reduce((sum, c) => sum + c.recordCount, 0))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredConnections.map((connection) => {
          const ConnectionIcon = getConnectionIcon(connection.type)
          const StatusIcon = getStatusIcon(connection.status)

          return (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => setSelectedConnection(connection.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <ConnectionIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {connection.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {connection.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(connection.status)} ${connection.status === 'syncing' ? 'animate-spin' : ''
                    }`} />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle menu action
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>

              {connection.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {connection.description}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {connection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Records</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatNumber(connection.recordCount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatTimeAgo(connection.lastSync)}
                  </p>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Latency</p>
                  <p className={`text-sm font-semibold ${getHealthColor(connection.health.latency, 'latency')}`}>
                    {connection.health.latency}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                  <p className={`text-sm font-semibold ${getHealthColor(connection.health.uptime, 'uptime')}`}>
                    {connection.health.uptime}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Errors</p>
                  <p className={`text-sm font-semibold ${getHealthColor(connection.health.errorRate, 'errorRate')}`}>
                    {connection.health.errorRate}%
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    testConnection(connection.id)
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Test</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    syncConnection(connection.id)
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Sync</span>
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Sync Jobs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sync Jobs</h2>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm rounded-full">
            {syncJobs.filter(j => j.status === 'running').length} active
          </span>
        </div>

        <div className="space-y-3">
          {syncJobs.slice(0, 5).map((job) => {
            const connection = connections.find(c => c.id === job.connectionId)
            const duration = job.endTime
              ? Math.floor((job.endTime.getTime() - job.startTime.getTime()) / 1000)
              : Math.floor((new Date().getTime() - job.startTime.getTime()) / 1000)

            return (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${job.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      job.status === 'completed' ? 'bg-green-500' :
                        job.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {connection?.name || 'Unknown Connection'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(job.recordsProcessed)} records • {duration}s
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {job.status === 'running' && (
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'running' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' :
                      job.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' :
                        job.status === 'failed' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' :
                          'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                    }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DashIntegrationManager
