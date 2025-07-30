'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  CogIcon,
  PuzzlePieceIcon,
  LinkIcon,
  CheckIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface NotificationCenterProps {
  userId: string
  projectId?: string
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable: boolean
  actions?: NotificationAction[]
  source: 'system' | 'user' | 'integration' | 'ai'
  metadata?: Record<string, any>
}

interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  handler: () => void
}

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: 'development' | 'communication' | 'analytics' | 'design' | 'deployment'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  lastSync?: Date
  config?: Record<string, any>
  permissions?: string[]
}

export function NotificationCenter({ userId, projectId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [userId, projectId])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const loadNotifications = async () => {
    setLoading(true)

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Deployment Successful',
        message: 'Your application has been successfully deployed to production.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        actionable: true,
        actions: [
          {
            id: 'view-deployment',
            label: 'View Live Site',
            type: 'primary',
            handler: () => window.open('https://your-app.vercel.app', '_blank')
          }
        ],
        source: 'integration',
        metadata: { deploymentId: 'dep_123', environment: 'production' }
      },
      {
        id: '2',
        type: 'info',
        title: 'New Team Member',
        message: 'Sarah Wilson has joined your project as a Designer.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: false,
        actionable: true,
        actions: [
          {
            id: 'view-profile',
            label: 'View Profile',
            type: 'secondary',
            handler: () => console.log('View profile')
          },
          {
            id: 'send-welcome',
            label: 'Send Welcome Message',
            type: 'primary',
            handler: () => console.log('Send welcome')
          }
        ],
        source: 'user'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Performance Alert',
        message: 'Your application response time has increased by 20% in the last hour.',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        read: true,
        actionable: true,
        actions: [
          {
            id: 'view-metrics',
            label: 'View Metrics',
            type: 'primary',
            handler: () => console.log('View metrics')
          }
        ],
        source: 'system'
      },
      {
        id: '4',
        type: 'info',
        title: 'AI Suggestion Available',
        message: 'Found 3 potential code optimizations in your React components.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        actionable: true,
        actions: [
          {
            id: 'view-suggestions',
            label: 'View Suggestions',
            type: 'primary',
            handler: () => console.log('View AI suggestions')
          }
        ],
        source: 'ai'
      },
      {
        id: '5',
        type: 'error',
        title: 'Build Failed',
        message: 'The latest build failed due to TypeScript errors in components/Dashboard.tsx',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        read: true,
        actionable: true,
        actions: [
          {
            id: 'view-logs',
            label: 'View Build Logs',
            type: 'primary',
            handler: () => console.log('View build logs')
          },
          {
            id: 'retry-build',
            label: 'Retry Build',
            type: 'secondary',
            handler: () => console.log('Retry build')
          }
        ],
        source: 'integration'
      }
    ]

    setNotifications(mockNotifications)
    setLoading(false)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'actionable':
        return notifications.filter(n => n.actionable)
      default:
        return notifications
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getSourceIcon = (source: Notification['source']) => {
    switch (source) {
      case 'ai':
        return <SparklesIcon className="w-3 h-3 text-purple-500" />
      case 'integration':
        return <PuzzlePieceIcon className="w-3 h-3 text-blue-500" />
      case 'user':
        return <CheckCircleIcon className="w-3 h-3 text-green-500" />
      default:
        return <CogIcon className="w-3 h-3 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredNotifications = getFilteredNotifications()

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-2">
                  {(['all', 'unread', 'actionable'] as const).map(filterOption => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-3 py-1 text-sm rounded-lg capitalize transition-colors ${filter === filterOption
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {filterOption}
                      {filterOption === 'unread' && unreadCount > 0 && (
                        <span className="ml-1 text-xs">({unreadCount})</span>
                      )}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {filter === 'unread' ? 'No unread notifications' :
                        filter === 'actionable' ? 'No actionable notifications' :
                          'No notifications'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read
                                  ? 'text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {notification.title}
                              </h4>

                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {getSourceIcon(notification.source)}
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                </div>

                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    dismissNotification(notification.id)
                                  }}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {notification.message}
                            </p>

                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-2">
                                {notification.actions.map(action => (
                                  <button
                                    key={action.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      action.handler()
                                    }}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${action.type === 'primary'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : action.type === 'danger'
                                          ? 'bg-red-600 hover:bg-red-700 text-white'
                                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                      }`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to full notifications page
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center space-x-1"
                >
                  <span>View all notifications</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function IntegrationsHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadIntegrations()
    loadAvailableIntegrations()
  }, [])

  const loadIntegrations = async () => {
    // Mock connected integrations
    const mockIntegrations: Integration[] = [
      {
        id: 'github',
        name: 'GitHub',
        description: 'Version control and collaboration',
        icon: '🐙',
        category: 'development',
        status: 'connected',
        lastSync: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        config: {
          repository: 'user/project',
          branch: 'main',
          webhooks: true
        }
      },
      {
        id: 'vercel',
        name: 'Vercel',
        description: 'Deployment and hosting platform',
        icon: '▲',
        category: 'deployment',
        status: 'connected',
        lastSync: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        config: {
          project: 'my-project',
          domain: 'my-project.vercel.app',
          autoDeployment: true
        }
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Team communication and notifications',
        icon: '💬',
        category: 'communication',
        status: 'error',
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        config: {
          channel: '#development',
          notifications: ['deployments', 'errors']
        }
      }
    ]

    setIntegrations(mockIntegrations)
  }

  const loadAvailableIntegrations = async () => {
    // Mock available integrations
    const mockAvailable: Integration[] = [
      {
        id: 'discord',
        name: 'Discord',
        description: 'Community communication platform',
        icon: '🎮',
        category: 'communication',
        status: 'disconnected'
      },
      {
        id: 'figma',
        name: 'Figma',
        description: 'Design collaboration tool',
        icon: '🎨',
        category: 'design',
        status: 'disconnected'
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'Documentation and project management',
        icon: '📝',
        category: 'development',
        status: 'disconnected'
      },
      {
        id: 'datadog',
        name: 'Datadog',
        description: 'Monitoring and analytics platform',
        icon: '📊',
        category: 'analytics',
        status: 'disconnected'
      }
    ]

    setAvailableIntegrations(mockAvailable)
  }

  const categories = [
    { id: 'all', name: 'All', count: integrations.length + availableIntegrations.length },
    { id: 'development', name: 'Development', count: 2 },
    { id: 'communication', name: 'Communication', count: 2 },
    { id: 'design', name: 'Design', count: 1 },
    { id: 'deployment', name: 'Deployment', count: 1 },
    { id: 'analytics', name: 'Analytics', count: 1 }
  ]

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckIcon className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      default:
        return <LinkIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const handleConnect = async (integrationId: string) => {
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Move from available to connected
    const integration = availableIntegrations.find(i => i.id === integrationId)
    if (integration) {
      setAvailableIntegrations(prev => prev.filter(i => i.id !== integrationId))
      setIntegrations(prev => [...prev, { ...integration, status: 'connected', lastSync: new Date() }])
    }

    setLoading(false)
  }

  const handleDisconnect = async (integrationId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      setLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Move from connected to available
      const integration = integrations.find(i => i.id === integrationId)
      if (integration) {
        setIntegrations(prev => prev.filter(i => i.id !== integrationId))
        setAvailableIntegrations(prev => [...prev, { ...integration, status: 'disconnected', lastSync: undefined }])
      }

      setLoading(false)
    }
  }

  const filterIntegrations = (items: Integration[]) => {
    if (selectedCategory === 'all') return items
    return items.filter(i => i.category === selectedCategory)
  }

  const filteredConnected = filterIntegrations(integrations)
  const filteredAvailable = filterIntegrations(availableIntegrations)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <PuzzlePieceIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Integrations
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your favorite tools and services
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            {category.name}
            <span className="ml-2 text-xs opacity-75">({category.count})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Integrations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Connected ({filteredConnected.length})
          </h3>

          <div className="space-y-4">
            {filteredConnected.map(integration => (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                    {getStatusIcon(integration.status)}
                  </div>
                </div>

                {integration.lastSync && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Last synced: {integration.lastSync.toLocaleString()}
                  </p>
                )}

                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Configure
                  </button>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    disabled={loading}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}

            {filteredConnected.length === 0 && (
              <div className="text-center py-8">
                <PuzzlePieceIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No connected integrations in this category
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Integrations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available ({filteredAvailable.length})
          </h3>

          <div className="space-y-4">
            {filteredAvailable.map(integration => (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleConnect(integration.id)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm rounded-lg"
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            ))}

            {filteredAvailable.length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  All integrations in this category are connected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
