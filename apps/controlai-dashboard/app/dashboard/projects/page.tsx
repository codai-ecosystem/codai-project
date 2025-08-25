'use client'

import React from 'react'
/**
 * Enhanced Projects Management Page - Project Tracking and Coordination Center
 * Comprehensive project management with real-time tracking and AI insights
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    FolderKanban, Plus, Search, Filter, Settings, MoreHorizontal,
    Calendar, Users, Target, TrendingUp, AlertCircle, CheckCircle2,
    Clock, Star, Flag, Zap, Activity, BarChart3, PieChart
} from 'lucide-react'

// Import modular components
import { ProjectHeader } from './components/ProjectHeader'
import { ProjectStats } from './components/ProjectStats'
import { ProjectNavigation } from './components/ProjectNavigation'
import { ProjectGrid } from './components/ProjectGrid'
import { ProjectList } from './components/ProjectList'
import { ProjectKanban } from './components/ProjectKanban'
import { ProjectTimeline } from './components/ProjectTimeline'
import { ProjectAnalytics } from './components/ProjectAnalytics'
import { ProjectFooter } from './components/ProjectFooter'

// Enhanced Types
interface ProjectsState {
    activeView: 'grid' | 'list' | 'kanban' | 'timeline' | 'analytics'
    selectedProjects: string[]
    filters: ProjectFilters
    searchQuery: string
    showCompleted: boolean
    realTimeUpdates: boolean
    sortBy: ProjectSortOption
    sortOrder: 'asc' | 'desc'
}

interface ProjectFilters {
    status: ProjectStatus[]
    priority: ProjectPriority[]
    teams: string[]
    technologies: string[]
    dateRange: DateRange
    budget: { min: number; max: number }
}

interface DateRange {
    start: string | null
    end: string | null
    preset: 'today' | 'week' | 'month' | 'quarter' | 'custom'
}

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'review' | 'completed' | 'cancelled'
type ProjectPriority = 'critical' | 'high' | 'medium' | 'low'
type ProjectSortOption = 'created' | 'updated' | 'deadline' | 'priority' | 'name' | 'budget'

export interface Project {
    id: string
    name: string
    description: string
    status: ProjectStatus
    priority: ProjectPriority
    progress: number
    startDate: string
    endDate: string
    deadline: string
    budget: number
    spent: number
    teamSize: number
    teamMembers: TeamMember[]
    technologies: string[]
    tags: string[]
    tasksTotal: number
    tasksCompleted: number
    lastActivity: string
    manager: string
    client?: string
    repository?: string
    deploymentUrl?: string
}

interface TeamMember {
    id: string
    name: string
    avatar: string
    role: string
}

// Mock data
const mockProjects: Project[] = [
    {
        id: 'project-1',
        name: 'ControlAI Dashboard v2.0',
        description: 'Next-generation AI-powered project management dashboard with real-time analytics',
        status: 'active',
        priority: 'high',
        progress: 75,
        startDate: '2024-12-01',
        endDate: '2025-03-15',
        deadline: '2025-03-15',
        budget: 150000,
        spent: 112500,
        teamSize: 8,
        teamMembers: [
            { id: '1', name: 'Alex Chen', avatar: '/avatars/alex.jpg', role: 'Tech Lead' },
            { id: '2', name: 'Sarah Kim', avatar: '/avatars/sarah.jpg', role: 'Product Manager' },
            { id: '3', name: 'David Rodriguez', avatar: '/avatars/david.jpg', role: 'ML Engineer' }
        ],
        technologies: ['React', 'TypeScript', 'Next.js', 'AI/ML'],
        tags: ['dashboard', 'analytics', 'real-time'],
        tasksTotal: 45,
        tasksCompleted: 34,
        lastActivity: new Date().toISOString(),
        manager: 'Sarah Kim',
        client: 'Internal',
        repository: 'https://github.com/controlai/dashboard-v2',
        deploymentUrl: 'https://dashboard-v2.controlai.com'
    },
    {
        id: 'project-2',
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application for project management on the go',
        status: 'planning',
        priority: 'medium',
        progress: 15,
        startDate: '2025-02-01',
        endDate: '2025-08-30',
        deadline: '2025-08-30',
        budget: 200000,
        spent: 15000,
        teamSize: 6,
        teamMembers: [
            { id: '4', name: 'Emma Wilson', avatar: '/avatars/emma.jpg', role: 'Mobile Lead' },
            { id: '5', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'UI/UX Designer' }
        ],
        technologies: ['React Native', 'Flutter', 'Firebase'],
        tags: ['mobile', 'cross-platform', 'productivity'],
        tasksTotal: 28,
        tasksCompleted: 4,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        manager: 'Emma Wilson',
        client: 'Enterprise Clients',
        repository: 'https://github.com/controlai/mobile-app'
    },
    {
        id: 'project-3',
        name: 'AI Integration Platform',
        description: 'Comprehensive AI service integration platform with ML pipeline automation',
        status: 'active',
        priority: 'critical',
        progress: 60,
        startDate: '2024-10-15',
        endDate: '2025-04-20',
        deadline: '2025-04-20',
        budget: 300000,
        spent: 180000,
        teamSize: 12,
        teamMembers: [
            { id: '6', name: 'James Liu', avatar: '/avatars/james.jpg', role: 'AI Architect' },
            { id: '7', name: 'Maria Garcia', avatar: '/avatars/maria.jpg', role: 'Backend Lead' }
        ],
        technologies: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes'],
        tags: ['ai', 'machine-learning', 'automation'],
        tasksTotal: 62,
        tasksCompleted: 37,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        manager: 'James Liu',
        client: 'AI Solutions Inc.',
        repository: 'https://github.com/controlai/ai-platform'
    }
]

// Mock hooks
const useProjects = () => ({
    projects: mockProjects,
    loading: false,
    error: null,
    createProject: (project: Partial<Project>) => console.log('Creating project:', project),
    updateProject: (id: string, updates: Partial<Project>) => console.log('Updating project:', id, updates),
    deleteProject: (id: string) => console.log('Deleting project:', id),
    bulkUpdate: (projectIds: string[], updates: Partial<Project>) => console.log('Bulk updating projects:', projectIds, updates)
})

export default function ProjectsPage() {
    // Enhanced state management
    const [projectsState, setProjectsState] = useState<ProjectsState>({
        activeView: 'grid',
        selectedProjects: [],
        filters: {
            status: [],
            priority: [],
            teams: [],
            technologies: [],
            dateRange: { start: null, end: null, preset: 'month' },
            budget: { min: 0, max: 1000000 }
        },
        searchQuery: '',
        showCompleted: false,
        realTimeUpdates: true,
        sortBy: 'updated',
        sortOrder: 'desc'
    })

    // Data hooks
    const { projects, loading, error, createProject, updateProject, deleteProject, bulkUpdate } = useProjects()

    // Computed values
    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects.filter(project => {
            // Search filter
            if (projectsState.searchQuery) {
                const query = projectsState.searchQuery.toLowerCase()
                if (!project.name.toLowerCase().includes(query) &&
                    !project.description.toLowerCase().includes(query) &&
                    !project.technologies.some(tech => tech.toLowerCase().includes(query)) &&
                    !project.tags.some(tag => tag.toLowerCase().includes(query))) {
                    return false
                }
            }

            // Status filter
            if (projectsState.filters.status.length > 0 && !projectsState.filters.status.includes(project.status)) {
                return false
            }

            // Priority filter
            if (projectsState.filters.priority.length > 0 && !projectsState.filters.priority.includes(project.priority)) {
                return false
            }

            // Show completed filter
            if (!projectsState.showCompleted && project.status === 'completed') {
                return false
            }

            return true
        })

        // Sort projects
        filtered.sort((a, b) => {
            let aValue, bValue

            switch (projectsState.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case 'priority':
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                    aValue = priorityOrder[a.priority]
                    bValue = priorityOrder[b.priority]
                    break
                case 'deadline':
                    aValue = new Date(a.deadline).getTime()
                    bValue = new Date(b.deadline).getTime()
                    break
                case 'budget':
                    aValue = a.budget
                    bValue = b.budget
                    break
                case 'updated':
                    aValue = new Date(a.lastActivity).getTime()
                    bValue = new Date(b.lastActivity).getTime()
                    break
                default:
                    aValue = a[projectsState.sortBy]
                    bValue = b[projectsState.sortBy]
            }

            if (aValue < bValue) return projectsState.sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return projectsState.sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [projects, projectsState])

    // Project analytics
    const projectAnalytics = useMemo(() => {
        const totalProjects = filteredAndSortedProjects.length
        const activeProjects = filteredAndSortedProjects.filter(p => p.status === 'active').length
        const completedProjects = filteredAndSortedProjects.filter(p => p.status === 'completed').length
        const overdueProjects = filteredAndSortedProjects.filter(p => {
            const now = new Date()
            const deadline = new Date(p.deadline)
            return deadline < now && p.status !== 'completed'
        }).length
        const totalBudget = filteredAndSortedProjects.reduce((sum, p) => sum + p.budget, 0)
        const totalSpent = filteredAndSortedProjects.reduce((sum, p) => sum + p.spent, 0)
        const avgProgress = totalProjects > 0 ? filteredAndSortedProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects : 0
        const totalTasks = filteredAndSortedProjects.reduce((sum, p) => sum + p.tasksTotal, 0)
        const completedTasks = filteredAndSortedProjects.reduce((sum, p) => sum + p.tasksCompleted, 0)

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            overdueProjects,
            totalBudget,
            totalSpent,
            avgProgress,
            totalTasks,
            completedTasks,
            completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
            budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        }
    }, [filteredAndSortedProjects])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-green-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <ProjectHeader
                analytics={projectAnalytics}
                searchQuery={projectsState.searchQuery}
                onSearchChange={(query) => setProjectsState(prev => ({ ...prev, searchQuery: query }))}
                showCompleted={projectsState.showCompleted}
                onShowCompletedChange={(show) => setProjectsState(prev => ({ ...prev, showCompleted: show }))}
                realTimeUpdates={projectsState.realTimeUpdates}
                onRealTimeToggle={(enabled) => setProjectsState(prev => ({ ...prev, realTimeUpdates: enabled }))}
            />

            <ProjectStats analytics={projectAnalytics} />

            <ProjectNavigation
                activeView={projectsState.activeView}
                onViewChange={(view) => setProjectsState(prev => ({ ...prev, activeView: view }))}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    key={projectsState.activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {projectsState.activeView === 'grid' && (
                        <ProjectGrid
                            projects={filteredAndSortedProjects}
                            selectedProjects={projectsState.selectedProjects}
                            onProjectSelect={(projectId, selected) => {
                                setProjectsState(prev => ({
                                    ...prev,
                                    selectedProjects: selected
                                        ? [...prev.selectedProjects, projectId]
                                        : prev.selectedProjects.filter(id => id !== projectId)
                                }))
                            }}
                            onProjectAction={(projectId, action) => {
                                console.log(`Project action: ${action} on ${projectId}`)
                            }}
                        />
                    )}

                    {projectsState.activeView === 'list' && (
                        <ProjectList
                            projects={filteredAndSortedProjects}
                            selectedProjects={projectsState.selectedProjects}
                            onProjectSelect={(projectId, selected) => {
                                setProjectsState(prev => ({
                                    ...prev,
                                    selectedProjects: selected
                                        ? [...prev.selectedProjects, projectId]
                                        : prev.selectedProjects.filter(id => id !== projectId)
                                }))
                            }}
                            onProjectAction={(projectId, action) => {
                                console.log(`Project action: ${action} on ${projectId}`)
                            }}
                        />
                    )}

                    {projectsState.activeView === 'kanban' && (
                        <ProjectKanban
                            projects={filteredAndSortedProjects}
                            onProjectUpdate={(projectId, updates) => updateProject(projectId, updates)}
                        />
                    )}

                    {projectsState.activeView === 'timeline' && (
                        <ProjectTimeline
                            projects={filteredAndSortedProjects}
                            onProjectUpdate={(projectId, updates) => updateProject(projectId, updates)}
                        />
                    )}

                    {projectsState.activeView === 'analytics' && (
                        <ProjectAnalytics
                            projects={filteredAndSortedProjects}
                            analytics={projectAnalytics}
                        />
                    )}
                </motion.div>
            </main>

            <ProjectFooter />

            {/* Real-time updates indicator */}
            {projectsState.realTimeUpdates && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                            <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                                Project updates active
                            </span>
                            <button
                                onClick={() => setProjectsState(prev => ({ ...prev, realTimeUpdates: false }))}
                                className="ml-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

