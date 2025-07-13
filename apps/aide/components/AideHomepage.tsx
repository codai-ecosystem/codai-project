'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Bot,
    Zap,
    GitBranch,
    Rocket,
    Activity,
    MessageSquare,
    FolderTree,
    Globe,
    Settings,
    Terminal,
    Plus,
    Eye,
    TrendingUp,
    X
} from 'lucide-react'

interface Stats {
    totalProjects: number
    activeConversations: number
    uptime: number
    supportedLanguages: number
}

interface Project {
    id: string
    name: string
    language: string
    status: 'active' | 'building' | 'deployed' | 'paused'
}

interface ProjectFormData {
    name: string
    description: string
    language: string
    template: string
}

const AideHomepage = () => {
    const [stats, setStats] = useState<Stats>({
        totalProjects: 0,
        activeConversations: 0,
        uptime: 0,
        supportedLanguages: 0
    })
    const [devToolsMetrics, setDevToolsMetrics] = useState<any>(null)
    const [devTools, setDevTools] = useState<any[]>([])

    const [projects, setProjects] = useState<Project[]>([
        {
            id: '1',
            name: 'E-commerce Platform',
            language: 'React/TypeScript',
            status: 'building'
        },
        {
            id: '2',
            name: 'AI Chat Bot',
            language: 'Next.js',
            status: 'deployed'
        }
    ])

    const [showProjectModal, setShowProjectModal] = useState(false)
    const [showProjectsList, setShowProjectsList] = useState(false)
    const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        language: 'javascript',
        template: 'blank'
    })
    const [allProjects, setAllProjects] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Load real-time stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await fetch('/api/status')
                if (response.ok) {
                    const data = await response.json()
                    if (data.stats) {
                        setStats(data.stats)
                    }
                }
            } catch (error) {
                console.error('Failed to load stats:', error)
            }
        }

        loadStats()
        const interval = setInterval(loadStats, 30000) // Update every 30 seconds

        // Update uptime counter
        const uptimeInterval = setInterval(() => {
            setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }))
        }, 1000)

        return () => {
            clearInterval(interval)
            clearInterval(uptimeInterval)
        }
    }, [])

    // Load real dev tools metrics
    useEffect(() => {
        const loadDevToolsMetrics = async () => {
            try {
                const response = await fetch('/api/dev-tools-metrics')
                if (response.ok) {
                    const data = await response.json()
                    setDevToolsMetrics(data.metrics)
                    setDevTools(data.tools)

                    // Update stats with real data
                    setStats(prev => ({
                        ...prev,
                        totalProjects: data.metrics.workspaceComplexity || prev.totalProjects,
                        supportedLanguages: Math.max(data.metrics.buildToolsCount + data.metrics.testingToolsCount, 7)
                    }))
                }
            } catch (error) {
                console.error('Failed to load dev tools metrics:', error)
            }
        }

        loadDevToolsMetrics()
        const interval = setInterval(loadDevToolsMetrics, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [])

    const formatUptime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
        return `${Math.floor(seconds / 86400)}d`
    }

    const handleStartNewProject = () => {
        setShowProjectModal(true)
    }

    const handleCreateProject = async () => {
        if (!projectFormData.name.trim() || !projectFormData.description.trim()) {
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: projectFormData.name,
                    description: projectFormData.description,
                    language: projectFormData.language,
                    template: projectFormData.template
                })
            })

            const data = await response.json()
            if (data.success) {
                setShowProjectModal(false)
                setProjectFormData({ name: '', description: '', language: 'javascript', template: 'blank' })
                // Refresh stats
                setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }))
            } else {
                console.error('Failed to create project:', data.error)
            }
        } catch (error) {
            console.error('Error creating project:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewProjects = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/projects')
            const data = await response.json()

            if (data.success) {
                setAllProjects(data.data || [])
                setShowProjectsList(true)
            } else {
                console.error('Failed to load projects:', data.error)
            }
        } catch (error) {
            console.error('Error loading projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const navigateToChat = () => {
        window.location.href = '/chat'
    }

    const navigateToCollaboration = () => {
        window.location.href = '/collaboration'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto max-w-6xl px-5 py-8">
                {/* Navigation Bar */}
                <motion.nav
                    className="flex items-center justify-between mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center space-x-6">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            AIDE
                        </h2>
                        <nav className="hidden md:flex items-center space-x-1">
                            <a
                                href="/"
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium"
                            >
                                Home
                            </a>
                            <a
                                href="/chat"
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Chat
                            </a>
                            <a
                                href="/projects"
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Projects
                            </a>
                            <a
                                href="/github"
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                GitHub
                            </a>
                            <a
                                href="/files"
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Files
                            </a>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm">Live</span>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </motion.nav>

                {/* Header */}
                <motion.header
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        AIDE
                    </h1>
                    <p className="text-xl text-gray-300 mb-6">
                        AI Development Environment
                    </p>
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm">Operational on Port 4042</span>
                    </div>
                </motion.header>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">Chat-Driven Development</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Describe your project in natural language and watch AI generate working code in real-time.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400 mb-4">
                            <li>• Natural language to code conversion</li>
                            <li>• Iterative refinement through conversation</li>
                            <li>• Multi-language support</li>
                            <li>• Context-aware code generation</li>
                        </ul>
                        <a
                            href="/chat"
                            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors group"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Start Coding</span>
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </motion.div>

                    <motion.div
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">Instant Project Setup</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Create new projects in seconds with our AI-powered scaffolding system.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400 mb-4">
                            <li>• Framework-specific templates</li>
                            <li>• Automatic dependency management</li>
                            <li>• Best practices implementation</li>
                            <li>• Ready-to-run code structure</li>
                        </ul>
                        <a
                            href="/projects"
                            className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 font-semibold transition-colors group"
                        >
                            <FolderTree className="w-4 h-4" />
                            <span>Manage Projects</span>
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </motion.div>

                    <motion.div
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                                <GitBranch className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">GitHub Integration</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Seamless integration with GitHub for version control and collaboration.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400 mb-4">
                            <li>• Automatic repository creation</li>
                            <li>• Commit and push automation</li>
                            <li>• Pull request generation</li>
                            <li>• Collaborative development</li>
                        </ul>
                        <a
                            href="/github"
                            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors group"
                        >
                            <GitBranch className="w-4 h-4" />
                            <span>Connect GitHub</span>
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </motion.div>

                    <motion.div
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">Deployment Ready</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Deploy your applications instantly to production environments.
                        </p>
                        <ul className="space-y-1 text-sm text-gray-400 mb-4">
                            <li>• One-click deployment</li>
                            <li>• Environment configuration</li>
                            <li>• CI/CD pipeline setup</li>
                            <li>• Custom domain support</li>
                        </ul>
                        <a
                            href="/files"
                            className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors group"
                        >
                            <FolderTree className="w-4 h-4" />
                            <span>Manage Files</span>
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalProjects}</div>
                        <div className="text-gray-400 text-sm">Active Projects</div>
                    </div>
                    <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-green-400 mb-2">{stats.activeConversations}</div>
                        <div className="text-gray-400 text-sm">Conversations</div>
                    </div>
                    <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-purple-400 mb-2">{stats.supportedLanguages}</div>
                        <div className="text-gray-400 text-sm">Languages</div>
                    </div>
                    <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">{formatUptime(stats.uptime)}</div>
                        <div className="text-gray-400 text-sm">Uptime</div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-wrap justify-center gap-4 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <button
                        onClick={handleStartNewProject}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Start New Project
                    </button>

                    <button
                        onClick={handleViewProjects}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        View Projects
                    </button>

                    <button
                        onClick={navigateToChat}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Start Chatting
                    </button>

                    <button
                        onClick={navigateToCollaboration}
                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        Collaboration
                    </button>
                </motion.div>

                {/* API Endpoints Section */}
                <motion.div
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    <h2 className="text-2xl font-bold text-center mb-8">API Endpoints</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { method: 'GET', path: '/api/projects', desc: 'Get all projects' },
                            { method: 'POST', path: '/api/projects', desc: 'Create new project' },
                            { method: 'POST', path: '/api/chat', desc: 'Chat with AI assistant' },
                            { method: 'POST', path: '/api/generate-code', desc: 'Generate code from prompt' },
                            { method: 'GET', path: '/health', desc: 'Service health check' },
                            { method: 'GET', path: '/status', desc: 'Detailed service status' }
                        ].map((endpoint, index) => (
                            <div key={index} className="bg-black/20 rounded-lg p-4 border-l-4 border-blue-500">
                                <div className="font-bold text-blue-400 text-sm">{endpoint.method}</div>
                                <div className="font-mono text-gray-300 text-sm mt-1">{endpoint.path}</div>
                                <div className="text-gray-400 text-xs mt-2">{endpoint.desc}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Create Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        className="bg-slate-800/90 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Create New Project</h3>
                            <button
                                onClick={() => setShowProjectModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={projectFormData.name}
                                    onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                    placeholder="My Awesome Project"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={projectFormData.description}
                                    onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-24 resize-none"
                                    placeholder="Describe your project..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Language/Framework</label>
                                <select
                                    value={projectFormData.language}
                                    onChange={(e) => setProjectFormData(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="react">React</option>
                                    <option value="nextjs">Next.js</option>
                                    <option value="python">Python</option>
                                    <option value="nodejs">Node.js</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !projectFormData.name.trim() || !projectFormData.description.trim()}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Projects List Modal */}
            {showProjectsList && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        className="bg-slate-800/90 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Your Projects</h3>
                            <button
                                onClick={() => setShowProjectsList(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-96">
                            {allProjects.length > 0 ? (
                                <div className="space-y-3">
                                    {allProjects.map((project, index) => (
                                        <div key={project.id || index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-white">{project.name}</h4>
                                                    <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                                        <span className="text-blue-400">Type: {project.type || 'javascript'}</span>
                                                        <span className="text-green-400">
                                                            Created: {new Date(project.lastOpened).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => window.location.href = '/projects'}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                                                >
                                                    Open
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No projects found.</p>
                                    <p className="text-sm mt-1">Create your first project to get started!</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setShowProjectsList(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.location.href = '/projects'}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all"
                            >
                                Go to Projects
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default AideHomepage
