'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    FolderOpen,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Play,
    Pause,
    CheckCircle,
    Users,
    Calendar,
    Code,
    GitBranch,
    ExternalLink,
    Star,
    Download,
    Edit,
    Trash2,
    Share
} from 'lucide-react'

interface Project {
    id: string
    name: string
    description: string
    language: string
    framework?: string
    status: 'active' | 'completed' | 'paused'
    progress: number
    lastModified: string
    collaborators: string[]
    repository?: string
    deploymentUrl?: string
    aiModels: string[]
    codeGenerated: number
    filesCount: number
    linesOfCode: number
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all')
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const fabricaiService = FabricAIService.getInstance()

    useEffect(() => {
        loadProjects()
    }, [])

    useEffect(() => {
        filterProjects()
    }, [projects, searchQuery, statusFilter])

    const loadProjects = async () => {
        try {
            setIsLoading(true)
            const projectsData = await fabricaiService.getProjects()
            setProjects(projectsData)
        } catch (error) {
            console.error('Failed to load projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filterProjects = () => {
        let filtered = projects

        if (searchQuery) {
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.language.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(project => project.status === statusFilter)
        }

        setFilteredProjects(filtered)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Play className="w-4 h-4" />
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            case 'paused':
                return <Pause className="w-4 h-4" />
            default:
                return <FolderOpen className="w-4 h-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500/20 text-emerald-400'
            case 'completed':
                return 'bg-blue-500/20 text-blue-400'
            case 'paused':
                return 'bg-orange-500/20 text-orange-400'
            default:
                return 'bg-slate-500/20 text-slate-400'
        }
    }

    const ProjectCard = ({ project }: { project: Project }) => (
        <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
        >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                            {project.name}
                        </h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            <span className="capitalize">{project.status}</span>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{project.description}</p>

                    {/* Tech Stack */}
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                            <Code className="w-4 h-4" />
                            <span>{project.language}</span>
                        </span>
                        {project.framework && (
                            <span className="flex items-center space-x-1">
                                <GitBranch className="w-4 h-4" />
                                <span>{project.framework}</span>
                            </span>
                        )}
                        <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{project.collaborators.length}</span>
                        </span>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>

                    <AnimatePresence>
                        {selectedProject === project.id && (
                            <motion.div
                                className="absolute right-0 top-full mt-2 w-48 bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/20 py-2 z-10"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Project</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                    <Share className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </button>
                                <hr className="border-white/20 my-2" />
                                <button className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-2">
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Progress</span>
                    <span className="text-white text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <motion.div
                        className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-purple-400">{project.filesCount}</div>
                    <div className="text-xs text-slate-400">Files</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-emerald-400">{project.linesOfCode.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">Lines</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-blue-400">{project.aiModels.length}</div>
                    <div className="text-xs text-slate-400">AI Models</div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-slate-400 text-sm flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{project.lastModified}</span>
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    {project.repository && (
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <GitBranch className="w-4 h-4 text-slate-400 hover:text-white" />
                        </button>
                    )}
                    {project.deploymentUrl && (
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
                        </button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <Star className="w-4 h-4 text-slate-400 hover:text-yellow-400" />
                    </button>
                </div>
            </div>
        </motion.div>
    )

    if (isLoading) {
        return (
            <FabricAILayout>
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="flex items-center space-x-3 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-lg font-medium">Loading Projects...</span>
                    </motion.div>
                </div>
            </FabricAILayout>
        )
    }

    return (
        <FabricAILayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                        <p className="text-slate-300">Manage your AI development projects</p>
                    </div>

                    <motion.button
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Project</span>
                    </motion.button>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Total Projects</p>
                                <p className="text-2xl font-bold text-white">{projects.length}</p>
                            </div>
                            <FolderOpen className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Active</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {projects.filter(p => p.status === 'active').length}
                                </p>
                            </div>
                            <Play className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {projects.filter(p => p.status === 'completed').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Avg Progress</p>
                                <p className="text-2xl font-bold text-purple-400">
                                    {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="paused">Paused</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-slate-400 text-sm">
                        Showing {filteredProjects.length} of {projects.length} projects
                    </div>
                </motion.div>

                {/* Projects Grid */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <AnimatePresence>
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ProjectCard project={project} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FolderOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold text-lg mb-2">No projects found</h3>
                        <p className="text-slate-400 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by creating your first AI project'
                            }
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Your First Project
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </div>
        </FabricAILayout>
    )
}
