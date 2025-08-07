'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  Plus
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  dueDate?: string
  tags: string[]
}

interface TaskBoardProps {
  tasks?: Task[]
  data?: any
  loading?: boolean
  compact?: boolean
  maxItemsPerColumn?: number
  className?: string
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'API Integration',
    description: 'Integrate external AI service APIs',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'Agent-001',
    dueDate: '2024-02-10',
    tags: ['backend', 'api']
  },
  {
    id: '2',
    title: 'UI Components',
    description: 'Build reusable dashboard components',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'Agent-002',
    dueDate: '2024-02-08',
    tags: ['frontend', 'ui']
  },
  {
    id: '3',
    title: 'Database Migration',
    description: 'Migrate legacy data to new schema',
    status: 'pending',
    priority: 'critical',
    assignedTo: 'Agent-003',
    dueDate: '2024-02-12',
    tags: ['database', 'migration']
  },
  {
    id: '4',
    title: 'Security Audit',
    description: 'Comprehensive security review',
    status: 'blocked',
    priority: 'high',
    assignedTo: 'Agent-004',
    dueDate: '2024-02-15',
    tags: ['security', 'audit']
  }
]

const statusColumns = [
  { id: 'pending', title: 'Pending', color: 'gray' },
  { id: 'in-progress', title: 'In Progress', color: 'blue' },
  { id: 'completed', title: 'Completed', color: 'green' },
  { id: 'blocked', title: 'Blocked', color: 'red' }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    case 'blocked': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'border-red-500'
    case 'high': return 'border-orange-500'
    case 'medium': return 'border-yellow-500'
    case 'low': return 'border-green-500'
    default: return 'border-gray-300 dark:border-gray-600'
  }
}

export function TaskBoard({
  tasks = mockTasks,
  data,
  loading = false,
  compact = false,
  maxItemsPerColumn,
  className = ''
}: TaskBoardProps) {
  // Use data if provided, otherwise use tasks prop or mock data
  const displayTasks = data?.tasks || tasks || mockTasks

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-100 dark:bg-gray-700 rounded mb-2"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  const getTasksByStatus = (status: string) => {
    const filteredTasks = displayTasks.filter(task => task.status === status)
    return maxItemsPerColumn ? filteredTasks.slice(0, maxItemsPerColumn) : filteredTasks
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
          <CheckSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Task Board
          </h2>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div
            key={column.id}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 min-h-96"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-${column.color}-500`}></div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm 
                    border-l-4 ${getPriorityColor(task.priority)}
                    hover:shadow-md transition-shadow cursor-pointer
                  `}
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {task.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {task.description}
                  </p>

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Task Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {task.assignedTo && (
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Add Task Button */}
              <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                <Plus className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const count = getTasksByStatus(column.id).length
          const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0

          return (
            <div
              key={column.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{column.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}% of total</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-${column.color}-100 dark:bg-${column.color}-900/20 flex items-center justify-center`}>
                  {column.id === 'pending' && <Clock className={`w-6 h-6 text-${column.color}-600`} />}
                  {column.id === 'in-progress' && <CheckSquare className={`w-6 h-6 text-${column.color}-600`} />}
                  {column.id === 'completed' && <CheckSquare className={`w-6 h-6 text-${column.color}-600`} />}
                  {column.id === 'blocked' && <AlertCircle className={`w-6 h-6 text-${column.color}-600`} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
