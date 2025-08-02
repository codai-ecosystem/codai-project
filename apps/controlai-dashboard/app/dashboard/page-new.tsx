'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  AlertCircle
} from 'lucide-react'

import { useDashboard, useProjects, useTasks, useAgents, useMetrics } from '@/lib/hooks/useControlAI'
import { useDashboardStore, useDashboardActions } from '@/lib/stores/dashboard-store'

type ActiveView = 'overview' | 'projects' | 'tasks' | 'agents' | 'metrics'

// Simple Button Component
function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'ghost' | 'outline' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    default: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// Simple Card Component
function Card({
  children,
  className = '',
  onClick
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue'
}: {
  title: string
  value: string | number
  icon: any
  trend?: { value: number; positive: boolean }
  color?: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </Card>
  )
}

// Projects Overview Component
function ProjectsOverview({ projects }: { projects: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{project.priority} priority</span>
              <span>{project.completionPercentage || 0}% complete</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Tasks Board Component
function TasksBoard({ tasks }: { tasks: any[] }) {
  const columns = [
    { id: 'todo', title: 'To Do', icon: Circle },
    { id: 'in-progress', title: 'In Progress', icon: Clock },
    { id: 'review', title: 'Review', icon: AlertCircle },
    { id: 'done', title: 'Done', icon: CheckCircle2 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h2>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id)
          const Icon = column.icon

          return (
            <Card key={column.id} className="p-4">
              <div className="flex items-center mb-4">
                <Icon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">{column.title}</h3>
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full px-2 py-1">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 text-xs rounded ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                        {task.priority}
                      </span>
                      {task.assignedTo && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignedTo}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Agents Monitor Component
function AgentsMonitor({ agents }: { agents: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agents</h2>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{agent.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${agent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  agent.status === 'busy' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                {agent.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{agent.type.replace('_', ' ')}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{agent.currentWorkload}/{agent.maxConcurrentTasks} tasks</span>
              <span>{agent.capabilities?.length || 0} capabilities</span>
            </div>
          </Card>
        ))}
      </div>
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

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [darkMode, setDarkMode] = useState(false)
  const { data: dashboardData, loading, error, refresh } = useDashboard()
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const { agents } = useAgents()
  const { metrics } = useMetrics()

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'projects', label: 'Projects', icon: Monitor },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'metrics', label: 'Metrics', icon: Activity },
  ] as const

  const renderActiveView = () => {
    if (loading) {
      return <LoadingSpinner />
    }

    if (error) {
      return <ErrorDisplay error={error} onRetry={refresh} />
    }

    switch (activeView) {
      case 'overview':
        return <ProjectsOverview projects={projects} />
      case 'projects':
        return <ProjectsOverview projects={projects} />
      case 'tasks':
        return <TasksBoard tasks={tasks} />
      case 'agents':
        return <AgentsMonitor agents={agents} />
      case 'metrics':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metrics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Projects"
                value={metrics.totalProjects}
                icon={FolderKanban}
                color="blue"
              />
              <StatsCard
                title="Active Tasks"
                value={tasks.filter(t => t.status === 'in-progress').length}
                icon={CheckCircle2}
                color="green"
              />
              <StatsCard
                title="Available Agents"
                value={agents.filter(a => a.status === 'active').length}
                icon={Users}
                color="purple"
              />
              <StatsCard
                title="Completion Rate"
                value={`${Math.round((metrics.completedTasks / Math.max(metrics.totalTasks, 1)) * 100)}%`}
                icon={BarChart3}
                color="orange"
              />
            </div>
          </div>
        )
      default:
        return <ProjectsOverview projects={projects} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                ControlAI Dashboard
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="ml-4 text-sm text-gray-500 dark:text-gray-400"
              >
                {projects.length} projects • {agents.length} agents
              </motion.div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={refresh}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="relative"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
              >
                <Bell className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
              >
                <Settings className="w-4 h-4" />
              </Button>

              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Projects"
            value={projects.length}
            icon={FolderKanban}
            color="blue"
          />
          <StatsCard
            title="Active Tasks"
            value={tasks.filter(t => t.status === 'in-progress').length}
            icon={CheckCircle2}
            color="green"
          />
          <StatsCard
            title="Available Agents"
            value={agents.filter(a => a.status === 'active').length}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Completion Rate"
            value={`${Math.round((tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100)}%`}
            icon={BarChart3}
            color="orange"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setActiveView(id as ActiveView)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${activeView === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveView()}
        </motion.div>
      </main>
    </div>
  )
}
