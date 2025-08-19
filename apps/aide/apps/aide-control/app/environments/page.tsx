'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Database,
    Server,
    Cloud,
    Monitor,
    Settings,
    Play,
    Pause,
    Square,
    RefreshCw,
    Plus,
    Edit,
    Trash2,
    Eye,
    Copy,
    Download,
    Upload,
    CheckCircle,
    AlertCircle,
    Clock,
    Cpu,
    HardDrive,
    MemoryStick,
    Network,
    Shield,
    Lock,
    Globe,
    Terminal,
    Code,
    Layers
} from 'lucide-react'

interface Environment {
    id: string
    name: string
    type: 'development' | 'staging' | 'production' | 'testing'
    status: 'running' | 'stopped' | 'deploying' | 'error' | 'maintenance'
    provider: string
    region: string
    lastDeployed: string
    resources: {
        cpu: string
        memory: string
        storage: string
        network: string
    }
    healthScore: number
    uptime: number
    activeServices: number
    totalServices: number
    cost: number
    alerts: number
}

interface EnvironmentMetrics {
    totalEnvironments: number
    activeEnvironments: number
    totalCost: number
    averageUptime: number
    deploymentsToday: number
    activeAlerts: number
    totalResources: {
        cpu: number
        memory: number
        storage: number
    }
    environmentsByType: {
        development: number
        staging: number
        production: number
        testing: number
    }
}

interface DeploymentActivity {
    id: string
    environment: string
    action: 'deploy' | 'update' | 'rollback' | 'scale' | 'restart'
    status: 'success' | 'failed' | 'in_progress'
    user: string
    timestamp: string
    duration: string
    changes: string[]
}

const AIDE_Environments: React.FC = () => {
    const [environments, setEnvironments] = useState<Environment[]>([])
    const [metrics, setMetrics] = useState<EnvironmentMetrics | null>(null)
    const [deploymentActivity, setDeploymentActivity] = useState<DeploymentActivity[]>([])
    const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useEffect(() => {
        // Simulate loading environment metrics
        setMetrics({
            totalEnvironments: 12,
            activeEnvironments: 9,
            totalCost: 2847,
            averageUptime: 99.2,
            deploymentsToday: 8,
            activeAlerts: 3,
            totalResources: {
                cpu: 64,
                memory: 256,
                storage: 2048
            },
            environmentsByType: {
                development: 4,
                staging: 3,
                production: 3,
                testing: 2
            }
        })

        // Simulate loading environments
        setEnvironments([
            {
                id: '1',
                name: 'CODAI Production',
                type: 'production',
                status: 'running',
                provider: 'AWS',
                region: 'us-east-1',
                lastDeployed: '2 hours ago',
                resources: {
                    cpu: '8 cores',
                    memory: '32 GB',
                    storage: '500 GB SSD',
                    network: '10 Gbps'
                },
                healthScore: 98,
                uptime: 99.8,
                activeServices: 12,
                totalServices: 12,
                cost: 847.50,
                alerts: 0
            },
            {
                id: '2',
                name: 'Frontend Staging',
                type: 'staging',
                status: 'running',
                provider: 'Azure',
                region: 'west-europe',
                lastDeployed: '4 hours ago',
                resources: {
                    cpu: '4 cores',
                    memory: '16 GB',
                    storage: '200 GB SSD',
                    network: '5 Gbps'
                },
                healthScore: 94,
                uptime: 98.5,
                activeServices: 8,
                totalServices: 10,
                cost: 423.25,
                alerts: 1
            },
            {
                id: '3',
                name: 'API Development',
                type: 'development',
                status: 'running',
                provider: 'GCP',
                region: 'us-central1',
                lastDeployed: '1 hour ago',
                resources: {
                    cpu: '2 cores',
                    memory: '8 GB',
                    storage: '100 GB SSD',
                    network: '1 Gbps'
                },
                healthScore: 89,
                uptime: 97.2,
                activeServices: 6,
                totalServices: 8,
                cost: 156.75,
                alerts: 2
            },
            {
                id: '4',
                name: 'ML Training Cluster',
                type: 'testing',
                status: 'deploying',
                provider: 'AWS',
                region: 'us-west-2',
                lastDeployed: '30 minutes ago',
                resources: {
                    cpu: '16 cores',
                    memory: '64 GB',
                    storage: '1 TB NVMe',
                    network: '25 Gbps'
                },
                healthScore: 0,
                uptime: 0,
                activeServices: 0,
                totalServices: 4,
                cost: 1245.80,
                alerts: 0
            },
            {
                id: '5',
                name: 'Mobile Backend',
                type: 'production',
                status: 'running',
                provider: 'Azure',
                region: 'east-us',
                lastDeployed: '1 day ago',
                resources: {
                    cpu: '6 cores',
                    memory: '24 GB',
                    storage: '300 GB SSD',
                    network: '10 Gbps'
                },
                healthScore: 96,
                uptime: 99.5,
                activeServices: 5,
                totalServices: 5,
                cost: 567.40,
                alerts: 0
            },
            {
                id: '6',
                name: 'Database Staging',
                type: 'staging',
                status: 'maintenance',
                provider: 'GCP',
                region: 'europe-west1',
                lastDeployed: '6 hours ago',
                resources: {
                    cpu: '4 cores',
                    memory: '32 GB',
                    storage: '500 GB SSD',
                    network: '5 Gbps'
                },
                healthScore: 75,
                uptime: 95.8,
                activeServices: 3,
                totalServices: 4,
                cost: 389.60,
                alerts: 1
            }
        ])

        // Simulate loading deployment activity
        setDeploymentActivity([
            {
                id: '1',
                environment: 'CODAI Production',
                action: 'deploy',
                status: 'success',
                user: 'john.doe',
                timestamp: '2 hours ago',
                duration: '4m 32s',
                changes: ['Updated API gateway', 'Deployed new auth service', 'Updated frontend assets']
            },
            {
                id: '2',
                environment: 'Frontend Staging',
                action: 'update',
                status: 'success',
                user: 'jane.smith',
                timestamp: '4 hours ago',
                duration: '2m 18s',
                changes: ['Updated React components', 'Fixed responsive layout issues']
            },
            {
                id: '3',
                environment: 'ML Training Cluster',
                action: 'deploy',
                status: 'in_progress',
                user: 'ai.system',
                timestamp: '30 minutes ago',
                duration: '15m 45s',
                changes: ['Deploying new ML models', 'Setting up training pipelines']
            },
            {
                id: '4',
                environment: 'API Development',
                action: 'restart',
                status: 'success',
                user: 'mike.johnson',
                timestamp: '1 hour ago',
                duration: '1m 23s',
                changes: ['Restarted database service', 'Applied configuration updates']
            }
        ])
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
            case 'stopped': return 'text-slate-600 bg-slate-50 border-slate-200'
            case 'deploying': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'error': return 'text-red-600 bg-red-50 border-red-200'
            case 'maintenance': return 'text-amber-600 bg-amber-50 border-amber-200'
            default: return 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'production': return 'bg-red-100 text-red-800'
            case 'staging': return 'bg-yellow-100 text-yellow-800'
            case 'development': return 'bg-green-100 text-green-800'
            case 'testing': return 'bg-purple-100 text-purple-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'AWS': return <Cloud className="w-4 h-4 text-orange-500" />
            case 'Azure': return <Cloud className="w-4 h-4 text-blue-500" />
            case 'GCP': return <Cloud className="w-4 h-4 text-green-500" />
            default: return <Server className="w-4 h-4 text-slate-500" />
        }
    }

    const getHealthScoreColor = (score: number) => {
        if (score >= 95) return 'text-emerald-600'
        if (score >= 80) return 'text-yellow-600'
        return 'text-red-600'
    }

    const filteredEnvironments = environments.filter(env => {
        const matchesType = filterType === 'all' || env.type === filterType
        const matchesStatus = filterStatus === 'all' || env.status === filterStatus
        return matchesType && matchesStatus
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                                Environments Management
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Orchestrate and monitor development environments with AI-powered insights
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                New Environment
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Environment Metrics */}
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
                                    <p className="text-slate-600 text-sm">Total Environments</p>
                                    <p className="text-2xl font-bold text-slate-900">{metrics.totalEnvironments}</p>
                                    <p className="text-xs text-emerald-600 mt-1">{metrics.activeEnvironments} active</p>
                                </div>
                                <Database className="w-8 h-8 text-blue-600" />
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
                                    <p className="text-slate-600 text-sm">Monthly Cost</p>
                                    <p className="text-2xl font-bold text-slate-900">${metrics.totalCost}</p>
                                    <p className="text-xs text-slate-500 mt-1">Across all providers</p>
                                </div>
                                <Server className="w-8 h-8 text-emerald-600" />
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
                                    <p className="text-slate-600 text-sm">Average Uptime</p>
                                    <p className="text-2xl font-bold text-emerald-600">{metrics.averageUptime}%</p>
                                    <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                                </div>
                                <Monitor className="w-8 h-8 text-purple-600" />
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
                                    <p className="text-slate-600 text-sm">Active Alerts</p>
                                    <p className="text-2xl font-bold text-red-600">{metrics.activeAlerts}</p>
                                    <p className="text-xs text-slate-500 mt-1">{metrics.deploymentsToday} deployments today</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Filters and Controls */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Types</option>
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                    <option value="development">Development</option>
                                    <option value="testing">Testing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="running">Running</option>
                                    <option value="stopped">Stopped</option>
                                    <option value="deploying">Deploying</option>
                                    <option value="error">Error</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Layers className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Environments Grid/List */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8' : 'space-y-4 mb-8'}>
                    {filteredEnvironments.map((environment, index) => (
                        <motion.div
                            key={environment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-slate-900">{environment.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(environment.type)}`}>
                                            {environment.type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                                        {getProviderIcon(environment.provider)}
                                        <span>{environment.provider}</span>
                                        <span>•</span>
                                        <span>{environment.region}</span>
                                    </div>

                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(environment.status)}`}>
                                        {environment.status === 'running' && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {environment.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                                        {environment.status === 'deploying' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                                        {environment.status}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4 text-slate-600" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-slate-600" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Resource Usage */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                        <Cpu className="w-3 h-3" />
                                        <span>CPU</span>
                                    </div>
                                    <p className="font-semibold text-slate-900 text-sm">{environment.resources.cpu}</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                        <MemoryStick className="w-3 h-3" />
                                        <span>Memory</span>
                                    </div>
                                    <p className="font-semibold text-slate-900 text-sm">{environment.resources.memory}</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                        <HardDrive className="w-3 h-3" />
                                        <span>Storage</span>
                                    </div>
                                    <p className="font-semibold text-slate-900 text-sm">{environment.resources.storage}</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                        <Network className="w-3 h-3" />
                                        <span>Network</span>
                                    </div>
                                    <p className="font-semibold text-slate-900 text-sm">{environment.resources.network}</p>
                                </div>
                            </div>

                            {/* Health and Metrics */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Health Score</p>
                                    <p className={`font-semibold ${getHealthScoreColor(environment.healthScore)}`}>
                                        {environment.healthScore > 0 ? `${environment.healthScore}%` : 'N/A'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Uptime</p>
                                    <p className="font-semibold text-emerald-600">{environment.uptime}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Services</p>
                                    <p className="font-semibold text-blue-600">{environment.activeServices}/{environment.totalServices}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 text-xs">Cost/Month</p>
                                    <p className="font-semibold text-purple-600">${environment.cost.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={environment.status === 'deploying'}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {environment.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {environment.status === 'running' ? 'Stop' : 'Start'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Terminal className="w-4 h-4" />
                                    Console
                                </motion.button>
                            </div>

                            {/* Last Deployed */}
                            <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Last deployed {environment.lastDeployed}</span>
                                {environment.alerts > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-red-600 font-medium">{environment.alerts} alert{environment.alerts > 1 ? 's' : ''}</span>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Deployment Activity */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                        Recent Deployment Activity
                    </h3>
                    <div className="space-y-4">
                        {deploymentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                                <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                        activity.status === 'failed' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {activity.action === 'deploy' && <Upload className="w-4 h-4" />}
                                    {activity.action === 'update' && <RefreshCw className="w-4 h-4" />}
                                    {activity.action === 'rollback' && <Download className="w-4 h-4" />}
                                    {activity.action === 'scale' && <Layers className="w-4 h-4" />}
                                    {activity.action === 'restart' && <Play className="w-4 h-4" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-slate-900">{activity.environment}</h4>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-sm text-slate-600 capitalize">{activity.action}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                activity.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {activity.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="text-sm text-slate-600 mb-2">
                                        {activity.changes.join(' • ')}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>By {activity.user}</span>
                                        <span>{activity.timestamp}</span>
                                        <span>Duration: {activity.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Enterprise Environment Management
                        </h3>
                        <p className="text-slate-600 max-w-3xl mx-auto">
                            AIDE provides comprehensive environment orchestration with automated scaling,
                            intelligent monitoring, cost optimization, and seamless multi-cloud deployment
                            capabilities across AWS, Azure, and Google Cloud Platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_Environments
