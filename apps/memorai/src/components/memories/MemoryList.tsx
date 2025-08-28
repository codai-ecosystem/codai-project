'use client'

import { useState } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import { useUpdateMemory, useDeleteMemory } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { Memory } from '@/lib/api'

interface MemoryCardProps {
  memory: Memory
  onEdit?: ((memory: Memory) => void) | undefined
  onDelete?: ((memoryId: string) => void) | undefined
  className?: string
}

export function MemoryCard({ memory, onEdit, onDelete, className = '' }: MemoryCardProps) {
  const t = useTranslations('memories.card')
  const format = useFormatter()
  const updateMemoryMutation = useUpdateMemory()
  const deleteMemoryMutation = useDeleteMemory()
  
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleImportance = async () => {
    if (!memory.metadata) return

    try {
      await updateMemoryMutation.mutateAsync({
        id: memory.id,
        data: {
          metadata: {
            ...memory.metadata,
            importance: (memory.metadata.importance || 5) >= 8 ? 5 : 10
          }
        }
      })
    } catch (error) {
      console.error('Failed to update memory importance:', error)
    }
  }

  const handleDelete = async () => {
    if (isDeleting || !memory.id) return

    setIsDeleting(true)
    try {
      await deleteMemoryMutation.mutateAsync(memory.id)
      onDelete?.(memory.id)
    } catch (error) {
      console.error('Failed to delete memory:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format.relativeTime(date, new Date())
    } catch {
      return dateString
    }
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'text-yellow-500'
    if (importance >= 6) return 'text-blue-500'
    return 'text-muted-foreground'
  }

  const getImportanceLabel = (importance: number) => {
    if (importance >= 8) return t('importance.high')
    if (importance >= 6) return t('importance.medium')
    return t('importance.low')
  }

  return (
    <Card className={`p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="space-y-3 sm:space-y-4">
        {/* Header with Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handleToggleImportance}
              disabled={updateMemoryMutation.isPending}
              className={`${getImportanceColor(memory.metadata?.importance || 5)} hover:scale-110 transition-transform flex-shrink-0 p-1`}
              title={`${t('importance.label')}: ${getImportanceLabel(memory.metadata?.importance || 5)}`}
            >
              {(memory.metadata?.importance || 5) >= 8 ? (
                <StarIconSolid className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <StarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
              {memory.metadata?.importance || 5}/10
            </span>
          </div>

          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="p-2 h-8 w-8 sm:h-9 sm:w-9"
            >
              <EllipsisHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-9 sm:top-10 z-10 bg-background border rounded-md shadow-lg py-1 min-w-32">
                <button
                  onClick={() => {
                    onEdit?.(memory)
                    setShowActions(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
                >
                  <PencilIcon className="w-4 h-4" />
                  {t('actions.edit')}
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setShowActions(false)
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 min-h-[44px]"
                >
                  <TrashIcon className="w-4 h-4" />
                  {isDeleting ? t('actions.deleting') : t('actions.delete')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">
            {memory.content}
          </p>
          
          {memory.content.length > 200 && (
            <button className="text-xs text-primary hover:underline">
              {t('actions.readMore')}
            </button>
          )}
        </div>

        {/* Metadata */}
        {(memory.metadata?.tags?.length || memory.metadata?.project || memory.metadata?.session) && (
          <div className="flex flex-wrap gap-1.5">
            {memory.metadata.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                <TagIcon className="w-2.5 h-2.5" />
                {tag}
              </Badge>
            ))}
            {memory.metadata.project && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <FolderIcon className="w-2.5 h-2.5" />
                {memory.metadata.project}
              </Badge>
            )}
            {memory.metadata.session && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <ChatBubbleLeftRightIcon className="w-2.5 h-2.5" />
                {memory.metadata.session}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {formatDate(memory.createdAt)}
            </span>
            {memory.updatedAt !== memory.createdAt && (
              <span className="text-muted-foreground/70">
                • {t('updated')} {formatDate(memory.updatedAt)}
              </span>
            )}
          </div>
          
          {memory.relevanceScore && (
            <span className="text-primary font-medium">
              {t('relevance')}: {Math.round(memory.relevanceScore * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Click overlay to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowActions(false)}
        />
      )}
    </Card>
  )
}

interface MemoryListProps {
  memories: Memory[]
  isLoading?: boolean
  error?: string | null
  onEdit?: (memory: Memory) => void | undefined
  onDelete?: (memoryId: string) => void | undefined
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

export function MemoryList({ 
  memories, 
  isLoading, 
  error,
  onEdit, 
  onDelete,
  onLoadMore,
  hasMore,
  className = '' 
}: MemoryListProps) {
  const t = useTranslations('memories.list')

  if (error) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="space-y-3">
          <p className="text-destructive">{t('error')}</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </Card>
    )
  }

  if (!isLoading && memories.length === 0) {
    return (
      <Card className={`p-6 sm:p-8 text-center ${className}`}>
        <div className="space-y-4 max-w-md mx-auto">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{t('empty.title')}</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('empty.description')}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {memories.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 sm:p-6 animate-pulse">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                  <div className="h-6 w-6 bg-muted rounded"></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-5 bg-muted rounded w-20"></div>
                </div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4 sm:pt-6">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}