'use client'

import { motion } from 'framer-motion'
import { Play, Pause, Download, Upload, RefreshCw, Settings } from 'lucide-react'
import { useState } from 'react'

interface ActionPanelProps {
    colorScheme: {
        primary: string
        secondary: string
        accent: string
    }
}

export function ActionPanel({ colorScheme }: ActionPanelProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    const actions = [
        { id: 'start', label: 'Start Analysis', icon: Play },
        { id: 'pause', label: 'Pause Process', icon: Pause },
        { id: 'refresh', label: 'Refresh Data', icon: RefreshCw },
        { id: 'download', label: 'Export Report', icon: Download },
        { id: 'upload', label: 'Import Data', icon: Upload },
        { id: 'settings', label: 'Configure', icon: Settings }
    ]

    const handleAction = (actionId: string) => {
        setIsProcessing(true)
        setTimeout(() => setIsProcessing(false), 2000)
    }

    return (
        <motion.div
            className="glassmorphism rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <h2 className="text-2xl font-bold mb-6 text-yellow-400">
                Quick Actions
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => {
                    const IconComponent = action.icon

                    return (
                        <motion.button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={isProcessing}
                            className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <IconComponent className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-white font-medium">{action.label}</span>
                        </motion.button>
                    )
                })}
            </div>

            {isProcessing && (
                <motion.div
                    className="mt-6 p-4 bg-yellow-500/20 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                        <span className="text-yellow-400">Processing action...</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
