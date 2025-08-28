'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchMemories, useDeleteMemory } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CreateMemoryForm } from './CreateMemoryForm'
import { EditMemoryForm } from './EditMemoryForm'
import { MemorySearchFilters, type MemoryFilters } from './MemorySearchFilters'
import { MemoryList } from './MemoryList'
import { PlusIcon } from '@heroicons/react/24/outline'
import { responsiveSpacing, responsiveText, layoutPatterns, touchTargets } from '@/lib/utils/responsive'
import type { Memory } from '@/lib/api'

export function MemoriesPage() {
  const t = useTranslations('memories.page')
  
  // State management
  const [filters, setFilters] = useState<MemoryFilters>({
    query: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  
  // API hooks
  const searchParams = useMemo(() => ({
    agentId: 'default-agent', // TODO: Get from session context
    query: searchQuery || filters.query || '*',
    limit: 20,
    minImportance: filters.importance?.min || 0,
    project: filters.project,
    session: filters.session,
    includeOtherAgents: false,
  }), [searchQuery, filters])
  
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useSearchMemories(searchParams, {
    enabled: !!searchParams.query && searchParams.query !== '',
  })
  
  const deleteMemoryMutation = useDeleteMemory()

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFiltersChange = useCallback((newFilters: MemoryFilters) => {
    setFilters(newFilters)
  }, [])

  const handleCreateSuccess = useCallback((_memory: Memory) => {
    setShowCreateForm(false)
    refetchSearch()
    // TODO: Add toast notification
  }, [refetchSearch])

  const handleEditSuccess = useCallback((_memory: Memory) => {
    setEditingMemory(null)
    refetchSearch()
    // TODO: Add toast notification
  }, [refetchSearch])

  const handleEdit = useCallback((memory: Memory) => {
    setEditingMemory(memory)
  }, [])

  const handleDelete = useCallback((memoryId: string) => {
    deleteMemoryMutation.mutateAsync(memoryId)
      .then(() => {
        refetchSearch()
        // TODO: Add toast notification
      })
      .catch((error) => {
        console.error('Failed to delete memory:', error)
      })
  }, [deleteMemoryMutation, refetchSearch])

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingMemory(null)
  }, [])

  // Render functions
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t('subtitle')}
        </p>
      </div>
      
      {!showCreateForm && !editingMemory && (
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
          size="md"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="block sm:inline">{t('actions.createMemory')}</span>
        </Button>
      )}
    </div>
  )

  const renderCreateForm = () => {
    if (!showCreateForm) return null

    return (
      <div className="mb-6 mx-auto max-w-2xl">
        <CreateMemoryForm
          onSuccess={handleCreateSuccess}
          onCancel={handleCancelCreate}
        />
      </div>
    )
  }

  const renderEditForm = () => {
    if (!editingMemory) return null

    return (
      <div className="mb-6 mx-auto max-w-2xl">
        <EditMemoryForm
          memory={editingMemory}
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
        />
      </div>
    )
  }

  const renderSearchAndFilters = () => {
    if (showCreateForm || editingMemory) return null

    return (
      <div className="mb-4 sm:mb-6">
        <MemorySearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          isLoading={isSearchLoading}
        />
      </div>
    )
  }

  const renderMemoryList = () => {
    if (showCreateForm || editingMemory) return null

    // If no search has been performed, show empty state
    if (!searchQuery && !filters.query) {
      return (
        <Card className="p-6 sm:p-8 text-center">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <PlusIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">{t('welcome.title')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('welcome.description')}
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[48px]"
              >
                <PlusIcon className="w-5 h-5" />
                <span>{t('actions.createFirstMemory')}</span>
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <MemoryList
        memories={searchResults || []}
        isLoading={isSearchLoading}
        error={searchError?.message || null}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  const renderStats = () => {
    if (showCreateForm || editingMemory || !searchResults?.length) return null

    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <span>
          {t('stats.found', { count: searchResults.length })}
        </span>
        {searchQuery && (
          <span className="truncate max-w-xs sm:max-w-none">
            {t('stats.searchQuery', { query: searchQuery })}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderHeader()}
        {renderCreateForm()}
        {renderEditForm()}
        {renderSearchAndFilters()}
        {renderStats()}
        {renderMemoryList()}
      </div>
    </div>
  )
}