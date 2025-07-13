'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Upload,
  Sparkles,
  X,
  Loader2,
  FileText,
  CheckSquare,
  MessageCircle,
  FileImage,
  MessageSquare,
  User,
  Heart
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useMemoryStore, type Memory } from '../../stores/memory-store'
import { cn } from '../../lib/utils'

interface MemoryActionsProps {
  className?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  testId: string
}

const memoryTypeOptions: Array<{ value: Memory['type']; label: string; icon: React.ReactNode }> = [
  { value: 'note', label: 'Note', icon: <FileText className="w-4 h-4" /> },
  { value: 'task', label: 'Task', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'conversation', label: 'Conversation', icon: <MessageCircle className="w-4 h-4" /> },
  { value: 'document', label: 'Document', icon: <FileImage className="w-4 h-4" /> },
  { value: 'thread', label: 'Thread', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'personality', label: 'Personality', icon: <User className="w-4 h-4" /> },
  { value: 'emotion', label: 'Emotion', icon: <Heart className="w-4 h-4" /> },
]

export function MemoryActions({ className }: MemoryActionsProps) {
  const { addMemory, isLoading } = useMemoryStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    type: 'note' as Memory['type'],
    tags: '',
    importance: 0.5
  })

  const handleBulkImport = () => {
    toast('Bulk import feature coming soon!')
  }

  const handleAIAssist = () => {
    toast('AI assist feature coming soon!')
  }

  const quickActions: QuickAction[] = [
    {
      id: 'add-memory',
      title: 'Add Memory',
      description: 'Create a new memory entry',
      icon: <Plus className="w-6 h-6" />,
      onClick: () => setShowAddForm(true),
      testId: 'quick-action-add-memory'
    },
    {
      id: 'bulk-import',
      title: 'Bulk Import',
      description: 'Import memories from file',
      icon: <Upload className="w-6 h-6" />,
      onClick: handleBulkImport,
      testId: 'quick-action-bulk-import'
    },
    {
      id: 'ai-assist',
      title: 'AI Assist',
      description: 'Get AI suggestions for memory organization',
      icon: <Sparkles className="w-6 h-6" />,
      onClick: handleAIAssist,
      testId: 'quick-action-ai-assist'
    }
  ]

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.content.trim()) {
      toast.error('Content is required')
      return
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      await addMemory(formData.content, {
        type: formData.type,
        tags,
        importance: formData.importance,
        source: 'dashboard'
      })

      toast.success('Memory added successfully!')
      setShowAddForm(false)
      setFormData({
        content: '',
        type: 'note',
        tags: '',
        importance: 0.5
      })
    } catch (error) {
      toast.error('Failed to add memory')
    }
  }

  const handleFormReset = () => {
    setShowAddForm(false)
    setFormData({
      content: '',
      type: 'note',
      tags: '',
      importance: 0.5
    })
  }

  return (
    <div className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Memory Actions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create, manage, and organize your memories
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            data-testid={action.testId}
            onClick={action.onClick}
            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left group bg-white dark:bg-gray-800"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {action.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Add Memory Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleFormReset()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add New Memory
                </h3>
                <button
                  data-testid="close-form-button"
                  onClick={handleFormReset}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4" role="form">
                {/* Content Field */}
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Content *
                  </label>
                  <textarea
                    id="content"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter memory content..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>

                {/* Type Field */}
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Memory['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    {memoryTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Field */}
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Importance Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Importance: {Math.round(formData.importance * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.importance}
                    onChange={(e) => setFormData(prev => ({ ...prev, importance: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleFormReset}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="submit-memory-button"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add Memory</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
