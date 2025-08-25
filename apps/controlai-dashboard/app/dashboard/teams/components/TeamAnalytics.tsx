'use client'

import React from 'react'
/**
 * TeamAnalytics Component - Comprehensive team performance analytics
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, PieChart, TrendingUp, TrendingDown, Users, Clock,
    Target, Activity, Star, Award, Calendar, Filter, Download,
    Eye, UserCheck, Zap, Shield, Crown, MapPin, Briefcase
} from 'lucide-react'
import { TeamMember } from '../page'

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

interface TeamAnalyticsProps {
    members: TeamMember[]
    analytics: TeamAnalytics
}

export function TeamAnalytics({ members, analytics }: TeamAnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('30d')
    const [selectedMetric, setSelectedMetric] = useState('productivity')

    // Analytics calculations
    const departmentBreakdown = useMemo(() => {
        const departments = members.reduce((acc, member) => {
            acc[member.department] = (acc[member.department] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(departments).map(([name, count]) => ({
            name,
            count,
            percentage: (count / members.length) * 100
        }))
    }, [members])

    const skillsAnalysis = useMemo(() => {
        const skills = members.flatMap(m => m.skills)
        const skillCounts = skills.reduce((acc, skill) => {
            acc[skill] = (acc[skill] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }))
    }, [members])

    const productivityTrends = useMemo(() => {
        return members.map(member => ({
            name: member.name,
            productivity: member.productivity,
            tasks: member.tasksCount,
            completed: member.completedTasks,
            efficiency: member.tasksCount > 0 ? (member.completedTasks / member.tasksCount) * 100 : 0
        })).sort((a, b) => b.productivity - a.productivity)
    }, [members])

    const locationDistribution = useMemo(() => {
        const locations = members.reduce((acc, member) => {
            const location = member.location === 'Remote' ? 'Remote' : member.location.split(',')[1]?.trim() || member.location
            acc[location] = (acc[location] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(locations).map(([location, count]) => ({
            location,
            count,
            percentage: (count / members.length) * 100
        }))
    }, [members])

    const performanceMetrics = [
        {
            title: 'Top Performers',
            value: members.filter(m => m.productivity >= 90).length,
            total: members.length,
            color: 'green',
            icon: Star,
            trend: 12.5
        },
        {
            title: 'Task Champions',
            value: members.filter(m => m.completedTasks >= 10).length,
            total: members.length,
            color: 'blue',
            icon: Target,
            trend: 8.3
        },
        {
            title: 'Team Leaders',
            value: members.filter(m => m.isManager || m.isTeamLead).length,
            total: members.length,
            color: 'purple',
            icon: Crown,
            trend: 0
        },
        {
            title: 'Active Members',
            value: members.filter(m => m.status === 'online').length,
            total: members.length,
            color: 'orange',
            icon: Activity,
            trend: 15.7
        }
    ]

    return (
        <div className="space-y-8">
            {/* Analytics Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Team Performance Analytics
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Comprehensive insights into team productivity, collaboration, and growth
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>

                        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Key Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceMetrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                                    <metric.icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                                </div>
                                {metric.trend !== 0 && (
                                    <div className={`flex items-center text-sm ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {metric.trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                        {Math.abs(metric.trend)}%
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {metric.title}
                            </h3>

                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metric.value}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    of {metric.total}
                                </span>
                            </div>

                            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <motion.div
                                    className={`bg-${metric.color}-500 h-2 rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(metric.value / metric.total) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Distribution */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Department Distribution
                        </h3>
                        <PieChart className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="space-y-4">
                        {departmentBreakdown.map((dept, index) => (
                            <motion.div
                                key={dept.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-4 h-4 rounded-full bg-blue-${(index + 1) * 100}`} />
                                    <span className="text-gray-700 dark:text-gray-300">{dept.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {dept.count} members
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {dept.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Productivity Rankings */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Productivity Rankings
                        </h3>
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="space-y-3">
                        {productivityTrends.slice(0, 5).map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {member.name}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {member.productivity}%
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {member.completed}/{member.tasks} tasks
                                        </div>
                                    </div>
                                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <motion.div
                                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${member.productivity}%` }}
                                            transition={{ duration: 1, delay: index * 0.2 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skills & Location Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Skills */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Most Common Skills
                        </h3>
                        <Zap className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="space-y-3">
                        {skillsAnalysis.map((skill, index) => (
                            <motion.div
                                key={skill.skill}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between"
                            >
                                <span className="text-gray-700 dark:text-gray-300">{skill.skill}</span>
                                <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <motion.div
                                            className="bg-purple-500 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(skill.count / members.length) * 100}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                                        {skill.count}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Location Distribution */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Team Locations
                        </h3>
                        <MapPin className="w-5 h-5 text-gray-500" />
                    </div>

                    <div className="space-y-4">
                        {locationDistribution.map((location, index) => (
                            <motion.div
                                key={location.location}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {location.location}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {location.count} members
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {location.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Summary */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Team Performance Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {analytics.avgProductivity.toFixed(1)}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Average Productivity</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {analytics.completionRate.toFixed(1)}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Task Completion Rate</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                            {((analytics.onlineMembers / analytics.totalMembers) * 100).toFixed(1)}%
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Team Availability</div>
                    </div>
                </div>
            </div>
        </div>
    )
}


