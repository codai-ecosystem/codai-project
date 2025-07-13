'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import type { MobileFeature, ColorScheme } from '../types'

interface FeatureCardProps {
    feature: MobileFeature
    colorScheme: ColorScheme
    delay?: number
}

export function FeatureCard({ feature, colorScheme, delay = 0 }: FeatureCardProps) {
    const IconComponent = feature.icon as LucideIcon

    return (
        <motion.div
            className="glassmorphism rounded-xl p-6 group hover:bg-white/15 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5, scale: 1.02 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${feature.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : feature.status === 'inactive'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {feature.status}
                </span>
            </div>

            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                {feature.title}
            </h3>

            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {feature.description}
            </p>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-blue-400 font-medium">{feature.progress}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <motion.div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.progress}%` }}
                        transition={{ duration: 1, delay: delay + 0.5 }}
                    />
                </div>
            </div>
        </motion.div>
    )
}
