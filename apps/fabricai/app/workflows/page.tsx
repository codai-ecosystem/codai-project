'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    GitBranch,
    Plus,
    Search,
    Filter,
    Play,
    Pause,
    Stop,
    MoreVertical,
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Zap,
    Settings,
    Copy,
    Edit3,
    Trash2,
    BarChart3,
    Activity,
    Target,
    Layers,
    RefreshCw,
    ArrowRight,
    Timer
} from 'lucide-react'

interface WorkflowStep {
    id: string
    name: string
    type: 'code_generation' | 'testing' | 'deployment' | 'review' | 'notification'
    status: 'pending' | 'running' | 'completed' | 'failed'
    duration?: number
    output?: string
}

interface Workflow {
    id: string
    name: string
    description: string
    status: 'draft' | 'active' | 'paused' | 'completed' | 'failed'
    trigger: 'manual' | 'git_push' | 'schedule' | 'api_call'
    author: string
    created: string
    lastRun?: string
    totalRuns: number
    successRate: number
    steps: WorkflowStep[]
    tags: string[]
    estimatedDuration: string
}

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
    const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(new Set())

    const fabricaiService = FabricAIService.getInstance()

    const statuses = ['draft', 'active', 'paused', 'completed', 'failed']
    const triggerTypes = ['manual', 'git_push', 'schedule', 'api_call']

    useEffect(() => {
        loadWorkflows()
    }, [])

    useEffect(() => {
        filterWorkflows()
    }, [workflows, searchQuery, statusFilter])

    const loadWorkflows = async () => {
        try {
            setIsLoading(true)
            const workflowsData = await fabricaiService.getWorkflows()

            // Enhanced workflow data
            const enhancedWorkflows = workflowsData.map(workflow => ({
                ...workflow,
                estimatedDuration: ['2 min', '5 min', '10 min', '15 min', '30 min'][Math.floor(Math.random() * 5)],
                totalRuns: Math.floor(Math.random() * 100) + 1,
                successRate: Math.floor(Math.random() * 30) + 70
            }))

            setWorkflows(enhancedWorkflows)
        } catch (error) {
            console.error('Failed to load workflows:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filterWorkflows = () => {
        let filtered = workflows

        if (searchQuery) {
            filtered = filtered.filter(workflow =>
                workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                workflow.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(workflow => workflow.status === statusFilter)
        }

        setFilteredWorkflows(filtered)
    }

    const runWorkflow = async (workflowId: string) => {
        setRunningWorkflows(prev => new Set(prev.add(workflowId)))

        // Simulate workflow execution
        setTimeout(() => {
            setRunningWorkflows(prev => {
                const newSet = new Set(prev)
                newSet.delete(workflowId)
                return newSet
            })

            // Update workflow status
            setWorkflows(prev => prev.map(workflow =>
                workflow.id === workflowId
                    ? { ...workflow, status: 'completed' as const, lastRun: new Date().toISOString() }
                    : workflow
            ))
        }, 3000)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-slate-500/20 text-slate-400'
            case 'active':
                return 'bg-emerald-500/20 text-emerald-400'
            case 'paused':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'completed':
                return 'bg-blue-500/20 text-blue-400'
            case 'failed':
                return 'bg-red-500/20 text-red-400'
            default:
                return 'bg-slate-500/20 text-slate-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return Edit3
            case 'active':
                return Play
            case 'paused':
                return Pause
            case 'completed':
                return CheckCircle
            case 'failed':
                return XCircle
            default:
                return AlertCircle
        }
    }

    const getTriggerIcon = (trigger: string) => {
        switch (trigger) {
            case 'manual':
                return Play
            case 'git_push':
                return GitBranch
            case 'schedule':
                return Clock
            case 'api_call':
                return Zap
            default:
                return Play
        }
    }

    const WorkflowCard = ({ workflow }: { workflow: Workflow }) => {
        const StatusIcon = getStatusIcon(workflow.status)
        const TriggerIcon = getTriggerIcon(workflow.trigger)
        const isRunning = runningWorkflows.has(workflow.id)

        return (
            <motion.div
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
            >
                {/* Workflow Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <GitBranch className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
                                {workflow.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(workflow.status)}`}>
                                    <StatusIcon className="w-3 h-3 inline mr-1" />
                                    {workflow.status}
                                </span>
                                <span className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs">
                                    <TriggerIcon className="w-3 h-3 inline mr-1" />
                                    {workflow.trigger.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                        <button
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                        >
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>

                        <AnimatePresence>
                            {selectedWorkflow === workflow.id && (
                                <motion.div
                                    className="absolute right-0 top-full mt-2 w-48 bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/20 py-2 z-10"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <Copy className="w-4 h-4" />
                                        <span>Clone</span>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Analytics</span>
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

                <p className="text-slate-300 text-sm mb-4">{workflow.description}</p>

                {/* Workflow Steps Preview */}
                <div className="mb-4">
                    <p className="text-slate-400 text-xs mb-2">WORKFLOW STEPS</p>
                    <div className="flex items-center space-x-2">
                        {workflow.steps.slice(0, 5).map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                        step.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                            step.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                {index < workflow.steps.slice(0, 5).length - 1 && (
                                    <ArrowRight className="w-3 h-3 text-slate-500 mx-1" />
                                )}
                            </div>
                        ))}
                        {workflow.steps.length > 5 && (
                            <span className="text-slate-400 text-xs ml-2">+{workflow.steps.length - 5} more</span>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {workflow.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                        {workflow.tags.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-slate-400 rounded text-xs">
                                +{workflow.tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                            <Activity className="w-4 h-4" />
                            <span>{workflow.totalRuns} runs</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>{workflow.successRate}% success</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Timer className="w-4 h-4" />
                            <span>{workflow.estimatedDuration}</span>
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-slate-400 text-sm flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{workflow.author}</span>
                        </span>
                        <span className="text-slate-500 text-sm">{workflow.created}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <motion.button
                            className="p-2 rounded-lg bg-white/10 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Settings className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${isRunning
                                    ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                }`}
                            whileHover={!isRunning ? { scale: 1.05 } : {}}
                            whileTap={!isRunning ? { scale: 0.95 } : {}}
                            onClick={() => !isRunning && runWorkflow(workflow.id)}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <motion.div
                                        className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Running...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3" />
                                    <span>Run</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        )
    }

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
                            className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-lg font-medium">Loading Workflows...</span>
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
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <GitBranch className="w-8 h-8 mr-3 text-blue-400" />
                            Workflows
                        </h1>
                        <p className="text-slate-300">Automate your development process with AI-powered workflows</p>
                    </div>

                    <motion.button
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Workflow</span>
                    </motion.button>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-5 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Total Workflows</p>
                                <p className="text-2xl font-bold text-white">{workflows.length}</p>
                            </div>
                            <GitBranch className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Active</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {workflows.filter(w => w.status === 'active').length}
                                </p>
                            </div>
                            <Play className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Success Rate</p>
                                <p className="text-2xl font-bold text-yellow-400">
                                    {Math.round(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length)}%
                                </p>
                            </div>
                            <Target className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Total Runs</p>
                                <p className="text-2xl font-bold text-purple-400">
                                    {workflows.reduce((acc, w) => acc + w.totalRuns, 0)}
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Running</p>
                                <p className="text-2xl font-bold text-orange-400">{runningWorkflows.size}</p>
                            </div>
                            <RefreshCw className="w-8 h-8 text-orange-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search workflows..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-slate-400 text-sm">
                        Showing {filteredWorkflows.length} of {workflows.length} workflows
                    </div>
                </motion.div>

                {/* Active Workflows */}
                {runningWorkflows.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <RefreshCw className="w-5 h-5 text-orange-400" />
                            <h2 className="text-white font-semibold text-lg">Currently Running</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            {filteredWorkflows
                                .filter(workflow => runningWorkflows.has(workflow.id))
                                .map((workflow, index) => (
                                    <motion.div
                                        key={`running-${workflow.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative"
                                    >
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                                            RUNNING
                                        </div>
                                        <WorkflowCard workflow={workflow} />
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                )}

                {/* All Workflows */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-white font-semibold text-lg mb-6">All Workflows</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredWorkflows.map((workflow, index) => (
                                <motion.div
                                    key={workflow.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <WorkflowCard workflow={workflow} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Empty State */}
                {filteredWorkflows.length === 0 && (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GitBranch className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold text-lg mb-2">No workflows found</h3>
                        <p className="text-slate-400 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first workflow to automate your development process'
                            }
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Your First Workflow
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </div>
        </FabricAILayout>
    )
}
