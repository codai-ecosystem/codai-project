'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionable?: boolean
}

interface NotificationCenterProps {
  className?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Task Completed',
    message: 'API Integration task has been completed successfully',
    timestamp: '2024-02-01T10:30:00Z',
    read: false,
    actionable: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Workload Alert',
    message: 'Agent Alpha is running at 95% capacity',
    timestamp: '2024-02-01T10:25:00Z',
    read: false,
    actionable: true
  },
  {
    id: '3',
    type: 'info',
    title: 'New Project Added',
    message: 'Security Enhancement project has been created',
    timestamp: '2024-02-01T10:20:00Z',
    read: true,
    actionable: false
  },
  {
    id: '4',
    type: 'error',
    title: 'System Error',
    message: 'Failed to sync with external service',
    timestamp: '2024-02-01T09:45:00Z',
    read: false,
    actionable: true
  }
]

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success': return CheckCircle2
    case 'warning': return AlertTriangle
    case 'error': return X
    case 'info': return Info
    default: return Bell
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
    case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
  }
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState(mockNotifications)
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'actionable'>('all')

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read
      case 'actionable': return notification.actionable
      default: return true
    }
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notification Center
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['all', 'unread', 'actionable'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize
              ${filter === filterOption 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {filterOption}
            {filterOption === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' ? 'All notifications have been read' : 
               filter === 'actionable' ? 'No actionable notifications' : 
               'No notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type)
            const colorClasses = getNotificationColor(notification.type)
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700
                  hover:shadow-md transition-shadow
                  ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {notification.actionable && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Take Action
                      </button>
                      <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
