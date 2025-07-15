'use client'

import { motion } from 'framer-motion'
import {
    Zap,
    Shield,
    Globe,
    BarChart3,
    Cpu,
    Database,
    CheckCircle,
    ArrowRight
} from 'lucide-react'

export interface FeatureData {
    id: string
    title: string
    description: string
    icon: string
    status: 'active' | 'inactive' | 'pending'
    progress: number
    color: string
}

interface FeatureShowcaseProps {
    features: FeatureData[]
    theme: string
}

const iconMap = {
    Zap,
    Shield,
    Globe,
    BarChart3,
    Cpu,
    Database
}

export function FeatureShowcase({ features, theme }: FeatureShowcaseProps) {
    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                    Platform Features
                </h2>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                    Discover the advanced capabilities that power our memory management system
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                    const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Cpu

                    return (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="glassmorphism rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all group"
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-lg flex items-center justify-center`}>
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">{feature.status}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Progress</span>
                                    <span className="text-white font-medium">{feature.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <motion.div
                                        className={`bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-400 h-2 rounded-full`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${feature.progress}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <motion.button
                                    className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 transition-colors group-hover:scale-110"
                                    whileHover={{ x: 5 }}
                                >
                                    <span className="text-sm">Learn More</span>
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
