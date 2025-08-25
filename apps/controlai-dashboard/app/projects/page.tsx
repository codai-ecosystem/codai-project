'use client'

import React from 'react'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FolderKanban,
    Plus,
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
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    AlertCircle,
    Users,
    Archive,
    Star,
    BookOpen,
    FileText,
    Database,
    Globe,
    Settings,
    MoreHorizontal,
    ExternalLink,
    RefreshCw,
    Bell,
    Award,
    Activity,
    PlusCircle,
    MinusCircle,
    Home,
    Layers,
    Command,
    Monitor,
    BarChart3
} from 'lucide-react'

// Simple Button component
const Button = ({ onClick, variant = 'default', size = 'md', children, disabled, className = '', ...props }: any) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-accent hover:text-accent-foreground bg-transparent hover:bg-gray-100',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
    }
    const sizeClasses = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

// Simple StatsCard component
const StatsCard = ({ title, value, subtitle, icon, color = 'blue', trend, loading }: any) => {
    const IconComponent = icon
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200'
    }

    return (
        <div className={`p-6 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
            <div className="flex items-center justify-between mb-2">
                {IconComponent && <IconComponent className="w-8 h-8" />}
                {trend && (
                    <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</h3>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
            </div>
        </div>
    )
}

// Simple Card component
const Card = ({ children, className = '' }: any) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
            {children}
        </div>
    )
}

// Enhanced Types
type ProjectStatus = 'active' | 'completed' | 'paused' | 'planning' | 'on-hold' | 'cancelled'
type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'
type ProjectCategory = 'development' | 'design' | 'research' | 'marketing' | 'infrastructure' | 'support'
type ProjectPhase = 'discovery' | 'planning' | 'execution' | 'testing' | 'deployment' | 'maintenance'
type ViewMode = 'grid' | 'list' | 'board' | 'timeline' | 'calendar'
type FilterOption = 'all' | 'my-projects' | 'team-projects' | 'archived'
type SortOption = 'name' | 'created' | 'updated' | 'deadline' | 'priority' | 'progress' | 'status'

interface ProjectsState {
    searchTerm: string
    selectedStatus: ProjectStatus | 'all'
    selectedPriority: ProjectPriority | 'all'
    selectedCategory: ProjectCategory | 'all'
    selectedPhase: ProjectPhase | 'all'
    filterOption: FilterOption
    sortBy: SortOption
    sortOrder: 'asc' | 'desc'
    viewMode: ViewMode
    showFilters: boolean
    selectedProjects: string[]
    quickFilters: string[]
    exportFormat: 'csv' | 'json' | 'pdf'
    timeRange: { label: string; value: string; days: number }
    autoRefresh: boolean
    comparisonMode: boolean
}

interface Project {
    id: string
    name: string
    description: string
    status: ProjectStatus
    priority: ProjectPriority
    category: ProjectCategory
    phase: ProjectPhase
    progress: number
    startDate: string
    deadline: string
    lastUpdated: string
    assignedAgents: string[]
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    budget: number
    spentBudget: number
    owner: string
    tags: string[]
    dependencies: string[]
    milestones: { name: string; date: string; completed: boolean }[]
    resources: { type: string; allocated: number; used: number }[]
    riskLevel: 'low' | 'medium' | 'high'
    successProbability: number
    estimatedCompletion: string
}

interface ProjectMetric {
    id: string
    label: string
    value: number
    unit?: string
    description: string
    icon: any
    category: 'overview' | 'performance' | 'resources' | 'quality'
    trend?: { value: number; positive: boolean; period?: string }
}

export default function ProjectsPage() {
    // Enhanced State Management
    const [projectsState, setProjectsState] = useState<ProjectsState>({
        searchTerm: '',
        selectedStatus: 'all',
        selectedPriority: 'all',
        selectedCategory: 'all',
        selectedPhase: 'all',
        filterOption: 'all',
        sortBy: 'updated',
        sortOrder: 'desc',
        viewMode: 'grid',
        showFilters: false,
        selectedProjects: [],
        quickFilters: [],
        exportFormat: 'csv',
        timeRange: { label: 'Last 30 Days', value: '30d', days: 30 },
        autoRefresh: false,
        comparisonMode: false
    })

    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [projectMetrics, setProjectMetrics] = useState<ProjectMetric[]>([])

    // Enhanced Mock Data
    const mockProjects: Project[] = [
        {
            id: 'proj-001',
            name: 'ControlAI Dashboard Enhancement',
            description: 'Advanced real-time dashboard with predictive analytics and multi-agent coordination',
            status: 'active',
            priority: 'high',
            category: 'development',
            phase: 'execution',
            progress: 75,
            startDate: '2025-07-01',
            deadline: '2025-08-15',
            lastUpdated: '2025-08-07',
            assignedAgents: ['Senior Developer', 'UX Designer', 'DevOps Engineer'],
            totalTasks: 24,
            completedTasks: 18,
            overdueTasks: 1,
            budget: 50000,
            spentBudget: 37500,
            owner: 'Alex Chen',
            tags: ['react', 'typescript', 'real-time', 'dashboard'],
            dependencies: ['proj-002'],
            milestones: [
                { name: 'MVP Complete', date: '2025-07-15', completed: true },
                { name: 'Beta Testing', date: '2025-08-01', completed: true },
                { name: 'Production Release', date: '2025-08-15', completed: false }
            ],
            resources: [
                { type: 'developers', allocated: 3, used: 3 },
                { type: 'designers', allocated: 1, used: 1 },
                { type: 'infrastructure', allocated: 100, used: 75 }
            ],
            riskLevel: 'low',
            successProbability: 92,
            estimatedCompletion: '2025-08-12'
        },
        {
            id: 'proj-002',
            name: 'AI Agent Coordination Framework',
            description: 'Multi-agent task management and intelligent resource allocation system',
            status: 'active',
            priority: 'critical',
            category: 'infrastructure',
            phase: 'testing',
            progress: 85,
            startDate: '2025-06-15',
            deadline: '2025-08-01',
            lastUpdated: '2025-08-06',
            assignedAgents: ['AI Engineer', 'Systems Architect', 'QA Engineer'],
            totalTasks: 32,
            completedTasks: 27,
            overdueTasks: 0,
            budget: 75000,
            spentBudget: 63750,
            owner: 'Sarah Kumar',
            tags: ['ai', 'coordination', 'framework', 'scalability'],
            dependencies: [],
            milestones: [
                { name: 'Core Framework', date: '2025-07-01', completed: true },
                { name: 'Agent Integration', date: '2025-07-20', completed: true },
                { name: 'Performance Testing', date: '2025-08-01', completed: false }
            ],
            resources: [
                { type: 'ai-engineers', allocated: 2, used: 2 },
                { type: 'compute', allocated: 200, used: 170 },
                { type: 'storage', allocated: 500, used: 340 }
            ],
            riskLevel: 'medium',
            successProbability: 88,
            estimatedCompletion: '2025-08-03'
        },
        {
            id: 'proj-003',
            name: 'MemorAI Integration Platform',
            description: 'Advanced memory management system with vector embeddings and semantic search',
            status: 'completed',
            priority: 'medium',
            category: 'development',
            phase: 'maintenance',
            progress: 100,
            startDate: '2025-05-01',
            deadline: '2025-07-15',
            lastUpdated: '2025-07-20',
            assignedAgents: ['Backend Developer', 'ML Engineer'],
            totalTasks: 18,
            completedTasks: 18,
            overdueTasks: 0,
            budget: 40000,
            spentBudget: 38500,
            owner: 'Marcus Johnson',
            tags: ['memory', 'ai', 'vector-db', 'search'],
            dependencies: [],
            milestones: [
                { name: 'Memory Core', date: '2025-05-15', completed: true },
                { name: 'Vector Integration', date: '2025-06-15', completed: true },
                { name: 'Production Deploy', date: '2025-07-15', completed: true }
            ],
            resources: [
                { type: 'developers', allocated: 2, used: 2 },
                { type: 'ml-engineers', allocated: 1, used: 1 },
                { type: 'database', allocated: 150, used: 145 }
            ],
            riskLevel: 'low',
            successProbability: 100,
            estimatedCompletion: '2025-07-15'
        }
    ]

    const mockProjectMetrics: ProjectMetric[] = [
        {
            id: 'total-projects',
            label: 'Total Projects',
            value: 12,
            description: 'Active and completed projects in portfolio',
            icon: FolderKanban,
            category: 'overview',
            trend: { value: 15.8, positive: true, period: 'vs last month' }
        },
        {
            id: 'active-projects',
            label: 'Active Projects',
            value: 8,
            description: 'Currently running projects',
            icon: Activity,
            category: 'overview',
            trend: { value: 2.4, positive: true, period: 'vs last week' }
        },
        {
            id: 'completion-rate',
            label: 'Completion Rate',
            value: 87,
            unit: '%',
            description: 'Projects completed on time',
            icon: CheckCircle2,
            category: 'performance',
            trend: { value: 5.2, positive: true, period: 'vs last quarter' }
        },
        {
            id: 'avg-progress',
            label: 'Average Progress',
            value: 73,
            unit: '%',
            description: 'Mean progress across all active projects',
            icon: Target,
            category: 'performance',
            trend: { value: 8.3, positive: true, period: 'vs last month' }
        },
        {
            id: 'resource-utilization',
            label: 'Resource Utilization',
            value: 82,
            unit: '%',
            description: 'Current resource allocation efficiency',
            icon: Users,
            category: 'resources',
            trend: { value: 3.1, positive: false, period: 'vs last week' }
        },
        {
            id: 'budget-efficiency',
            label: 'Budget Efficiency',
            value: 94,
            unit: '%',
            description: 'Budget utilization vs planned spending',
            icon: BarChart3,
            category: 'resources',
            trend: { value: 7.5, positive: true, period: 'vs target' }
        },
        {
            id: 'quality-score',
            label: 'Quality Score',
            value: 91,
            unit: '/100',
            description: 'Overall project quality assessment',
            icon: Award,
            category: 'quality',
            trend: { value: 2.8, positive: true, period: 'vs last review' }
        },
        {
            id: 'risk-level',
            label: 'Risk Level',
            value: 23,
            unit: '%',
            description: 'Average risk across all projects',
            icon: AlertCircle,
            category: 'quality',
            trend: { value: 12.4, positive: false, period: 'vs last assessment' }
        }
    ]

    // Time Range Options
    const timeRanges = [
        { label: 'Last 7 Days', value: '7d', days: 7 },
        { label: 'Last 30 Days', value: '30d', days: 30 },
        { label: 'Last 90 Days', value: '90d', days: 90 },
        { label: 'Last 6 Months', value: '6m', days: 180 },
        { label: 'Last Year', value: '1y', days: 365 },
        { label: 'All Time', value: 'all', days: -1 }
    ]

    // Navigation Items
    const navigationItems = [
        { id: 'overview', label: 'Overview', icon: Home, description: 'Project portfolio overview' },
        { id: 'active', label: 'Active Projects', icon: Activity, description: 'Currently running projects' },
        { id: 'planning', label: 'Planning', icon: Calendar, description: 'Projects in planning phase' },
        { id: 'completed', label: 'Completed', icon: CheckCircle2, description: 'Finished projects' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Project analytics and insights' },
        { id: 'resources', label: 'Resources', icon: Users, description: 'Resource allocation and management' },
        { id: 'timeline', label: 'Timeline', icon: Clock, description: 'Project timeline and milestones' }
    ]

    // Enhanced Effects
    useEffect(() => {
        setProjects(mockProjects)
        setProjectMetrics(mockProjectMetrics)
    }, [])

    useEffect(() => {
        if (projectsState.autoRefresh) {
            const interval = setInterval(() => {
                // Refresh project data
                console.log('Auto-refreshing projects data...')
            }, 30000) // 30 seconds

            return () => clearInterval(interval)
        }
    }, [projectsState.autoRefresh])

    // Enhanced Handlers
    const handleSearch = useCallback((term: string) => {
        setProjectsState(prev => ({ ...prev, searchTerm: term }))
    }, [])

    const handleFilterChange = useCallback((key: keyof ProjectsState, value: any) => {
        setProjectsState(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleSort = useCallback((sortBy: SortOption) => {
        setProjectsState(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }))
    }, [])

    const handleBulkAction = useCallback((action: string) => {
        console.log(`Bulk action: ${action} on projects:`, projectsState.selectedProjects)
        // Implement bulk actions
    }, [projectsState.selectedProjects])

    const handleExport = useCallback(() => {
        console.log(`Exporting projects as ${projectsState.exportFormat}`)
        // Implement export functionality
    }, [projectsState.exportFormat])

    const handleProjectAction = useCallback((projectId: string, action: string) => {
        console.log(`Project action: ${action} on project: ${projectId}`)
        // Implement project actions
    }, [])

    // Enhanced Filtered and Sorted Projects
    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(projectsState.searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(projectsState.searchTerm.toLowerCase()) ||
                project.tags.some(tag => tag.toLowerCase().includes(projectsState.searchTerm.toLowerCase()))

            const matchesStatus = projectsState.selectedStatus === 'all' || project.status === projectsState.selectedStatus
            const matchesPriority = projectsState.selectedPriority === 'all' || project.priority === projectsState.selectedPriority
            const matchesCategory = projectsState.selectedCategory === 'all' || project.category === projectsState.selectedCategory
            const matchesPhase = projectsState.selectedPhase === 'all' || project.phase === projectsState.selectedPhase

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesPhase
        })

        // Sort projects
        filtered.sort((a, b) => {
            let aValue: any, bValue: any

            switch (projectsState.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case 'created':
                    aValue = new Date(a.startDate).getTime()
                    bValue = new Date(b.startDate).getTime()
                    break
                case 'updated':
                    aValue = new Date(a.lastUpdated).getTime()
                    bValue = new Date(b.lastUpdated).getTime()
                    break
                case 'deadline':
                    aValue = new Date(a.deadline).getTime()
                    bValue = new Date(b.deadline).getTime()
                    break
                case 'priority':
                    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
                    aValue = priorityOrder[a.priority]
                    bValue = priorityOrder[b.priority]
                    break
                case 'progress':
                    aValue = a.progress
                    bValue = b.progress
                    break
                case 'status':
                    aValue = a.status
                    bValue = b.status
                    break
                default:
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
            }

            if (projectsState.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
            }
        })

        return filtered
    }, [projects, projectsState])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            {/* Enhanced Header with Gradient Design and Project Analytics */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                                    <FolderKanban className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                        Project Management Hub
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Comprehensive project coordination and tracking
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Header Analytics Cards */}
                            <div className="hidden lg:flex items-center space-x-4">
                                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Active</span>
                                        <div className="text-sm font-bold text-blue-900 dark:text-blue-100">8</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <div>
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Completion</span>
                                        <div className="text-sm font-bold text-green-900 dark:text-green-100">87%</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <div>
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Resources</span>
                                        <div className="text-sm font-bold text-purple-900 dark:text-purple-100">82%</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    <div>
                                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Quality</span>
                                        <div className="text-sm font-bold text-orange-900 dark:text-orange-100">91</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={() => handleFilterChange('showFilters', !projectsState.showFilters)}
                                    variant="ghost"
                                    size="sm"
                                    icon={<Filter className="w-4 h-4" />}
                                >
                                    Filters
                                </Button>
                                <Button
                                    onClick={() => setProjectsState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                                    variant="ghost"
                                    size="sm"
                                    icon={<RefreshCw className={`w-4 h-4 ${projectsState.autoRefresh ? 'animate-spin text-green-600' : ''}`} />}
                                >
                                    {projectsState.autoRefresh ? 'Auto' : 'Refresh'}
                                </Button>
                                <Button
                                    onClick={() => console.log('Create project')}
                                    variant="primary"
                                    size="sm"
                                    icon={<Plus className="w-4 h-4" />}
                                >
                                    New Project
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Enhanced Summary Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            title: 'Total Projects',
                            value: '12',
                            subtitle: 'Active portfolio size',
                            icon: FolderKanban,
                            color: 'blue' as const,
                            trend: { value: 15.8, positive: true }
                        },
                        {
                            title: 'Success Rate',
                            value: '87%',
                            subtitle: 'On-time completion rate',
                            icon: CheckCircle2,
                            color: 'green' as const,
                            trend: { value: 5.2, positive: true }
                        },
                        {
                            title: 'Active Tasks',
                            value: '156',
                            subtitle: 'Currently in progress',
                            icon: Activity,
                            color: 'purple' as const,
                            trend: { value: 12.3, positive: true }
                        },
                        {
                            title: 'Team Utilization',
                            value: '82%',
                            subtitle: 'Resource efficiency',
                            icon: Users,
                            color: 'orange' as const,
                            trend: { value: 3.1, positive: false }
                        }
                    ].map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <StatsCard
                                title={card.title}
                                value={card.value}
                                subtitle={card.subtitle}
                                icon={card.icon}
                                color={card.color}
                                trend={card.trend}
                                loading={loading}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Plus, label: 'New Project', color: 'blue', action: () => console.log('New project') },
                        { icon: Upload, label: 'Import Data', color: 'green', action: () => console.log('Import') },
                        { icon: BarChart3, label: 'Analytics', color: 'purple', action: () => console.log('Analytics') },
                        { icon: Download, label: 'Export', color: 'orange', action: handleExport }
                    ].map((action, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                onClick={action.action}
                                variant="outline"
                                className="w-full h-20 flex-col space-y-2"
                                icon={<action.icon className="w-6 h-6" />}
                            >
                                {action.label}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Enhanced Filters Panel */}
            <AnimatePresence>
                {projectsState.showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Search Projects
                                    </label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={projectsState.searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search by name, tags, or description..."
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Status
                                    </label>
                                    <select
                                        value={projectsState.selectedStatus}
                                        onChange={(e) => handleFilterChange('selectedStatus', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="paused">Paused</option>
                                        <option value="planning">Planning</option>
                                        <option value="on-hold">On Hold</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Priority Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Priority
                                    </label>
                                    <select
                                        value={projectsState.selectedPriority}
                                        onChange={(e) => handleFilterChange('selectedPriority', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Priorities</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Category
                                    </label>
                                    <select
                                        value={projectsState.selectedCategory}
                                        onChange={(e) => handleFilterChange('selectedCategory', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="development">Development</option>
                                        <option value="design">Design</option>
                                        <option value="research">Research</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="infrastructure">Infrastructure</option>
                                        <option value="support">Support</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sort and View Options */}
                            <div className="flex flex-wrap items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                                        <select
                                            value={projectsState.sortBy}
                                            onChange={(e) => handleSort(e.target.value as SortOption)}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        >
                                            <option value="updated">Last Updated</option>
                                            <option value="name">Name</option>
                                            <option value="created">Created Date</option>
                                            <option value="deadline">Deadline</option>
                                            <option value="priority">Priority</option>
                                            <option value="progress">Progress</option>
                                            <option value="status">Status</option>
                                        </select>
                                        <button
                                            onClick={() => handleFilterChange('sortOrder', projectsState.sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            {projectsState.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
                                    {(['grid', 'list', 'board'] as ViewMode[]).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => handleFilterChange('viewMode', mode)}
                                            className={`px-3 py-1 rounded text-sm capitalize ${projectsState.viewMode === mode
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Stats Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
                    {projectMetrics.map((metric, index) => (
                        <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <StatsCard
                                title={metric.label}
                                value={`${metric.value}${metric.unit || ''}`}
                                subtitle={metric.description}
                                icon={metric.icon}
                                color={
                                    metric.category === 'overview' ? 'blue' :
                                        metric.category === 'performance' ? 'green' :
                                            metric.category === 'resources' ? 'purple' :
                                                'orange'
                                }
                                loading={loading}
                                trend={metric.trend}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Enhanced Navigation */}
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto">
                        {navigationItems.map(({ id, label, icon: Icon, description }) => (
                            <motion.button
                                key={id}
                                onClick={() => console.log(`Navigate to ${id}`)}
                                className="flex items-center px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 whitespace-nowrap"
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
                {/* Projects Grid/List */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Projects ({filteredAndSortedProjects.length})
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage and track your project portfolio
                            </p>
                        </div>

                        {projectsState.selectedProjects.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {projectsState.selectedProjects.length} selected
                                </span>
                                <Button
                                    onClick={() => handleBulkAction('archive')}
                                    variant="outline"
                                    size="sm"
                                    icon={<Archive className="w-4 h-4" />}
                                >
                                    Archive
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('export')}
                                    variant="outline"
                                    size="sm"
                                    icon={<Download className="w-4 h-4" />}
                                >
                                    Export
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Projects Display */}
                    {projectsState.viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAndSortedProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ProjectCard
                                        project={project}
                                        onAction={handleProjectAction}
                                        selected={projectsState.selectedProjects.includes(project.id)}
                                        onSelect={(selected) => {
                                            setProjectsState(prev => ({
                                                ...prev,
                                                selectedProjects: selected
                                                    ? [...prev.selectedProjects, project.id]
                                                    : prev.selectedProjects.filter(id => id !== project.id)
                                            }))
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {projectsState.viewMode === 'list' && (
                        <div className="space-y-4">
                            {filteredAndSortedProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ProjectListItem
                                        project={project}
                                        onAction={handleProjectAction}
                                        selected={projectsState.selectedProjects.includes(project.id)}
                                        onSelect={(selected) => {
                                            setProjectsState(prev => ({
                                                ...prev,
                                                selectedProjects: selected
                                                    ? [...prev.selectedProjects, project.id]
                                                    : prev.selectedProjects.filter(id => id !== project.id)
                                            }))
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {filteredAndSortedProjects.length === 0 && (
                        <div className="text-center py-12">
                            <FolderKanban className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No projects found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Try adjusting your filters or create a new project to get started.
                            </p>
                            <Button
                                onClick={() => console.log('Create project')}
                                variant="primary"
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Create New Project
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Real-time status indicator */}
            {projectsState.autoRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                            <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                                Auto-refresh enabled
                            </span>
                            <button
                                onClick={() => setProjectsState(prev => ({ ...prev, autoRefresh: false }))}
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
                                title: 'Project Templates',
                                description: 'Access pre-built project templates and workflows',
                                icon: FileText,
                                gradient: 'from-blue-500 to-cyan-500'
                            },
                            {
                                title: 'Resource Planning',
                                description: 'Advanced resource allocation and capacity planning',
                                icon: Users,
                                gradient: 'from-purple-500 to-pink-500'
                            },
                            {
                                title: 'Project Analytics',
                                description: 'Comprehensive insights and performance metrics',
                                icon: BarChart3,
                                gradient: 'from-green-500 to-emerald-500'
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
}

// Enhanced Project Card Component
function ProjectCard({
    project,
    onAction,
    selected,
    onSelect
}: {
    project: Project
    onAction: (projectId: string, action: string) => void
    selected: boolean
    onSelect: (selected: boolean) => void
}) {
    const statusColors = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        planning: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }

    const priorityColors = {
        critical: 'border-red-500',
        high: 'border-orange-500',
        medium: 'border-yellow-500',
        low: 'border-green-500'
    }

    return (
        <Card className={`p-6 hover:shadow-lg transition-all duration-200 ${selected ? 'ring-2 ring-blue-500' : ''} ${priorityColors[project.priority]} border-l-4`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => onSelect(e.target.checked)}
                        className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {project.description}
                        </p>
                        <div className="flex items-center space-x-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                                {project.status}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {project.category}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onAction(project.id, 'view')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onAction(project.id, 'edit')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onAction(project.id, 'more')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{project.completedTasks}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Tasks Done</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{project.assignedAgents.length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Team Size</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.round((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Days Left</div>
                </div>
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                            {tag}
                        </span>
                    ))}
                    {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            +{project.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Updated {new Date(project.lastUpdated).toLocaleDateString()}</span>
                <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{project.assignedAgents.length}</span>
                </div>
            </div>
        </Card>
    )
}

// Enhanced Project List Item Component
function ProjectListItem({
    project,
    onAction,
    selected,
    onSelect
}: {
    project: Project
    onAction: (projectId: string, action: string) => void
    selected: boolean
    onSelect: (selected: boolean) => void
}) {
    const statusColors = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        planning: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
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

                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {project.description}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                            {project.status}
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {project.completedTasks}/{project.totalTasks} tasks
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        <button
                            onClick={() => onAction(project.id, 'view')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction(project.id, 'edit')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction(project.id, 'more')}
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

