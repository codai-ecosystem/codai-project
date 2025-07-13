/**
 * DocsIntegrationManager - Advanced Documentation Integration & Content Management System
 * Manages documentation workflow, content synchronization, automation, and ecosystem integration
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch,
  Sync,
  Webhook,
  Database,
  Cloud,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Square,
  RefreshCw,
  Upload,
  Download,
  ExternalLink,
  Code,
  FileText,
  Zap,
  Globe,
  Key,
  Shield,
  Monitor,
  Bell,
  Users,
  Archive,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface DocsIntegrationManagerProps {
  className?: string
}

interface Integration {
  id: string
  name: string
  type: 'git' | 'cms' | 'api' | 'webhook' | 'analytics' | 'auth' | 'storage'
  status: 'active' | 'inactive' | 'error' | 'pending'
  lastSync?: Date
  description: string
  config: Record<string, any>
  metrics?: {
    totalSyncs: number
    successRate: number
    lastActivity: Date
    dataTransferred: string
  }
  icon: React.ReactNode
  color: string
}

interface SyncJob {
  id: string
  integrationId: string
  type: 'manual' | 'scheduled' | 'webhook'
  status: 'running' | 'completed' | 'failed' | 'queued'
  startTime: Date
  endTime?: Date
  progress: number
  itemsProcessed: number
  totalItems: number
  logs: SyncLog[]
}

interface SyncLog {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: any
}

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: 'content_updated' | 'scheduled' | 'webhook' | 'manual'
  conditions: Array<{
    field: string
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }>
  actions: Array<{
    type: 'sync' | 'notify' | 'publish' | 'archive' | 'transform'
    config: Record<string, any>
  }>
  enabled: boolean
  lastExecuted?: Date
  executions: number
}

const DocsIntegrationManager: React.FC<DocsIntegrationManagerProps> = ({ className = '' }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [activeTab, setActiveTab] = useState<'integrations' | 'sync' | 'automation' | 'logs'>('integrations')
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showAddIntegration, setShowAddIntegration] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data initialization
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: 'git-1',
        name: 'GitHub Repository',
        type: 'git',
        status: 'active',
        lastSync: new Date('2024-01-15T10:30:00'),
        description: 'Sync documentation from GitHub repository',
        config: {
          repository: 'company/docs',
          branch: 'main',
          path: '/docs',
          autoSync: true
        },
        metrics: {
          totalSyncs: 156,
          successRate: 98.7,
          lastActivity: new Date('2024-01-15T10:30:00'),
          dataTransferred: '2.3 GB'
        },
        icon: <GitBranch className="w-5 h-5" />,
        color: 'blue'
      },
      {
        id: 'cms-1',
        name: 'Notion CMS',
        type: 'cms',
        status: 'active',
        lastSync: new Date('2024-01-15T09:15:00'),
        description: 'Import content from Notion workspace',
        config: {
          workspace: 'company-docs',
          database: 'Documentation',
          syncInterval: '1h'
        },
        metrics: {
          totalSyncs: 89,
          successRate: 96.6,
          lastActivity: new Date('2024-01-15T09:15:00'),
          dataTransferred: '1.1 GB'
        },
        icon: <Database className="w-5 h-5" />,
        color: 'purple'
      },
      {
        id: 'api-1',
        name: 'REST API Docs',
        type: 'api',
        status: 'active',
        lastSync: new Date('2024-01-15T08:45:00'),
        description: 'Auto-generate API documentation from OpenAPI specs',
        config: {
          endpoint: 'https://api.company.com/openapi.json',
          authentication: 'bearer',
          refreshInterval: '6h'
        },
        metrics: {
          totalSyncs: 234,
          successRate: 99.1,
          lastActivity: new Date('2024-01-15T08:45:00'),
          dataTransferred: '854 MB'
        },
        icon: <Code className="w-5 h-5" />,
        color: 'green'
      },
      {
        id: 'webhook-1',
        name: 'Slack Notifications',
        type: 'webhook',
        status: 'active',
        lastSync: new Date('2024-01-15T11:00:00'),
        description: 'Send documentation updates to Slack channels',
        config: {
          webhookUrl: 'https://hooks.slack.com/services/...',
          channels: ['#docs', '#dev-team'],
          events: ['publish', 'update', 'review']
        },
        metrics: {
          totalSyncs: 67,
          successRate: 100,
          lastActivity: new Date('2024-01-15T11:00:00'),
          dataTransferred: '12 MB'
        },
        icon: <Webhook className="w-5 h-5" />,
        color: 'yellow'
      },
      {
        id: 'analytics-1',
        name: 'Google Analytics',
        type: 'analytics',
        status: 'error',
        lastSync: new Date('2024-01-14T16:30:00'),
        description: 'Track documentation usage and performance',
        config: {
          trackingId: 'GA-XXXXXXX-X',
          events: ['page_view', 'search', 'download'],
          realtime: true
        },
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'red'
      }
    ]

    const mockSyncJobs: SyncJob[] = [
      {
        id: 'job-1',
        integrationId: 'git-1',
        type: 'scheduled',
        status: 'running',
        startTime: new Date('2024-01-15T12:00:00'),
        progress: 65,
        itemsProcessed: 32,
        totalItems: 49,
        logs: [
          {
            id: 'log-1',
            timestamp: new Date('2024-01-15T12:01:00'),
            level: 'info',
            message: 'Starting sync process for GitHub repository'
          },
          {
            id: 'log-2',
            timestamp: new Date('2024-01-15T12:02:00'),
            level: 'success',
            message: 'Successfully processed 32 files'
          }
        ]
      },
      {
        id: 'job-2',
        integrationId: 'cms-1',
        type: 'manual',
        status: 'completed',
        startTime: new Date('2024-01-15T09:15:00'),
        endTime: new Date('2024-01-15T09:18:00'),
        progress: 100,
        itemsProcessed: 23,
        totalItems: 23,
        logs: []
      }
    ]

    const mockAutomationRules: AutomationRule[] = [
      {
        id: 'rule-1',
        name: 'Auto-publish API docs',
        description: 'Automatically publish API documentation when OpenAPI spec is updated',
        trigger: 'webhook',
        conditions: [
          { field: 'integration', operator: 'equals', value: 'api-1' },
          { field: 'change_type', operator: 'equals', value: 'spec_updated' }
        ],
        actions: [
          { type: 'sync', config: { immediate: true } },
          { type: 'publish', config: { status: 'published' } },
          { type: 'notify', config: { channel: 'slack', message: 'API docs updated' } }
        ],
        enabled: true,
        lastExecuted: new Date('2024-01-15T08:45:00'),
        executions: 23
      },
      {
        id: 'rule-2',
        name: 'Weekly content review',
        description: 'Send weekly report of outdated content for review',
        trigger: 'scheduled',
        conditions: [
          { field: 'last_modified', operator: 'less_than', value: '30d' },
          { field: 'status', operator: 'equals', value: 'published' }
        ],
        actions: [
          { type: 'notify', config: { email: 'docs@company.com', template: 'review_needed' } }
        ],
        enabled: true,
        lastExecuted: new Date('2024-01-12T09:00:00'),
        executions: 8
      }
    ]

    setIntegrations(mockIntegrations)
    setSyncJobs(mockSyncJobs)
    setAutomationRules(mockAutomationRules)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'running': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      case 'queued': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'git': return <GitBranch className="w-4 h-4" />
      case 'cms': return <Database className="w-4 h-4" />
      case 'api': return <Code className="w-4 h-4" />
      case 'webhook': return <Webhook className="w-4 h-4" />
      case 'analytics': return <TrendingUp className="w-4 h-4" />
      case 'auth': return <Shield className="w-4 h-4" />
      case 'storage': return <Cloud className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const triggerSync = (integrationId: string) => {
    // In real app, this would trigger actual sync
    console.log('Triggering sync for integration:', integrationId)
  }

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: integration.status === 'active' ? 'inactive' : 'active' }
        : integration
    ))
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integration Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage documentation integrations, sync jobs, and automation rules
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddIntegration(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            <span>Add Integration</span>
          </button>

          <button
            onClick={() => setShowConfig(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Active Integrations',
            value: integrations.filter(i => i.status === 'active').length,
            total: integrations.length,
            icon: <Sync className="w-5 h-5" />,
            color: 'blue'
          },
          {
            title: 'Running Jobs',
            value: syncJobs.filter(j => j.status === 'running').length,
            total: syncJobs.length,
            icon: <Activity className="w-5 h-5" />,
            color: 'green'
          },
          {
            title: 'Automation Rules',
            value: automationRules.filter(r => r.enabled).length,
            total: automationRules.length,
            icon: <Zap className="w-5 h-5" />,
            color: 'purple'
          },
          {
            title: 'Success Rate',
            value: '98.2%',
            description: 'Last 30 days',
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'emerald'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                      'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
                {stat.total && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /{stat.total}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'integrations', label: 'Integrations', icon: <Sync className="w-4 h-4" /> },
            { key: 'sync', label: 'Sync Jobs', icon: <RefreshCw className="w-4 h-4" /> },
            { key: 'automation', label: 'Automation', icon: <Zap className="w-4 h-4" /> },
            { key: 'logs', label: 'Activity Logs', icon: <FileText className="w-4 h-4" /> }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`
                flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === 'integrations' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
              <option value="pending">Pending</option>
            </select>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'integrations' && (
          <motion.div
            key="integrations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {filteredIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`
                      p-3 rounded-lg
                      ${integration.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        integration.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                          integration.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                            integration.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      }
                    `}>
                      {integration.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {integration.name}
                        </h3>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${getStatusColor(integration.status)}
                        `}>
                          {integration.status}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          {getTypeIcon(integration.type)}
                          <span className="text-xs">{integration.type.toUpperCase()}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {integration.description}
                      </p>

                      {integration.metrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Total Syncs</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {integration.metrics.totalSyncs}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Success Rate</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {integration.metrics.successRate}%
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Data Transferred</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {integration.metrics.dataTransferred}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Last Activity</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatRelativeTime(integration.metrics.lastActivity)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => triggerSync(integration.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      title="Trigger sync"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleIntegration(integration.id)}
                      className={`
                        p-2 rounded-lg
                        ${integration.status === 'active'
                          ? 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }
                      `}
                      title={integration.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {integration.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      title="More options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sync className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No integrations found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by adding your first integration
                </p>
                <button
                  onClick={() => setShowAddIntegration(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Integration
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'sync' && (
          <motion.div
            key="sync"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {syncJobs.map((job) => {
              const integration = integrations.find(i => i.id === job.integrationId)
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`
                        p-2 rounded-lg
                        ${getStatusColor(job.status)}
                      `}>
                        {job.status === 'running' && <RefreshCw className="w-4 h-4 animate-spin" />}
                        {job.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        {job.status === 'failed' && <AlertCircle className="w-4 h-4" />}
                        {job.status === 'queued' && <Clock className="w-4 h-4" />}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {integration?.name || 'Unknown Integration'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Type: {job.type}</span>
                          <span>Started: {formatRelativeTime(job.startTime)}</span>
                          {job.endTime && (
                            <span>Duration: {Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${getStatusColor(job.status)}
                    `}>
                      {job.status}
                    </span>
                  </div>

                  {job.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress: {job.itemsProcessed}/{job.totalItems} items
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {job.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {job.logs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Recent Logs
                      </h4>
                      {job.logs.slice(-3).map((log) => (
                        <div key={log.id} className="flex items-start space-x-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={`
                            text-xs px-1.5 py-0.5 rounded
                            ${log.level === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                              log.level === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                log.level === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }
                          `}>
                            {log.level}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'automation' && (
          <motion.div
            key="automation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {automationRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${rule.enabled
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }
                      `}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {rule.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Trigger</span>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {rule.trigger.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Executions</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {rule.executions}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Executed</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {rule.lastExecuted ? formatRelativeTime(rule.lastExecuted) : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>

                    <button className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      {rule.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DocsIntegrationManager
