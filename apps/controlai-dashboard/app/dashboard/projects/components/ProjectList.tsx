import React from 'react'
/**
 * Project List Component - Compact table view
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    MoreHorizontal, Calendar, Users, Target, TrendingUp,
    AlertCircle, CheckCircle2, Clock, Star, Flag, Zap,
    ExternalLink, GitBranch, Play, Pause, Edit, ChevronRight
} from 'lucide-react'
import { Project } from '../page'

interface ProjectListProps {
    projects: Project[]
    selectedProjects: string[]
    onProjectSelect: (projectId: string, selected: boolean) => void
    onProjectAction: (projectId: string, action: string) => void
}

export function ProjectList({
    projects,
    selectedProjects,
    onProjectSelect,
    onProjectAction
}: ProjectListProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'updated',
        direction: 'desc'
    })

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

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        })
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="col-span-1">
                        <input
                            type="checkbox"
                            checked={selectedProjects.length === projects.length}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    projects.forEach(project => onProjectSelect(project.id, true))
                                } else {
                                    projects.forEach(project => onProjectSelect(project.id, false))
                                }
                            }}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="col-span-3">
                        <button
                            onClick={() => handleSort('name')}
                            className="flex items-center hover:text-gray-900 dark:hover:text-white"
                        >
                            Project Name
                            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-90' : ''
                                }`} />
                        </button>
                    </div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">
                        <button
                            onClick={() => handleSort('priority')}
                            className="flex items-center hover:text-gray-900 dark:hover:text-white"
                        >
                            Priority
                        </button>
                    </div>
                    <div className="col-span-1">
                        <button
                            onClick={() => handleSort('progress')}
                            className="flex items-center hover:text-gray-900 dark:hover:text-white"
                        >
                            Progress
                        </button>
                    </div>
                    <div className="col-span-1">Team</div>
                    <div className="col-span-1">
                        <button
                            onClick={() => handleSort('budget')}
                            className="flex items-center hover:text-gray-900 dark:hover:text-white"
                        >
                            Budget
                        </button>
                    </div>
                    <div className="col-span-2">
                        <button
                            onClick={() => handleSort('deadline')}
                            className="flex items-center hover:text-gray-900 dark:hover:text-white"
                        >
                            Deadline
                        </button>
                    </div>
                    <div className="col-span-1">Actions</div>
                </div>
            </div>

            {/* Table body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project, index) => {
                    const daysUntilDeadline = getDaysUntilDeadline(project.deadline)
                    const isSelected = selectedProjects.includes(project.id)

                    return (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <div className="grid grid-cols-12 gap-4 items-center">
                                {/* Checkbox */}
                                <div className="col-span-1">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => onProjectSelect(project.id, e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                </div>

                                {/* Project name */}
                                <div className="col-span-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Priority */}
                                <div className="col-span-1">
                                    <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                                        {project.priority}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="col-span-1">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                            <div
                                                className={`h-2 rounded-full ${project.progress >= 75
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
                                        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[2rem]">
                                            {project.progress}%
                                        </span>
                                    </div>
                                </div>

                                {/* Team */}
                                <div className="col-span-1">
                                    <div className="flex items-center">
                                        <div className="flex -space-x-1">
                                            {project.teamMembers.slice(0, 3).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="w-6 h-6 bg-gradient-to-br from-blue-400 to-green-500 rounded-full border border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
                                                    title={member.name}
                                                >
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            ))}
                                            {project.teamSize > 3 && (
                                                <div className="w-6 h-6 bg-gray-400 rounded-full border border-white dark:border-gray-800 flex items-center justify-center text-white text-xs">
                                                    +{project.teamSize - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="col-span-1">
                                    <div className="text-xs">
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {formatCurrency(project.spent)}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">
                                            of {formatCurrency(project.budget)}
                                        </div>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div className="col-span-2">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                        <div className="text-xs">
                                            <div className="text-gray-900 dark:text-white">
                                                {new Date(project.deadline).toLocaleDateString()}
                                            </div>
                                            <div className={`${daysUntilDeadline < 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : daysUntilDeadline <= 7
                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {daysUntilDeadline > 0
                                                    ? `${daysUntilDeadline}d left`
                                                    : daysUntilDeadline === 0
                                                        ? 'Due today'
                                                        : `${Math.abs(daysUntilDeadline)}d overdue`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1">
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => onProjectAction(project.id, 'edit')}
                                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                            title="Edit project"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {project.repository && (
                                            <button
                                                onClick={() => window.open(project.repository, '_blank')}
                                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                                                title="View repository"
                                            >
                                                <GitBranch className="w-4 h-4" />
                                            </button>
                                        )}
                                        {project.deploymentUrl && (
                                            <button
                                                onClick={() => window.open(project.deploymentUrl, '_blank')}
                                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                                title="View deployment"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Table footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        Showing {projects.length} projects
                        {selectedProjects.length > 0 && (
                            <span className="ml-2">
                                ({selectedProjects.length} selected)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            Previous
                        </button>
                        <button className="px-3 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

