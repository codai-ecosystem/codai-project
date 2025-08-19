'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FolderOpen,
    Plus,
    Search,
    Filter,
    GitBranch,
    Code,
    Clock,
    Users,
    CheckCircle,
    AlertCircle,
    Star,
    Zap,
    Download,
    Github,
    Database,
    Monitor,
    Settings
} from 'lucide-react'

interface Project {
    id: string
    name: string
    description: string
    language: string
    framework: string
    status: 'active' | 'completed' | 'on_hold' | 'archived'
    lastActivity: string
    progress: number
    team: number
    commits: number
    issues: number
    stars: number
    aiAssists: number
    buildHealth: number
    testCoverage: number
    codeQuality: number
}

interface ProjectMetrics {
    totalProjects: number
    activeProjects: number
    completedThisMonth: number
    averageCompletion: number
    totalCommits: number
    codeGenerated: number
    bugsFixed: number
    testsCreated: number
}

const AIDE_Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [metrics, setMetrics] = useState<ProjectMetrics | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('lastActivity')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    useEffect(() => {
        // Simulate loading project metrics
        setMetrics({
            totalProjects: 24,
            activeProjects: 16,
            completedThisMonth: 8,
            averageCompletion: 73,
            totalCommits: 1247,
            codeGenerated: 487000,
            bugsFixed: 156,
            testsCreated: 342
        })

        // Simulate loading projects
        setProjects([
            {
                id: '1',
                name: 'E-Commerce Platform',
                description: 'Next.js e-commerce with AI recommendations',
                language: 'TypeScript',
                framework: 'Next.js',
                status: 'active',
                lastActivity: '2 hours ago',
                progress: 78,
                team: 5,
                commits: 234,
                issues: 12,
                stars: 89,
                aiAssists: 156,
                buildHealth: 94,
                testCoverage: 87,
                codeQuality: 92
            },
            {
                id: '2',
                name: 'ML Pipeline Framework',
                description: 'Python-based machine learning pipeline automation',
                language: 'Python',
                framework: 'FastAPI',
                status: 'active',
                lastActivity: '4 hours ago',
                progress: 65,
                team: 3,
                commits: 187,
                issues: 8,
                stars: 124,
                aiAssists: 98,
                buildHealth: 89,
                testCoverage: 76,
                codeQuality: 88
            },
            {
                id: '3',
                name: 'Real-time Chat App',
                description: 'Go-based WebSocket chat with Redis clustering',
                language: 'Go',
                framework: 'Gin',
                status: 'completed',
                lastActivity: '1 day ago',
                progress: 100,
                team: 4,
                commits: 298,
                issues: 3,
                stars: 67,
                aiAssists: 87,
                buildHealth: 98,
                testCoverage: 92,
                codeQuality: 95
            },
            {
                id: '4',
                name: 'Mobile Banking API',
                description: 'Secure banking API with biometric authentication',
                language: 'TypeScript',
                framework: 'NestJS',
                status: 'active',
                lastActivity: '6 hours ago',
                progress: 82,
                team: 6,
                commits: 156,
                issues: 15,
                stars: 45,
                aiAssists: 134,
                buildHealth: 91,
                testCoverage: 84,
                codeQuality: 89
            },
            {
                id: '5',
                name: 'IoT Dashboard',
                description: 'React dashboard for IoT device monitoring',
                language: 'JavaScript',
                framework: 'React',
                status: 'on_hold',
                lastActivity: '3 days ago',
                progress: 45,
                team: 2,
                commits: 89,
                issues: 7,
                stars: 23,
                aiAssists: 56,
                buildHealth: 76,
                testCoverage: 65,
                codeQuality: 78
            },
            {
                id: '6',
                name: 'Blockchain Validator',
                description: 'Rust-based blockchain consensus validator',
                language: 'Rust',
                framework: 'Tokio',
                status: 'active',
                lastActivity: '8 hours ago',
                progress: 38,
                team: 3,
                commits: 112,
                issues: 9,
                stars: 156,
                aiAssists: 78,
                buildHealth: 85,
                testCoverage: 71,
                codeQuality: 91
            }
        ])
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
            case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'on_hold': return 'text-amber-600 bg-amber-50 border-amber-200'
            case 'archived': return 'text-slate-600 bg-slate-50 border-slate-200'
            default: return 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }

    const getLanguageColor = (language: string) => {
        switch (language) {
            case 'TypeScript': return 'bg-blue-100 text-blue-800'
            case 'Python': return 'bg-green-100 text-green-800'
            case 'Go': return 'bg-cyan-100 text-cyan-800'
            case 'JavaScript': return 'bg-yellow-100 text-yellow-800'
            case 'Rust': return 'bg-orange-100 text-orange-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterStatus === 'all' || project.status === filterStatus
        return matchesSearch && matchesFilter
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                                Projects Management
                            </h1>
                            <p className="text-slate-600 mt-1">
                                AI-powered project management with intelligent insights and automation
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                New Project
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Metrics Overview */}
                {metrics && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Total Projects</p>
                                    <p className="text-2xl font-bold text-slate-900">{metrics.totalProjects}</p>
                                </div>
                                <FolderOpen className="w-8 h-8 text-blue-600" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Active Projects</p>
                                    <p className="text-2xl font-bold text-emerald-600">{metrics.activeProjects}</p>
                                </div>
                                <Zap className="w-8 h-8 text-emerald-600" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Completed This Month</p>
                                    <p className="text-2xl font-bold text-blue-600">{metrics.completedThisMonth}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-blue-600" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Avg Completion</p>
                                    <p className="text-2xl font-bold text-purple-600">{metrics.averageCompletion}%</p>
                                </div>
                                <Monitor className="w-8 h-8 text-purple-600" />
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Search and Filter Controls */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                                <option value="archived">Archived</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="lastActivity">Last Activity</option>
                                <option value="name">Name</option>
                                <option value="progress">Progress</option>
                                <option value="stars">Stars</option>
                            </select>

                            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                                >
                                    List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Grid/List */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
                                    <p className="text-slate-600 text-sm mb-3">{project.description}</p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(project.language)}`}>
                                            {project.language}
                                        </span>
                                        <span className="text-slate-500 text-xs">{project.framework}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-slate-600">
                                    <Star className="w-4 h-4" />
                                    <span className="text-sm">{project.stars}</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-slate-600 mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-slate-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Project Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Commits</p>
                                    <p className="font-semibold text-slate-900">{project.commits}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">AI Assists</p>
                                    <p className="font-semibold text-purple-600">{project.aiAssists}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Build Health</p>
                                    <p className="font-semibold text-emerald-600">{project.buildHealth}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Test Coverage</p>
                                    <p className="font-semibold text-blue-600">{project.testCoverage}%</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                >
                                    <Code className="w-4 h-4" />
                                    Open
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    <Settings className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* Last Activity */}
                            <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Last activity {project.lastActivity}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            AI-Powered Project Management
                        </h3>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            AIDE automatically tracks project health, suggests optimizations, generates documentation,
                            and provides intelligent insights to accelerate your development workflow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_Projects
