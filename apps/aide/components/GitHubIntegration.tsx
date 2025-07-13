'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Github,
    GitBranch,
    GitCommit,
    GitPullRequest,
    Settings,
    Link,
    Unlink,
    RefreshCw,
    Plus,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Star,
    GitFork,
    Activity,
    Calendar,
    FileText,
    Code,
    ExternalLink,
    Download,
    Upload,
    Merge,
    AlertTriangle,
    Info,
    Search,
    Filter,
    MoreHorizontal,
    Copy,
    Check
} from 'lucide-react'

interface Repository {
    id: string
    name: string
    fullName: string
    description: string
    url: string
    private: boolean
    language: string
    stars: number
    forks: number
    lastCommit: Date
    defaultBranch: string
    connected: boolean
    status: 'synced' | 'syncing' | 'error' | 'disconnected'
    lastSync: Date | null
}

interface PullRequest {
    id: string
    number: number
    title: string
    state: 'open' | 'closed' | 'merged'
    author: string
    createdAt: Date
    updatedAt: Date
    mergeable: boolean
    draft: boolean
    reviewStatus: 'pending' | 'approved' | 'changes_requested'
    comments: number
    additions: number
    deletions: number
    commits: number
    url: string
}

interface Commit {
    id: string
    sha: string
    message: string
    author: string
    date: Date
    url: string
    verified: boolean
    additions: number
    deletions: number
    files: number
}

interface Branch {
    name: string
    protected: boolean
    default: boolean
    lastCommit: Date
    ahead: number
    behind: number
}

const GitHubIntegration = () => {
    const [connected, setConnected] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'repositories' | 'pullrequests' | 'commits' | 'branches'>('repositories')
    const [repositories, setRepositories] = useState<Repository[]>([
        {
            id: '1',
            name: 'codai-ecosystem',
            fullName: 'codai-ecosystem/aide-frontend',
            description: 'AI Development Environment - Frontend Application',
            url: 'https://github.com/codai-ecosystem/aide-frontend',
            private: false,
            language: 'TypeScript',
            stars: 247,
            forks: 43,
            lastCommit: new Date(Date.now() - 3600000),
            defaultBranch: 'main',
            connected: true,
            status: 'synced',
            lastSync: new Date(Date.now() - 1800000)
        },
        {
            id: '2',
            name: 'ai-chatbot',
            fullName: 'codai-ecosystem/ai-chatbot',
            description: 'Intelligent customer service chatbot with NLP capabilities',
            url: 'https://github.com/codai-ecosystem/ai-chatbot',
            private: false,
            language: 'TypeScript',
            stars: 89,
            forks: 12,
            lastCommit: new Date(Date.now() - 7200000),
            defaultBranch: 'main',
            connected: true,
            status: 'synced',
            lastSync: new Date(Date.now() - 3600000)
        },
        {
            id: '3',
            name: 'ecommerce-platform',
            fullName: 'codai-ecosystem/ecommerce-platform',
            description: 'Modern React-based e-commerce solution with AI recommendations',
            url: 'https://github.com/codai-ecosystem/ecommerce-platform',
            private: true,
            language: 'TypeScript',
            stars: 156,
            forks: 28,
            lastCommit: new Date(Date.now() - 1800000),
            defaultBranch: 'main',
            connected: false,
            status: 'disconnected',
            lastSync: null
        }
    ])

    const [pullRequests, setPullRequests] = useState<PullRequest[]>([
        {
            id: '1',
            number: 42,
            title: 'Add advanced AI code generation features',
            state: 'open',
            author: 'aide-ai',
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 3600000),
            mergeable: true,
            draft: false,
            reviewStatus: 'pending',
            comments: 3,
            additions: 847,
            deletions: 124,
            commits: 8,
            url: 'https://github.com/codai-ecosystem/aide-frontend/pull/42'
        },
        {
            id: '2',
            number: 41,
            title: 'Improve GitHub integration UI',
            state: 'open',
            author: 'dev-team',
            createdAt: new Date(Date.now() - 172800000),
            updatedAt: new Date(Date.now() - 7200000),
            mergeable: true,
            draft: true,
            reviewStatus: 'changes_requested',
            comments: 7,
            additions: 234,
            deletions: 67,
            commits: 4,
            url: 'https://github.com/codai-ecosystem/aide-frontend/pull/41'
        },
        {
            id: '3',
            number: 40,
            title: 'Fix responsive design issues',
            state: 'merged',
            author: 'ui-team',
            createdAt: new Date(Date.now() - 259200000),
            updatedAt: new Date(Date.now() - 172800000),
            mergeable: true,
            draft: false,
            reviewStatus: 'approved',
            comments: 2,
            additions: 123,
            deletions: 89,
            commits: 3,
            url: 'https://github.com/codai-ecosystem/aide-frontend/pull/40'
        }
    ])

    const [commits, setCommits] = useState<Commit[]>([
        {
            id: '1',
            sha: 'a1b2c3d4',
            message: 'feat: add GitHub integration component with real-time sync',
            author: 'aide-ai',
            date: new Date(Date.now() - 3600000),
            url: 'https://github.com/codai-ecosystem/aide-frontend/commit/a1b2c3d4',
            verified: true,
            additions: 523,
            deletions: 47,
            files: 8
        },
        {
            id: '2',
            sha: 'e5f6g7h8',
            message: 'fix: resolve merge conflicts in project dashboard',
            author: 'dev-team',
            date: new Date(Date.now() - 7200000),
            url: 'https://github.com/codai-ecosystem/aide-frontend/commit/e5f6g7h8',
            verified: true,
            additions: 89,
            deletions: 156,
            files: 4
        },
        {
            id: '3',
            sha: 'i9j0k1l2',
            message: 'refactor: optimize component rendering performance',
            author: 'performance-team',
            date: new Date(Date.now() - 10800000),
            url: 'https://github.com/codai-ecosystem/aide-frontend/commit/i9j0k1l2',
            verified: false,
            additions: 234,
            deletions: 178,
            files: 12
        }
    ])

    const [branches, setBranches] = useState<Branch[]>([
        {
            name: 'main',
            protected: true,
            default: true,
            lastCommit: new Date(Date.now() - 3600000),
            ahead: 0,
            behind: 0
        },
        {
            name: 'feature/github-integration',
            protected: false,
            default: false,
            lastCommit: new Date(Date.now() - 1800000),
            ahead: 8,
            behind: 2
        },
        {
            name: 'develop',
            protected: true,
            default: false,
            lastCommit: new Date(Date.now() - 7200000),
            ahead: 3,
            behind: 1
        },
        {
            name: 'hotfix/ui-fixes',
            protected: false,
            default: false,
            lastCommit: new Date(Date.now() - 10800000),
            ahead: 2,
            behind: 5
        }
    ])

    const [searchTerm, setSearchTerm] = useState('')
    const [copiedSha, setCopiedSha] = useState<string | null>(null)

    const connectGitHub = async () => {
        setLoading(true)
        try {
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 2000))
            setConnected(true)
            alert('Successfully connected to GitHub!')
        } catch (error) {
            alert('Failed to connect to GitHub')
        } finally {
            setLoading(false)
        }
    }

    const disconnectGitHub = async () => {
        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            setConnected(false)
            setRepositories(prev => prev.map(repo => ({ ...repo, connected: false, status: 'disconnected' as const })))
        } catch (error) {
            alert('Failed to disconnect from GitHub')
        } finally {
            setLoading(false)
        }
    }

    const syncRepository = async (repoId: string) => {
        setRepositories(prev => prev.map(repo =>
            repo.id === repoId
                ? { ...repo, status: 'syncing' as const }
                : repo
        ))

        try {
            await new Promise(resolve => setTimeout(resolve, 3000))
            setRepositories(prev => prev.map(repo =>
                repo.id === repoId
                    ? { ...repo, status: 'synced' as const, lastSync: new Date(), connected: true }
                    : repo
            ))
        } catch (error) {
            setRepositories(prev => prev.map(repo =>
                repo.id === repoId
                    ? { ...repo, status: 'error' as const }
                    : repo
            ))
        }
    }

    const getStatusColor = (status: Repository['status']) => {
        switch (status) {
            case 'synced': return 'text-green-400 bg-green-500/20'
            case 'syncing': return 'text-blue-400 bg-blue-500/20'
            case 'error': return 'text-red-400 bg-red-500/20'
            case 'disconnected': return 'text-gray-400 bg-gray-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    const getPRStatusColor = (state: PullRequest['state']) => {
        switch (state) {
            case 'open': return 'text-green-400 bg-green-500/20'
            case 'merged': return 'text-purple-400 bg-purple-500/20'
            case 'closed': return 'text-red-400 bg-red-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    const getReviewStatusColor = (status: PullRequest['reviewStatus']) => {
        switch (status) {
            case 'approved': return 'text-green-400'
            case 'changes_requested': return 'text-red-400'
            case 'pending': return 'text-yellow-400'
            default: return 'text-gray-400'
        }
    }

    const formatTimeAgo = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (days > 0) return `${days}d ago`
        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return 'Just now'
    }

    const copySha = async (sha: string) => {
        await navigator.clipboard.writeText(sha)
        setCopiedSha(sha)
        setTimeout(() => setCopiedSha(null), 2000)
    }

    const createPullRequest = () => {
        // Simulate creating a new PR
        alert('Creating pull request... This would open GitHub\'s PR creation page.')
    }

    const filteredRepositories = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredPullRequests = pullRequests.filter(pr =>
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.author.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredCommits = commits.filter(commit =>
        commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commit.author.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto max-w-7xl px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Github className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                GitHub Integration
                            </h1>
                            <p className="text-gray-300 mt-2">Seamlessly connect and manage your GitHub repositories</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {connected ? (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 font-medium">Connected</span>
                                </div>
                                <button
                                    onClick={disconnectGitHub}
                                    disabled={loading}
                                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                                    <span>Disconnect</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={connectGitHub}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                                <span>Connect GitHub</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Connection State */}
                {!connected ? (
                    <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Connect Your GitHub Account</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Link your GitHub account to access repositories, manage pull requests, and sync your code with AIDE's AI development environment.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                            <div className="p-4 bg-black/20 rounded-lg">
                                <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-white mb-1">Repository Sync</h4>
                                <p className="text-sm text-gray-400">Real-time synchronization with your GitHub repositories</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-lg">
                                <GitPullRequest className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-white mb-1">PR Management</h4>
                                <p className="text-sm text-gray-400">Create and manage pull requests directly from AIDE</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-lg">
                                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-white mb-1">Live Updates</h4>
                                <p className="text-sm text-gray-400">Get notified about commits, reviews, and deployments</p>
                            </div>
                        </div>
                        <button
                            onClick={connectGitHub}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
                            <span>Connect with GitHub</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Navigation Tabs */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-1 bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
                                <button
                                    onClick={() => setActiveTab('repositories')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === 'repositories'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Github className="w-4 h-4" />
                                    <span>Repositories</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('pullrequests')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === 'pullrequests'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <GitPullRequest className="w-4 h-4" />
                                    <span>Pull Requests</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('commits')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === 'commits'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <GitCommit className="w-4 h-4" />
                                    <span>Commits</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('branches')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${activeTab === 'branches'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <GitBranch className="w-4 h-4" />
                                    <span>Branches</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                                    />
                                </div>

                                {activeTab === 'pullrequests' && (
                                    <button
                                        onClick={createPullRequest}
                                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors flex items-center space-x-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>New PR</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {/* Repositories Tab */}
                            {activeTab === 'repositories' && (
                                <motion.div
                                    key="repositories"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    {filteredRepositories.map((repo) => (
                                        <div
                                            key={repo.id}
                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                                                        <Github className="w-6 h-6 text-purple-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
                                                            {repo.private && (
                                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                                                                    Private
                                                                </span>
                                                            )}
                                                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(repo.status)}`}>
                                                                {repo.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 mb-3">{repo.description}</p>
                                                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                                                <span>{repo.language}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="w-4 h-4" />
                                                                <span>{repo.stars}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <GitFork className="w-4 h-4" />
                                                                <span>{repo.forks}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>Updated {formatTimeAgo(repo.lastCommit)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => window.open(repo.url, '_blank')}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </button>

                                                    {repo.connected ? (
                                                        <button
                                                            onClick={() => syncRepository(repo.id)}
                                                            disabled={repo.status === 'syncing'}
                                                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                                        >
                                                            <RefreshCw className={`w-4 h-4 ${repo.status === 'syncing' ? 'animate-spin' : ''}`} />
                                                            <span>Sync</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => syncRepository(repo.id)}
                                                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors flex items-center space-x-2"
                                                        >
                                                            <Link className="w-4 h-4" />
                                                            <span>Connect</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => window.open(`/chat?repo=${repo.id}`, '_blank')}
                                                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors flex items-center space-x-2"
                                                    >
                                                        <Code className="w-4 h-4" />
                                                        <span>Code with AI</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Pull Requests Tab */}
                            {activeTab === 'pullrequests' && (
                                <motion.div
                                    key="pullrequests"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    {filteredPullRequests.map((pr) => (
                                        <div
                                            key={pr.id}
                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                                                        <GitPullRequest className="w-5 h-5 text-green-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-white">{pr.title}</h3>
                                                            <span className={`px-2 py-1 text-xs rounded ${getPRStatusColor(pr.state)}`}>
                                                                {pr.state}
                                                            </span>
                                                            {pr.draft && (
                                                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded border border-gray-500/30">
                                                                    Draft
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                                                            <span>#{pr.number}</span>
                                                            <span>by {pr.author}</span>
                                                            <span>{formatTimeAgo(pr.createdAt)}</span>
                                                            <span className={getReviewStatusColor(pr.reviewStatus)}>
                                                                {pr.reviewStatus.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <Plus className="w-4 h-4 text-green-400" />
                                                                <span className="text-green-400">{pr.additions}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                                <span className="text-red-400">{pr.deletions}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <GitCommit className="w-4 h-4" />
                                                                <span>{pr.commits} commits</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <FileText className="w-4 h-4" />
                                                                <span>{pr.comments} comments</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => window.open(pr.url, '_blank')}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </button>

                                                    {pr.state === 'open' && pr.mergeable && (
                                                        <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors flex items-center space-x-2">
                                                            <Merge className="w-4 h-4" />
                                                            <span>Merge</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => window.open(`/chat?pr=${pr.id}`, '_blank')}
                                                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors flex items-center space-x-2"
                                                    >
                                                        <Code className="w-4 h-4" />
                                                        <span>Review with AI</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Commits Tab */}
                            {activeTab === 'commits' && (
                                <motion.div
                                    key="commits"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    {filteredCommits.map((commit) => (
                                        <div
                                            key={commit.id}
                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                                                        <GitCommit className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-white">{commit.message}</h3>
                                                            {commit.verified && (
                                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 flex items-center space-x-1">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    <span>Verified</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-xs">{commit.sha}</span>
                                                                <button
                                                                    onClick={() => copySha(commit.sha)}
                                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                                >
                                                                    {copiedSha === commit.sha ? (
                                                                        <Check className="w-3 h-3 text-green-400" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3 text-gray-400" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <span>by {commit.author}</span>
                                                            <span>{formatTimeAgo(commit.date)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <Plus className="w-4 h-4 text-green-400" />
                                                                <span className="text-green-400">{commit.additions}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                                <span className="text-red-400">{commit.deletions}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <FileText className="w-4 h-4" />
                                                                <span>{commit.files} files</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => window.open(commit.url, '_blank')}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </button>

                                                    <button
                                                        onClick={() => window.open(`/chat?commit=${commit.id}`, '_blank')}
                                                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors flex items-center space-x-2"
                                                    >
                                                        <Code className="w-4 h-4" />
                                                        <span>Analyze</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Branches Tab */}
                            {activeTab === 'branches' && (
                                <motion.div
                                    key="branches"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    {filteredBranches.map((branch) => (
                                        <div
                                            key={branch.name}
                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                                                        <GitBranch className="w-5 h-5 text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
                                                            {branch.default && (
                                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                                                    Default
                                                                </span>
                                                            )}
                                                            {branch.protected && (
                                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                                                                    Protected
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>Updated {formatTimeAgo(branch.lastCommit)}</span>
                                                            </div>
                                                            {branch.ahead > 0 && (
                                                                <div className="flex items-center space-x-1">
                                                                    <Upload className="w-4 h-4 text-green-400" />
                                                                    <span className="text-green-400">{branch.ahead} ahead</span>
                                                                </div>
                                                            )}
                                                            {branch.behind > 0 && (
                                                                <div className="flex items-center space-x-1">
                                                                    <Download className="w-4 h-4 text-red-400" />
                                                                    <span className="text-red-400">{branch.behind} behind</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center space-x-2">
                                                        <GitPullRequest className="w-4 h-4" />
                                                        <span>Create PR</span>
                                                    </button>

                                                    <button
                                                        onClick={() => window.open(`/chat?branch=${branch.name}`, '_blank')}
                                                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors flex items-center space-x-2"
                                                    >
                                                        <Code className="w-4 h-4" />
                                                        <span>Code</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    )
}

export default GitHubIntegration
