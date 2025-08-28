'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useUpdateMemory } from '@/lib/api/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Memory, UpdateMemory } from '@/lib/api/types'

interface EditMemoryFormProps {
  memory: Memory
  onSuccess?: (memory: Memory) => void
  onCancel?: () => void
}

export function EditMemoryForm({ memory, onSuccess, onCancel }: EditMemoryFormProps) {
  const t = useTranslations('memories.edit')
  const updateMemoryMutation = useUpdateMemory()
  
  const [formData, setFormData] = useState<UpdateMemory>({
    content: memory.content,
    metadata: {
      importance: memory.metadata?.importance || 5,
      tags: memory.metadata?.tags || [],
      project: memory.metadata?.project || '',
      session: memory.metadata?.session || '',
    }
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Reset form when memory changes
  useEffect(() => {
    setFormData({
      content: memory.content,
      metadata: {
        importance: memory.metadata?.importance || 5,
        tags: memory.metadata?.tags || [],
        project: memory.metadata?.project || '',
        session: memory.metadata?.session || '',
      }
    })
    setErrors({})
  }, [memory])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.content?.trim()) {
      newErrors['content'] = t('validation.contentRequired')
    } else if (formData.content.trim().length < 10) {
      newErrors['content'] = t('validation.contentMinLength')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const updatedMemory = await updateMemoryMutation.mutateAsync({
        id: memory.id,
        data: {
          content: formData.content?.trim(),
          metadata: {
            importance: formData.metadata?.importance || 5,
            tags: formData.metadata?.tags || [],
            project: formData.metadata?.project || '',
            session: formData.metadata?.session || '',
          }
        }
      })
      onSuccess?.(updatedMemory)
    } catch (error) {
      console.error('Failed to update memory:', error)
    }
  }

  const addTag = (tag: string) => {
    if (!tag.trim() || !formData.metadata) return
    
    const normalizedTag = tag.trim().toLowerCase()
    if (formData.metadata.tags?.includes(normalizedTag)) return
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: [...(prev.metadata?.tags || []), normalizedTag]
      }
    }))
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    if (!formData.metadata) return
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
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
        setTagInput(lastTag)
      }
    }
  }

  const hasChanges = () => {
    return (
      formData.content !== memory.content ||
      formData.metadata?.importance !== memory.metadata?.importance ||
      JSON.stringify(formData.metadata?.tags) !== JSON.stringify(memory.metadata?.tags) ||
      formData.metadata?.project !== memory.metadata?.project ||
      formData.metadata?.session !== memory.metadata?.session
    )
  }

  return (
    <Card className="p-4 sm:p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            {t('title')}
          </h2>
          {onCancel && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground self-end sm:self-auto min-h-9 min-w-9"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              {t('fields.content')}
            </Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('fields.contentPlaceholder')}
              rows={4}
              className={`min-h-[100px] text-sm min-h-9 ${
                errors['content'] ? 'border-red-500 focus-visible:ring-red-500' : ''
              }`}
            />
            {errors['content'] && (
              <p className="text-sm text-red-500">{errors['content']}</p>
            )}
          </div>

          {/* Importance Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="importance" className="text-sm font-medium">
                {t('fields.importance')}
              </Label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {formData.metadata?.importance || 5}
              </span>
            </div>
            <Slider
              id="importance"
              min={1}
              max={10}
              step={1}
              value={[formData.metadata?.importance || 5]}
              onValueChange={(value) => 
                setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, importance: value[0] }
                }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('fields.importanceLow')}</span>
              <span>{t('fields.importanceHigh')}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label htmlFor="tags" className="text-sm font-medium">
              {t('fields.tags')}
            </Label>
            
            {/* Existing Tags */}
            {formData.metadata?.tags && formData.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.metadata.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="group cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 min-h-6 px-2"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <XMarkIcon className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder={t('fields.tagsPlaceholder')}
                className="flex-1 text-sm min-h-9"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim()}
                className="min-h-9 min-w-9"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Project Field */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium">
              {t('fields.project')}
            </Label>
            <Input
              id="project"
              value={formData.metadata?.project || ''}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, project: e.target.value }
                }))
              }
              placeholder={t('fields.projectPlaceholder')}
              className="text-sm min-h-9"
            />
          </div>

          {/* Session Field */}
          <div className="space-y-2">
            <Label htmlFor="session" className="text-sm font-medium">
              {t('fields.session')}
            </Label>
            <Input
              id="session"
              value={formData.metadata?.session || ''}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, session: e.target.value }
                }))
              }
              placeholder={t('fields.sessionPlaceholder')}
              className="text-sm min-h-9"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={!hasChanges() || updateMemoryMutation.isPending}
              className="flex-1 sm:flex-none min-h-9"
            >
              {updateMemoryMutation.isPending ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('actions.updating')}
                </>
              ) : (
                t('actions.update')
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={updateMemoryMutation.isPending}
                className="flex-1 sm:flex-none min-h-9"
              >
                {t('actions.cancel')}
              </Button>
            )}
          </div>

          {/* Show changes indicator */}
          {hasChanges() && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border">
              {t('status.hasChanges')}
            </div>
          )}
        </form>
      </div>
    </Card>
  )
}