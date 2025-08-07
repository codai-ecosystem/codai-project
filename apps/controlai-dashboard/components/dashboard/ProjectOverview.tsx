'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  MoreHorizontal
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  dueDate?: string
  assignedAgents: string[]
  tasks: {
    total: number
    completed: number
    inProgress: number
    pending: number
  }
}

interface ProjectOverviewProps {
  projects?: Project[]
  data?: any
  loading?: boolean
  maxItems?: number
  showCreateButton?: boolean
  className?: string
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI Integration Platform',
    description: 'Building comprehensive AI service integration',
    status: 'active',
    priority: 'high',
    progress: 75,
    dueDate: '2024-02-15',
    assignedAgents: ['Agent-001', 'Agent-002', 'Agent-003'],
    tasks: { total: 24, completed: 18, inProgress: 4, pending: 2 }
  },
  {
    id: '2',
    name: 'Data Pipeline Optimization',
    description: 'Improving data processing efficiency',
    status: 'active',
    priority: 'medium',
    progress: 45,
    dueDate: '2024-02-28',
    assignedAgents: ['Agent-004', 'Agent-005'],
    tasks: { total: 16, completed: 7, inProgress: 6, pending: 3 }
  },
  {
    id: '3',
    name: 'Security Enhancement',
    description: 'Implementing advanced security measures',
    status: 'active',
    priority: 'critical',
    progress: 30,
    dueDate: '2024-02-10',
    assignedAgents: ['Agent-006'],
    tasks: { total: 12, completed: 4, inProgress: 3, pending: 5 }
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    case 'archived': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
    case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
    case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
  }
}

export function ProjectOverview({
  projects = mockProjects,
  data,
  loading = false,
  maxItems,
  showCreateButton = true,
  className = ''
}: ProjectOverviewProps) {
  // Use data if provided, otherwise use projects prop or mock data
  const displayProjects = data?.projects || projects || mockProjects
  const limitedProjects = maxItems ? displayProjects.slice(0, maxItems) : displayProjects

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FolderKanban className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Project Overview
          </h2>
        </div>
        {showCreateButton && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {limitedProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Project Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                </div>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>

              {/* Task Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.tasks.completed}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.tasks.total}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Tasks
                  </div>
                </div>
              </div>

              {/* Due Date */}
              {project.dueDate && (
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Assigned Agents */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {project.assignedAgents.length} agents
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {project.assignedAgents.slice(0, 3).map((agent, agentIndex) => (
                    <div
                      key={agent}
                      className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-medium">
                        {agentIndex + 1}
                      </span>
                    </div>
                  ))}
                  {project.assignedAgents.length > 3 && (
                    <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        +{project.assignedAgents.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayProjects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayProjects.reduce((sum, p) => sum + p.tasks.total, 0)}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayProjects.reduce((sum, p) => sum + p.tasks.completed, 0)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayProjects.filter(p => p.priority === 'high' || p.priority === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
