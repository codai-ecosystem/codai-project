'use client'

import React, { useState } from 'react'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'

interface AdvancedSearchProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: any) => void
  placeholder?: string
  className?: string
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Search memories...",
  className = ""
}) => {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  const handleFilterToggle = () => {
    setShowFilters(!showFilters)
  }

  const handleSortToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)
    onFilterChange?.({ sortOrder: newOrder })
  }

  return (
    <div className={`search-container ${className}`}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search input"
          />
        </div>

        <button
          onClick={handleFilterToggle}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4" />
        </button>

        <button
          onClick={handleSortToggle}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          aria-label="Toggle sort order"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <p>Advanced filters panel</p>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch