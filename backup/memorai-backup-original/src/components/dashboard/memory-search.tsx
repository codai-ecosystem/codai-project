'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  SortDesc,
  SortAsc,
  Calendar,
  Tag,
  Star,
  X,
  FileText,
  CheckSquare,
  MessageCircle,
  FileImage,
  MessageSquare,
  User,
  Heart
} from 'lucide-react'
import { type Memory } from '../../stores/memory-store'
import { cn } from '../../lib/utils'

interface MemorySearchProps {
  className?: string
  onSearch?: (query: string) => void
  onFilterType?: (type: Memory['type'] | 'all') => void
  onSort?: (sortBy: 'date' | 'importance' | 'type', order: 'asc' | 'desc') => void
  onDateRange?: (startDate: Date | null, endDate: Date | null) => void
  onImportanceRange?: (min: number, max: number) => void
  searchQuery?: string
  selectedType?: Memory['type'] | 'all'
  sortBy?: 'date' | 'importance' | 'type'
  sortOrder?: 'asc' | 'desc'
}

const memoryTypes: Array<{ value: Memory['type'] | 'all'; label: string; icon: React.ReactNode }> = [
  { value: 'all', label: 'All Types', icon: <Filter className="w-4 h-4" /> },
  { value: 'note', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  { value: 'task', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'conversation', label: 'Conversations', icon: <MessageCircle className="w-4 h-4" /> },
  { value: 'document', label: 'Documents', icon: <FileImage className="w-4 h-4" /> },
  { value: 'thread', label: 'Threads', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'personality', label: 'Personalities', icon: <User className="w-4 h-4" /> },
  { value: 'emotion', label: 'Emotions', icon: <Heart className="w-4 h-4" /> },
]

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'importance', label: 'Importance' },
  { value: 'type', label: 'Type' },
]

export function MemorySearch({
  className,
  onSearch,
  onFilterType,
  onSort,
  onDateRange,
  onImportanceRange,
  searchQuery = '',
  selectedType = 'all',
  sortBy = 'date',
  sortOrder = 'desc'
}: MemorySearchProps) {
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery)
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [minImportance, setMinImportance] = React.useState(0)
  const [maxImportance, setMaxImportance] = React.useState(1)
  const [tags, setTags] = React.useState('')

  React.useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(localSearchQuery)
  }

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    // Debounced search
    const timeoutId = setTimeout(() => {
      onSearch?.(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleTypeFilter = (type: Memory['type'] | 'all') => {
    onFilterType?.(type)
  }

  const handleSort = (newSortBy: 'date' | 'importance' | 'type') => {
    const newOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
    onSort?.(newSortBy, newOrder)
  }

  const handleDateRangeApply = () => {
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    onDateRange?.(start, end)
  }

  const handleImportanceRangeApply = () => {
    onImportanceRange?.(minImportance, maxImportance)
  }

  const clearAllFilters = () => {
    setLocalSearchQuery('')
    setStartDate('')
    setEndDate('')
    setMinImportance(0)
    setMaxImportance(1)
    setTags('')
    onSearch?.('')
    onFilterType?.('all')
    onSort?.('date', 'desc')
    onDateRange?.(null, null)
    onImportanceRange?.(0, 1)
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    minImportance !== 0 ||
    maxImportance !== 1 ||
    tags !== ''

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
      {/* Main Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Search & Filter
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              data-testid="clear-filters"
            >
              <X className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search memories by content, tags, or keywords..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="search-input"
          />
        </form>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {memoryTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeFilter(type.value)}
              className={cn(
                'flex items-center space-x-2 p-3 rounded-lg border transition-all',
                selectedType === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              )}
              data-testid={`filter-type-${type.value}`}
            >
              {type.icon}
              <span className="text-sm font-medium">{type.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <div className="flex items-center space-x-1">
              {sortOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort(option.value as 'date' | 'importance' | 'type')}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    sortBy === option.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  data-testid={`sort-${option.value}`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    sortOrder === 'desc'
                      ? <SortDesc className="w-4 h-4" />
                      : <SortAsc className="w-4 h-4" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              showAdvancedFilters
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
            data-testid="advanced-filters-toggle"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </motion.button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            {/* Date Range */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={handleDateRangeApply}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start date"
                  data-testid="start-date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onBlur={handleDateRangeApply}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End date"
                  data-testid="end-date"
                />
              </div>
            </div>

            {/* Importance Range */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="w-4 h-4" />
                <span>Importance Range ({Math.round(minImportance * 100)}% - {Math.round(maxImportance * 100)}%)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minImportance}
                  onChange={(e) => setMinImportance(parseFloat(e.target.value))}
                  onMouseUp={handleImportanceRangeApply}
                  className="w-full"
                  data-testid="min-importance"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={maxImportance}
                  onChange={(e) => setMaxImportance(parseFloat(e.target.value))}
                  onMouseUp={handleImportanceRangeApply}
                  className="w-full"
                  data-testid="max-importance"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4" />
                <span>Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., important, work, personal"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="tags-input"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
