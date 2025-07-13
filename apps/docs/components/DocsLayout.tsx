/**
 * DocsLayout - Advanced Documentation Platform Layout
 * Professional documentation interface with navigation, search, and analytics
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Settings,
  Bell,
  User,
  Edit,
  Share,
  Download,
  Bookmark,
  Eye,
  Clock,
  Star,
  MessageCircle,
  GitBranch,
  Archive,
  FileText,
  Zap,
  Filter,
  Tag,
  Globe,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react'

interface DocsLayoutProps {
  children: React.ReactNode
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  currentPage?: string
  searchEnabled?: boolean
  notifications?: number
  userProfile?: UserProfile
  documentationMeta?: DocumentationMeta
}

interface UserProfile {
  name: string
  avatar?: string
  role: string
  permissions: string[]
}

interface DocumentationMeta {
  title: string
  description?: string
  lastModified?: Date
  author?: string
  version?: string
  status?: 'draft' | 'published' | 'archived'
  readingTime?: number
  category?: string
  tags?: string[]
}

interface NavigationItem {
  id: string
  title: string
  icon?: React.ReactNode
  href?: string
  children?: NavigationItem[]
  badge?: string
  isNew?: boolean
  isExpanded?: boolean
}

interface SearchResult {
  id: string
  title: string
  content: string
  type: string
  url: string
  relevance: number
}

const DocsLayout: React.FC<DocsLayoutProps> = ({
  children,
  sidebarCollapsed = false,
  onSidebarToggle,
  currentPage = '',
  searchEnabled = true,
  notifications = 0,
  userProfile,
  documentationMeta
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['getting-started']))
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [activeView, setActiveView] = useState<'docs' | 'api' | 'guides' | 'changelog'>('docs')
  const [copiedText, setCopiedText] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Navigation structure
  const navigationItems: NavigationItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="w-4 h-4" />,
      children: [
        { id: 'introduction', title: 'Introduction', href: '/docs/introduction' },
        { id: 'installation', title: 'Installation', href: '/docs/installation' },
        { id: 'quick-start', title: 'Quick Start', href: '/docs/quick-start', isNew: true }
      ]
    },
    {
      id: 'guides',
      title: 'Guides',
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        { id: 'tutorial', title: 'Tutorial', href: '/docs/tutorial' },
        { id: 'best-practices', title: 'Best Practices', href: '/docs/best-practices' },
        { id: 'examples', title: 'Examples', href: '/docs/examples' }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: <FileText className="w-4 h-4" />,
      children: [
        { id: 'authentication', title: 'Authentication', href: '/docs/api/auth' },
        { id: 'endpoints', title: 'Endpoints', href: '/docs/api/endpoints' },
        { id: 'webhooks', title: 'Webhooks', href: '/docs/api/webhooks' }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Topics',
      icon: <Settings className="w-4 h-4" />,
      children: [
        { id: 'architecture', title: 'Architecture', href: '/docs/architecture' },
        { id: 'performance', title: 'Performance', href: '/docs/performance' },
        { id: 'security', title: 'Security', href: '/docs/security' }
      ]
    }
  ]

  // Mock search function
  const performSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200))

    return [
      {
        id: '1',
        title: 'Getting Started with API',
        content: 'Learn how to quickly get started with our API...',
        type: 'Guide',
        url: '/docs/api/getting-started',
        relevance: 0.95
      },
      {
        id: '2',
        title: 'Authentication Methods',
        content: 'Comprehensive guide to authentication...',
        type: 'API Reference',
        url: '/docs/api/auth',
        relevance: 0.87
      }
    ].filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.content.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const searchTimeout = setTimeout(async () => {
        const results = await performSearch(searchQuery)
        setSearchResults(results)
      }, 300)

      return () => clearTimeout(searchTimeout)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (e.key === 'Escape') {
        setIsSearchFocused(false)
        setShowSettings(false)
        setShowNotifications(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const toggleBookmark = (itemId: string) => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(itemId)) {
      newBookmarks.delete(itemId)
    } else {
      newBookmarks.add(itemId)
    }
    setBookmarks(newBookmarks)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isActive = currentPage === item.href

    return (
      <div key={item.id} className="mb-1">
        <motion.div
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg text-sm
            transition-all duration-200 cursor-pointer group
            ${isActive
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            ${level > 0 ? 'ml-4' : ''}
          `}
          onClick={() => hasChildren ? toggleExpanded(item.id) : undefined}
          whileHover={{ x: level === 0 ? 2 : 0 }}
          whileTap={{ scale: 0.98 }}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <div className="flex items-center space-x-2 flex-1">
            {item.icon}
            <span className="font-medium">{item.title}</span>
            {item.isNew && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                New
              </span>
            )}
            {item.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {item.badge}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {item.href && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(item.id)
                }}
                className={`
                  p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                  ${bookmarks.has(item.id)
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                <Bookmark className="w-3 h-3" />
              </button>
            )}

            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1">
                {item.children?.map(child => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:relative lg:z-auto"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Documentation
                  </span>
                </div>

                <button
                  onClick={onSidebarToggle}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { key: 'docs', label: 'Docs', icon: <BookOpen className="w-4 h-4" /> },
                  { key: 'api', label: 'API', icon: <FileText className="w-4 h-4" /> },
                  { key: 'guides', label: 'Guides', icon: <Zap className="w-4 h-4" /> },
                  { key: 'changelog', label: 'Changes', icon: <GitBranch className="w-4 h-4" /> }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key as any)}
                    className={`
                      flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium
                      border-b-2 transition-colors
                      ${activeView === key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {navigationItems.map(item => renderNavigationItem(item))}
                </nav>

                {/* Bookmarks Section */}
                {bookmarks.size > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Bookmarks
                    </h3>
                    <div className="space-y-1">
                      {Array.from(bookmarks).map(bookmarkId => {
                        const findItem = (items: NavigationItem[]): NavigationItem | null => {
                          for (const item of items) {
                            if (item.id === bookmarkId) return item
                            if (item.children) {
                              const found = findItem(item.children)
                              if (found) return found
                            }
                          }
                          return null
                        }

                        const item = findItem(navigationItems)
                        return item ? (
                          <div key={bookmarkId} className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <span>{item.title}</span>
                            <button
                              onClick={() => toggleBookmark(bookmarkId)}
                              className="text-yellow-500 hover:text-yellow-600"
                            >
                              <Bookmark className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    v2.1.0
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onSidebarToggle}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              {documentationMeta && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{documentationMeta.category || 'Documentation'}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {documentationMeta.title}
                  </span>
                </div>
              )}
            </div>

            {/* Search */}
            {searchEnabled && (
              <div className="flex-1 max-w-lg mx-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search docs... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {isSearchFocused && (searchQuery || searchResults.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                    >
                      {searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((result) => (
                            <a
                              key={result.id}
                              href={result.url}
                              className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {result.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {result.content}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  {result.type}
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2" />
                          <p>No results found for "{searchQuery}"</p>
                        </div>
                      ) : (
                        <div className="p-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Recent Searches
                          </h4>
                          <div className="space-y-1">
                            {['API authentication', 'Getting started', 'Webhooks'].map((term) => (
                              <button
                                key={term}
                                onClick={() => setSearchQuery(term)}
                                className="block w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              {/* Documentation Meta */}
              {documentationMeta && (
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  {documentationMeta.readingTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{documentationMeta.readingTime} min read</span>
                    </div>
                  )}

                  {documentationMeta.lastModified && (
                    <div className="flex items-center space-x-1">
                      <Edit className="w-4 h-4" />
                      <span>Updated {documentationMeta.lastModified.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => copyToClipboard(window.location.href)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Copy link"
                >
                  {copiedText === window.location.href ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Share"
                >
                  <Share className="w-4 h-4" />
                </button>

                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Notifications
                          </h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {[
                            { type: 'info', message: 'New API version 2.1 released', time: '2 hours ago' },
                            { type: 'warning', message: 'Deprecated endpoint will be removed', time: '1 day ago' },
                            { type: 'success', message: 'Documentation updated', time: '3 days ago' }
                          ].map((notification, index) => (
                            <div key={index} className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {notification.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                                  {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                                  {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile */}
                {userProfile && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Auto</option>
                      <option>Light</option>
                      <option>Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-save
                    </span>
                    <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out">
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DocsLayout
