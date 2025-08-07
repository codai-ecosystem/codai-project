import React from 'react'
/**
 * Project Analytics Component - Detailed analytics and reporting
 */
'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
    DollarSign, Users, Target, Clock, AlertTriangle,
    CheckCircle2, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Project } from '../page'

interface ProjectAnalyticsProps {
    projects: Project[]
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

export function ProjectAnalytics({ projects, analytics }: ProjectAnalyticsProps) {
    // Calculate additional analytics
    const statusDistribution = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const priorityDistribution = projects.reduce((acc, project) => {
        acc[project.priority] = (acc[project.priority] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const monthlyProgress = projects.map(project => ({
        name: project.name,
        progress: project.progress,
        budget: project.budget,
        spent: project.spent,
        status: project.status
    }))

    const teamPerformance = projects.reduce((acc, project) => {
        const efficiency = project.tasksCompleted / project.tasksTotal
        acc.push({
            project: project.name,
            teamSize: project.teamSize,
            efficiency: efficiency,
            progress: project.progress
        })
        return acc
    }, [] as Array<{ project: string; teamSize: number; efficiency: number; progress: number }>)

    const budgetAnalysis = {
        totalAllocated: analytics.totalBudget,
        totalSpent: analytics.totalSpent,
        remaining: analytics.totalBudget - analytics.totalSpent,
        utilizationRate: analytics.budgetUtilization,
        avgBudgetPerProject: analytics.totalBudget / analytics.totalProjects,
        avgSpentPerProject: analytics.totalSpent / analytics.totalProjects
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 dark:text-green-400'
            case 'planning': return 'text-blue-600 dark:text-blue-400'
            case 'on_hold': return 'text-yellow-600 dark:text-yellow-400'
            case 'review': return 'text-purple-600 dark:text-purple-400'
            case 'completed': return 'text-gray-600 dark:text-gray-400'
            case 'cancelled': return 'text-red-600 dark:text-red-400'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            {/* Overview cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(analytics.totalBudget)}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                12% from last quarter
                            </p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Math.round(analytics.completionRate)}%
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                5% improvement
                            </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                            <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Timeline</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                4.2 months
                            </p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                                <ArrowDownRight className="w-4 h-4 mr-1" />
                                0.3 months slower
                            </p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Efficiency</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Math.round(analytics.taskCompletionRate)}%
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                8% increase
                            </p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Project Status Distribution
                        </h3>
                        <PieChart className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {Object.entries(statusDistribution).map(([status, count]) => {
                            const percentage = (count / analytics.totalProjects) * 100
                            return (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${status === 'active' ? 'bg-green-500' :
                                                status === 'planning' ? 'bg-blue-500' :
                                                    status === 'on_hold' ? 'bg-yellow-500' :
                                                        status === 'review' ? 'bg-purple-500' :
                                                            status === 'completed' ? 'bg-gray-500' :
                                                                'bg-red-500'
                                            }`}></div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                            {status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {count}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ({Math.round(percentage)}%)
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Budget analysis */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Budget Analysis
                        </h3>
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(budgetAnalysis.totalAllocated)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(budgetAnalysis.totalSpent)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(budgetAnalysis.remaining)}
                            </span>
                        </div>
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Utilization Rate</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {Math.round(budgetAnalysis.utilizationRate)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${budgetAnalysis.utilizationRate > 85
                                            ? 'bg-red-500'
                                            : budgetAnalysis.utilizationRate > 70
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(budgetAnalysis.utilizationRate, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Project performance table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Project Performance Details
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Progress
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Budget Utilization
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Team Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Task Efficiency
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {projects.map((project) => {
                                const budgetUtilization = (project.spent / project.budget) * 100
                                const taskEfficiency = (project.tasksCompleted / project.tasksTotal) * 100

                                return (
                                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {project.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {project.priority} priority
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    project.status === 'planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        project.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                                                    <div
                                                        className={`h-2 rounded-full ${project.progress >= 75 ? 'bg-green-500' :
                                                                project.progress >= 50 ? 'bg-blue-500' :
                                                                    project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {project.progress}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                                                    <div
                                                        className={`h-2 rounded-full ${budgetUtilization > 85 ? 'bg-red-500' :
                                                                budgetUtilization > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {Math.round(budgetUtilization)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {project.teamSize} members
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                                                    <div
                                                        className={`h-2 rounded-full ${taskEfficiency >= 80 ? 'bg-green-500' :
                                                                taskEfficiency >= 60 ? 'bg-blue-500' :
                                                                    taskEfficiency >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${taskEfficiency}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {Math.round(taskEfficiency)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Insights and recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
                <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-4">
                        <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            AI-Powered Insights
                        </h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p>
                                • Your portfolio shows strong performance with {Math.round(analytics.completionRate)}% completion rate,
                                which is above industry average of 72%.
                            </p>
                            <p>
                                • Budget utilization at {Math.round(analytics.budgetUtilization)}% suggests efficient resource allocation,
                                with room for strategic investments.
                            </p>
                            <p>
                                • Consider reallocating resources from completed projects to accelerate the {analytics.overdueProjects} overdue project(s).
                            </p>
                            <p>
                                • Team efficiency metrics indicate potential for process optimization in task management workflows.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

