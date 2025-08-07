import React from 'react'
/**
 * TeamStats Component - Analytics overview cards
 */
'use client'

import { motion } from 'framer-motion'
import { Users, UserCheck, TrendingUp, Target, Crown, Shield, Activity, Clock } from 'lucide-react'
import { StatsCard } from '../../shared/StatsCard'

interface TeamAnalytics {
    totalMembers: number
    onlineMembers: number
    avgProductivity: number
    totalTasks: number
    completedTasks: number
    managers: number
    teamLeads: number
    completionRate: number
}

interface TeamStatsProps {
    analytics: TeamAnalytics
}

export function TeamStats({ analytics }: TeamStatsProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
                {[
                    {
                        title: 'Total Members',
                        value: analytics.totalMembers,
                        icon: Users,
                        color: 'blue' as const,
                        subtitle: 'Active team members'
                    },
                    {
                        title: 'Online Now',
                        value: analytics.onlineMembers,
                        icon: UserCheck,
                        color: 'green' as const,
                        trend: { value: 15.2, positive: true, period: 'vs yesterday' }
                    },
                    {
                        title: 'Avg Productivity',
                        value: `${analytics.avgProductivity.toFixed(1)}%`,
                        icon: TrendingUp,
                        color: 'purple' as const,
                        trend: { value: 8.7, positive: true, period: 'this week' }
                    },
                    {
                        title: 'Task Completion',
                        value: `${analytics.completionRate.toFixed(1)}%`,
                        icon: Target,
                        color: 'orange' as const,
                        trend: { value: 12.3, positive: true, period: 'this month' }
                    },
                    {
                        title: 'Total Tasks',
                        value: analytics.totalTasks,
                        icon: Activity,
                        color: 'indigo' as const,
                        subtitle: 'Active assignments'
                    },
                    {
                        title: 'Completed',
                        value: analytics.completedTasks,
                        icon: Clock,
                        color: 'green' as const,
                        subtitle: 'Tasks finished'
                    },
                    {
                        title: 'Team Leads',
                        value: analytics.teamLeads,
                        icon: Crown,
                        color: 'yellow' as const,
                        subtitle: 'Leadership roles'
                    },
                    {
                        title: 'Managers',
                        value: analytics.managers,
                        icon: Shield,
                        color: 'red' as const,
                        subtitle: 'Management tier'
                    }
                ].map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <StatsCard {...metric} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

