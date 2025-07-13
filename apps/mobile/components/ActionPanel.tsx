'use client'

import { motion } from 'framer-motion'
import {
    Play,
    Pause,
    RefreshCw,
    Download,
    Upload,
    Settings,
    Monitor,
    Database,
    Shield,
    Activity
} from 'lucide-react'
import type { ColorScheme } from '../types'

interface ActionPanelProps {
    colorScheme: ColorScheme
}

export function ActionPanel({ colorScheme }: ActionPanelProps) {
    const actions = [
        {
            id: 'deploy',
            label: 'Deploy App',
            description: 'Deploy to production environment',
            icon: Upload,
            color: 'from-emerald-500 to-teal-500',
            action: () => console.log('Deploy app')
        },
        {
            id: 'monitor',
            label: 'Monitor',
            description: 'View real-time monitoring',
            icon: Monitor,
            color: 'from-blue-500 to-cyan-500',
            action: () => console.log('Monitor app')
        },
        {
            id: 'backup',
            label: 'Backup',
            description: 'Create system backup',
            icon: Database,
            color: 'from-purple-500 to-indigo-500',
            action: () => console.log('Backup system')
        },
        {
            id: 'security',
            label: 'Security Scan',
            description: 'Run security assessment',
            icon: Shield,
            color: 'from-orange-500 to-red-500',
            action: () => console.log('Security scan')
        },
        {
            id: 'performance',
            label: 'Performance',
            description: 'Analyze performance metrics',
            icon: Activity,
            color: 'from-pink-500 to-rose-500',
            action: () => console.log('Performance analysis')
        },
        {
            id: 'settings',
            label: 'Configure',
            description: 'Update system settings',
            icon: Settings,
            color: 'from-slate-500 to-gray-500',
            action: () => console.log('Configure settings')
        }
    ]

    return (
        <motion.div
            className="glassmorphism rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-2">
                        Quick Actions
                    </h2>
                    <p className="text-slate-400">
                        Manage your mobile applications with enterprise-grade tools
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <motion.button
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Play className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Pause className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.action}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} bg-opacity-20`}>
                                <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                                    {action.label}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        System Status: <span className="text-emerald-400">All Systems Operational</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>Last Action: 2 minutes ago</span>
                        <span>•</span>
                        <span>Next Scheduled: 15 minutes</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
