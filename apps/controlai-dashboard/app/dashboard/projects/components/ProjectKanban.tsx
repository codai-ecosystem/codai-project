'use client'

import React from 'react'
/**
 * Project Kanban Component - Status-based board view
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, MoreHorizontal, Calendar, Users, Target, AlertCircle,
    CheckCircle2, Clock, Star, Flag, Zap, ExternalLink, GitBranch
} from 'lucide-react'
import { Project } from '../page'

interface ProjectKanbanProps {
    projects: Project[]
    onProjectUpdate: (projectId: string, updates: Partial<Project>) => void
}

export function ProjectKanban({ projects, onProjectUpdate }: ProjectKanbanProps) {
    const [draggedProject, setDraggedProject] = useState<string | null>(null)

    const statusColumns = [
        {
            id: 'planning',
            title: 'Planning',
            color: 'bg-blue-500',
            description: 'Projects in planning phase'
        },
        {
            id: 'active',
            title: 'Active',
            color: 'bg-green-500',
            description: 'Currently in development'
        },
        {
            id: 'review',
            title: 'Review',
            color: 'bg-purple-500',
            description: 'Under review or testing'
        },
        {
            id: 'on_hold',
            title: 'On Hold',
            color: 'bg-yellow-500',
            description: 'Temporarily paused'
        },
        {
            id: 'completed',
            title: 'Completed',
            color: 'bg-gray-500',
            description: 'Successfully completed'
        }
    ]

    const getProjectsByStatus = (status: string) => {
        return projects.filter(project => project.status === status)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'border-l-red-500'
            case 'high': return 'border-l-orange-500'
            case 'medium': return 'border-l-yellow-500'
            case 'low': return 'border-l-green-500'
            default: return 'border-l-gray-500'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getDaysUntilDeadline = (deadline: string) => {
        const today = new Date()
        const deadlineDate = new Date(deadline)
        const diffTime = deadlineDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const handleDragStart = (projectId: string) => {
        setDraggedProject(projectId)
    }

    const handleDragEnd = () => {
        setDraggedProject(null)
    }

    const handleDrop = (status: string) => {
        if (draggedProject) {
            onProjectUpdate(draggedProject, { status: status as any })
            setDraggedProject(null)
        }
    }

    return (
        <div className="flex space-x-6 overflow-x-auto pb-6">
            {statusColumns.map((column) => {
                const columnProjects = getProjectsByStatus(column.id)

                return (
                    <motion.div
                        key={column.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 w-80"
                    >
                        {/* Column header */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${column.color} mr-3`}></div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {column.title}
                                    </h3>
                                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm px-2 py-0.5 rounded-full">
                                        {columnProjects.length}
                                    </span>
                                </div>
                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {column.description}
                            </p>
                        </div>

                        {/* Drop zone */}
                        <div
                            className={`min-h-[600px] bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed transition-colors ${draggedProject
                                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                handleDrop(column.id)
                            }}
                        >
                            <AnimatePresence>
                                {columnProjects.map((project, index) => {
                                    const daysUntilDeadline = getDaysUntilDeadline(project.deadline)

                                    return (
                                        <motion.div
                                            key={project.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            draggable
                                            onDragStart={() => handleDragStart(project.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`bg-white dark:bg-gray-700 rounded-lg p-4 mb-3 shadow-sm border-l-4 cursor-move hover:shadow-md transition-shadow ${getPriorityColor(project.priority)} ${draggedProject === project.id ? 'opacity-50' : ''
                                                }`}
                                        >
                                            {/* Project header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2">
                                                    {project.name}
                                                </h4>
                                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded flex-shrink-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Project description */}
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {project.description}
                                            </p>

                                            {/* Priority indicator */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    {project.priority === 'critical' && <Flag className="w-4 h-4 text-red-500 mr-1" />}
                                                    {project.priority === 'high' && <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />}
                                                    {project.priority === 'medium' && <Star className="w-4 h-4 text-yellow-500 mr-1" />}
                                                    {project.priority === 'low' && <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />}
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                                                        {project.priority}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    {project.repository && (
                                                        <button
                                                            onClick={() => window.open(project.repository, '_blank')}
                                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                                                        >
                                                            <GitBranch className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    {project.deploymentUrl && (
                                                        <button
                                                            onClick={() => window.open(project.deploymentUrl, '_blank')}
                                                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                                                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                        {project.progress}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${project.progress >= 75
                                                                ? 'bg-green-500'
                                                                : project.progress >= 50
                                                                    ? 'bg-blue-500'
                                                                    : project.progress >= 25
                                                                        ? 'bg-yellow-500'
                                                                        : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Tasks and team info */}
                                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                                <div className="text-center bg-gray-50 dark:bg-gray-600 rounded p-2">
                                                    <div className="text-gray-500 dark:text-gray-400">Tasks</div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {project.tasksCompleted}/{project.tasksTotal}
                                                    </div>
                                                </div>
                                                <div className="text-center bg-gray-50 dark:bg-gray-600 rounded p-2">
                                                    <div className="text-gray-500 dark:text-gray-400">Budget</div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {Math.round((project.spent / project.budget) * 100)}%
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Team members */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex -space-x-2">
                                                    {project.teamMembers.slice(0, 3).map((member) => (
                                                        <div
                                                            key={member.id}
                                                            className="w-6 h-6 bg-gradient-to-br from-blue-400 to-green-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-white text-xs font-medium"
                                                            title={member.name}
                                                        >
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                    ))}
                                                    {project.teamSize > 3 && (
                                                        <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-white text-xs font-medium">
                                                            +{project.teamSize - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {project.teamSize} members
                                                </span>
                                            </div>

                                            {/* Technologies */}
                                            <div className="mb-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {project.technologies.slice(0, 2).map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.technologies.length > 2 && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                            +{project.technologies.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Deadline */}
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    <span>
                                                        {new Date(project.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className={`font-medium ${daysUntilDeadline < 0
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : daysUntilDeadline <= 7
                                                            ? 'text-yellow-600 dark:text-yellow-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {daysUntilDeadline > 0
                                                        ? `${daysUntilDeadline}d`
                                                        : daysUntilDeadline === 0
                                                            ? 'Today'
                                                            : `${Math.abs(daysUntilDeadline)}d overdue`
                                                    }
                                                </span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>

                            {/* Empty state */}
                            {columnProjects.length === 0 && (
                                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No projects in {column.title.toLowerCase()}</p>
                                    <button className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                        Add project
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}


