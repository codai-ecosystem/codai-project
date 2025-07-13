'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FolderTree,
    Plus,
    GitBranch,
    Play,
    Pause,
    Settings,
    Eye,
    Code,
    Terminal,
    Cloud,
    Activity,
    CheckCircle,
    AlertTriangle,
    Clock,
    Users,
    Star,
    Download,
    Upload,
    RefreshCw,
    Trash2,
    Edit3,
    ExternalLink,
    FileText,
    Folder,
    ChevronRight,
    ChevronDown,
    Search,
    Filter,
    MoreHorizontal,
    Archive
} from 'lucide-react'

interface ProjectFile {
    id: string
    name: string
    type: 'file' | 'folder'
    path: string
    size?: number
    lastModified: Date
    language?: string
    children?: ProjectFile[]
}

interface ProjectStats {
    totalFiles: number
    totalLines: number
    lastCommit: Date
    deploymentStatus: 'deployed' | 'building' | 'failed' | 'pending'
    buildTime: number
    tests: {
        total: number
        passed: number
        failed: number
    }
    collaborators: number
}

interface Project {
    id: string
    name: string
    description: string
    status: 'active' | 'building' | 'deployed' | 'error' | 'paused'
    language: string
    framework: string
    createdAt: Date
    lastActivity: Date
    stats: ProjectStats
    files: ProjectFile[]
    repository?: {
        url: string
        branch: string
        commits: number
    }
    deployment?: {
        url: string
        status: 'live' | 'building' | 'failed'
        lastDeploy: Date
    }
}

const ProjectDashboard = () => {
    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            name: 'E-commerce Platform',
            description: 'Modern React-based e-commerce solution with AI recommendations',
            status: 'building',
            language: 'TypeScript',
            framework: 'Next.js 14',
            createdAt: new Date('2025-01-05'),
            lastActivity: new Date(),
            stats: {
                totalFiles: 127,
                totalLines: 15420,
                lastCommit: new Date(Date.now() - 3600000),
                deploymentStatus: 'building',
                buildTime: 45000,
                tests: { total: 89, passed: 86, failed: 3 },
                collaborators: 3
            },
            files: [
                {
                    id: '1',
                    name: 'src',
                    type: 'folder',
                    path: '/src',
                    lastModified: new Date(),
                    children: [
                        {
                            id: '2',
                            name: 'components',
                            type: 'folder',
                            path: '/src/components',
                            lastModified: new Date(),
                            children: [
                                {
                                    id: '3',
                                    name: 'ProductCard.tsx',
                                    type: 'file',
                                    path: '/src/components/ProductCard.tsx',
                                    size: 2340,
                                    lastModified: new Date(),
                                    language: 'typescript'
                                }
                            ]
                        }
                    ]
                }
            ],
            repository: {
                url: 'https://github.com/codai-ecosystem/ecommerce-platform',
                branch: 'main',
                commits: 127
            },
            deployment: {
                url: 'https://ecommerce-platform.vercel.app',
                status: 'building',
                lastDeploy: new Date(Date.now() - 1800000)
            }
        },
        {
            id: '2',
            name: 'AI Chat Bot',
            description: 'Intelligent customer service chatbot with NLP capabilities',
            status: 'deployed',
            language: 'TypeScript',
            framework: 'Next.js 14',
            createdAt: new Date('2025-01-01'),
            lastActivity: new Date(Date.now() - 7200000),
            stats: {
                totalFiles: 89,
                totalLines: 12300,
                lastCommit: new Date(Date.now() - 7200000),
                deploymentStatus: 'deployed',
                buildTime: 32000,
                tests: { total: 67, passed: 67, failed: 0 },
                collaborators: 2
            },
            files: [],
            repository: {
                url: 'https://github.com/codai-ecosystem/ai-chatbot',
                branch: 'main',
                commits: 89
            },
            deployment: {
                url: 'https://ai-chatbot.vercel.app',
                status: 'live',
                lastDeploy: new Date(Date.now() - 7200000)
            }
        },
        {
            id: '3',
            name: 'Dashboard Analytics',
            description: 'Real-time analytics dashboard with AI insights',
            status: 'active',
            language: 'TypeScript',
            framework: 'React + Vite',
            createdAt: new Date('2025-01-08'),
            lastActivity: new Date(Date.now() - 1800000),
            stats: {
                totalFiles: 45,
                totalLines: 6780,
                lastCommit: new Date(Date.now() - 1800000),
                deploymentStatus: 'pending',
                buildTime: 0,
                tests: { total: 23, passed: 20, failed: 3 },
                collaborators: 1
            },
            files: [],
            repository: {
                url: 'https://github.com/codai-ecosystem/dashboard-analytics',
                branch: 'develop',
                commits: 34
            }
        }
    ])

    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'building': return 'bg-blue-500'
            case 'deployed': return 'bg-green-500'
            case 'error': return 'bg-red-500'
            case 'paused': return 'bg-yellow-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusIcon = (status: Project['status']) => {
        switch (status) {
            case 'building': return <RefreshCw className="w-4 h-4 animate-spin" />
            case 'deployed': return <CheckCircle className="w-4 h-4" />
            case 'error': return <AlertTriangle className="w-4 h-4" />
            case 'paused': return <Pause className="w-4 h-4" />
            default: return <Activity className="w-4 h-4" />
        }
    }

    const getDeploymentStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'text-green-400 bg-green-500/20'
            case 'building': return 'text-blue-400 bg-blue-500/20'
            case 'failed': return 'text-red-400 bg-red-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId)
        } else {
            newExpanded.add(folderId)
        }
        setExpandedFolders(newExpanded)
    }

    const renderFileTree = (files: ProjectFile[], level = 0) => {
        return files.map(file => (
            <div key={file.id} style={{ marginLeft: `${level * 20}px` }}>
                <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group">
                    <div className="flex items-center space-x-2">
                        {file.type === 'folder' ? (
                            <button
                                onClick={() => toggleFolder(file.id)}
                                className="flex items-center space-x-1"
                            >
                                {expandedFolders.has(file.id) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                <Folder className="w-4 h-4 text-blue-400" />
                            </button>
                        ) : (
                            <FileText className="w-4 h-4 text-gray-400 ml-5" />
                        )}
                        <span className="text-white text-sm">{file.name}</span>
                        {file.language && (
                            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                                {file.language}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.size && (
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                        )}
                        <button className="p-1 hover:bg-white/10 rounded">
                            <Edit3 className="w-3 h-3 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded">
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </button>
                    </div>
                </div>

                {file.type === 'folder' && expandedFolders.has(file.id) && file.children && (
                    <div>
                        {renderFileTree(file.children, level + 1)}
                    </div>
                )}
            </div>
        ))
    }

    const createNewProject = async () => {
        const name = prompt('Project name:')
        const description = prompt('Project description:')
        const framework = prompt('Framework (Next.js, React, Vue, etc.):') || 'Next.js'

        if (name && description) {
            try {
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, framework })
                })

                if (response.ok) {
                    const data = await response.json()
                    // Refresh projects list
                    window.location.reload()
                } else {
                    alert('Failed to create project')
                }
            } catch (error) {
                console.error('Error creating project:', error)
                alert('Error creating project')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto max-w-7xl px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Project Dashboard
                        </h1>
                        <p className="text-gray-300 mt-2">Manage and monitor your AI-powered development projects</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-black/20 rounded-lg p-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FolderTree className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={createNewProject}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Project</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center justify-between mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="building">Building</option>
                            <option value="deployed">Deployed</option>
                            <option value="error">Error</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{filteredProjects.length} projects</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{projects.filter(p => p.status === 'active').length} active</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{projects.filter(p => p.status === 'deployed').length} deployed</span>
                    </div>
                </div>

                {/* Projects Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                            >
                                {/* Project Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 ${getStatusColor(project.status)} rounded-lg flex items-center justify-center`}>
                                            {getStatusIcon(project.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                                            <p className="text-sm text-gray-400">{project.framework}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <Settings className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Project Description */}
                                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

                                {/* Project Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="text-center p-2 bg-black/20 rounded-lg">
                                        <div className="text-lg font-bold text-blue-400">{project.stats.totalFiles}</div>
                                        <div className="text-xs text-gray-400">Files</div>
                                    </div>
                                    <div className="text-center p-2 bg-black/20 rounded-lg">
                                        <div className="text-lg font-bold text-green-400">{project.stats.totalLines.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">Lines</div>
                                    </div>
                                    <div className="text-center p-2 bg-black/20 rounded-lg">
                                        <div className="text-lg font-bold text-purple-400">{project.stats.tests.passed}/{project.stats.tests.total}</div>
                                        <div className="text-xs text-gray-400">Tests</div>
                                    </div>
                                    <div className="text-center p-2 bg-black/20 rounded-lg">
                                        <div className="text-lg font-bold text-yellow-400">{project.stats.collaborators}</div>
                                        <div className="text-xs text-gray-400">Team</div>
                                    </div>
                                </div>

                                {/* Deployment Status */}
                                {project.deployment && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-400">Deployment</span>
                                            <span className={`text-xs px-2 py-1 rounded ${getDeploymentStatusColor(project.deployment.status)}`}>
                                                {project.deployment.status}
                                            </span>
                                        </div>
                                        {project.deployment.url && (
                                            <a
                                                href={project.deployment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                                            >
                                                <span>View Live</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => window.open(`/chat?project=${project.id}`, '_blank')}
                                        className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors text-sm flex items-center justify-center space-x-2"
                                    >
                                        <Code className="w-4 h-4" />
                                        <span>Code</span>
                                    </button>

                                    {project.repository && (
                                        <button
                                            onClick={() => window.open(project.repository!.url, '_blank')}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 transition-colors"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 transition-colors">
                                        <Terminal className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Expanded Project Details */}
                                <AnimatePresence>
                                    {selectedProject === project.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-white/10"
                                        >
                                            <h4 className="font-semibold text-white mb-3">Project Files</h4>
                                            <div className="max-h-40 overflow-y-auto bg-black/20 rounded-lg p-3">
                                                {project.files.length > 0 ? (
                                                    renderFileTree(project.files)
                                                ) : (
                                                    <p className="text-gray-400 text-sm">No files to display</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                layout
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-8 h-8 ${getStatusColor(project.status)} rounded-lg flex items-center justify-center`}>
                                            {getStatusIcon(project.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                                            <p className="text-sm text-gray-400">{project.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 text-sm">
                                        <div className="text-center">
                                            <div className="text-blue-400 font-semibold">{project.stats.totalFiles}</div>
                                            <div className="text-gray-400">Files</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-green-400 font-semibold">{project.stats.totalLines.toLocaleString()}</div>
                                            <div className="text-gray-400">Lines</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-purple-400 font-semibold">{project.stats.tests.passed}/{project.stats.tests.total}</div>
                                            <div className="text-gray-400">Tests</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-yellow-400 font-semibold">{project.stats.collaborators}</div>
                                            <div className="text-gray-400">Team</div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => window.open(`/chat?project=${project.id}`, '_blank')}
                                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center space-x-2"
                                            >
                                                <Code className="w-4 h-4" />
                                                <span>Code</span>
                                            </button>

                                            {project.repository && (
                                                <button
                                                    onClick={() => window.open(project.repository!.url, '_blank')}
                                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 transition-colors"
                                                >
                                                    <GitBranch className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 transition-colors">
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-16">
                        <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
                        <p className="text-gray-400 mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Start building amazing projects with AI assistance'
                            }
                        </p>
                        {(!searchTerm && statusFilter === 'all') && (
                            <button
                                onClick={createNewProject}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Your First Project</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProjectDashboard
