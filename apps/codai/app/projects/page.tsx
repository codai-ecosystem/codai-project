'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Code,
  Package,
  Star,
  GitBranch,
  Clock,
  Users,
  Activity,
  Zap,
  Settings,
  ArrowRight,
  RefreshCw,
  Download,
  Trash2,
  Edit3
} from 'lucide-react'

interface Project {
  id: string
  name: string
  type: string
  language: string
  framework: string
  status: 'active' | 'maintenance' | 'archived'
  lastModified: Date
  size: string
  description: string
  path?: string
  dependencies?: string[]
  scripts?: Record<string, string>
  gitBranch?: string
  gitCommits?: number
}

interface ProjectsResponse {
  projects: Project[]
  totalProjects: number
  activeProjects: number
  lastUpdated: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'apps' | 'packages'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'archived'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'type' | 'status'>('modified')
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalApps: 0,
    totalPackages: 0
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/projects')
      const data: ProjectsResponse = await response.json()

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to fetch projects')
      }

      setProjects(data.projects)
      setStats({
        totalProjects: data.totalProjects,
        activeProjects: data.activeProjects,
        totalApps: data.projects.filter(p => p.id.startsWith('app-')).length,
        totalPackages: data.projects.filter(p => p.id.startsWith('package-')).length
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === 'all' ||
        (filterType === 'apps' && project.id.startsWith('app-')) ||
        (filterType === 'packages' && project.id.startsWith('package-'))

      const matchesStatus = filterStatus === 'all' || project.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'modified':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/20'
      case 'archived': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('Application') || type.includes('app')) return Code
    if (type.includes('Package') || type.includes('Library')) return Package
    return Settings
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

  const ProjectCard = ({ project }: { project: Project }) => {
    const TypeIcon = getTypeIcon(project.type)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-pointer"
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <TypeIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-400">{project.type}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex items-center space-x-4 mb-4 text-xs text-gray-400">
            <span className="flex items-center space-x-1">
              <Code className="w-3 h-3" />
              <span>{project.language}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{project.framework}</span>
            </span>
            {project.gitCommits && (
              <span className="flex items-center space-x-1">
                <GitBranch className="w-3 h-3" />
                <span>{project.gitCommits}</span>
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(project.lastModified)}</span>
            </div>
            <div className="flex items-center space-x-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs">View Project</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const ProjectListItem = ({ project }: { project: Project }) => {
    const TypeIcon = getTypeIcon(project.type)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer"
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <TypeIcon className="w-5 h-5 text-indigo-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-white font-medium group-hover:text-indigo-300 transition-colors truncate">
                    {project.name}
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                </div>
                <p className="text-gray-300 text-sm truncate">{project.description}</p>
              </div>

              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>{project.language}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{project.framework}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(project.lastModified)}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading projects...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FolderOpen className="w-8 h-8 text-indigo-400" />
              <div>
                <h1 className="text-2xl font-bold">Projects</h1>
                <p className="text-sm text-gray-400">
                  Manage and explore your development projects
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={fetchProjects}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title="Refresh projects"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/projects/create')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Project</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <FolderOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                <p className="text-sm text-gray-400">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
                <p className="text-sm text-gray-400">Active Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Code className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalApps}</p>
                <p className="text-sm text-gray-400">Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalPackages}</p>
                <p className="text-sm text-gray-400">Packages</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Types</option>
                <option value="apps">Applications</option>
                <option value="packages">Packages</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="modified">Last Modified</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-500/30 text-indigo-300' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-500/30 text-indigo-300' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects */}
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center"
          >
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 bg-red-500/30 hover:bg-red-500/40 text-red-300 px-4 py-2 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
          >
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'No projects match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first project.'}
            </p>
            <button
              onClick={() => router.push('/projects/create')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 px-6 rounded-xl transition-all flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredAndSortedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredAndSortedProjects.map((project) => (
                    <ProjectListItem key={project.id} project={project} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
