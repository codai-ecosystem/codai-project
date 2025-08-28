'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCreateMemory } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { responsive, touchTargets } from '@/lib/utils/responsive'
import { cn } from '@/lib/utils'
import type { CreateMemory } from '@/lib/api'

interface CreateMemoryFormProps {
  onSuccess?: (memory: any) => void
  onCancel?: () => void
}

export function CreateMemoryForm({ onSuccess, onCancel }: CreateMemoryFormProps) {
  const t = useTranslations('memories.create')
  const vt = useTranslations('memories.create.validation')  // Add validation translations
  const createMemoryMutation = useCreateMemory()
  
  const [formData, setFormData] = useState<CreateMemory>({
    agentId: 'default-agent', // TODO: Get from session context
    content: '',
    metadata: {
      importance: 5,
      tags: [],
      project: '',
      session: '',
    }
  })
  
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.content.trim()) {
      newErrors['content'] = vt('contentRequired')
    } else if (formData.content.trim().length < 10) {
      newErrors['content'] = vt('contentMinLength')
    }

    const importance = formData.metadata?.importance || 5
    if (importance < 1 || importance > 10) {
      newErrors['importance'] = vt('importanceRange')
    }
    
    // Debug logging for tests
    console.log('validateForm called:', { 
      content: formData.content, 
      contentTrimmed: formData.content.trim(),
      hasContentError: !formData.content.trim(),
      newErrors: newErrors,
      contentRequiredText: vt('contentRequired')
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Force validation and get result
    const isValid = validateForm()
    
    // If validation fails, the errors state will be updated and component will re-render
    if (!isValid) {
      return
    }

    try {
      const memory = await createMemoryMutation.mutateAsync({
        ...formData,
        content: formData.content.trim(),
        metadata: {
          ...formData.metadata,
          importance: formData.metadata?.importance || 5,
          project: formData.metadata?.project?.trim() || undefined,
          session: formData.metadata?.session?.trim() || undefined,
        }
      })
      
      // Clear errors on successful submission
      setErrors({})
      onSuccess?.(memory)
    } catch (error) {
      console.error('Failed to create memory:', error)
    }
  }

  const addTag = (tag: string) => {
    if (!tag.trim() || !formData.metadata) return
    
    const trimmedTag = tag.trim().toLowerCase()
    
    if (formData.metadata.tags?.includes(trimmedTag)) {
      setErrors(prev => ({ ...prev, tagExists: vt('tagExists') }))
      return
    }
    
    // Clear tag error when successfully adding
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.tagExists
      return newErrors
    })
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        tags: [...(prev.metadata?.tags || []), trimmedTag]
      }
    }))
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    if (!formData.metadata) return
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        tags: (prev.metadata?.tags || []).filter(tag => tag !== tagToRemove)
      }
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && formData.metadata?.tags?.length) {
      const lastTag = formData.metadata.tags[formData.metadata.tags.length - 1]
      if (lastTag) {
        removeTag(lastTag)
      }
    }
  }

  return (
    <Card className="p-4 sm:p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              {t('title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
          {onCancel && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onCancel}
              className={cn(
                "text-muted-foreground hover:text-foreground self-end sm:self-auto",
                touchTargets.button
              )}
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Memory Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-foreground">
              {t('fields.content.label')}
            </label>
            <textarea
              id="content"
              placeholder={t('fields.content.placeholder')}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              disabled={createMemoryMutation.isPending}
              tabIndex={0}
              aria-describedby={errors['content'] ? 'content-error' : undefined}
              className={cn(
                "w-full min-h-32 p-3 rounded-md border resize-y",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                errors['content']
                  ? 'border-destructive focus:ring-destructive/20' 
                  : 'border-input focus:ring-primary/20',
                responsive.touchTargets.default
              )}
              rows={4}
            />
            {errors['content'] && (
              <p id="content-error" className="text-sm text-destructive" role="alert">
                {errors['content']}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags-input" className="text-sm font-medium text-foreground">
              {t('fields.tags.label')}
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 min-h-6">
                {formData.metadata?.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <span className="truncate max-w-24 sm:max-w-none">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className={cn(
                        "ml-1 hover:bg-muted rounded-full p-0.5 flex-shrink-0",
                        touchTargets.iconButton
                      )}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="tags-input"
                  placeholder={t('fields.tags.placeholder')}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={createMemoryMutation.isPending}
                  className={cn("flex-1", responsive.touchTargets.default)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || createMemoryMutation.isPending}
                  aria-label="Add tag"
                  className={cn(
                    "w-full sm:w-auto",
                    touchTargets.button
                  )}
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
              {errors['tagExists'] && (
                <p className="text-sm text-destructive" role="alert">
                  {errors['tagExists']}
                </p>
              )}
            </div>
          </div>

          {/* Project and Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="project" className="text-sm font-medium text-foreground">
                {t('fields.project.label')}
              </label>
              <Input
                id="project"
                placeholder={t('fields.project.placeholder')}
                value={formData.metadata?.project || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata!, project: e.target.value }
                }))}
                disabled={createMemoryMutation.isPending}
                className={responsive.touchTargets.default}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="session" className="text-sm font-medium text-foreground">
                {t('fields.session.label')}
              </label>
              <Input
                id="session"
                placeholder={t('fields.session.placeholder')}
                value={formData.metadata?.session || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata!, session: e.target.value }
                }))}
                disabled={createMemoryMutation.isPending}
                className={responsive.touchTargets.default}
              />
            </div>
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <label htmlFor="importance" className="text-sm font-medium text-foreground">
              {t('fields.importance.label')} ({formData.metadata?.importance || 5}/10)
            </label>
            <input
              id="importance"
              type="range"
              min="1"
              max="10"
              value={formData.metadata?.importance || 5}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                metadata: { ...prev.metadata!, importance: parseInt(e.target.value) }
              }))}
              disabled={createMemoryMutation.isPending}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('fields.importance.levels.low')}</span>
              <span>{t('fields.importance.levels.medium')}</span>
              <span>{t('fields.importance.levels.high')}</span>
            </div>
            {errors['importance'] && (
              <p className="text-sm text-destructive" role="alert">
                {errors['importance']}
              </p>
            )}
          </div>

          {/* Error Message */}
          {createMemoryMutation.error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                {createMemoryMutation.error.message || t('errors.createFailed')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={createMemoryMutation.isPending}
              className={cn(
                "flex-1 order-1 sm:order-1",
                touchTargets.button
              )}
            >
              {createMemoryMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  {t('actions.creating')}
                </div>
              ) : (
                t('actions.create')
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createMemoryMutation.isPending}
                className={cn(
                  "flex-1 sm:flex-none order-2 sm:order-2",
                  touchTargets.button
                )}
              >
                {t('actions.cancel')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Card>
  )
}

export default CreateMemoryForm;