'use client'

import React from 'react'
/**
 * Project Grid Component - Card-based project display
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    MoreHorizontal, Calendar, Users, Target, TrendingUp,
    AlertCircle, CheckCircle2, Clock, Star, Flag, Zap,
    ExternalLink, GitBranch, Play, Pause, Archive, Edit
} from 'lucide-react'
import { Project } from '../page'

interface ProjectGridProps {
    projects: Project[]
    selectedProjects: string[]
    onProjectSelect: (projectId: string, selected: boolean) => void
    onProjectAction: (projectId: string, action: string) => void
}

export function ProjectGrid({
    projects,
    selectedProjects,
    onProjectSelect,
    onProjectAction
}: ProjectGridProps) {
    const [hoveredProject, setHoveredProject] = useState<string | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return Flag
            case 'high': return AlertCircle
            case 'medium': return Star
            case 'low': return CheckCircle2
            default: return CheckCircle2
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

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-500 dark:text-gray-400"
                >
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                    <p className="text-sm">Try adjusting your filters or create a new project.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => {
                const PriorityIcon = getPriorityIcon(project.priority)
                const daysUntilDeadline = getDaysUntilDeadline(project.deadline)
                const isSelected = selectedProjects.includes(project.id)
                const isHovered = hoveredProject === project.id

                return (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onHoverStart={() => setHoveredProject(project.id)}
                        onHoverEnd={() => setHoveredProject(null)}
                        className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:scale-105 ${isSelected
                                ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        {/* Selection checkbox */}
                        <div className="absolute top-4 left-4 z-10">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onProjectSelect(project.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                        </div>

                        {/* More actions */}
                        <div className="absolute top-4 right-4 z-10">
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 pr-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {project.description}
                                    </p>
                                </div>
                            </div>

                            {/* Status and Priority */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                                <div className="flex items-center">
                                    <PriorityIcon className={`w-4 h-4 ${getPriorityColor(project.priority)}`} />
                                    <span className={`ml-1 text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                        {project.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {project.progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${project.progress}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                        className={`h-2 rounded-full ${project.progress >= 75
                                                ? 'bg-green-500'
                                                : project.progress >= 50
                                                    ? 'bg-blue-500'
                                                    : project.progress >= 25
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Key metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {project.tasksCompleted}/{project.tasksTotal}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Team</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {project.teamSize} members
                                    </div>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Budget</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full ${(project.spent / project.budget) * 100 > 85
                                                ? 'bg-red-500'
                                                : (project.spent / project.budget) * 100 > 70
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Team members */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Team</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {project.manager}
                                    </span>
                                </div>
                                <div className="flex -space-x-2">
                                    {project.teamMembers.slice(0, 4).map((member) => (
                                        <div
                                            key={member.id}
                                            className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
                                            title={member.name}
                                        >
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    ))}
                                    {project.teamSize > 4 && (
                                        <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium">
                                            +{project.teamSize - 4}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Technologies */}
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-1">
                                    {project.technologies.slice(0, 3).map((tech) => (
                                        <span
                                            key={tech}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technologies.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            +{project.technologies.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Deadline */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>
                                        {daysUntilDeadline > 0
                                            ? `${daysUntilDeadline} days left`
                                            : daysUntilDeadline === 0
                                                ? 'Due today'
                                                : `${Math.abs(daysUntilDeadline)} days overdue`
                                        }
                                    </span>
                                </div>
                                {daysUntilDeadline < 0 && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                            </div>

                            {/* Action buttons - visible on hover */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-2">
                                    {project.deploymentUrl && (
                                        <button
                                            onClick={() => window.open(project.deploymentUrl, '_blank')}
                                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="View deployment"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    )}
                                    {project.repository && (
                                        <button
                                            onClick={() => window.open(project.repository, '_blank')}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="View repository"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onProjectAction(project.id, 'edit')}
                                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Edit project"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {project.status === 'active' ? (
                                        <button
                                            onClick={() => onProjectAction(project.id, 'pause')}
                                            className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="Pause project"
                                        >
                                            <Pause className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onProjectAction(project.id, 'resume')}
                                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="Resume project"
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}


