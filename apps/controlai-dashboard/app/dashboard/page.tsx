'use client'

import React from 'react'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor,
  Users,
  FolderKanban,
  Activity,
  Moon,
  Sun,
  RefreshCw,
  Settings,
  Bell,
  Plus,
  BarChart3,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Share2,
  Eye,
  Edit3,
  Trash2,
  Play,
  Pause,
  Square,
  GitBranch,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  Command,
  Home,
  PlusCircle,
  MinusCircle,
  MoreHorizontal,
  ExternalLink,
  Archive,
  Star,
  BookOpen,
  FileText,
  Database,
  Server,
  Shield,
  Award,
  Lightbulb,
  Rocket,
  Globe,
  Minus
} from 'lucide-react'

import { useDashboard, useProjects, useTasks, useAgents, useMetrics } from '../../lib/hooks/useControlAI'
import { useDashboardStore, useDashboardActions } from '../../lib/stores/dashboard-store'

type ActiveView = 'overview' | 'projects' | 'tasks' | 'agents' | 'metrics' | 'analytics' | 'reports'

// Enhanced dashboard state interface
interface DashboardState {
  activeView: ActiveView
  darkMode: boolean
  searchQuery: string
  selectedFilters: {
    status: string[]
    priority: string[]
    assignee: string[]
    dateRange: string
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
  refreshInterval: number
  isRealTime: boolean
  notifications: number
}

// Enhanced analytics data interface  
interface DashboardAnalytics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  totalAgents: number
  activeAgents: number
  busyAgents: number
  projectSuccessRate: number
  averageCompletionTime: number
  resourceUtilization: number
  upcomingDeadlines: number
  criticalIssues: number
  performanceScore: number
}

// Project interface
interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  dueDate: string
  assignedAgents: string[]
  tags: string[]
  budget?: number
  spent?: number
  createdAt: string
  updatedAt: string
}

// Task interface
interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId: string
  assignedTo?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  dependencies: string[]
  createdAt: string
  updatedAt: string
}

// Agent interface
interface Agent {
  id: string
  name: string
  type: 'senior_developer' | 'qa_engineer' | 'devops_engineer' | 'ux_designer' | 'security_engineer' | 'project_manager' | 'data_scientist' | 'generic'
  status: 'active' | 'busy' | 'offline' | 'away'
  capabilities: string[]
  currentWorkload: number
  maxConcurrentTasks: number
  performance: {
    tasksCompleted: number
    averageTime: number
    successRate: number
    rating: number
  }
  workspaceId: string
  lastActive: string
}

// Enhanced Button Component with more variants
function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  loading = false,
  icon,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'ghost' | 'outline' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  className?: string
  icon?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden'

  const variants = {
    default: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500',
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl focus:ring-blue-500 transform hover:scale-[1.02]',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl focus:ring-gray-500',
    destructive: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl focus:ring-red-500',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl focus:ring-green-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl focus:ring-yellow-500'
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

// Enhanced Card Component with hover effects and animations
function Card({
  children,
  className = '',
  onClick,
  hover = false,
  gradient = false,
  ...props
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  gradient?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      className={`
        ${gradient
          ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900'
          : 'bg-white dark:bg-gray-800'
        }
        rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm
        ${onClick ? 'cursor-pointer' : ''}
        ${hover || onClick ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={hover || onClick ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Enhanced Stats Card Component with trend indicators and animations
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
  onClick,
  subtitle,
  actions
}: {
  title: string
  value: string | number
  icon: any
  trend?: { value: number; positive: boolean; label?: string }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'indigo'
  loading?: boolean
  onClick?: () => void
  subtitle?: string
  actions?: React.ReactNode
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
  }

  return (
    <Card
      className="p-6 group"
      onClick={onClick}
      hover={!!onClick}
      gradient
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            {actions && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {actions}
              </div>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ) : (
            <>
              <motion.p
                className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {value}
              </motion.p>

              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {subtitle}
                </p>
              )}

              {trend && (
                <motion.div
                  className={`flex items-center text-xs ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {trend.positive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trend.positive ? '+' : ''}{trend.value}%
                  {trend.label && <span className="ml-1">{trend.label}</span>}
                </motion.div>
              )}
            </>
          )}
        </div>

        <motion.div
          className={`p-3 rounded-xl ${colorClasses[color]} flex-shrink-0`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </Card>
  )
}

// Enhanced Projects Overview Component with filtering and actions
function ProjectsOverview({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [projects, searchQuery, statusFilter, priorityFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'on-hold': return <Pause className="w-4 h-4" />
      case 'planning': return <Calendar className="w-4 h-4" />
      case 'cancelled': return <Square className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'planning': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="planning">Planning</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 h-full" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress || 0}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Priority</span>
                    <span className={`font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority?.toUpperCase()}
                    </span>
                  </div>

                  {project.dueDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Agents</span>
                    <span className="text-gray-900 dark:text-white">
                      {project.assignedAgents?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="xs" icon={<Eye className="w-3 h-3" />}>
                      View
                    </Button>
                    <Button variant="ghost" size="xs" icon={<Edit3 className="w-3 h-3" />}>
                      Edit
                    </Button>
                  </div>

                  <Button variant="ghost" size="xs" icon={<MoreHorizontal className="w-4 h-4" />}>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FolderKanban className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters to see more projects.'
              : 'Get started by creating your first project.'}
          </p>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// Enhanced Tasks Board Component with drag-and-drop and filtering
function TasksBoard({ tasks }: { tasks: Task[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')

  const columns = [
    { id: 'todo', title: 'To Do', icon: Circle, color: 'gray' },
    { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'blue' },
    { id: 'review', title: 'Review', icon: AlertCircle, color: 'yellow' },
    { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'green' },
    { id: 'blocked', title: 'Blocked', icon: AlertCircle, color: 'red' }
  ]

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter

      return matchesSearch && matchesPriority && matchesAssignee
    })
  }, [tasks, searchQuery, priorityFilter, assigneeFilter])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="w-3 h-3" />
      case 'high': return <TrendingUp className="w-3 h-3" />
      case 'medium': return <Minus className="w-3 h-3" />
      case 'low': return <TrendingDown className="w-3 h-3" />
      default: return <Circle className="w-3 h-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getColumnColor = (color: string) => {
    const colors = {
      gray: 'border-gray-300 dark:border-gray-600',
      blue: 'border-blue-300 dark:border-blue-600',
      yellow: 'border-yellow-300 dark:border-yellow-600',
      green: 'border-green-300 dark:border-green-600',
      red: 'border-red-300 dark:border-red-600'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks Board</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto min-h-[600px]">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id)
          const Icon = column.icon

          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: columns.indexOf(column) * 0.1 }}
            >
              <Card className={`p-4 h-full border-t-4 ${getColumnColor(column.color)}`}>
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 -my-2">
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full px-2 py-1 font-medium">
                      {columnTasks.length}
                    </span>
                    <Button variant="ghost" size="xs" icon={<Plus className="w-3 h-3" />}>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  <AnimatePresence>
                    {columnTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="group"
                      >
                        <Card className="p-4 cursor-move hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                          <div className="space-y-3">
                            {/* Task Header */}
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">
                                {task.title}
                              </h4>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <Button variant="ghost" size="xs" icon={<MoreHorizontal className="w-3 h-3" />}>
                                </Button>
                              </div>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Task Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {task.tags.length > 2 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                    +{task.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Task Metadata */}
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)}
                                {task.priority}
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Task Assignment */}
                            {task.assignedTo && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  {task.assignedTo}
                                </span>
                              </div>
                            )}

                            {/* Time Tracking */}
                            {(task.estimatedHours || task.actualHours) && (
                              <div className="flex items-center justify-between text-xs border-t border-gray-200 dark:border-gray-700 pt-2">
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Time
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {task.actualHours || 0}h / {task.estimatedHours || 0}h
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty Column Message */}
                  {columnTasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-gray-400 dark:text-gray-600"
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Enhanced Agents Monitor Component with performance metrics
function AgentsMonitor({ agents }: { agents: Agent[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      const matchesType = typeFilter === 'all' || agent.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [agents, searchQuery, statusFilter, typeFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />
      case 'busy': return <Clock className="w-4 h-4" />
      case 'offline': return <Circle className="w-4 h-4" />
      case 'away': return <Pause className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'busy': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'away': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'senior_developer': return <Rocket className="w-4 h-4" />
      case 'qa_engineer': return <Shield className="w-4 h-4" />
      case 'devops_engineer': return <Server className="w-4 h-4" />
      case 'ux_designer': return <Lightbulb className="w-4 h-4" />
      case 'security_engineer': return <Shield className="w-4 h-4" />
      case 'project_manager': return <Target className="w-4 h-4" />
      case 'data_scientist': return <BarChart3 className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400'
    if (rating >= 4.0) return 'text-blue-600 dark:text-blue-400'
    if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400'
    if (rating >= 3.0) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Agents</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredAgents.length} of {agents.length} agents
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="senior_developer">Senior Developer</option>
            <option value="qa_engineer">QA Engineer</option>
            <option value="devops_engineer">DevOps Engineer</option>
            <option value="ux_designer">UX Designer</option>
            <option value="security_engineer">Security Engineer</option>
            <option value="project_manager">Project Manager</option>
            <option value="data_scientist">Data Scientist</option>
            <option value="generic">Generic</option>
          </select>

          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Agent
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 h-full" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3">
                      {getTypeIcon(agent.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </div>
                </div>

                {/* Workload Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Workload</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {agent.currentWorkload}/{agent.maxConcurrentTasks}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${(agent.currentWorkload / agent.maxConcurrentTasks) > 0.8
                          ? 'bg-red-500'
                          : (agent.currentWorkload / agent.maxConcurrentTasks) > 0.6
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(agent.currentWorkload / agent.maxConcurrentTasks) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tasks Completed</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {agent.performance?.tasksCompleted || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {agent.performance?.successRate || 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {agent.performance?.averageTime || 0}h
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center">
                      <Star className={`w-4 h-4 mr-1 ${getPerformanceColor(agent.performance?.rating || 0)}`} />
                      <span className={`font-medium ${getPerformanceColor(agent.performance?.rating || 0)}`}>
                        {agent.performance?.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Capabilities</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {agent.capabilities?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities?.slice(0, 4).map((capability, capIndex) => (
                      <span
                        key={capIndex}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities && agent.capabilities.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        +{agent.capabilities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Active */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span>Last active:</span>
                  <span>{new Date(agent.lastActive).toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="ghost" size="xs" icon={<Eye className="w-3 h-3" />}>
                    View
                  </Button>
                  <Button variant="ghost" size="xs" icon={<Edit3 className="w-3 h-3" />}>
                    Edit
                  </Button>
                  <div className="ml-auto">
                    <Button variant="ghost" size="xs" icon={<MoreHorizontal className="w-4 h-4" />}>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No agents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters to see more agents.'
              : 'Get started by adding your first agent.'}
          </p>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Agent
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// Simple loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="rounded-full h-12 w-12 border-b-2 border-blue-600"
      />
    </div>
  )
}

// Error component
function ErrorDisplay({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
    >
      <h3 className="text-red-800 dark:text-red-200 font-medium text-lg">Error loading dashboard data</h3>
      <p className="text-red-600 dark:text-red-300 text-sm mt-2">{error?.message || 'Unknown error'}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </motion.div>
  )
}

// Dashboard Overview Component
function DashboardOverview({
  analytics,
  projects,
  tasks,
  agents
}: {
  analytics: DashboardAnalytics
  projects: Project[]
  tasks: Task[]
  agents: Agent[]
}) {
  const recentProjects = projects.slice(0, 6)
  const upcomingTasks = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6" hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <Button variant="primary" className="w-full" icon={<PlusCircle className="w-4 h-4" />}>
              Create Project
            </Button>
            <Button variant="outline" className="w-full" icon={<Plus className="w-4 h-4" />}>
              Add Task
            </Button>
            <Button variant="outline" className="w-full" icon={<Users className="w-4 h-4" />}>
              Invite Agent
            </Button>
          </div>
        </Card>

        <Card className="p-6" hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">System Health</span>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Excellent</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Connected</span>
            </div>
          </div>
        </Card>

        <Card className="p-6" hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <Bell className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {criticalTasks.map(task => (
              <div key={task.id} className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  Critical: {task.title}
                </span>
              </div>
            ))}
            {criticalTasks.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No critical issues</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
            <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentProjects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{project.status}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{project.progress}%</div>
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
            <Button variant="ghost" size="sm" icon={<Calendar className="w-4 h-4" />}>
              View Calendar
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.assignedTo}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${task.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                    {task.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Metrics Dashboard Component
function MetricsDashboard({ analytics, metrics }: { analytics: DashboardAnalytics, metrics: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Metrics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Project Success Rate"
          value={`${Math.round(analytics.projectSuccessRate)}%`}
          icon={Target}
          color="green"
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Resource Utilization"
          value={`${Math.round(analytics.resourceUtilization)}%`}
          icon={Activity}
          color="orange"
          trend={{ value: 2, positive: false }}
        />
        <StatsCard
          title="Overdue Tasks"
          value={analytics.overdueTasks}
          icon={AlertCircle}
          color="red"
        />
        <StatsCard
          title="Avg. Completion Time"
          value={`${analytics.averageCompletionTime.toFixed(1)}h`}
          icon={Clock}
          color="blue"
          trend={{ value: 10, positive: false }}
        />
      </div>
    </div>
  )
}

// Advanced Analytics Component
function AdvancedAnalytics({ projects, tasks, agents }: { projects: Project[], tasks: Task[], agents: Agent[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Analytics</h2>
        <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />}>
          View Full Analytics
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Distribution</h3>
          <div className="space-y-3">
            {['active', 'completed', 'on-hold', 'planning'].map(status => {
              const count = projects.filter(p => p.status === status).length
              const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Performance</h3>
          <div className="space-y-3">
            {agents.slice(0, 5).map(agent => (
              <div key={agent.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{agent.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(agent.performance?.successRate || 0)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {agent.performance?.successRate || 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Reports Dashboard Component
function ReportsDashboard({ analytics }: { analytics: DashboardAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reports</h2>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="primary" icon={<FileText className="w-4 h-4" />}>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center" hover>
          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Project Summary</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Comprehensive project overview and status</p>
          <Button variant="outline" size="sm">Generate</Button>
        </Card>

        <Card className="p-6 text-center" hover>
          <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Report</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Agent and task performance metrics</p>
          <Button variant="outline" size="sm">Generate</Button>
        </Card>

        <Card className="p-6 text-center" hover>
          <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Time Tracking</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Time allocation and productivity analysis</p>
          <Button variant="outline" size="sm">Generate</Button>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // Enhanced state management
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    activeView: 'overview',
    darkMode: false,
    searchQuery: '',
    selectedFilters: {
      status: [],
      priority: [],
      assignee: [],
      dateRange: 'all'
    },
    sortBy: 'updated',
    sortOrder: 'desc',
    refreshInterval: 30000,
    isRealTime: false,
    notifications: 0
  })

  // Data hooks with enhanced error handling and loading states
  const { data: dashboardData, loading, error, refresh } = useDashboard()
  const { projects, loading: projectsLoading } = useProjects()
  const { tasks, loading: tasksLoading } = useTasks()
  const { agents, loading: agentsLoading } = useAgents()
  const { metrics, loading: metricsLoading } = useMetrics()

  // Computed analytics
  const analytics = useMemo((): DashboardAnalytics => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length

    const totalAgents = agents.length
    const activeAgents = agents.filter(a => a.status === 'active').length
    const busyAgents = agents.filter(a => a.status === 'busy').length

    const projectSuccessRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
    const resourceUtilization = totalAgents > 0 ? (busyAgents / totalAgents) * 100 : 0
    const upcomingDeadlines = tasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return dueDate >= today && dueDate <= nextWeek
    }).length

    const criticalIssues = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length
    const performanceScore = (projectSuccessRate + (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0)) / 2
    const averageCompletionTime = tasks.length > 0 ? tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0) / tasks.length : 0

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalAgents,
      activeAgents,
      busyAgents,
      projectSuccessRate,
      averageCompletionTime,
      resourceUtilization,
      upcomingDeadlines,
      criticalIssues,
      performanceScore
    }
  }, [projects, tasks, agents])

  // Enhanced effects
  useEffect(() => {
    // Initialize dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)

    setDashboardState(prev => ({ ...prev, darkMode: isDark }))

    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    // Set up auto-refresh when real-time is enabled
    if (dashboardState.isRealTime && dashboardState.refreshInterval > 0) {
      const interval = setInterval(refresh, dashboardState.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [dashboardState.isRealTime, dashboardState.refreshInterval, refresh])

  // Enhanced handlers
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !dashboardState.darkMode
    setDashboardState(prev => ({ ...prev, darkMode: newDarkMode }))
    localStorage.setItem('darkMode', newDarkMode.toString())

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dashboardState.darkMode])

  const handleViewChange = useCallback((view: ActiveView) => {
    setDashboardState(prev => ({ ...prev, activeView: view }))
  }, [])

  const toggleRealTime = useCallback(() => {
    setDashboardState(prev => ({ ...prev, isRealTime: !prev.isRealTime }))
  }, [])

  const handleRefresh = useCallback(() => {
    refresh()
    setDashboardState(prev => ({
      ...prev,
      notifications: 0 // Clear notifications on manual refresh
    }))
  }, [refresh])

  // Enhanced navigation items with new views
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, count: null },
    { id: 'projects', label: 'Projects', icon: FolderKanban, count: analytics.activeProjects },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, count: analytics.overdueTasks > 0 ? analytics.overdueTasks : null },
    { id: 'agents', label: 'Agents', icon: Users, count: analytics.activeAgents },
    { id: 'metrics', label: 'Metrics', icon: BarChart3, count: null },
    { id: 'analytics', label: 'Analytics', icon: Activity, count: null },
    { id: 'reports', label: 'Reports', icon: FileText, count: null },
  ] as const

  // Enhanced view renderer
  const renderActiveView = () => {
    const isLoading = loading || projectsLoading || tasksLoading || agentsLoading || metricsLoading

    if (isLoading && !projects.length && !tasks.length && !agents.length) {
      return <LoadingSpinner />
    }

    if (error) {
      return <ErrorDisplay error={error} onRetry={handleRefresh} />
    }

    switch (dashboardState.activeView) {
      case 'overview':
        return <DashboardOverview analytics={analytics} projects={projects} tasks={tasks} agents={agents} />
      case 'projects':
        return <ProjectsOverview projects={projects} />
      case 'tasks':
        return <TasksBoard tasks={tasks} />
      case 'agents':
        return <AgentsMonitor agents={agents} />
      case 'metrics':
        return <MetricsDashboard analytics={analytics} metrics={metrics} />
      case 'analytics':
        return <AdvancedAnalytics projects={projects} tasks={tasks} agents={agents} />
      case 'reports':
        return <ReportsDashboard analytics={analytics} />
      default:
        return <DashboardOverview analytics={analytics} projects={projects} tasks={tasks} agents={agents} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Enhanced Header with gradient */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ControlAI Dashboard
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {analytics.totalProjects} projects • {analytics.totalAgents} agents • {analytics.totalTasks} tasks
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Real-time indicator */}
              {dashboardState.isRealTime && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center text-green-600 dark:text-green-400 text-sm mr-4"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Live
                </motion.div>
              )}

              {/* Real-time toggle */}
              <Button
                onClick={toggleRealTime}
                variant={dashboardState.isRealTime ? "primary" : "ghost"}
                size="sm"
                icon={<Zap className="w-4 h-4" />}
              >
                Real-time
              </Button>

              {/* Refresh button */}
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={loading}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              >
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                icon={<Bell className="w-4 h-4" />}
              >
                {dashboardState.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dashboardState.notifications > 9 ? '9+' : dashboardState.notifications}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                icon={<Settings className="w-4 h-4" />}
              >
              </Button>

              {/* Dark mode toggle */}
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                icon={dashboardState.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              >
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Stats Overview with animations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Projects"
            value={analytics.activeProjects}
            subtitle={`${analytics.totalProjects} total projects`}
            icon={FolderKanban}
            color="blue"
            loading={projectsLoading}
            trend={{ value: 12, positive: true, label: 'this month' }}
            actions={
              <Button variant="ghost" size="xs" icon={<ExternalLink className="w-3 h-3" />}>
              </Button>
            }
          />
          <StatsCard
            title="Task Completion"
            value={`${Math.round((analytics.completedTasks / Math.max(analytics.totalTasks, 1)) * 100)}%`}
            subtitle={`${analytics.completedTasks}/${analytics.totalTasks} tasks`}
            icon={CheckCircle2}
            color="green"
            loading={tasksLoading}
            trend={{ value: 8, positive: true, label: 'this week' }}
            actions={
              <Button variant="ghost" size="xs" icon={<ExternalLink className="w-3 h-3" />}>
              </Button>
            }
          />
          <StatsCard
            title="Active Agents"
            value={analytics.activeAgents}
            subtitle={`${analytics.totalAgents} total agents`}
            icon={Users}
            color="purple"
            loading={agentsLoading}
            trend={{ value: 5, positive: true, label: 'new this week' }}
            actions={
              <Button variant="ghost" size="xs" icon={<ExternalLink className="w-3 h-3" />}>
              </Button>
            }
          />
          <StatsCard
            title="Performance Score"
            value={`${Math.round(analytics.performanceScore)}%`}
            subtitle="Overall efficiency"
            icon={Award}
            color="orange"
            loading={metricsLoading}
            trend={{ value: 3, positive: true, label: 'this quarter' }}
            actions={
              <Button variant="ghost" size="xs" icon={<ExternalLink className="w-3 h-3" />}>
              </Button>
            }
          />
        </div>
      </div>

      {/* Enhanced Navigation with active indicators */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map(({ id, label, icon: Icon, count }) => (
              <motion.button
                key={id}
                onClick={() => handleViewChange(id as ActiveView)}
                className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${dashboardState.activeView === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
                {count !== null && count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full">
                    {count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with enhanced animations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={dashboardState.activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveView()}
        </motion.div>
      </main>

      {/* Footer with quick actions */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 sm:mb-0">
              <Button variant="ghost" size="sm" icon={<BookOpen className="w-4 h-4" />}>
                Documentation
              </Button>
              <Button variant="ghost" size="sm" icon={<Globe className="w-4 h-4" />}>
                API Status
              </Button>
              <Button variant="ghost" size="sm" icon={<Database className="w-4 h-4" />}>
                System Health
              </Button>
            </div>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              {dashboardState.isRealTime && (
                <span className="ml-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  Auto-refresh enabled
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

