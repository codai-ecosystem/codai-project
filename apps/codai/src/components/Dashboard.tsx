/**
 * 🎯 Dashboard Component - CODAI
 * Main dashboard interface for project management and AI insights
 */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Activity,
    Plus,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react'

interface Project {
    id: string
    name: string
    description?: string
    status: 'active' | 'paused' | 'completed'
    progress: number
    members: number
    updatedAt: Date
}

interface DashboardProps {
    projects?: Project[]
    onCreateProject?: () => void
    onProjectClick?: (project: Project) => void
}

const Dashboard: React.FC<DashboardProps> = ({
    projects = [],
    onCreateProject,
    onProjectClick
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('all')

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || project.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalMembers: projects.reduce((sum, p) => sum + p.members, 0)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        CODAI Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage your AI-powered development projects
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.completedProjects}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Team Members</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.totalMembers}</p>
                            </div>
                            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Projects Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    {/* Projects Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                            <button
                                onClick={onCreateProject}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Project
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="p-6">
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-12">
                                <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-600 mb-4">
                                    {projects.length === 0
                                        ? "Get started by creating your first project"
                                        : "Try adjusting your search or filter criteria"
                                    }
                                </p>
                                {projects.length === 0 && (
                                    <button
                                        onClick={onCreateProject}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Project
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => onProjectClick?.(project)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <MoreVertical className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>

                                        {project.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-purple-100 text-purple-800'
                                                }`}>
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </span>

                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-1" />
                                                {project.members}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Dashboard
