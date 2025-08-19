/**
 * 🎯 ProjectManager Component - CODAI
 * Advanced project management interface with AI insights
 */
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings,
    Users,
    Calendar,
    Target,
    CheckSquare,
    AlertCircle,
    TrendingUp,
    Clock,
    MoreHorizontal,
    Plus,
    Edit3,
    Trash2,
    Archive
} from 'lucide-react'

interface Task {
    id: string
    title: string
    description?: string
    status: 'todo' | 'in-progress' | 'review' | 'completed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    assignedTo?: string
    dueDate?: Date
    completedAt?: Date
}

interface Project {
    id: string
    name: string
    description?: string
    status: 'planning' | 'active' | 'paused' | 'completed' | 'archived'
    progress: number
    tasks: Task[]
    team: string[]
    startDate: Date
    dueDate?: Date
    budget?: number
    spent?: number
}

interface ProjectManagerProps {
    project: Project
    onUpdateProject?: (project: Project) => void
    onDeleteProject?: (projectId: string) => void
    onCreateTask?: (task: Omit<Task, 'id'>) => void
    onUpdateTask?: (task: Task) => void
    onDeleteTask?: (taskId: string) => void
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
    project,
    onUpdateProject,
    onDeleteProject,
    onCreateTask,
    onUpdateTask,
    onDeleteTask
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'settings'>('overview')
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium'
    })

    const taskStats = {
        total: project.tasks.length,
        completed: project.tasks.filter(t => t.status === 'completed').length,
        inProgress: project.tasks.filter(t => t.status === 'in-progress').length,
        overdue: project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    }

    const handleCreateTask = () => {
        if (newTask.title.trim()) {
            onCreateTask?.(newTask)
            setNewTask({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium'
            })
            setShowTaskForm(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo': return 'bg-gray-100 text-gray-800'
            case 'in-progress': return 'bg-blue-100 text-blue-800'
            case 'review': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Project Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
                            {project.description && (
                                <p className="text-gray-600 mb-4">{project.description}</p>
                            )}

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                            project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                                                project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                    project.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                        }`}>
                                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-4 w-4 mr-1" />
                                    {project.team.length} members
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                    <CheckSquare className="h-4 w-4 mr-1" />
                                    {taskStats.completed}/{taskStats.total} tasks
                                </div>

                                {taskStats.overdue > 0 && (
                                    <div className="flex items-center text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {taskStats.overdue} overdue
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit3 className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Overall Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'overview', label: 'Overview', icon: TrendingUp },
                                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                                { id: 'team', label: 'Team', icon: Users },
                                { id: 'settings', label: 'Settings', icon: Settings }
                            ].map(tab => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                                    <p className="text-xl font-bold text-gray-900">{taskStats.total}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                    <CheckSquare className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                                    <p className="text-xl font-bold text-gray-900">{taskStats.completed}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                                    <Clock className="h-4 w-4 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                                    <p className="text-xl font-bold text-gray-900">{taskStats.inProgress}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-red-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                                                    <p className="text-xl font-bold text-gray-900">{taskStats.overdue}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Tasks */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
                                        <div className="space-y-3">
                                            {project.tasks.slice(0, 5).map(task => (
                                                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                                                task.status === 'in-progress' ? 'bg-blue-500' :
                                                                    'bg-gray-400'
                                                            }`} />
                                                        <span className="font-medium text-gray-900">{task.title}</span>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                        {task.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'tasks' && (
                                <motion.div
                                    key="tasks"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Tasks Header */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                                        <button
                                            onClick={() => setShowTaskForm(true)}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Task
                                        </button>
                                    </div>

                                    {/* Task Form */}
                                    {showTaskForm && (
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Task title"
                                                value={newTask.title}
                                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <textarea
                                                placeholder="Task description (optional)"
                                                value={newTask.description}
                                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                rows={3}
                                            />
                                            <div className="flex items-center space-x-4">
                                                <select
                                                    value={newTask.priority}
                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                >
                                                    <option value="low">Low Priority</option>
                                                    <option value="medium">Medium Priority</option>
                                                    <option value="high">High Priority</option>
                                                    <option value="critical">Critical Priority</option>
                                                </select>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleCreateTask}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        Create Task
                                                    </button>
                                                    <button
                                                        onClick={() => setShowTaskForm(false)}
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tasks List */}
                                    <div className="space-y-3">
                                        {project.tasks.map(task => (
                                            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                                        )}
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                                {task.status.replace('-', ' ')}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className="text-xs text-gray-500">
                                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button className="p-1 hover:bg-gray-100 rounded">
                                                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'team' && (
                                <motion.div
                                    key="team"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                                        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Member
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {project.team.map((member, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-indigo-600">
                                                            {member.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{member}</h4>
                                                        <p className="text-sm text-gray-600">Team Member</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                                            <input
                                                type="text"
                                                value={project.name}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <textarea
                                                value={project.description || ''}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                            <select
                                                value={project.status}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="planning">Planning</option>
                                                <option value="active">Active</option>
                                                <option value="paused">Paused</option>
                                                <option value="completed">Completed</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-900 mb-4">Danger Zone</h4>
                                            <div className="space-y-2">
                                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Archive className="h-4 w-4 mr-2" />
                                                    Archive Project
                                                </button>
                                                <button
                                                    onClick={() => onDeleteProject?.(project.id)}
                                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors ml-2"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Project
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectManager
