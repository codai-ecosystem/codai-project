'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    Bot,
    Brain,
    Cpu,
    Zap,
    CheckCircle,
    Clock,
    AlertCircle,
    Play,
    Pause,
    Settings,
    TrendingUp,
    Download,
    Upload,
    Eye,
    MoreVertical,
    Activity,
    Shield,
    DollarSign,
    Layers,
    Code,
    MessageSquare,
    Search,
    Filter
} from 'lucide-react'

interface AIModel {
    id: string
    name: string
    description: string
    type: string
    provider: string
    status: 'loaded' | 'loading' | 'error' | 'offline'
    usage: number
    performance: number
    capabilities: string[]
    costPerToken: number
    maxTokens: number
    languages: string[]
}

export default function AIModelsPage() {
    const [models, setModels] = useState<AIModel[]>([])
    const [filteredModels, setFilteredModels] = useState<AIModel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'loaded' | 'loading' | 'error' | 'offline'>('all')
    const [selectedModel, setSelectedModel] = useState<string | null>(null)
    const [showModelDetails, setShowModelDetails] = useState<string | null>(null)

    const fabricaiService = FabricAIService.getInstance()

    useEffect(() => {
        loadModels()
    }, [])

    useEffect(() => {
        filterModels()
    }, [models, searchQuery, statusFilter])

    const loadModels = async () => {
        try {
            setIsLoading(true)
            const modelsData = await fabricaiService.getAIModels()
            setModels(modelsData)
        } catch (error) {
            console.error('Failed to load AI models:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filterModels = () => {
        let filtered = models

        if (searchQuery) {
            filtered = filtered.filter(model =>
                model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                model.provider.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(model => model.status === statusFilter)
        }

        setFilteredModels(filtered)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'loaded':
                return <CheckCircle className="w-4 h-4" />
            case 'loading':
                return <Clock className="w-4 h-4" />
            case 'error':
                return <AlertCircle className="w-4 h-4" />
            case 'offline':
                return <Pause className="w-4 h-4" />
            default:
                return <Bot className="w-4 h-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'loaded':
                return 'bg-emerald-500/20 text-emerald-400'
            case 'loading':
                return 'bg-orange-500/20 text-orange-400'
            case 'error':
                return 'bg-red-500/20 text-red-400'
            case 'offline':
                return 'bg-slate-500/20 text-slate-400'
            default:
                return 'bg-blue-500/20 text-blue-400'
        }
    }

    const getPerformanceColor = (performance: number) => {
        if (performance >= 90) return 'text-emerald-400'
        if (performance >= 70) return 'text-yellow-400'
        return 'text-red-400'
    }

    const ModelCard = ({ model }: { model: AIModel }) => (
        <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
        >
            {/* Model Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                                {model.name}
                            </h3>
                            <p className="text-slate-400 text-sm">{model.provider}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                            {getStatusIcon(model.status)}
                            <span className="capitalize">{model.status}</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                            {model.type}
                        </span>
                    </div>

                    <p className="text-slate-300 text-sm mb-4">{model.description}</p>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>

                    <AnimatePresence>
                        {selectedModel === model.id && (
                            <motion.div
                                className="absolute right-0 top-full mt-2 w-48 bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/20 py-2 z-10"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                    <Settings className="w-4 h-4" />
                                    <span>Configure</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                </button>
                                <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                    <Download className="w-4 h-4" />
                                    <span>Export Config</span>
                                </button>
                                <hr className="border-white/20 my-2" />
                                {model.status === 'loaded' ? (
                                    <button className="w-full px-4 py-2 text-left text-orange-400 hover:bg-orange-500/10 transition-colors flex items-center space-x-2">
                                        <Pause className="w-4 h-4" />
                                        <span>Unload Model</span>
                                    </button>
                                ) : (
                                    <button className="w-full px-4 py-2 text-left text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center space-x-2">
                                        <Play className="w-4 h-4" />
                                        <span>Load Model</span>
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-sm">Usage</span>
                        <span className="text-purple-300 text-sm font-medium">{model.usage}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                        <motion.div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${model.usage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-sm">Performance</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(model.performance)}`}>
                            {model.performance}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                        <motion.div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${model.performance}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                        />
                    </div>
                </div>
            </div>

            {/* Model Specs */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-sm font-semibold text-purple-400">
                        ${model.costPerToken.toFixed(5)}
                    </div>
                    <div className="text-xs text-slate-400">per token</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-sm font-semibold text-emerald-400">
                        {model.maxTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">max tokens</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-sm font-semibold text-blue-400">
                        {model.capabilities.length}
                    </div>
                    <div className="text-xs text-slate-400">capabilities</div>
                </div>
            </div>

            {/* Capabilities */}
            <div className="mb-4">
                <span className="text-slate-400 text-sm mb-2 block">Capabilities</span>
                <div className="flex flex-wrap gap-1">
                    {model.capabilities.slice(0, 3).map((capability, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs"
                        >
                            {capability}
                        </span>
                    ))}
                    {model.capabilities.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-slate-400 rounded text-xs">
                            +{model.capabilities.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg text-white text-sm font-medium hover:from-purple-600 hover:to-emerald-600 transition-all">
                        <MessageSquare className="w-3 h-3" />
                        <span>Test</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 rounded-lg text-slate-300 text-sm hover:bg-white/20 transition-all">
                        <Activity className="w-3 h-3" />
                        <span>Monitor</span>
                    </button>
                </div>

                <button
                    className="text-slate-400 hover:text-white transition-colors"
                    onClick={() => setShowModelDetails(showModelDetails === model.id ? null : model.id)}
                >
                    <Eye className="w-4 h-4" />
                </button>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {showModelDetails === model.id && (
                    <motion.div
                        className="mt-4 pt-4 border-t border-white/20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="space-y-3">
                            <div>
                                <span className="text-slate-400 text-sm block mb-1">Supported Languages</span>
                                <div className="flex flex-wrap gap-1">
                                    {model.languages.map((lang, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                                        >
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 text-sm block mb-1">All Capabilities</span>
                                <div className="flex flex-wrap gap-1">
                                    {model.capabilities.map((capability, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                        >
                                            {capability}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                        <span className="text-lg font-medium">Loading AI Models...</span>
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
                            <Bot className="w-8 h-8 mr-3 text-purple-400" />
                            AI Models
                        </h1>
                        <p className="text-slate-300">Manage and monitor your AI model deployment</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 text-white hover:bg-white/15 transition-all"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Upload className="w-4 h-4" />
                            <span>Deploy Model</span>
                        </motion.button>

                        <motion.button
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Zap className="w-5 h-5" />
                            <span>Add Model</span>
                        </motion.button>
                    </div>
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
                                <p className="text-slate-300 text-sm">Total Models</p>
                                <p className="text-2xl font-bold text-white">{models.length}</p>
                            </div>
                            <Layers className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Active</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {models.filter(m => m.status === 'loaded').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Avg Performance</p>
                                <p className="text-2xl font-bold text-purple-400">
                                    {Math.round(models.reduce((acc, m) => acc + m.performance, 0) / models.length)}%
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Monthly Cost</p>
                                <p className="text-2xl font-bold text-yellow-400">$284</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-yellow-400" />
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
                                placeholder="Search models..."
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
                                <option value="loaded">Loaded</option>
                                <option value="loading">Loading</option>
                                <option value="error">Error</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-slate-400 text-sm">
                        Showing {filteredModels.length} of {models.length} models
                    </div>
                </motion.div>

                {/* Models Grid */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <AnimatePresence>
                        {filteredModels.map((model, index) => (
                            <motion.div
                                key={model.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ModelCard model={model} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredModels.length === 0 && (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold text-lg mb-2">No models found</h3>
                        <p className="text-slate-400 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Deploy your first AI model to get started'
                            }
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Deploy Your First Model
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* Usage Analytics */}
                <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-purple-400" />
                        Model Usage Analytics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-400 mb-2">
                                {models.reduce((acc, m) => acc + m.usage, 0).toFixed(0)}%
                            </div>
                            <div className="text-slate-300 text-sm">Total Usage</div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">
                                {Math.round(models.reduce((acc, m) => acc + m.performance, 0) / models.length)}%
                            </div>
                            <div className="text-slate-300 text-sm">Avg Performance</div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                ${models.reduce((acc, m) => acc + (m.costPerToken * 1000000), 0).toFixed(2)}
                            </div>
                            <div className="text-slate-300 text-sm">Monthly Cost</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </FabricAILayout>
    )
}
