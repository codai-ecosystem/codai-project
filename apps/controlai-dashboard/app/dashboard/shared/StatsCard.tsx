import React from 'react'
/**
 * Shared StatsCard Component - Reusable metrics card
 */
'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: any
    trend?: { value: number; positive: boolean; period?: string }
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'indigo'
    loading?: boolean
    onClick?: () => void
    subtitle?: string
    actions?: React.ReactNode
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'blue',
    loading = false,
    onClick,
    subtitle,
    actions
}: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
        red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        pink: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
        indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
    }

    return (
        <motion.div
            className={`
        bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900
        rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 group
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:scale-[1.02]' : ''}
      `}
            onClick={onClick}
            whileHover={onClick ? { y: -2 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                        {actions && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {actions}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                    ) : (
                        <>
                            <motion.p
                                className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {value}
                            </motion.p>

                            {subtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {subtitle}
                                </p>
                            )}

                            {trend && (
                                <motion.div
                                    className={`flex items-center text-xs ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {trend.positive ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                    )}
                                    {trend.positive ? '+' : ''}{trend.value}%
                                    {trend.period && <span className="ml-1">{trend.period}</span>}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                <motion.div
                    className={`p-3 rounded-xl ${colorClasses[color]} flex-shrink-0`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                >
                    <Icon className="w-6 h-6" />
                </motion.div>
            </div>
        </motion.div>
    )
}

