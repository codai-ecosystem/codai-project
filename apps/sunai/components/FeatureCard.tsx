'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface SunaiFeature {
    id: string
    title: string
    description: string
    status: string
    icon: LucideIcon
    progress: number
}

interface FeatureCardProps {
    feature: SunaiFeature
    colorScheme: {
        primary: string
        secondary: string
        accent: string
    }
    delay?: number
}

export function FeatureCard({ feature, colorScheme, delay = 0 }: FeatureCardProps) {
    const IconComponent = feature.icon

    return (
        <motion.div
            className="glassmorphism rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02, y: -5 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <IconComponent className="w-6 h-6 text-yellow-400" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${feature.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                    {feature.status}
                </span>
            </div>

            <h3 className="text-lg font-semibold mb-2 text-white">
                {feature.title}
            </h3>

            <p className="text-slate-300 text-sm mb-4">
                {feature.description}
            </p>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-yellow-400">{feature.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${feature.progress}%` }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

