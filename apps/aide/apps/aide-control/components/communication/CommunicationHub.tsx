'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  InboxIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  ShieldExclamationIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ArchiveBoxIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  LinkIcon,
  DocumentTextIcon,
  UserIcon,
  AtSymbolIcon,
  HashtagIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

interface Notification {
  id: string
  type: 'mention' | 'comment' | 'review' | 'deployment' | 'security' | 'system' | 'invitation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: {
    type: 'project' | 'team' | 'user' | 'system'
    id: string
    name: string
  }
  actor?: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  isRead: boolean
  isStarred: boolean
  actions?: NotificationAction[]
  metadata?: Record<string, any>
}

interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: string
}

interface ChatMessage {
  id: string
  content: string
  authorId: string
  author: {
    id: string
    name: string
    avatar?: string
    status: 'online' | 'away' | 'offline'
  }
  timestamp: Date
  type: 'text' | 'code' | 'file' | 'system'
  mentions?: string[]
  reactions?: { emoji: string; users: string[] }[]
  threadId?: string
  replyToId?: string
}

interface CommunicationHubProps {
  userId: string
  teamId?: string
  projectId?: string
}

export function CommunicationHub({ userId, teamId, projectId }: CommunicationHubProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'chat' | 'inbox'>('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'mentions'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())

  // Mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'mention',
        priority: 'high',
        title: 'You were mentioned in a comment',
        message: 'John Doe mentioned you in a comment on Button.tsx: "@alice Can you review the accessibility improvements?"',
        source: { type: 'project', id: 'proj-1', name: 'Frontend App' },
        actor: { id: 'user-1', name: 'John Doe' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        isStarred: false,
        actions: [
          { id: 'reply', label: 'Reply', type: 'primary', action: 'reply' },
          { id: 'view', label: 'View Comment', type: 'secondary', action: 'view' }
        ],
        metadata: { file: '/src/components/Button.tsx', line: 42 }
      },
      {
        id: '2',
        type: 'review',
        priority: 'medium',
        title: 'Review requested',
        message: 'Jane Smith requested your review on pull request #127: "Add dark mode support"',
        source: { type: 'project', id: 'proj-1', name: 'Frontend App' },
        actor: { id: 'user-2', name: 'Jane Smith' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        isStarred: true,
        actions: [
          { id: 'review', label: 'Start Review', type: 'primary', action: 'review' },
          { id: 'decline', label: 'Decline', type: 'secondary', action: 'decline' }
        ],
        metadata: { pullRequestId: '127', branch: 'feature/dark-mode' }
      },
      {
        id: '3',
        type: 'deployment',
        priority: 'low',
        title: 'Deployment completed',
        message: 'Version 2.1.0 has been successfully deployed to production',
        source: { type: 'system', id: 'deployment', name: 'Deployment System' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
        isStarred: false,
        actions: [
          { id: 'view', label: 'View Deployment', type: 'secondary', action: 'view' }
        ],
        metadata: { version: '2.1.0', environment: 'production' }
      },
      {
        id: '4',
        type: 'security',
        priority: 'critical',
        title: 'Security vulnerability detected',
        message: 'A high-severity vulnerability was found in the authentication module. Immediate action required.',
        source: { type: 'system', id: 'security', name: 'Security Scanner' },
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        isRead: false,
        isStarred: false,
        actions: [
          { id: 'fix', label: 'Fix Now', type: 'danger', action: 'fix' },
          { id: 'details', label: 'View Details', type: 'secondary', action: 'details' }
        ],
        metadata: { severity: 'high', component: 'auth-module', cveId: 'CVE-2024-1234' }
      },
      {
        id: '5',
        type: 'invitation',
        priority: 'medium',
        title: 'Team invitation',
        message: 'You have been invited to join the "Backend Team" with admin permissions',
        source: { type: 'team', id: 'team-2', name: 'Backend Team' },
        actor: { id: 'user-3', name: 'Mike Johnson' },
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        isRead: false,
        isStarred: false,
        actions: [
          { id: 'accept', label: 'Accept', type: 'primary', action: 'accept' },
          { id: 'decline', label: 'Decline', type: 'secondary', action: 'decline' }
        ]
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length)

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hey everyone! Just deployed the new authentication system to staging. Could use some testing help.',
        authorId: 'user-1',
        author: { id: 'user-1', name: 'John Doe', status: 'online' },
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        type: 'text',
        reactions: [{ emoji: '👍', users: ['user-2', 'user-3'] }]
      },
      {
        id: '2',
        content: 'Great work! I\'ll test the OAuth flow this afternoon',
        authorId: 'user-2',
        author: { id: 'user-2', name: 'Jane Smith', status: 'online' },
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        type: 'text',
        replyToId: '1'
      },
      {
        id: '3',
        content: '```javascript\nconst handleAuth = async (credentials) => {\n  // New authentication logic\n  return await authenticateUser(credentials);\n};\n```',
        authorId: 'user-1',
        author: { id: 'user-1', name: 'John Doe', status: 'online' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'code'
      }
    ]

    setMessages(mockMessages)
  }, [])

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    const iconClass = priority === 'critical' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
        priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'

    switch (type) {
      case 'mention':
        return <AtSymbolIcon className={`w-5 h-5 ${iconClass}`} />
      case 'comment':
        return <ChatBubbleLeftRightIcon className={`w-5 h-5 ${iconClass}`} />
      case 'review':
        return <EyeIcon className={`w-5 h-5 ${iconClass}`} />
      case 'deployment':
        return <RocketLaunchIcon className={`w-5 h-5 ${iconClass}`} />
      case 'security':
        return <ShieldExclamationIcon className={`w-5 h-5 ${iconClass}`} />
      case 'invitation':
        return <UserGroupIcon className={`w-5 h-5 ${iconClass}`} />
      default:
        return <BellIcon className={`w-5 h-5 ${iconClass}`} />
    }
  }

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false
    if (filter === 'starred' && !notification.isStarred) return false
    if (filter === 'mentions' && notification.type !== 'mention') return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.source.name.toLowerCase().includes(query)
    }

    return true
  })

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    console.log('Notification action:', notificationId, actionId)
    // Implement notification actions
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleToggleStar = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, isStarred: !n.isStarred } : n
    ))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      authorId: userId,
      author: { id: userId, name: 'You', status: 'online' },
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const tabs = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      count: unreadCount
    },
    {
      id: 'chat',
      name: 'Team Chat',
      icon: ChatBubbleLeftRightIcon
    },
    {
      id: 'inbox',
      name: 'Inbox',
      icon: InboxIcon
    }
  ]

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Communications</h1>
            {unreadCount > 0 && (
              <div className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full">
                {unreadCount} unread
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Mark all read
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-6 mt-4">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-2 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                {tab.count && tab.count > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Filters and Search */}
      {activeTab === 'notifications' && (
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only</option>
                <option value="starred">Starred</option>
                <option value="mentions">Mentions</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500' : ''
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{notification.source.name}</span>
                          {notification.actor && <span>by {notification.actor.name}</span>}
                          <span>{formatTimeAgo(notification.timestamp)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStar(notification.id)}
                            className={`p-1 rounded ${notification.isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                          >
                            <StarIcon className="w-4 h-4" />
                          </button>

                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-500 rounded"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}

                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          {notification.actions.map(action => (
                            <button
                              key={action.id}
                              onClick={() => handleNotificationAction(notification.id, action.id)}
                              className={`px-3 py-1 text-xs rounded ${action.type === 'primary'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : action.type === 'danger'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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

              {filteredNotifications.length === 0 && (
                <div className="p-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full"
            >
              {/* Chat messages */}
              <div className="flex-1 p-4 space-y-4">
                {messages.map(message => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {message.author.name[0]}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{message.author.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {message.type === 'code' ? (
                        <pre className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm overflow-x-auto">
                          <code>{message.content}</code>
                        </pre>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                      )}

                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type a message..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inbox' && (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center"
            >
              <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Inbox feature coming soon</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

