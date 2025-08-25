'use client'

import React from 'react'
/**
 * Project Stats Component - Key metrics and analytics cards
 */

import { motion } from 'framer-motion'
import {
    FolderKanban, TrendingUp, TrendingDown, Clock, DollarSign,
    Target, Users, AlertTriangle, CheckCircle2, Calendar,
    BarChart3, PieChart, Activity
} from 'lucide-react'
import { StatsCard } from '../../shared/StatsCard'

interface ProjectStatsProps {
    analytics: {
        totalProjects: number
        activeProjects: number
        completedProjects: number
        overdueProjects: number
        totalBudget: number
        totalSpent: number
        avgProgress: number
        totalTasks: number
        completedTasks: number
        completionRate: number
        budgetUtilization: number
        taskCompletionRate: number
    }
}

export function ProjectStats({ analytics }: ProjectStatsProps) {
    const statsCards = [
        {
            title: 'Total Projects',
            value: analytics.totalProjects.toString(),
            change: '+12%',
            trend: 'up' as const,
            icon: FolderKanban,
            color: 'blue' as const,
            description: 'All projects in portfolio'
        },
        {
            title: 'Active Projects',
            value: analytics.activeProjects.toString(),
            change: '+8%',
            trend: 'up' as const,
            icon: Activity,
            color: 'green' as const,
            description: 'Currently in development'
        },
        {
            title: 'Completion Rate',
            value: `${Math.round(analytics.completionRate)}%`,
            change: '+5%',
            trend: 'up' as const,
            icon: CheckCircle2,
            color: 'green' as const,
            description: 'Projects completed successfully'
        },
        {
            title: 'Budget Utilization',
            value: `${Math.round(analytics.budgetUtilization)}%`,
            change: analytics.budgetUtilization > 85 ? '+2%' : '-3%',
            trend: analytics.budgetUtilization > 85 ? 'up' as const : 'down' as const,
            icon: DollarSign,
            color: analytics.budgetUtilization > 85 ? 'yellow' as const : 'green' as const,
            description: `$${(analytics.totalSpent / 1000).toFixed(0)}K of $${(analytics.totalBudget / 1000).toFixed(0)}K spent`
        },
        {
            title: 'Average Progress',
            value: `${Math.round(analytics.avgProgress)}%`,
            change: '+7%',
            trend: 'up' as const,
            icon: TrendingUp,
            color: 'blue' as const,
            description: 'Across all active projects'
        },
        {
            title: 'Task Completion',
            value: `${Math.round(analytics.taskCompletionRate)}%`,
            change: '+4%',
            trend: 'up' as const,
            icon: Target,
            color: 'green' as const,
            description: `${analytics.completedTasks} of ${analytics.totalTasks} tasks`
        }
    ]

    // Add overdue projects if any
    if (analytics.overdueProjects > 0) {
        statsCards.push({
            title: 'Overdue Projects',
            value: analytics.overdueProjects.toString(),
            change: analytics.overdueProjects > 2 ? '+15%' : '-5%',
            trend: analytics.overdueProjects > 2 ? 'up' as const : 'down' as const,
            icon: AlertTriangle,
            color: 'red' as const,
            description: 'Requiring immediate attention'
        })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <StatsCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                {/* Additional insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Progress distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Progress Distribution
                            </h3>
                            <PieChart className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Planning (0-25%)</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {/* Calculate based on actual data */}
                                    1 project
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Development (26-75%)</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    2 projects
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Near completion (76-100%)</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    1 project
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Budget insights */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Budget Overview
                            </h3>
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${(analytics.totalBudget / 1000).toFixed(0)}K
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: '100%' }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${(analytics.totalSpent / 1000).toFixed(0)}K
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${analytics.budgetUtilization > 85
                                                ? 'bg-yellow-500'
                                                : analytics.budgetUtilization > 70
                                                    ? 'bg-blue-500'
                                                    : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(analytics.budgetUtilization, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${((analytics.totalBudget - analytics.totalSpent) / 1000).toFixed(0)}K
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gray-400 h-2 rounded-full"
                                        style={{ width: `${Math.max(100 - analytics.budgetUtilization, 0)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}


