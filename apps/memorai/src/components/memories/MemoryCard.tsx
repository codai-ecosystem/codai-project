'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  FolderIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { touchTargets } from '@/lib/utils/responsive'
import type { Memory } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MemoryCardProps {
  memory: Memory
  onEdit?: (memory: Memory) => void
  onDelete?: (memoryId: string) => void
  className?: string
}

export function MemoryCard({ 
  memory, 
  onEdit, 
  onDelete, 
  className 
}: MemoryCardProps) {
  const t = useTranslations('memories.card')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEdit = () => {
    onEdit?.(memory)
  }

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    onDelete?.(memory.id)
    setShowDeleteDialog(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8) return 'high'
    if (importance >= 5) return 'medium'
    return 'low'
  }

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const importance = memory.metadata?.importance || 5
  const importanceLevel = getImportanceLevel(importance)
  const importanceColor = getImportanceColor(importanceLevel)

  return (
    <>
      <Card className={cn("p-4 sm:p-6 hover:shadow-md transition-shadow", className)} data-testid="memory-card">
        <div className="space-y-4">
          {/* Content */}
          <div className="space-y-2" data-testid="memory-content">
            <p className="text-foreground leading-relaxed line-clamp-3">
              {memory.content}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {/* Importance */}
            <div className="flex items-center gap-1">
              <ChartBarIcon className="w-4 h-4" />
              <Badge variant="secondary" className={cn("text-xs", importanceColor)}>
                {importance}/10
              </Badge>
            </div>

            {/* Project */}
            {memory.metadata?.project && (
              <div className="flex items-center gap-1">
                <FolderIcon className="w-4 h-4" />
                <span>{memory.metadata.project}</span>
              </div>
            )}

            {/* Session */}
            {memory.metadata?.session && (
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{memory.metadata.session}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-1 ml-auto">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs">
                {formatDate(memory.updatedAt || memory.createdAt)}
              </span>
            </div>
          </div>

          {/* Tags */}
          {memory.metadata?.tags && memory.metadata.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {memory.metadata.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-2 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                onKeyDown={(e) => handleKeyDown(e, handleEdit)}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  touchTargets.button
                )}
                aria-label={`Edit memory: ${memory.content.slice(0, 50)}...`}
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                {t('actions.edit')}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className={cn(
                  "text-muted-foreground hover:text-destructive",
                  touchTargets.button
                )}
                aria-label={`Delete memory: ${memory.content.slice(0, 50)}...`}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                {t('actions.delete')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('confirm.deleteMessage')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className={touchTargets.button}
            >
              {t('confirm.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className={touchTargets.button}
            >
              {t('confirm.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}