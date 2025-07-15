'use client'

import { motion } from 'framer-motion'
import {
    Activity,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Cpu,
    HardDrive,
    Wifi,
    Database
} from 'lucide-react'

export interface LiveMetric {
    id: string
    name: string
    value: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    color: string
}

interface RealTimeMonitorProps {
    metrics: LiveMetric[]
    theme: string
}

export function RealTimeMonitor({ metrics, theme }: RealTimeMonitorProps) {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return TrendingUp
            case 'down': return AlertTriangle
            default: return Activity
        }
    }

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'up': return 'text-emerald-400'
            case 'down': return 'text-red-400'
            default: return 'text-slate-400'
        }
    }

    const getMetricIcon = (name: string) => {
        if (name.toLowerCase().includes('cpu')) return Cpu
        if (name.toLowerCase().includes('memory') || name.toLowerCase().includes('disk')) return HardDrive
        if (name.toLowerCase().includes('network')) return Wifi
        return Database
    }

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                    Real-Time System Monitor
                </h2>
                <p className="text-lg text-slate-400">
                    Live monitoring of system performance and health metrics
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                    const TrendIcon = getTrendIcon(metric.trend)
                    const MetricIcon = getMetricIcon(metric.name)

                    return (
                        <motion.div
                            key={metric.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="glassmorphism rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 rounded-lg flex items-center justify-center`}>
                                    <MetricIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                                    <TrendIcon className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase">{metric.trend}</span>
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="text-2xl font-bold text-white mb-1">
                                    {metric.value.toFixed(1)}{metric.unit}
                                </div>
                                <div className="text-sm text-slate-400">{metric.name}</div>
                            </div>

                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <motion.div
                                    className={`bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 h-2 rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, metric.value)}%` }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-3 text-xs">
                                <span className="text-slate-500">0</span>
                                <span className="text-slate-500">100</span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glassmorphism rounded-xl p-6 border border-white/20"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">System Status</h3>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">All Systems Operational</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400 mb-2">99.9%</div>
                        <div className="text-sm text-slate-400">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                            {metrics.reduce((sum, metric) => sum + metric.value, 0).toFixed(0)}
                        </div>
                        <div className="text-sm text-slate-400">Total Load</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
                        <div className="text-sm text-slate-400">Critical Alerts</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
