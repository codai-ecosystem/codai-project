import React from 'react'
/**
 * Enhanced Tasks Management Page - Advanced ControlAI Task Center
 * Comprehensive task management with real-time updates and AI-powered insights
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Core Task Icons
    CheckSquare, Square, Clock, AlertCircle, Users, Calendar, Target, Activity,
    Play, Pause, SkipForward, RotateCcw, Archive, Trash2, Edit3, Eye, Copy,

    // Priority & Status Icons
    ArrowUp, ArrowDown, Circle, AlertTriangle, CheckCircle2, XCircle,
    Minus, Plus, Star, Flag, Zap, Flame, Shield, Award,

    // Organization Icons
    Filter, Search, SortAsc, SortDesc, Grid, List, Columns, Layout,
    FolderKanban, Tags, Bookmark, Pin, Link, Share2,

    // Action Icons
    Settings, RefreshCw, Download, Upload, ExternalLink, MoreHorizontal,
    Save, Send, MessageSquare, Bell, BellOff, Volume2, VolumeX,

    // Analytics Icons
    BarChart3, TrendingUp, TrendingDown, PieChart, LineChart, Activity as ActivityChart,
    Brain, Cpu, Database, Server, Globe, Wifi, Signal,

    // Time & Calendar Icons
    CalendarDays, CalendarClock, Hourglass, Timer, Stopwatch, History
} from 'lucide-react'

// Enhanced Types
interface TasksState {
    activeView: 'kanban' | 'list' | 'timeline' | 'calendar' | 'analytics'
    selectedTasks: string[]
    filters: TaskFilters
    sortBy: TaskSortOption
    sortOrder: 'asc' | 'desc'
    searchQuery: string
    showCompleted: boolean
    realTimeUpdates: boolean
    autoRefresh: boolean
    refreshInterval: number
    groupBy: 'status' | 'priority' | 'assignee' | 'project' | 'due_date'
    viewSettings: ViewSettings
}

interface TaskFilters {
    status: TaskStatus[]
    priority: TaskPriority[]
    assignees: string[]
    projects: string[]
    tags: string[]
    dateRange: DateRange
    overdue: boolean
}

interface ViewSettings {
    showSubtasks: boolean
    showDependencies: boolean
    showTimeTracking: boolean
    showComments: boolean
    cardSize: 'compact' | 'normal' | 'detailed'
    showAssigneeAvatars: boolean
}

interface DateRange {
    start: string | null
    end: string | null
    preset: 'today' | 'week' | 'month' | 'quarter' | 'custom'
}

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'testing' | 'blocked' | 'completed' | 'cancelled'
type TaskPriority = 'critical' | 'high' | 'medium' | 'low'
type TaskSortOption = 'created' | 'updated' | 'due_date' | 'priority' | 'title' | 'assignee'

interface Task {
    id: string
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assignee?: string
    assigneeAvatar?: string
    project: string
    projectColor: string
    tags: string[]
    dueDate: string
    createdAt: string
    updatedAt: string
    estimatedHours: number
    actualHours: number
    progress: number
    subtasks: SubTask[]
    dependencies: string[]
    comments: Comment[]
    attachments: Attachment[]
    timeEntries: TimeEntry[]
}

interface SubTask {
    id: string
    title: string
    completed: boolean
    assignee?: string
}

interface Comment {
    id: string
    author: string
    authorAvatar: string
    content: string
    createdAt: string
}

interface Attachment {
    id: string
    name: string
    size: number
    type: string
    url: string
}

interface TimeEntry {
    id: string
    startTime: string
    endTime?: string
    duration: number
    description: string
    user: string
}

// Mock data
const mockTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Implement Real-time Analytics Dashboard',
        description: 'Build comprehensive analytics dashboard with real-time data visualization',
        status: 'in_progress',
        priority: 'high',
        assignee: 'Alex Chen',
        assigneeAvatar: '/avatars/alex.jpg',
        project: 'ControlAI Platform',
        projectColor: 'blue',
        tags: ['frontend', 'analytics', 'react'],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 24,
        actualHours: 16,
        progress: 65,
        subtasks: [
            { id: 'sub-1', title: 'Design dashboard layout', completed: true },
            { id: 'sub-2', title: 'Implement chart components', completed: true },
            { id: 'sub-3', title: 'Add real-time data feed', completed: false },
            { id: 'sub-4', title: 'Add export functionality', completed: false }
        ],
        dependencies: [],
        comments: [],
        attachments: [],
        timeEntries: []
    },
    {
        id: 'task-2',
        title: 'Enhanced Security Audit System',
        description: 'Develop comprehensive security auditing and monitoring system',
        status: 'review',
        priority: 'critical',
        assignee: 'Sarah Kim',
        assigneeAvatar: '/avatars/sarah.jpg',
        project: 'Security Framework',
        projectColor: 'red',
        tags: ['security', 'backend', 'monitoring'],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        estimatedHours: 32,
        actualHours: 28,
        progress: 90,
        subtasks: [
            { id: 'sub-5', title: 'Implement audit logging', completed: true },
            { id: 'sub-6', title: 'Create monitoring dashboard', completed: true },
            { id: 'sub-7', title: 'Add alerting system', completed: true },
            { id: 'sub-8', title: 'Security testing', completed: false }
        ],
        dependencies: [],
        comments: [],
        attachments: [],
        timeEntries: []
    },
    {
        id: 'task-3',
        title: 'AI Model Performance Optimization',
        description: 'Optimize ML models for better performance and accuracy',
        status: 'todo',
        priority: 'medium',
        assignee: 'David Rodriguez',
        assigneeAvatar: '/avatars/david.jpg',
        project: 'AI/ML Pipeline',
        projectColor: 'purple',
        tags: ['ai', 'optimization', 'performance'],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 40,
        actualHours: 0,
        progress: 0,
        subtasks: [
            { id: 'sub-9', title: 'Analyze current performance', completed: false },
            { id: 'sub-10', title: 'Identify optimization opportunities', completed: false },
            { id: 'sub-11', title: 'Implement optimizations', completed: false },
            { id: 'sub-12', title: 'Performance testing', completed: false }
        ],
        dependencies: ['task-1'],
        comments: [],
        attachments: [],
        timeEntries: []
    }
]

// Priority configurations
const priorityConfig = {
    critical: { color: 'red', icon: AlertTriangle, label: 'Critical' },
    high: { color: 'orange', icon: ArrowUp, label: 'High' },
    medium: { color: 'yellow', icon: Minus, label: 'Medium' },
    low: { color: 'green', icon: ArrowDown, label: 'Low' }
}

// Status configurations
const statusConfig = {
    todo: { color: 'gray', icon: Circle, label: 'To Do' },
    in_progress: { color: 'blue', icon: Play, label: 'In Progress' },
    review: { color: 'purple', icon: Eye, label: 'Review' },
    testing: { color: 'orange', icon: Zap, label: 'Testing' },
    blocked: { color: 'red', icon: AlertCircle, label: 'Blocked' },
    completed: { color: 'green', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'gray', icon: XCircle, label: 'Cancelled' }
}

// Mock hooks
const useTasks = () => ({
    tasks: mockTasks,
    loading: false,
    error: null,
    createTask: (task: Partial<Task>) => console.log('Creating task:', task),
    updateTask: (id: string, updates: Partial<Task>) => console.log('Updating task:', id, updates),
    deleteTask: (id: string) => console.log('Deleting task:', id),
    bulkUpdate: (taskIds: string[], updates: Partial<Task>) => console.log('Bulk updating tasks:', taskIds, updates)
})

export default function TasksPage() {
    // Enhanced state management
    const [tasksState, setTasksState] = useState<TasksState>({
        activeView: 'kanban',
        selectedTasks: [],
        filters: {
            status: [],
            priority: [],
            assignees: [],
            projects: [],
            tags: [],
            dateRange: { start: null, end: null, preset: 'week' },
            overdue: false
        },
        sortBy: 'updated',
        sortOrder: 'desc',
        searchQuery: '',
        showCompleted: false,
        realTimeUpdates: true,
        autoRefresh: true,
        refreshInterval: 30000,
        groupBy: 'status',
        viewSettings: {
            showSubtasks: true,
            showDependencies: true,
            showTimeTracking: true,
            showComments: true,
            cardSize: 'normal',
            showAssigneeAvatars: true
        }
    })

    const [showFilters, setShowFilters] = useState(false)
    const [showCreateTask, setShowCreateTask] = useState(false)

    // Data hooks
    const { tasks, loading, error, createTask, updateTask, deleteTask, bulkUpdate } = useTasks()

    // Computed values
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            // Search filter
            if (tasksState.searchQuery) {
                const query = tasksState.searchQuery.toLowerCase()
                if (!task.title.toLowerCase().includes(query) &&
                    !task.description.toLowerCase().includes(query) &&
                    !task.tags.some(tag => tag.toLowerCase().includes(query))) {
                    return false
                }
            }

            // Status filter
            if (tasksState.filters.status.length > 0 && !tasksState.filters.status.includes(task.status)) {
                return false
            }

            // Priority filter
            if (tasksState.filters.priority.length > 0 && !tasksState.filters.priority.includes(task.priority)) {
                return false
            }

            // Show completed filter
            if (!tasksState.showCompleted && task.status === 'completed') {
                return false
            }

            // Overdue filter
            if (tasksState.filters.overdue) {
                const now = new Date()
                const dueDate = new Date(task.dueDate)
                if (dueDate > now || task.status === 'completed') {
                    return false
                }
            }

            return true
        })

        // Sort tasks
        filtered.sort((a, b) => {
            let aValue, bValue

            switch (tasksState.sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase()
                    bValue = b.title.toLowerCase()
                    break
                case 'priority':
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                    aValue = priorityOrder[a.priority]
                    bValue = priorityOrder[b.priority]
                    break
                case 'due_date':
                    aValue = new Date(a.dueDate).getTime()
                    bValue = new Date(b.dueDate).getTime()
                    break
                case 'updated':
                    aValue = new Date(a.updatedAt).getTime()
                    bValue = new Date(b.updatedAt).getTime()
                    break
                case 'created':
                    aValue = new Date(a.createdAt).getTime()
                    bValue = new Date(b.createdAt).getTime()
                    break
                default:
                    aValue = a[tasksState.sortBy]
                    bValue = b[tasksState.sortBy]
            }

            if (aValue < bValue) return tasksState.sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return tasksState.sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [tasks, tasksState.searchQuery, tasksState.filters, tasksState.showCompleted, tasksState.sortBy, tasksState.sortOrder])

    // Task analytics
    const taskAnalytics = useMemo(() => {
        const totalTasks = filteredAndSortedTasks.length
        const completedTasks = filteredAndSortedTasks.filter(t => t.status === 'completed').length
        const overdueTasks = filteredAndSortedTasks.filter(t => {
            const now = new Date()
            const dueDate = new Date(t.dueDate)
            return dueDate < now && t.status !== 'completed'
        }).length
        const inProgressTasks = filteredAndSortedTasks.filter(t => t.status === 'in_progress').length
        const avgProgress = totalTasks > 0 ? filteredAndSortedTasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks : 0
        const criticalTasks = filteredAndSortedTasks.filter(t => t.priority === 'critical').length

        return {
            totalTasks,
            completedTasks,
            overdueTasks,
            inProgressTasks,
            avgProgress,
            criticalTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        }
    }, [filteredAndSortedTasks])

    // Handlers
    const handleTaskAction = useCallback((taskId: string, action: string) => {
        console.log(`Task action: ${action} on task ${taskId}`)

        switch (action) {
            case 'complete':
                updateTask(taskId, { status: 'completed', progress: 100 })
                break
            case 'start':
                updateTask(taskId, { status: 'in_progress' })
                break
            case 'pause':
                updateTask(taskId, { status: 'todo' })
                break
            case 'delete':
                deleteTask(taskId)
                break
            // Add more actions as needed
        }
    }, [updateTask, deleteTask])

    const handleBulkAction = useCallback((action: string) => {
        if (tasksState.selectedTasks.length === 0) return

        console.log(`Bulk action: ${action} on tasks:`, tasksState.selectedTasks)

        switch (action) {
            case 'complete':
                bulkUpdate(tasksState.selectedTasks, { status: 'completed', progress: 100 })
                break
            case 'delete':
                tasksState.selectedTasks.forEach(deleteTask)
                break
            case 'archive':
                bulkUpdate(tasksState.selectedTasks, { status: 'cancelled' })
                break
        }

        setTasksState(prev => ({ ...prev, selectedTasks: [] }))
    }, [tasksState.selectedTasks, bulkUpdate, deleteTask])

    // Enhanced navigation items
    const navigationItems = [
        { id: 'kanban', label: 'Kanban Board', icon: FolderKanban, description: 'Visual task board with drag & drop' },
        { id: 'list', label: 'List View', icon: List, description: 'Detailed task list with sorting' },
        { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Gantt chart timeline view' },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays, description: 'Calendar view with due dates' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Task metrics and insights' }
    ] as const

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Enhanced Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center"
                        >
                            <div className="p-3 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 rounded-xl mr-4 shadow-lg">
                                <CheckSquare className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                                    Task Management Center
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {taskAnalytics.totalTasks} tasks • {taskAnalytics.completedTasks} completed •
                                    {taskAnalytics.overdueTasks} overdue • {taskAnalytics.completionRate.toFixed(1)}% completion rate
                                </p>
                            </div>
                        </motion.div>

                        <div className="flex items-center space-x-3">
                            {/* View mode selector */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                {(['kanban', 'list', 'timeline'] as const).map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setTasksState(prev => ({ ...prev, activeView: view }))}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${tasksState.activeView === view
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {view === 'kanban' && <FolderKanban className="w-3 h-3" />}
                                        {view === 'list' && <List className="w-3 h-3" />}
                                        {view === 'timeline' && <Calendar className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={tasksState.searchQuery}
                                    onChange={(e) => setTasksState(prev => ({ ...prev, searchQuery: e.target.value }))}
                                    className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>

                            {/* Filters */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${showFilters
                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </button>

                            {/* Create Task */}
                            <button
                                onClick={() => setShowCreateTask(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Task
                            </button>

                            {/* Settings */}
                            <button className="flex items-center px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {[
                        {
                            title: 'Total Tasks',
                            value: taskAnalytics.totalTasks,
                            icon: CheckSquare,
                            color: 'blue',
                            subtitle: 'All active tasks'
                        },
                        {
                            title: 'Completed',
                            value: taskAnalytics.completedTasks,
                            icon: CheckCircle2,
                            color: 'green',
                            trend: { value: 12.5, positive: true, period: 'this week' }
                        },
                        {
                            title: 'In Progress',
                            value: taskAnalytics.inProgressTasks,
                            icon: Play,
                            color: 'blue',
                            subtitle: 'Currently active'
                        },
                        {
                            title: 'Overdue',
                            value: taskAnalytics.overdueTasks,
                            icon: AlertCircle,
                            color: 'red',
                            trend: { value: 8.2, positive: false, period: 'this week' }
                        },
                        {
                            title: 'Critical Tasks',
                            value: taskAnalytics.criticalTasks,
                            icon: AlertTriangle,
                            color: 'orange',
                            subtitle: 'High priority items'
                        },
                        {
                            title: 'Avg Progress',
                            value: `${taskAnalytics.avgProgress.toFixed(1)}%`,
                            icon: Target,
                            color: 'purple',
                            trend: { value: 5.8, positive: true, period: 'this month' }
                        }
                    ].map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <StatsCard {...metric} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Enhanced Navigation */}
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto">
                        {navigationItems.map(({ id, label, icon: Icon, description }) => (
                            <motion.button
                                key={id}
                                onClick={() => setTasksState(prev => ({ ...prev, activeView: id as TasksState['activeView'] }))}
                                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${tasksState.activeView === id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                                    }`}
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 0 }}
                                title={description}
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
                {/* Bulk Actions Bar */}
                {tasksState.selectedTasks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-blue-800 dark:text-blue-200 font-medium">
                                {tasksState.selectedTasks.length} tasks selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleBulkAction('complete')}
                                    className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Mark Complete
                                </button>
                                <button
                                    onClick={() => handleBulkAction('archive')}
                                    className="flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                                >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Task View Content */}
                <motion.div
                    key={tasksState.activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {tasksState.activeView === 'kanban' && renderKanbanView()}
                    {tasksState.activeView === 'list' && renderListView()}
                    {tasksState.activeView === 'timeline' && renderTimelineView()}
                    {tasksState.activeView === 'calendar' && renderCalendarView()}
                    {tasksState.activeView === 'analytics' && renderAnalyticsView()}
                </motion.div>
            </main>

            {/* Real-time indicator */}
            {tasksState.realTimeUpdates && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                            <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                                Real-time updates active
                            </span>
                            <button
                                onClick={() => setTasksState(prev => ({ ...prev, realTimeUpdates: false }))}
                                className="ml-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Footer */}
            <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Task Templates',
                                description: 'Pre-built task templates for common workflows',
                                icon: FolderKanban,
                                gradient: 'from-blue-500 to-cyan-500'
                            },
                            {
                                title: 'Time Tracking',
                                description: 'Advanced time tracking and productivity analytics',
                                icon: Timer,
                                gradient: 'from-green-500 to-emerald-500'
                            },
                            {
                                title: 'Team Collaboration',
                                description: 'Enhanced collaboration tools and communication',
                                icon: Users,
                                gradient: 'from-purple-500 to-pink-500'
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                className="group cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card className="p-6 h-full hover:shadow-lg transition-all duration-200">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )

    // Helper functions for different views
    function renderKanbanView() {
        const columns = Object.keys(statusConfig) as TaskStatus[]

        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                {columns.map((status) => {
                    const columnTasks = filteredAndSortedTasks.filter(task => task.status === status)
                    const config = statusConfig[status]

                    return (
                        <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <config.icon className={`w-4 h-4 mr-2 text-${config.color}-600`} />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {config.label}
                                    </h3>
                                    <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                        {columnTasks.length}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {columnTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <TaskCard
                                            task={task}
                                            onAction={handleTaskAction}
                                            selected={tasksState.selectedTasks.includes(task.id)}
                                            onSelect={(selected) => {
                                                setTasksState(prev => ({
                                                    ...prev,
                                                    selectedTasks: selected
                                                        ? [...prev.selectedTasks, task.id]
                                                        : prev.selectedTasks.filter(id => id !== task.id)
                                                }))
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    function renderListView() {
        return (
            <div className="space-y-4">
                {filteredAndSortedTasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <TaskListItem
                            task={task}
                            onAction={handleTaskAction}
                            selected={tasksState.selectedTasks.includes(task.id)}
                            onSelect={(selected) => {
                                setTasksState(prev => ({
                                    ...prev,
                                    selectedTasks: selected
                                        ? [...prev.selectedTasks, task.id]
                                        : prev.selectedTasks.filter(id => id !== task.id)
                                }))
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        )
    }

    function renderTimelineView() {
        return (
            <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Timeline View Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Gantt chart timeline visualization will be implemented here.
                </p>
            </div>
        )
    }

    function renderCalendarView() {
        return (
            <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Calendar View Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Calendar view with task due dates will be implemented here.
                </p>
            </div>
        )
    }

    function renderAnalyticsView() {
        return (
            <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Task Analytics Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Detailed task analytics and productivity insights will be implemented here.
                </p>
            </div>
        )
    }
}

// Enhanced Task Card Component
function TaskCard({
    task,
    onAction,
    selected,
    onSelect
}: {
    task: Task
    onAction: (taskId: string, action: string) => void
    selected: boolean
    onSelect: (selected: boolean) => void
}) {
    const priorityConfig = {
        critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
        high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
        medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        low: 'border-green-500 bg-green-50 dark:bg-green-900/20'
    }

    const statusConfig = {
        todo: 'text-gray-600 dark:text-gray-400',
        in_progress: 'text-blue-600 dark:text-blue-400',
        review: 'text-purple-600 dark:text-purple-400',
        testing: 'text-orange-600 dark:text-orange-400',
        blocked: 'text-red-600 dark:text-red-400',
        completed: 'text-green-600 dark:text-green-400',
        cancelled: 'text-gray-600 dark:text-gray-400'
    }

    return (
        <Card className={`p-4 ${selected ? 'ring-2 ring-blue-500' : ''} ${priorityConfig[task.priority]} border-l-4 hover:shadow-lg transition-all duration-200`}>
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => onSelect(e.target.checked)}
                            className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                                {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {task.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => onAction(task.id, 'view')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <Eye className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onAction(task.id, 'edit')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => onAction(task.id, 'more')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <MoreHorizontal className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                        {task.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                +{task.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        {task.assigneeAvatar && (
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {task.assignee?.charAt(0)}
                                </span>
                            </div>
                        )}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {task.assignee}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

// Enhanced Task List Item Component
function TaskListItem({
    task,
    onAction,
    selected,
    onSelect
}: {
    task: Task
    onAction: (taskId: string, action: string) => void
    selected: boolean
    onSelect: (selected: boolean) => void
}) {
    const priorityColors = {
        critical: 'text-red-600 dark:text-red-400',
        high: 'text-orange-600 dark:text-orange-400',
        medium: 'text-yellow-600 dark:text-yellow-400',
        low: 'text-green-600 dark:text-green-400'
    }

    const statusColors = {
        todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        testing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }

    return (
        <Card className={`p-4 hover:shadow-lg transition-all duration-200 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center space-x-4">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {task.description}
                        </p>
                    </div>

                    <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                            {statusConfig[task.status].label}
                        </span>
                    </div>

                    <div className={`text-sm font-medium ${priorityColors[task.priority]}`}>
                        {priorityConfig[task.priority].label}
                    </div>

                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{task.progress}%</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    style={{ width: `${task.progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {task.estimatedHours}h estimated
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <button
                            onClick={() => onAction(task.id, 'view')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction(task.id, 'edit')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction(task.id, 'more')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

// Enhanced Components (reusing from previous implementations)
function Button({
    children,
    onClick,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    ...props
}: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm',
        outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
        ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
    }

    const sizes = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    }

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
        </motion.button>
    )
}

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
    trend?: { value: number; positive: boolean; period?: string }
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
                                className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
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
                                    {trend.period && <span className="ml-1">{trend.period}</span>}
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

