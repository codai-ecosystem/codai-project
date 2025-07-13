/**
 * HubIntegrationManager - Advanced Integration Management Interface
 * Comprehensive system for managing external integrations, webhooks, and API connections
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Zap,
  Link,
  Unlink,
  Settings,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Key,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Edit,
  Trash2,
  Download,
  Upload,
  Code,
  Terminal,
  GitBranch,
  Layers,
  Network,
  Server,
  Webhook,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Package
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'API' | 'WEBHOOK' | 'DATABASE' | 'SERVICE' | 'EXTERNAL'
  status: 'active' | 'inactive' | 'error' | 'pending'
  provider: string
  endpoint: string
  method?: string
  authentication: {
    type: 'API_KEY' | 'OAUTH' | 'BASIC' | 'BEARER' | 'NONE'
    configured: boolean
    lastUpdated: Date
  }
  usage: {
    requests: number
    errors: number
    latency: number
    uptime: number
  }
  configuration: {
    retries: number
    timeout: number
    rateLimit: number
    headers: Record<string, string>
  }
  createdAt: Date
  lastUsed: Date
  description?: string
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive' | 'error'
  secret: string
  deliveries: {
    total: number
    successful: number
    failed: number
    lastDelivery: Date
  }
  retryPolicy: {
    maxRetries: number
    backoffType: 'linear' | 'exponential'
    interval: number
  }
  createdAt: Date
  lastTriggered: Date
}

interface APIEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  service: string
  description: string
  status: 'active' | 'deprecated' | 'beta'
  version: string
  authentication: boolean
  rateLimit: {
    requests: number
    window: string
  }
  usage: {
    requests: number
    errors: number
    latency: number
  }
  documentation: string
  lastUpdated: Date
}

export default function HubIntegrationManager() {
  const [activeTab, setActiveTab] = useState('integrations')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNewIntegration, setShowNewIntegration] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data - would come from actual APIs
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Stripe Payment API',
      type: 'API',
      status: 'active',
      provider: 'Stripe',
      endpoint: 'https://api.stripe.com/v1',
      method: 'POST',
      authentication: {
        type: 'API_KEY',
        configured: true,
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      usage: {
        requests: 45000,
        errors: 12,
        latency: 150,
        uptime: 99.98
      },
      configuration: {
        retries: 3,
        timeout: 30000,
        rateLimit: 100,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Hub/1.0'
        }
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 5 * 60 * 1000),
      description: 'Payment processing integration for subscription billing'
    },
    {
      id: '2',
      name: 'SendGrid Email Service',
      type: 'SERVICE',
      status: 'active',
      provider: 'SendGrid',
      endpoint: 'https://api.sendgrid.com/v3',
      method: 'POST',
      authentication: {
        type: 'API_KEY',
        configured: true,
        lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      usage: {
        requests: 89000,
        errors: 5,
        latency: 85,
        uptime: 99.99
      },
      configuration: {
        retries: 2,
        timeout: 15000,
        rateLimit: 600,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 1000),
      description: 'Email delivery service for notifications and marketing'
    },
    {
      id: '3',
      name: 'Analytics Webhook',
      type: 'WEBHOOK',
      status: 'active',
      provider: 'Internal',
      endpoint: 'https://analytics.example.com/webhook',
      authentication: {
        type: 'BEARER',
        configured: true,
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      usage: {
        requests: 23000,
        errors: 8,
        latency: 45,
        uptime: 99.95
      },
      configuration: {
        retries: 5,
        timeout: 10000,
        rateLimit: 1000,
        headers: {}
      },
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 10 * 60 * 1000),
      description: 'Real-time analytics event processing'
    },
    {
      id: '4',
      name: 'Slack Notifications',
      type: 'EXTERNAL',
      status: 'error',
      provider: 'Slack',
      endpoint: 'https://hooks.slack.com/services',
      method: 'POST',
      authentication: {
        type: 'WEBHOOK',
        configured: false,
        lastUpdated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      usage: {
        requests: 1200,
        errors: 156,
        latency: 200,
        uptime: 85.2
      },
      configuration: {
        retries: 3,
        timeout: 20000,
        rateLimit: 1,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 120 * 60 * 1000),
      description: 'Team notification integration for alerts and updates'
    },
    {
      id: '5',
      name: 'User Database Sync',
      type: 'DATABASE',
      status: 'inactive',
      provider: 'PostgreSQL',
      endpoint: 'postgresql://prod-db:5432/users',
      authentication: {
        type: 'BASIC',
        configured: true,
        lastUpdated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
      },
      usage: {
        requests: 0,
        errors: 0,
        latency: 0,
        uptime: 0
      },
      configuration: {
        retries: 1,
        timeout: 60000,
        rateLimit: 10,
        headers: {}
      },
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      description: 'Legacy user data synchronization (deprecated)'
    }
  ]

  const webhooks: Webhook[] = [
    {
      id: '1',
      name: 'Payment Events',
      url: 'https://api.example.com/webhooks/payments',
      events: ['payment.completed', 'payment.failed', 'subscription.created'],
      status: 'active',
      secret: 'whsec_1234567890',
      deliveries: {
        total: 15420,
        successful: 15380,
        failed: 40,
        lastDelivery: new Date(Date.now() - 5 * 60 * 1000)
      },
      retryPolicy: {
        maxRetries: 3,
        backoffType: 'exponential',
        interval: 5000
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      name: 'User Activity',
      url: 'https://analytics.example.com/events',
      events: ['user.login', 'user.logout', 'user.action'],
      status: 'active',
      secret: 'whsec_0987654321',
      deliveries: {
        total: 89432,
        successful: 89201,
        failed: 231,
        lastDelivery: new Date(Date.now() - 1 * 60 * 1000)
      },
      retryPolicy: {
        maxRetries: 2,
        backoffType: 'linear',
        interval: 3000
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 1 * 60 * 1000)
    },
    {
      id: '3',
      name: 'System Alerts',
      url: 'https://monitoring.example.com/alerts',
      events: ['alert.critical', 'alert.warning', 'system.health'],
      status: 'error',
      secret: 'whsec_abcdef1234',
      deliveries: {
        total: 456,
        successful: 398,
        failed: 58,
        lastDelivery: new Date(Date.now() - 30 * 60 * 1000)
      },
      retryPolicy: {
        maxRetries: 5,
        backoffType: 'exponential',
        interval: 10000
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]

  const apiEndpoints: APIEndpoint[] = [
    {
      id: '1',
      path: '/api/v1/integrations',
      method: 'GET',
      service: 'integration-service',
      description: 'List all available integrations',
      status: 'active',
      version: 'v1.2.0',
      authentication: true,
      rateLimit: {
        requests: 1000,
        window: '1h'
      },
      usage: {
        requests: 5432,
        errors: 12,
        latency: 65
      },
      documentation: 'https://docs.example.com/api/integrations',
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      path: '/api/v1/webhooks/{id}/test',
      method: 'POST',
      service: 'webhook-service',
      description: 'Test webhook delivery',
      status: 'active',
      version: 'v1.0.3',
      authentication: true,
      rateLimit: {
        requests: 100,
        window: '1h'
      },
      usage: {
        requests: 234,
        errors: 3,
        latency: 125
      },
      documentation: 'https://docs.example.com/api/webhooks',
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      path: '/api/v2/external/sync',
      method: 'PUT',
      service: 'sync-service',
      description: 'Synchronize external data',
      status: 'beta',
      version: 'v2.0.0-beta.1',
      authentication: true,
      rateLimit: {
        requests: 50,
        window: '1h'
      },
      usage: {
        requests: 89,
        errors: 5,
        latency: 450
      },
      documentation: 'https://docs.example.com/api/v2/sync',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'inactive': return 'text-gray-500'
      case 'error': return 'text-red-500'
      case 'pending': return 'text-yellow-500'
      case 'beta': return 'text-purple-500'
      case 'deprecated': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'beta': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'deprecated': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'API': return <Globe className="w-4 h-4" />
      case 'WEBHOOK': return <Zap className="w-4 h-4" />
      case 'DATABASE': return <Database className="w-4 h-4" />
      case 'SERVICE': return <Server className="w-4 h-4" />
      case 'EXTERNAL': return <Link className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter
    const matchesType = typeFilter === 'all' || integration.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integration Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage external integrations, webhooks, and API connections
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowNewIntegration(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Integration</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'integrations', label: 'Integrations', count: integrations.length },
            { id: 'webhooks', label: 'Webhooks', count: webhooks.length },
            { id: 'endpoints', label: 'API Endpoints', count: apiEndpoints.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
          <option value="pending">Pending</option>
        </select>

        {activeTab === 'integrations' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="API">API</option>
            <option value="WEBHOOK">Webhook</option>
            <option value="DATABASE">Database</option>
            <option value="SERVICE">Service</option>
            <option value="EXTERNAL">External</option>
          </select>
        )}
      </div>

      {/* Content */}
      {activeTab === 'integrations' && (
        <div className="grid gap-6">
          {filteredIntegrations.map((integration) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getTypeIcon(integration.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(integration.status)}`}>
                        {integration.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {integration.type}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {integration.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>Provider: {integration.provider}</span>
                      <span>Last used: {formatTimeAgo(integration.lastUsed)}</span>
                      <span className={`flex items-center space-x-1 ${integration.authentication.configured ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <Shield className="w-3 h-3" />
                        <span>{integration.authentication.configured ? 'Authenticated' : 'Auth Required'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(integration.usage.requests)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {integration.usage.errors}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {integration.usage.latency}ms
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {integration.usage.uptime}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="grid gap-6">
          {webhooks.map((webhook) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {webhook.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(webhook.status)}`}>
                        {webhook.status}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 font-mono">
                      {webhook.url}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded"
                        >
                          {event}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>Last triggered: {formatTimeAgo(webhook.lastTriggered)}</span>
                      <span>Success rate: {((webhook.deliveries.successful / webhook.deliveries.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <PlayCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delivery Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(webhook.deliveries.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {formatNumber(webhook.deliveries.successful)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {formatNumber(webhook.deliveries.failed)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {webhook.retryPolicy.maxRetries}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Max Retries</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rate Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {apiEndpoints.map((endpoint) => (
                  <tr key={endpoint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            {endpoint.path}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {endpoint.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {endpoint.service}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {endpoint.version}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatNumber(endpoint.usage.requests)} req
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {endpoint.usage.latency}ms avg
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {endpoint.rateLimit.requests}/{endpoint.rateLimit.window}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                          <Code className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default HubIntegrationManager
