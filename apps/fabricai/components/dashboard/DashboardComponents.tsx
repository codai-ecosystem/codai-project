'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Code,
    Sparkles,
    FolderOpen,
    Bot,
    FileTemplate,
    Zap,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    Pause,
    GitBranch,
    Users,
    Download,
    Eye,
    Star,
    Activity
} from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    change: string
    icon: React.ComponentType<any>
    color: string
    trend: 'up' | 'down' | 'neutral'
}

function StatsCard({ title, value, change, icon: Icon, color, trend }: StatsCardProps) {
    return (
        <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                        trend === 'down' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                    }`}>
                    <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{change}</span>
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-white mb-1">{value}</p>
                <p className="text-slate-300 text-sm">{title}</p>
            </div>
        </motion.div>
    )
}

interface ProjectCardProps {
    id: string
    name: string
    description: string
    language: string
    status: 'active' | 'completed' | 'paused'
    progress: number
    lastModified: string
    collaborators: number
}

function ProjectCard({ name, description, language, status, progress, lastModified, collaborators }: ProjectCardProps) {
    const statusColors = {
        active: 'bg-emerald-500/20 text-emerald-400',
        completed: 'bg-blue-500/20 text-blue-400',
        paused: 'bg-orange-500/20 text-orange-400'
    }

    const statusIcons = {
        active: Play,
        completed: CheckCircle,
        paused: Pause
    }

    const StatusIcon = statusIcons[status]

    return (
        <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{name}</h3>
                    <p className="text-slate-300 text-sm">{description}</p>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="capitalize">{status}</span>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Progress</span>
                    <span className="text-white text-sm font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <motion.div
                        className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                    <span className="text-slate-400">{language}</span>
                    <div className="flex items-center space-x-1 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{collaborators}</span>
                    </div>
                </div>
                <span className="text-slate-400">{lastModified}</span>
            </div>
        </motion.div>
    )
}

interface AIModelCardProps {
    name: string
    description: string
    type: string
    status: 'loaded' | 'loading' | 'error'
    usage: number
    performance: number
}

function AIModelCard({ name, description, type, status, usage, performance }: AIModelCardProps) {
    const statusColors = {
        loaded: 'bg-emerald-500/20 text-emerald-400',
        loading: 'bg-orange-500/20 text-orange-400',
        error: 'bg-red-500/20 text-red-400'
    }

    const statusIcons = {
        loaded: CheckCircle,
        loading: Clock,
        error: AlertCircle
    }

    const StatusIcon = statusIcons[status]

    return (
        <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h4 className="text-white font-medium">{name}</h4>
                    <p className="text-slate-400 text-xs">{type}</p>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="capitalize">{status}</span>
                </div>
            </div>

            <p className="text-slate-300 text-xs mb-3">{description}</p>

            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Usage</span>
                    <span className="text-purple-300">{usage}%</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Performance</span>
                    <span className="text-emerald-300">{performance}%</span>
                </div>
            </div>
        </motion.div>
    )
}

interface RecentActivityProps {
    activity: {
        id: string
        type: 'code_generation' | 'model_training' | 'deployment' | 'collaboration'
        title: string
        description: string
        timestamp: string
        status: 'success' | 'pending' | 'error'
    }[]
}

function RecentActivity({ activity }: RecentActivityProps) {
    const activityIcons = {
        code_generation: Code,
        model_training: Bot,
        deployment: Zap,
        collaboration: Users
    }

    const statusColors = {
        success: 'text-emerald-400',
        pending: 'text-orange-400',
        error: 'text-red-400'
    }

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-400" />
                Recent Activity
            </h3>

            <div className="space-y-4">
                {activity.map((item, index) => {
                    const Icon = activityIcons[item.type]
                    return (
                        <motion.div
                            key={item.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium text-sm">{item.title}</p>
                                <p className="text-slate-400 text-xs">{item.description}</p>
                                <p className="text-slate-500 text-xs mt-1">{item.timestamp}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${statusColors[item.status]}`} />
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export function DashboardStats() {
    const stats = [
        {
            title: 'Active Projects',
            value: 12,
            change: '+23%',
            icon: FolderOpen,
            color: 'from-blue-500 to-purple-500',
            trend: 'up' as const
        },
        {
            title: 'Code Generated',
            value: '2.4K',
            change: '+18%',
            icon: Code,
            color: 'from-emerald-500 to-blue-500',
            trend: 'up' as const
        },
        {
            title: 'AI Models',
            value: 8,
            change: '+2',
            icon: Bot,
            color: 'from-purple-500 to-pink-500',
            trend: 'up' as const
        },
        {
            title: 'Templates',
            value: 45,
            change: '+7',
            icon: FileTemplate,
            color: 'from-orange-500 to-red-500',
            trend: 'up' as const
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <StatsCard {...stat} />
                </motion.div>
            ))}
        </div>
    )
}

export function ProjectsOverview() {
    const projects = [
        {
            id: '1',
            name: 'E-commerce AI Bot',
            description: 'Customer service automation with GPT-4',
            language: 'Python',
            status: 'active' as const,
            progress: 78,
            lastModified: '2 hours ago',
            collaborators: 3
        },
        {
            id: '2',
            name: 'React Component Generator',
            description: 'Auto-generate React components from designs',
            language: 'TypeScript',
            status: 'active' as const,
            progress: 92,
            lastModified: '1 day ago',
            collaborators: 2
        },
        {
            id: '3',
            name: 'Data Analysis Pipeline',
            description: 'Automated ML pipeline for data insights',
            language: 'Python',
            status: 'completed' as const,
            progress: 100,
            lastModified: '3 days ago',
            collaborators: 5
        }
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2 text-blue-400" />
                    Active Projects
                </h3>
                <motion.button
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                >
                    View All
                </motion.button>
            </div>

            <div className="grid gap-4">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ProjectCard {...project} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export function AIModelsStatus() {
    const models = [
        {
            name: 'GPT-4 Turbo',
            description: 'Latest language model for code generation',
            type: 'Language Model',
            status: 'loaded' as const,
            usage: 85,
            performance: 96
        },
        {
            name: 'CodeBERT',
            description: 'Specialized model for code understanding',
            type: 'Code Model',
            status: 'loaded' as const,
            usage: 72,
            performance: 89
        },
        {
            name: 'Claude-3.5',
            description: 'Advanced reasoning and analysis',
            type: 'Reasoning Model',
            status: 'loading' as const,
            usage: 45,
            performance: 94
        },
        {
            name: 'Codex',
            description: 'GitHub Copilot integration',
            type: 'Code Assistant',
            status: 'loaded' as const,
            usage: 91,
            performance: 87
        }
    ]

    return (
        <div>
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-400" />
                AI Models Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model, index) => (
                    <motion.div
                        key={model.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <AIModelCard {...model} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export function QuickActions() {
    const actions = [
        {
            title: 'Generate Code',
            description: 'Create code from natural language',
            icon: Sparkles,
            color: 'from-purple-500 to-pink-500',
            href: '/fabricai/codegen'
        },
        {
            title: 'New Project',
            description: 'Start a new AI project',
            icon: FolderOpen,
            color: 'from-blue-500 to-purple-500',
            href: '/fabricai/projects'
        },
        {
            title: 'Deploy Model',
            description: 'Deploy AI model to production',
            icon: Zap,
            color: 'from-emerald-500 to-blue-500',
            href: '/fabricai/models'
        },
        {
            title: 'Create Template',
            description: 'Save current setup as template',
            icon: FileTemplate,
            color: 'from-orange-500 to-red-500',
            href: '/fabricai/templates'
        }
    ]

    return (
        <div>
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-emerald-400" />
                Quick Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <motion.button
                            key={action.title}
                            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-left group"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-white font-medium mb-2">{action.title}</h4>
                            <p className="text-slate-300 text-sm">{action.description}</p>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

export { RecentActivity }
