import React, { useState } from 'react'
import { Clock, User, Flag, CheckCircle, Circle, PlayCircle, Pause } from 'lucide-react'
import { DashboardData, Task } from '../hooks/useControlAIApi'

interface TaskBoardProps {
    data?: DashboardData
}

const TaskBoard: React.FC<TaskBoardProps> = ({ data }) => {
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterPriority, setFilterPriority] = useState<string>('all')

    if (!data) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    const { tasks } = data

    const filteredTasks = tasks.filter(task => {
        const statusMatch = filterStatus === 'all' || task.status === filterStatus
        const priorityMatch = filterPriority === 'all' || task.priority === filterPriority
        return statusMatch && priorityMatch
    })

    const tasksByStatus = {
        todo: filteredTasks.filter(task => task.status === 'todo'),
        in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
        review: filteredTasks.filter(task => task.status === 'review'),
        completed: filteredTasks.filter(task => task.status === 'completed')
    }

    const getStatusIcon = (status: Task['status']) => {
        switch (status) {
            case 'todo':
                return <Circle className="h-4 w-4" />
            case 'in_progress':
                return <PlayCircle className="h-4 w-4" />
            case 'review':
                return <Pause className="h-4 w-4" />
            case 'completed':
                return <CheckCircle className="h-4 w-4" />
            default:
                return <Circle className="h-4 w-4" />
        }
    }

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    const getColumnColor = (status: string) => {
        switch (status) {
            case 'todo':
                return 'border-gray-300 dark:border-gray-600'
            case 'in_progress':
                return 'border-blue-300 dark:border-blue-600'
            case 'review':
                return 'border-yellow-300 dark:border-yellow-600'
            case 'completed':
                return 'border-green-300 dark:border-green-600'
            default:
                return 'border-gray-300 dark:border-gray-600'
        }
    }

    const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {task.title}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
            </div>

            <div className="space-y-2">
                {task.assignedAgent && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        {task.assignedAgent}
                    </div>
                )}

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {task.estimatedHours}h estimated
                    {task.actualHours && ` (${task.actualHours}h actual)`}
                </div>

                {task.dueDate && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Flag className="h-4 w-4 mr-2" />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    )

    const statusLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        review: 'Review',
        completed: 'Completed'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Task Board
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track task progress across the team
                    </p>
                </div>

                <div className="flex space-x-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        <option value="all">All Priority</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Task Board Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                    <div key={status} className={`border-2 rounded-lg p-4 ${getColumnColor(status)}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {getStatusIcon(status as Task['status'])}
                                <h3 className="ml-2 font-medium text-gray-900 dark:text-white">
                                    {statusLabels[status as keyof typeof statusLabels]}
                                </h3>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded-full">
                                {statusTasks.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {statusTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}

                            {statusTasks.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Task Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                        <div key={status} className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statusTasks.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {statusLabels[status as keyof typeof statusLabels]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TaskBoard
