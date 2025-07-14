'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Code,
  Package,
  Server,
  Layers,
  Settings,
  Download,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Star,
  Calendar,
  Tag,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tools'
  tags: string[]
  language: string
  framework: string
  features: string[]
  dependencies: string[]
  devDependencies: string[]
  scripts: Record<string, string>
  created: Date
  updated: Date
}

export default function TemplatesPage() {
  const router = useRouter()

  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory, searchTerm])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/templates?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates')
      }

      setTemplates(data.templates)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend': return Code
      case 'backend': return Server
      case 'fullstack': return Layers
      case 'library': return Package
      case 'tools': return Settings
      default: return Code
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'text-blue-400 bg-blue-400/20'
      case 'backend': return 'text-green-400 bg-green-400/20'
      case 'fullstack': return 'text-purple-400 bg-purple-400/20'
      case 'library': return 'text-amber-400 bg-amber-400/20'
      case 'tools': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderIcon = (IconComponent: React.ComponentType<any>, className: string = "w-5 h-5") => {
    return <IconComponent className={className} />
  }

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'frontend', name: 'Frontend', icon: Code },
    { id: 'backend', name: 'Backend', icon: Server },
    { id: 'fullstack', name: 'Full Stack', icon: Layers },
    { id: 'library', name: 'Library', icon: Package },
    { id: 'tools', name: 'Tools', icon: Settings }
  ]

  const TemplateCard = ({ template }: { template: ProjectTemplate }) => {
    const CategoryIcon = getCategoryIcon(template.category)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${getCategoryColor(template.category)}`}>
              <CategoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400">{template.framework}</p>
            </div>
          </div>

          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => router.push(`/templates/${template.id}`)}
              className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={() => router.push(`/projects/create?template=${template.id}`)}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
              title="Use Template"
            >
              <Plus className="w-4 h-4 text-green-400" />
            </button>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-300"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-gray-400">
              +{template.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{template.dependencies.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(template.updated)}</span>
            </div>
          </div>

          <div className={`px-2 py-1 rounded-lg text-xs ${getCategoryColor(template.category)}`}>
            {template.category}
          </div>
        </div>
      </motion.div>
    )
  }

  const TemplateListItem = ({ template }: { template: ProjectTemplate }) => {
    const CategoryIcon = getCategoryIcon(template.category)

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-2 rounded-xl ${getCategoryColor(template.category)}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {template.name}
                </h3>
                <div className={`px-2 py-1 rounded-lg text-xs ${getCategoryColor(template.category)}`}>
                  {template.category}
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                {template.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{template.framework}</span>
                <span>{template.dependencies.length} dependencies</span>
                <span>Updated {formatDate(template.updated)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <div className="flex flex-wrap gap-1 max-w-xs">
              {template.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => router.push(`/templates/${template.id}`)}
                className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                onClick={() => router.push(`/projects/create?template=${template.id}`)}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                title="Use Template"
              >
                <Plus className="w-4 h-4 text-green-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold">Project Templates</h1>
              <p className="text-gray-400 mt-1">Ready-to-use project scaffolds and boilerplates</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <button
                onClick={fetchTemplates}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/templates/create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Template</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-slate-800">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Templates */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Templates</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchTemplates}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Templates Found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search criteria.'
                : 'Create your first template to get started.'}
            </p>
            <button
              onClick={() => router.push('/templates/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Create Template
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template, index) => (
                  <TemplateListItem key={template.id} template={template} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
