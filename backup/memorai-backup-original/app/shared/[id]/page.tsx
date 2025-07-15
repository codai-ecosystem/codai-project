'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import MemorAILayout from '../../../components/layout/MemorAILayout'
import Collaboration from '../../../components/collaboration/Collaboration'
import MemorAIService from '../../../services/memoraiService'
import {
  Brain,
  Clock,
  Tags,
  Star,
  Link2,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  Users,
  Eye,
  MessageCircle,
  Share2,
  ChevronLeft,
  Lock,
  Globe
} from 'lucide-react'
import { Memory } from '../../../services/memoraiService'

export default function SharedMemoryPage() {
  const params = useParams()
  const memoryId = params?.id as string

  if (!memoryId) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Memory ID</h2>
            <p className="text-slate-400">The memory ID is missing or invalid.</p>
          </div>
        </div>
      </MemorAILayout>
    )
  }

  const [memory, setMemory] = useState<Memory | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  const memoraiService = MemorAIService.getInstance()

  useEffect(() => {
    if (memoryId) {
      loadMemory()
    }
  }, [memoryId])

  const loadMemory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const memoryData = await memoraiService.getMemoryById(memoryId)
      if (!memoryData) {
        setError('Memory not found')
        return
      }

      setMemory(memoryData)
      setEditedContent(memoryData.content)
      setEditedTitle(memoryData.title)

      // Mock permissions - in real implementation, this would come from API
      setCanEdit(true)
      setIsOwner(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memory')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!memory || !canEdit) return

    try {
      setIsSaving(true)

      const updatedMemory = await memoraiService.updateMemory(memory.id, {
        title: editedTitle,
        content: editedContent,
        timestamps: {
          ...memory.timestamps,
          updated: new Date().toISOString()
        }
      })

      if (updatedMemory) {
        setMemory(updatedMemory)
        setIsEditing(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (memory) {
      setEditedContent(memory.content)
      setEditedTitle(memory.title)
    }
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users
      case 'research': return Brain
      case 'code': return Edit3
      case 'idea': return Star
      case 'document': return Brain
      default: return Brain
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'from-blue-500 to-cyan-500'
      case 'research': return 'from-purple-500 to-pink-500'
      case 'code': return 'from-emerald-500 to-teal-500'
      case 'idea': return 'from-yellow-500 to-orange-500'
      case 'document': return 'from-red-500 to-pink-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  if (isLoading) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="flex items-center space-x-3 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-lg font-medium">Loading shared memory...</span>
          </motion.div>
        </div>
      </MemorAILayout>
    )
  }

  if (error) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Memory</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={loadMemory}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MemorAILayout>
    )
  }

  if (!memory) {
    return (
      <MemorAILayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Memory Not Found</h2>
            <p className="text-slate-400">The requested memory could not be found.</p>
          </div>
        </div>
      </MemorAILayout>
    )
  }

  const TypeIcon = getTypeIcon(memory.type)

  return (
    <MemorAILayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(memory.type)} rounded-lg flex items-center justify-center`}>
                <TypeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Shared Memory</h1>
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Collaborative workspace</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </motion.div>

        {/* Memory Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Memory Header */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Memory title..."
                  />
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editedTitle.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{memory.title}</h2>
                  <div className="flex items-center space-x-6 text-slate-400 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Created {formatDate(memory.timestamps.created)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>{Math.round(memory.importance * 100)}% importance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link2 className="w-4 h-4" />
                      <span>{memory.connections.length} connections</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Memory Content */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={20}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Memory content..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {memory.content}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Tags */}
            {memory.tags.length > 0 && (
              <motion.div
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Tags className="w-5 h-5 text-slate-400" />
                  <span className="text-white font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-slate-300 text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Collaboration Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Collaboration
                memoryId={memory.id}
                isOwner={isOwner}
                onMemoryUpdate={(updatedMemory) => {
                  // Handle memory updates from collaboration
                  console.log('Memory updated via collaboration:', updatedMemory)
                }}
              />
            </motion.div>

            {/* Memory Statistics */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-white font-semibold mb-4">Memory Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white capitalize">{memory.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Access Count</span>
                  <span className="text-white">{memory.usage.accessCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Search Count</span>
                  <span className="text-white">{memory.usage.searchCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Connections</span>
                  <span className="text-white">{memory.usage.connectionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${memory.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-500/20 text-slate-400'
                    }`}>
                    {memory.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Updated</span>
                  <span className="text-white text-sm">
                    {formatDate(memory.timestamps.updated)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MemorAILayout>
  )
}
