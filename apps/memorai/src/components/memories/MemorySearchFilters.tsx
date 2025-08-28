'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { responsive } from '@/lib/utils/responsive'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline'

export interface MemoryFilters {
  query?: string
  tags?: string[]
  project?: string | undefined
  session?: string | undefined
  importance?: {
    min?: number
    max?: number
  }
  dateRange?: {
    from?: Date
    to?: Date
  }
  sortBy?: 'relevance' | 'importance' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

interface MemorySearchFiltersProps {
  filters: MemoryFilters
  onFiltersChange: (filters: MemoryFilters) => void
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function MemorySearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch,
  isLoading 
}: MemorySearchFiltersProps) {
  const t = useTranslations('memories.search')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filters.query) {
      onSearch(filters.query)
    }
  }

  const addTagFilter = (tag: string) => {
    if (!tag.trim()) return
    
    const trimmedTag = tag.trim().toLowerCase()
    const currentTags = filters.tags || []
    
    if (!currentTags.includes(trimmedTag)) {
      onFiltersChange({
        ...filters,
        tags: [...currentTags, trimmedTag]
      })
    }
    setTagInput('')
  }

  const removeTagFilter = (tagToRemove: string) => {
    const currentTags = filters.tags || []
    onFiltersChange({
      ...filters,
      tags: currentTags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTagFilter(tagInput)
    }
  }

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
    setTagInput('')
  }

  const hasActiveFilters = !!(
    filters.tags?.length ||
    filters.project ||
    filters.session ||
    filters.importance ||
    filters.dateRange
  )

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={filters.query || ''}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            disabled={isLoading}
            className={`pl-10 ${responsive.touchTargets.default}`}
          />
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !filters.query?.trim()}
            className={`px-4 flex-1 sm:flex-none ${responsive.touchTargets.default}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 flex-1 sm:flex-none ${responsive.touchTargets.default}`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {t('sortBy')}:
        </span>
        <Select
          value={filters.sortBy || 'relevance'}
          onValueChange={(value: any) => onFiltersChange({ 
            ...filters, 
            sortBy: value 
          })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">{t('sortOptions.relevance')}</SelectItem>
            <SelectItem value="importance">{t('sortOptions.importance')}</SelectItem>
            <SelectItem value="created_at">{t('sortOptions.newest')}</SelectItem>
            <SelectItem value="updated_at">{t('sortOptions.updated')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value: any) => onFiltersChange({ 
            ...filters, 
            sortOrder: value 
          })}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">{t('sortOrder.desc')}</SelectItem>
            <SelectItem value="asc">{t('sortOrder.asc')}</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className={`text-muted-foreground hover:text-foreground ${responsive.touchTargets.default}`}
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            {t('clearFilters')}
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(filters.tags?.length || filters.project || filters.session) && (
        <div className="flex flex-wrap gap-2">
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <span className="text-xs">{t('filters.tagLabel')}:</span>
              <span className="truncate max-w-20 sm:max-w-none">{tag}</span>
              <button
                type="button"
                onClick={() => removeTagFilter(tag)}
                className={`ml-1 hover:bg-muted rounded-full p-0.5 flex-shrink-0 ${responsive.touchTargets.small}`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.project && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="text-xs">{t('filters.projectLabel')}:</span>
              <span className="truncate max-w-20 sm:max-w-none">{filters.project}</span>
              <button
                type="button"
                onClick={() => {
                  const { project, ...restFilters } = filters
                  onFiltersChange(restFilters)
                }}
                className={`ml-1 hover:bg-muted rounded-full p-0.5 flex-shrink-0 ${responsive.touchTargets.small}`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.session && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="text-xs">{t('filters.sessionLabel')}:</span>
              <span className="truncate max-w-20 sm:max-w-none">{filters.session}</span>
              <button
                type="button"
                onClick={() => {
                  const { session, ...restFilters } = filters
                  onFiltersChange(restFilters)
                }}
                className={`ml-1 hover:bg-muted rounded-full p-0.5 flex-shrink-0 ${responsive.touchTargets.small}`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">{t('advancedFilters')}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tag Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('filters.tags')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder={t('filters.addTag')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className={`flex-1 ${responsive.touchTargets.default}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTagFilter(tagInput)}
                  disabled={!tagInput.trim()}
                  className={`${responsive.touchTargets.default} w-full sm:w-auto`}
                >
                  {t('add')}
                </Button>
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('filters.project')}
              </label>
              <Input
                placeholder={t('filters.projectPlaceholder')}
                value={filters.project || ''}
                onChange={(e) => {
                  const value = e.target.value.trim()
                  onFiltersChange({ 
                    ...filters, 
                    project: value ? value : undefined 
                  })
                }}
                className={responsive.touchTargets.default}
              />
            </div>

            {/* Session Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('filters.session')}
              </label>
              <Input
                placeholder={t('filters.sessionPlaceholder')}
                value={filters.session || ''}
                onChange={(e) => {
                  const value = e.target.value.trim()
                  onFiltersChange({ 
                    ...filters, 
                    session: value ? value : undefined 
                  })
                }}
                className={responsive.touchTargets.default}
              />
            </div>

            {/* Importance Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('filters.importance')} ({filters.importance?.min || 1} - {filters.importance?.max || 10})
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filters.importance?.min || 1}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    importance: {
                      ...filters.importance,
                      min: parseInt(e.target.value)
                    }
                  })}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs text-muted-foreground w-4">-</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filters.importance?.max || 10}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    importance: {
                      ...filters.importance,
                      max: parseInt(e.target.value)
                    }
                  })}
                  className="flex-1 accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}