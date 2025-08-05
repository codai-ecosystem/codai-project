'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    Network,
    Zap,
    Shield,
    Users,
    TrendingUp,
    Database,
    Globe,
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu,
    HardDrive,
    Wifi,
    Monitor
} from 'lucide-react'

interface EcosystemApp {
    id: string
    name: string
    status: 'online' | 'offline' | 'maintenance'
    health: number
    users: number
    responseTime: number
    uptime: number
    version: string
    lastDeployment: Date
    metrics: {
        cpu: number
        memory: number
        requests: number
        errors: number
    }
}

interface SystemMetrics {
    totalRequests: number
    totalUsers: number
    averageResponseTime: number
    systemHealth: number
    errorRate: number
    uptime: number
}

export function EcosystemMonitor() {
    const [apps, setApps] = useState<EcosystemApp[]>([
        {
            id: 'codai',
            name: 'CODAI Central',
            status: 'online',
            health: 98,
            users: 1250,
            responseTime: 45,
            uptime: 99.9,
            version: '2.1.0',
            lastDeployment: new Date('2025-07-06T08:00:00'),
            metrics: { cpu: 35, memory: 60, requests: 15420, errors: 2 }
        },
        {
            id: 'memorai',
            name: 'MEMORAI',
            status: 'online',
            health: 96,
            users: 890,
            responseTime: 32,
            uptime: 99.8,
            version: '1.8.5',
            lastDeployment: new Date('2025-07-06T07:30:00'),
            metrics: { cpu: 28, memory: 45, requests: 8730, errors: 1 }
        },
        {
            id: 'logai',
            name: 'LOGAI Auth',
            status: 'online',
            health: 99,
            users: 2100,
            responseTime: 18,
            uptime: 99.99,
            version: '3.2.1',
            lastDeployment: new Date('2025-07-06T06:15:00'),
            metrics: { cpu: 22, memory: 38, requests: 25640, errors: 0 }
        },
        {
            id: 'studiai',
            name: 'STUDIAI',
            status: 'maintenance',
            health: 0,
            users: 0,
            responseTime: 0,
            uptime: 95.2,
            version: '1.5.2',
            lastDeployment: new Date('2025-07-05T14:00:00'),
            metrics: { cpu: 0, memory: 0, requests: 0, errors: 0 }
        },
        {
            id: 'fabricai',
            name: 'FABRICAI',
            status: 'online',
            health: 94,
            users: 445,
            responseTime: 78,
            uptime: 98.7,
            version: '2.0.3',
            lastDeployment: new Date('2025-07-06T05:45:00'),
            metrics: { cpu: 42, memory: 55, requests: 5230, errors: 3 }
        },
        {
            id: 'bancai',
            name: 'BANCAI',
            status: 'online',
            health: 97,
            users: 1680,
            responseTime: 52,
            uptime: 99.5,
            version: '4.1.0',
            lastDeployment: new Date('2025-07-06T04:20:00'),
            metrics: { cpu: 38, memory: 62, requests: 12450, errors: 1 }
        }
    ])

    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
        totalRequests: 67470,
        totalUsers: 6365,
        averageResponseTime: 37.5,
        systemHealth: 96.8,
        errorRate: 0.012,
        uptime: 99.2
    })

    const [selectedApp, setSelectedApp] = useState<string | null>(null)

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setApps(prev => prev.map(app => ({
                ...app,
                health: Math.max(85, Math.min(100, app.health + (Math.random() - 0.5) * 2)),
                users: Math.max(0, app.users + Math.floor((Math.random() - 0.5) * 50)),
                responseTime: Math.max(10, app.responseTime + (Math.random() - 0.5) * 10),
                metrics: {
                    ...app.metrics,
                    cpu: Math.max(0, Math.min(100, app.metrics.cpu + (Math.random() - 0.5) * 5)),
                    memory: Math.max(0, Math.min(100, app.metrics.memory + (Math.random() - 0.5) * 3)),
                    requests: app.metrics.requests + Math.floor(Math.random() * 100),
                    errors: Math.max(0, app.metrics.errors + (Math.random() > 0.95 ? 1 : 0))
                }
            })))

            setSystemMetrics(prev => ({
                ...prev,
                totalRequests: prev.totalRequests + Math.floor(Math.random() * 500),
                totalUsers: Math.max(5000, prev.totalUsers + Math.floor((Math.random() - 0.5) * 100)),
                averageResponseTime: Math.max(20, prev.averageResponseTime + (Math.random() - 0.5) * 5),
                systemHealth: Math.max(90, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 1)),
                errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.01))
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30'
            case 'offline': return 'text-red-400 bg-red-400/20 border-red-400/30'
            case 'maintenance': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
            default: return 'text-slate-400 bg-slate-400/20 border-slate-400/30'
        }
    }

    const getHealthColor = (health: number) => {
        if (health >= 95) return 'text-emerald-400'
        if (health >= 85) return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <div className="space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{systemMetrics.totalUsers.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Total Users</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{systemMetrics.totalRequests.toLocaleString()}</div>
                            <div className="text-xs text-slate-400">Total Requests</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{systemMetrics.averageResponseTime.toFixed(1)}ms</div>
                            <div className="text-xs text-slate-400">Avg Response</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{systemMetrics.systemHealth.toFixed(1)}%</div>
                            <div className="text-xs text-slate-400">System Health</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{(systemMetrics.errorRate * 100).toFixed(3)}%</div>
                            <div className="text-xs text-slate-400">Error Rate</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="glassmorphism rounded-xl p-4 border border-white/20"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{systemMetrics.uptime.toFixed(1)}%</div>
                            <div className="text-xs text-slate-400">Uptime</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Apps Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {apps.map((app) => (
                    <motion.div
                        key={app.id}
                        className={`glassmorphism rounded-xl p-6 border border-white/20 cursor-pointer transition-all ${selectedApp === app.id ? 'ring-2 ring-blue-500/50' : ''
                            }`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <Network className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{app.name}</h3>
                                    <p className="text-sm text-slate-400">v{app.version}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(app.status)}`}>
                                {app.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-sm text-slate-400">Health</div>
                                <div className={`text-xl font-bold ${getHealthColor(app.health)}`}>
                                    {app.health}%
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400">Users</div>
                                <div className="text-xl font-bold text-white">{app.users.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400">Response</div>
                                <div className="text-xl font-bold text-white">{app.responseTime}ms</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400">Uptime</div>
                                <div className="text-xl font-bold text-white">{app.uptime}%</div>
                            </div>
                        </div>

                        {selectedApp === app.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-white/10 pt-4 space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Cpu className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-slate-300">CPU: {app.metrics.cpu}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <HardDrive className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-slate-300">Memory: {app.metrics.memory}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Activity className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm text-slate-300">Requests: {app.metrics.requests.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                        <span className="text-sm text-slate-300">Errors: {app.metrics.errors}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500">
                                    Last deployment: {app.lastDeployment.toLocaleString()}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Real-time Activity Feed */}
            <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Real-time Activity</span>
                </h3>

                <div className="space-y-3">
                    {apps.slice(0, 4).map((app, index) => (
                        <motion.div
                            key={`${app.id}-activity-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${app.status === 'online' ? 'bg-emerald-400 animate-pulse' :
                                        app.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                                    }`} />
                                <span className="text-white">{app.name}</span>
                                <span className="text-sm text-slate-400">
                                    {Math.floor(Math.random() * 50) + 10} requests/min
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-emerald-400">Healthy</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
