'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Search,
  Plus,
  BarChart3,
  Settings,
  FileText,
  CheckSquare,
  MessageCircle,
  FileImage,
  MessageSquare,
  User,
  Heart,
  Folder,
  Tag,
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  Filter,
  Archive,
  Trash2
} from 'lucide-react'
import { useMemoryStore, type Memory } from '../../stores/memory-store'
import { cn } from '../../lib/utils'

interface DashboardSidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: (view: string) => void
  currentView?: string
  onQuickFilter?: (filter: any) => void
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  view: string
  badge?: number
  color?: string
}

interface QuickFilter {
  id: string
  label: string
  icon: React.ReactNode
  count: number
  filter: any
  color: string
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, view: 'dashboard' },
  { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" />, view: 'search' },
  { id: 'add-memory', label: 'Add Memory', icon: <Plus className="w-5 h-5" />, view: 'add' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, view: 'analytics' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, view: 'settings' },
]

const memoryTypeFilters = [
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" />, type: 'note', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, type: 'task', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  { id: 'conversations', label: 'Conversations', icon: <MessageCircle className="w-4 h-4" />, type: 'conversation', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  { id: 'documents', label: 'Documents', icon: <FileImage className="w-4 h-4" />, type: 'document', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  { id: 'threads', label: 'Threads', icon: <MessageSquare className="w-4 h-4" />, type: 'thread', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' },
  { id: 'personalities', label: 'Personalities', icon: <User className="w-4 h-4" />, type: 'personality', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'emotions', label: 'Emotions', icon: <Heart className="w-4 h-4" />, type: 'emotion', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
]

export function DashboardSidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
  currentView = 'dashboard',
  onQuickFilter
}: DashboardSidebarProps) {
  const { memories, getMemoriesByType, getRecentMemories } = useMemoryStore()
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    navigation: true,
    types: true,
    quick: true,
    collections: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getTypeCount = (type: Memory['type']) => {
    return getMemoriesByType(type).length
  }

  const getQuickFilters = (): QuickFilter[] => {
    const recentMemories = getRecentMemories(7) // Last 7 days
    const importantMemories = memories.filter(m => m.importance >= 0.8)
    const taggedMemories = memories.filter(m => m.tags.length > 0)

    return [
      {
        id: 'recent',
        label: 'Recent',
        icon: <Clock className="w-4 h-4" />,
        count: recentMemories.length,
        filter: { timeRange: '7days' },
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      },
      {
        id: 'important',
        label: 'Important',
        icon: <Star className="w-4 h-4" />,
        count: importantMemories.length,
        filter: { importance: { min: 0.8, max: 1.0 } },
        color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      },
      {
        id: 'tagged',
        label: 'Tagged',
        icon: <Tag className="w-4 h-4" />,
        count: taggedMemories.length,
        filter: { hasTags: true },
        color: 'text-green-600 bg-green-50 dark:bg-green-900/20'
      },
      {
        id: 'archived',
        label: 'Archived',
        icon: <Archive className="w-4 h-4" />,
        count: 0, // Placeholder - would need archived status in Memory interface
        filter: { archived: true },
        color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
      }
    ]
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64'

  return (
    <aside className={cn(
      'sticky top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden flex flex-col',
      sidebarWidth,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Navigation
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {memories.length} memories
            </p>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleCollapse}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          data-testid="toggle-sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4 rotate-90" />
          )}
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="p-4">
          <div className="space-y-1">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection('navigation')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <span>MAIN</span>
                {expandedSections.navigation ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            <AnimatePresence>
              {(isCollapsed || expandedSections.navigation) && (
                <motion.div
                  initial={!isCollapsed ? { opacity: 0, height: 0 } : false}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 mt-2"
                >
                  {navigationItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate?.(item.view)}
                      className={cn(
                        'flex items-center w-full p-3 rounded-lg text-left transition-colors group',
                        currentView === item.view
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                      data-testid={`nav-${item.id}`}
                    >
                      <span className={cn(
                        'flex-shrink-0',
                        currentView === item.view
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      )}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Memory Types */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => toggleSection('types')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-2"
              >
                <span>MEMORY TYPES</span>
                {expandedSections.types ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.types && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    {memoryTypeFilters.map((filter) => (
                      <motion.button
                        key={filter.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onQuickFilter?.({ type: filter.type })}
                        className="flex items-center justify-between w-full p-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        data-testid={`filter-${filter.id}`}
                      >
                        <div className="flex items-center">
                          <span className={cn('p-1 rounded', filter.color)}>
                            {filter.icon}
                          </span>
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {filter.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getTypeCount(filter.type as Memory['type'])}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Filters */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => toggleSection('quick')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-2"
              >
                <span>QUICK FILTERS</span>
                {expandedSections.quick ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.quick && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    {getQuickFilters().map((filter) => (
                      <motion.button
                        key={filter.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onQuickFilter?.(filter.filter)}
                        className="flex items-center justify-between w-full p-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        data-testid={`quick-filter-${filter.id}`}
                      >
                        <div className="flex items-center">
                          <span className={cn('p-1 rounded', filter.color)}>
                            {filter.icon}
                          </span>
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {filter.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {filter.count}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collections */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => toggleSection('collections')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-2"
              >
                <span>COLLECTIONS</span>
                {expandedSections.collections ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.collections && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <div className="text-center py-4">
                      <Folder className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No collections yet
                      </p>
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">
                        Create collection
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
