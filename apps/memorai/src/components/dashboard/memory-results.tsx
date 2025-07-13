'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckSquare,
  MessageCircle,
  FileImage,
  MessageSquare,
  User,
  Heart,
  Clock,
  Tag,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Share,
  Copy
} from 'lucide-react'
import { useMemoryStore, type Memory } from '../../stores/memory-store'
import { cn } from '../../lib/utils'

interface MemoryResultsProps {
  className?: string
  searchQuery?: string
  selectedType?: Memory['type'] | 'all'
  sortBy?: 'date' | 'importance' | 'type'
  sortOrder?: 'asc' | 'desc'
  onMemoryClick?: (memory: Memory) => void
  onMemoryEdit?: (memory: Memory) => void
  onMemoryDelete?: (memoryId: string) => void
  onMemoryShare?: (memory: Memory) => void
}

const memoryTypeIcons: Record<Memory['type'], React.ReactNode> = {
  note: <FileText className="w-4 h-4" />,
  task: <CheckSquare className="w-4 h-4" />,
  conversation: <MessageCircle className="w-4 h-4" />,
  document: <FileImage className="w-4 h-4" />,
  thread: <MessageSquare className="w-4 h-4" />,
  personality: <User className="w-4 h-4" />,
  emotion: <Heart className="w-4 h-4" />,
}

const memoryTypeColors: Record<Memory['type'], string> = {
  note: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  task: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  conversation: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  document: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  thread: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
  personality: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  emotion: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
}

export function MemoryResults({
  className,
  searchQuery,
  selectedType = 'all',
  sortBy = 'date',
  sortOrder = 'desc',
  onMemoryClick,
  onMemoryEdit,
  onMemoryDelete,
  onMemoryShare
}: MemoryResultsProps) {
  const { memories, isLoading } = useMemoryStore()
  const [selectedMemory, setSelectedMemory] = React.useState<string | null>(null)

  // Filter and sort memories
  const filteredMemories = React.useMemo(() => {
    let filtered = memories

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(memory =>
        memory.content.toLowerCase().includes(query) ||
        memory.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(memory => memory.type === selectedType)
    }

    // Sort memories
    return filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'importance':
          comparison = a.importance - b.importance
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [memories, searchQuery, selectedType, sortBy, sortOrder])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`

    return date.toLocaleDateString()
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.8) return 'text-red-500'
    if (importance >= 0.6) return 'text-orange-500'
    if (importance >= 0.4) return 'text-yellow-500'
    return 'text-gray-400'
  }

  const handleMemoryAction = (action: string, memory: Memory) => {
    switch (action) {
      case 'edit':
        onMemoryEdit?.(memory)
        break
      case 'delete':
        onMemoryDelete?.(memory.id)
        break
      case 'share':
        onMemoryShare?.(memory)
        break
      case 'copy':
        navigator.clipboard.writeText(memory.content)
        break
    }
    setSelectedMemory(null)
  }

  if (isLoading) {
    return (
      <div className={cn('p-6 space-y-4', className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (filteredMemories.length === 0) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <div className="max-w-md mx-auto">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No memories found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? `No memories match "${searchQuery}". Try a different search term.`
              : 'Start by creating your first memory using the Memory Actions panel.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('p-6', className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Memory Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredMemories.map((memory) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onMemoryClick?.(memory)}
              data-testid={`memory-item-${memory.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      memoryTypeColors[memory.type]
                    )}>
                      {memoryTypeIcons[memory.type]}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {memory.type}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(memory.timestamp.toString())}
                        </span>
                        <Star className={cn(
                          'w-3 h-3',
                          getImportanceColor(memory.importance)
                        )} />
                        <span className={cn(
                          'text-xs font-medium',
                          getImportanceColor(memory.importance)
                        )}>
                          {Math.round(memory.importance * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-900 dark:text-gray-100 mb-3 line-clamp-3">
                    {memory.content}
                  </p>

                  {/* Tags */}
                  {memory.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 mb-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {memory.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="relative ml-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedMemory(selectedMemory === memory.id ? null : memory.id)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    data-testid={`memory-actions-${memory.id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>

                  {/* Actions Menu */}
                  <AnimatePresence>
                    {selectedMemory === memory.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleMemoryAction('edit', memory)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleMemoryAction('copy', memory)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => handleMemoryAction('share', memory)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Share className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                        <button
                          onClick={() => handleMemoryAction('delete', memory)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
