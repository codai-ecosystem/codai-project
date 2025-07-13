'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import { MemoryCard } from '../../components/dashboard/DashboardComponents'
import MemorAIService, { Memory } from '../../services/memoraiService'
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Calendar,
  Tag,
  Star,
  Brain,
  FileText,
  Users,
  Lightbulb,
  Code,
  Clock,
  ArrowUpDown,
  ChevronDown,
  X,
  Edit,
  Archive,
  Share2,
  MoreHorizontal
} from 'lucide-react'


export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'importance' | 'connections'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  const memoraiService = MemorAIService.getInstance()

  const memoryTypes = [
    { value: 'all', label: 'All Types', icon: Brain, color: 'text-slate-400' },
    { value: 'meeting', label: 'Meetings', icon: Users, color: 'text-blue-400' },
    { value: 'research', label: 'Research', icon: FileText, color: 'text-purple-400' },
    { value: 'code', label: 'Code', icon: Code, color: 'text-emerald-400' },
    { value: 'idea', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-400' },
    { value: 'document', label: 'Documents', icon: FileText, color: 'text-red-400' }
  ]

  useEffect(() => {
    loadMemories()
  }, [])

  useEffect(() => {
    filterAndSortMemories()
  }, [memories, searchQuery, selectedType, sortBy, sortOrder])

  const loadMemories = async () => {
    try {
      setIsLoading(true)
      const data = await memoraiService.getMemories(100)
      setMemories(data)
    } catch (error) {
      console.error('Failed to load memories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortMemories = () => {
    let filtered = memories.filter(memory => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Type filter
      const matchesType = selectedType === 'all' || memory.type === selectedType

      return matchesSearch && matchesType
    })

    // Sort memories
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'created':
          aVal = new Date(a.timestamps.created).getTime()
          bVal = new Date(b.timestamps.created).getTime()
          break
        case 'updated':
          aVal = new Date(a.timestamps.updated).getTime()
          bVal = new Date(b.timestamps.updated).getTime()
          break
        case 'importance':
          aVal = a.importance
          bVal = b.importance
          break
        case 'connections':
          aVal = a.connections.length
          bVal = b.connections.length
          break
        default:
          aVal = new Date(a.timestamps.created).getTime()
          bVal = new Date(b.timestamps.created).getTime()
      }

      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    setFilteredMemories(filtered)
  }

  const handleMemorySelect = (memoryId: string) => {
    setSelectedMemories(prev =>
      prev.includes(memoryId)
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    )
  }

  const bulkActions = [
    { label: 'Archive', icon: Archive, action: 'archive' },
    { label: 'Delete', icon: X, action: 'delete' },
    { label: 'Export', icon: Share2, action: 'export' }
  ]

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = memoryTypes.find(t => t.value === type)
    return typeConfig ? typeConfig.icon : Brain
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      case 'research': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'code': return 'bg-gradient-to-r from-emerald-500 to-teal-500'
      case 'idea': return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'document': return 'bg-gradient-to-r from-red-500 to-pink-500'
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600'
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
            <span className="text-lg font-medium">Loading Memories...</span>
          </motion.div>
        </div>
      </MemorAILayout>
    )
  }

  return (
    <MemorAILayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Memory Library 📚
            </h1>
            <p className="text-slate-300">
              Manage and explore your knowledge repository
            </p>
          </div>

          <motion.button
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Create Memory</span>
          </motion.button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search memories by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-8"
                >
                  {memoryTypes.map(type => (
                    <option key={type.value} value={type.value} className="bg-slate-800">
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-8"
                >
                  <option value="created" className="bg-slate-800">Created</option>
                  <option value="updated" className="bg-slate-800">Updated</option>
                  <option value="importance" className="bg-slate-800">Importance</option>
                  <option value="connections" className="bg-slate-800">Connections</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
            <span className="text-slate-300">
              {filteredMemories.length} memories found
            </span>

            {selectedMemories.length > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-400">
                  {selectedMemories.length} selected
                </span>
                <div className="flex items-center space-x-2">
                  {bulkActions.map(action => (
                    <button
                      key={action.action}
                      className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors"
                    >
                      <action.icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Memories Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredMemories.length === 0 ? (
            <div className="text-center py-16">
              <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No memories found</h3>
              <p className="text-slate-400 mb-6">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first memory to get started'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Create Memory
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <MemoryCard
                    memory={{
                      ...memory,
                      icon: getTypeIcon(memory.type),
                      typeColor: getTypeColor(memory.type),
                      timestamp: formatTimestamp(memory.timestamps.created)
                    }}
                    index={index}
                  />

                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={selectedMemories.includes(memory.id)}
                      onChange={() => handleMemorySelect(memory.id)}
                      className="w-4 h-4 text-purple-500 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMemories.map((memory, index) => {
                const TypeIcon = getTypeIcon(memory.type)
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedMemories.includes(memory.id)}
                          onChange={() => handleMemorySelect(memory.id)}
                          className="w-4 h-4 text-purple-500 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                        />
                        <div className={`w-10 h-10 ${getTypeColor(memory.type)} rounded-lg flex items-center justify-center`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">
                              {memory.title}
                            </h3>
                            <p className="text-slate-300 mb-3 line-clamp-2">
                              {memory.content}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimestamp(memory.timestamps.created)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4" />
                                <span>{(memory.importance * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Tag className="w-4 h-4" />
                                <span>{memory.tags.length} tags</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </MemorAILayout>
  )
}
