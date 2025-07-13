'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Brain,
    Shield,
    Database,
    CreditCard,
    Wallet,
    BookOpen,
    Settings,
    BarChart3,
    Users,
    Globe,
    Zap,
    Activity,
    ExternalLink,
    Play,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react'

interface AppStatus {
    id: string
    name: string
    description: string
    port: number
    url: string
    status: 'online' | 'offline' | 'starting' | 'error'
    icon: any
    category: 'foundation' | 'business' | 'admin'
    healthScore: number
    lastCheck: Date
    version: string
    uptime: number
}

export default function EcosystemPage() {
    const [apps, setApps] = useState<AppStatus[]>([
        {
            id: 'codai',
            name: 'CODAI',
            description: 'Central Platform & AIDE Hub',
            port: 4030,
            url: 'http://localhost:4030',
            status: 'online',
            icon: Brain,
            category: 'foundation',
            healthScore: 98,
            lastCheck: new Date(),
            version: '1.0.0',
            uptime: 99.9
        },
        {
            id: 'memorai',
            name: 'MEMORAI',
            description: 'AI Memory & Database Core',
            port: 4031,
            url: 'http://localhost:4031',
            status: 'online',
            icon: Database,
            category: 'foundation',
            healthScore: 95,
            lastCheck: new Date(),
            version: '3.0.0',
            uptime: 99.8
        },
        {
            id: 'logai',
            name: 'LOGAI',
            description: 'Identity & Access Control',
            port: 4032,
            url: 'http://localhost:4032',
            status: 'online',
            icon: Shield,
            category: 'foundation',
            healthScore: 97,
            lastCheck: new Date(),
            version: '2.1.0',
            uptime: 99.7
        },
        {
            id: 'bancai',
            name: 'BANCAI',
            description: 'Financial Engine & KYC Core',
            port: 4033,
            url: 'http://localhost:4033',
            status: 'online',
            icon: CreditCard,
            category: 'business',
            healthScore: 96,
            lastCheck: new Date(),
            version: '1.5.0',
            uptime: 99.6
        },
        {
            id: 'fabricai',
            name: 'FABRICAI',
            description: 'AI Services Platform',
            port: 4034,
            url: 'http://localhost:4034',
            status: 'online',
            icon: Zap,
            category: 'business',
            healthScore: 94,
            lastCheck: new Date(),
            version: '1.2.0',
            uptime: 99.5
        },
        {
            id: 'wallet',
            name: 'WALLET',
            description: 'Smart Programmable Wallet',
            port: 4035,
            url: 'http://localhost:4035',
            status: 'online',
            icon: Wallet,
            category: 'business',
            healthScore: 93,
            lastCheck: new Date(),
            version: '1.3.0',
            uptime: 99.4
        },
        {
            id: 'admin',
            name: 'ADMIN',
            description: 'System Administration',
            port: 4036,
            url: 'http://localhost:4036',
            status: 'online',
            icon: Settings,
            category: 'admin',
            healthScore: 99,
            lastCheck: new Date(),
            version: '1.1.0',
            uptime: 99.9
        },
        {
            id: 'docs',
            name: 'DOCS',
            description: 'Documentation & Guides',
            port: 4037,
            url: 'http://localhost:4037',
            status: 'online',
            icon: BookOpen,
            category: 'admin',
            healthScore: 98,
            lastCheck: new Date(),
            version: '1.0.5',
            uptime: 99.8
        }
    ])

    const [globalStats, setGlobalStats] = useState({
        totalApps: 8,
        onlineApps: 8,
        averageHealth: 96.25,
        totalUptime: 99.7,
        requestsPerMinute: 2847,
        dataProcessed: '124.5 GB'
    })

    const [isRefreshing, setIsRefreshing] = useState(false)

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setApps(prevApps =>
                prevApps.map(app => ({
                    ...app,
                    healthScore: Math.max(85, Math.min(100, app.healthScore + (Math.random() - 0.5) * 2)),
                    lastCheck: new Date()
                }))
            )

            setGlobalStats(prev => ({
                ...prev,
                requestsPerMinute: Math.floor(Math.random() * 1000) + 2000,
                dataProcessed: `${(Math.random() * 50 + 100).toFixed(1)} GB`
            }))
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    const refreshAll = async () => {
        setIsRefreshing(true)
        // Simulate refresh delay
        setTimeout(() => {
            setIsRefreshing(false)
        }, 2000)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30'
            case 'offline': return 'text-red-400 bg-red-400/20 border-red-400/30'
            case 'starting': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
            case 'error': return 'text-red-400 bg-red-400/20 border-red-400/30'
            default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return CheckCircle
            case 'offline': return AlertCircle
            case 'starting': return Clock
            case 'error': return AlertCircle
            default: return Clock
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'foundation': return 'from-blue-500 to-cyan-500'
            case 'business': return 'from-purple-500 to-pink-500'
            case 'admin': return 'from-emerald-500 to-teal-500'
            default: return 'from-slate-500 to-gray-500'
        }
    }

    const foundationApps = apps.filter(app => app.category === 'foundation')
    const businessApps = apps.filter(app => app.category === 'business')
    const adminApps = apps.filter(app => app.category === 'admin')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-30">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    <motion.div
                        className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 100, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>
            </div>

            <div className="relative z-10 p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            Ecosystem Navigator
                        </h1>
                        <p className="text-slate-400">Unified dashboard for all CODAI applications</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 backdrop-blur-md rounded-lg border border-emerald-500/30">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-emerald-400 text-sm font-medium">All Systems Operational</span>
                        </div>
                        <button
                            onClick={refreshAll}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh All</span>
                        </button>
                    </div>
                </motion.div>

                {/* Global Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
                >
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-white">{globalStats.totalApps}</div>
                        <div className="text-xs text-slate-400">Total Apps</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{globalStats.onlineApps}</div>
                        <div className="text-xs text-slate-400">Online</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-blue-400">{globalStats.averageHealth.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400">Avg Health</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-purple-400">{globalStats.totalUptime}%</div>
                        <div className="text-xs text-slate-400">Uptime</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-cyan-400">{globalStats.requestsPerMinute.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Req/Min</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{globalStats.dataProcessed}</div>
                        <div className="text-xs text-slate-400">Data/Day</div>
                    </div>
                </motion.div>

                {/* Foundation Apps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded mr-3"></div>
                        Foundation Layer
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {foundationApps.map((app, index) => {
                            const StatusIcon = getStatusIcon(app.status)
                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(app.category)} rounded-lg flex items-center justify-center`}>
                                            <app.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            <span className="capitalize">{app.status}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{app.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Health Score</span>
                                            <span className="text-white font-medium">{app.healthScore}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <motion.div
                                                className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${app.healthScore}%` }}
                                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            Port: {app.port} | v{app.version}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={app.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors group-hover:scale-110"
                                            >
                                                <ExternalLink className="w-4 h-4 text-blue-400" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Business Apps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded mr-3"></div>
                        Business Layer
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {businessApps.map((app, index) => {
                            const StatusIcon = getStatusIcon(app.status)
                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(app.category)} rounded-lg flex items-center justify-center`}>
                                            <app.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            <span className="capitalize">{app.status}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{app.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Health Score</span>
                                            <span className="text-white font-medium">{app.healthScore}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <motion.div
                                                className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${app.healthScore}%` }}
                                                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            Port: {app.port} | v{app.version}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={app.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors group-hover:scale-110"
                                            >
                                                <ExternalLink className="w-4 h-4 text-purple-400" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Admin Apps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded mr-3"></div>
                        Administrative Layer
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {adminApps.map((app, index) => {
                            const StatusIcon = getStatusIcon(app.status)
                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(app.category)} rounded-lg flex items-center justify-center`}>
                                            <app.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            <span className="capitalize">{app.status}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{app.name}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{app.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Health Score</span>
                                            <span className="text-white font-medium">{app.healthScore}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <motion.div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${app.healthScore}%` }}
                                                transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            Port: {app.port} | v{app.version}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={app.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg transition-colors group-hover:scale-110"
                                            >
                                                <ExternalLink className="w-4 h-4 text-emerald-400" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* System Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">System Overview</h2>
                        <div className="text-sm text-slate-400">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-400 mb-2">
                                {apps.filter(app => app.status === 'online').length}/{apps.length}
                            </div>
                            <div className="text-slate-400 text-sm">Applications Online</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                {(apps.reduce((sum, app) => sum + app.healthScore, 0) / apps.length).toFixed(1)}%
                            </div>
                            <div className="text-slate-400 text-sm">Average Health Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">
                                {(apps.reduce((sum, app) => sum + app.uptime, 0) / apps.length).toFixed(1)}%
                            </div>
                            <div className="text-slate-400 text-sm">Average Uptime</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
