'use client'

import React from 'react'
/**
 * Insights Panel Component - AI-Powered Analytics Insights
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Zap,
    Users, ArrowRight, CheckCircle2, Clock, Star, Bookmark,
    ThumbsUp, ThumbsDown, Share2, MoreHorizontal, RefreshCw
} from 'lucide-react'

interface InsightsPanelProps {
    metrics: any[]
    summary: any
    timeRange: any
}

export function InsightsPanel({ metrics, summary, timeRange }: InsightsPanelProps) {
    const [selectedInsightType, setSelectedInsightType] = useState('all')
    const [savedInsights, setSavedInsights] = useState<string[]>([])

    const insightTypes = [
        { id: 'all', label: 'All Insights', icon: Brain },
        { id: 'performance', label: 'Performance', icon: TrendingUp },
        { id: 'opportunities', label: 'Opportunities', icon: Lightbulb },
        { id: 'risks', label: 'Risks', icon: AlertTriangle },
        { id: 'recommendations', label: 'Recommendations', icon: Target }
    ]

    const insights = [
        {
            id: 'performance-trend',
            type: 'performance',
            priority: 'high',
            title: 'Strong Performance Momentum',
            description: 'Your team productivity has increased by 8.7% over the last month, marking the highest growth rate in the past quarter.',
            impact: 'positive',
            confidence: 92,
            actionable: true,
            timestamp: '2025-01-20T10:30:00Z',
            metrics: ['team-productivity', 'completion-rate'],
            recommendations: [
                'Maintain current workflow patterns that are driving this improvement',
                'Consider scaling successful practices to other teams',
                'Document best practices for knowledge sharing'
            ],
            insights: [
                'Peak productivity occurs during Tuesday-Thursday periods',
                'Remote work days show 15% higher efficiency',
                'Collaborative sessions improve output quality by 23%'
            ]
        },
        {
            id: 'budget-optimization',
            type: 'opportunities',
            priority: 'medium',
            title: 'Budget Efficiency Opportunity',
            description: 'Budget efficiency has decreased by 2.1%, but analysis shows potential for 5-8% improvement through resource reallocation.',
            impact: 'neutral',
            confidence: 78,
            actionable: true,
            timestamp: '2025-01-20T09:15:00Z',
            metrics: ['budget-efficiency'],
            recommendations: [
                'Review allocation in underperforming project categories',
                'Implement automated cost tracking for better visibility',
                'Consider consolidating vendor relationships for better rates'
            ],
            insights: [
                'IT infrastructure costs are 12% above industry average',
                'Training budget utilization is only at 67%',
                'Equipment refresh cycle could be optimized'
            ]
        },
        {
            id: 'completion-risk',
            type: 'risks',
            priority: 'high',
            title: 'Project Completion Rate Alert',
            description: 'While completion rate is strong at 87%, three projects are showing early warning signs of potential delays.',
            impact: 'negative',
            confidence: 85,
            actionable: true,
            timestamp: '2025-01-20T08:45:00Z',
            metrics: ['completion-rate', 'total-projects'],
            recommendations: [
                'Immediate review of flagged projects for resource needs',
                'Implement weekly check-ins for at-risk projects',
                'Consider redistributing workload to prevent bottlenecks'
            ],
            insights: [
                'Projects with external dependencies show 23% higher risk',
                'Teams with 5+ members maintain better completion rates',
                'Q1 timeline pressure affecting quality metrics'
            ]
        },
        {
            id: 'team-scaling',
            type: 'recommendations',
            priority: 'medium',
            title: 'Team Capacity Optimization',
            description: 'Current team productivity metrics suggest optimal conditions for strategic expansion or additional project adoption.',
            impact: 'positive',
            confidence: 73,
            actionable: true,
            timestamp: '2025-01-20T07:20:00Z',
            metrics: ['team-productivity', 'total-projects'],
            recommendations: [
                'Consider pilot program for 20% capacity increase',
                'Identify high-performing team patterns for replication',
                'Evaluate cross-training opportunities to reduce bottlenecks'
            ],
            insights: [
                'Senior developers are operating at 95% capacity',
                'Junior team members have 30% growth potential',
                'Project management overhead is optimally balanced'
            ]
        }
    ]

    const filteredInsights = selectedInsightType === 'all'
        ? insights
        : insights.filter(insight => insight.type === selectedInsightType)

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
            case 'medium': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
            case 'low': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
            default: return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />
            case 'medium': return <Clock className="w-5 h-5 text-yellow-500" />
            case 'low': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            default: return <Brain className="w-5 h-5 text-gray-500" />
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'positive': return 'text-green-600 dark:text-green-400'
            case 'negative': return 'text-red-600 dark:text-red-400'
            case 'neutral': return 'text-yellow-600 dark:text-yellow-400'
            default: return 'text-gray-600 dark:text-gray-400'
        }
    }

    const toggleSavedInsight = (insightId: string) => {
        setSavedInsights(prev =>
            prev.includes(insightId)
                ? prev.filter(id => id !== insightId)
                : [...prev, insightId]
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Brain className="w-7 h-7 mr-3 text-purple-500" />
                        AI-Powered Insights
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Intelligent analysis and recommendations for {timeRange.label.toLowerCase()}
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {/* Insight Type Filter */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {insightTypes.map(type => {
                            const Icon = type.icon
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedInsightType(type.id)}
                                    className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center ${selectedInsightType === type.id
                                            ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {type.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Refresh Button */}
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Insights Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {filteredInsights.length}
                        </span>
                    </div>
                    <div>
                        <p className="text-purple-800 dark:text-purple-300 font-medium">Total Insights</p>
                        <p className="text-purple-600 dark:text-purple-400 text-sm">Generated today</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-500 p-2 rounded-lg">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {filteredInsights.filter(i => i.type === 'opportunities').length}
                        </span>
                    </div>
                    <div>
                        <p className="text-green-800 dark:text-green-300 font-medium">Opportunities</p>
                        <p className="text-green-600 dark:text-green-400 text-sm">Growth potential</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-500 p-2 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-red-900 dark:text-red-100">
                            {filteredInsights.filter(i => i.priority === 'high').length}
                        </span>
                    </div>
                    <div>
                        <p className="text-red-800 dark:text-red-300 font-medium">High Priority</p>
                        <p className="text-red-600 dark:text-red-400 text-sm">Needs attention</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {filteredInsights.filter(i => i.actionable).length}
                        </span>
                    </div>
                    <div>
                        <p className="text-blue-800 dark:text-blue-300 font-medium">Actionable</p>
                        <p className="text-blue-600 dark:text-blue-400 text-sm">Ready to implement</p>
                    </div>
                </div>
            </motion.div>

            {/* Insights Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
            >
                {filteredInsights.map((insight, index) => (
                    <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 ${getPriorityColor(insight.priority)}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="mt-1">
                                    {getPriorityIcon(insight.priority)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {insight.title}
                                        </h3>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${insight.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                insight.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                            }`}>
                                            {insight.priority} priority
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => toggleSavedInsight(insight.id)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${savedInsights.includes(insight.id)
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                        }`}
                                >
                                    <Bookmark className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Confidence and Impact */}
                        <div className="flex items-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {insight.confidence}% confidence
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className={`w-4 h-4 ${getImpactColor(insight.impact)}`} />
                                <span className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                                    {insight.impact} impact
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {insight.metrics.length} metrics
                                </span>
                            </div>
                        </div>

                        {/* Key Insights */}
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Key Insights:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {insight.insights.map((keyInsight, i) => (
                                    <div key={i} className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{keyInsight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Recommended Actions:
                            </h4>
                            <div className="space-y-2">
                                {insight.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-blue-800 dark:text-blue-300">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4">
                                <button className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span className="text-sm">Helpful</span>
                                </button>
                                <button className="flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                                    <ThumbsDown className="w-4 h-4" />
                                    <span className="text-sm">Not helpful</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200">
                                    Implement
                                </button>
                                <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* AI Insights Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-green-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-500" />
                        AI Analysis Summary
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Generated {new Date().toLocaleString()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Overall Health</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your organization shows strong performance indicators with {summary.healthScore}% health score.
                            Continue current momentum while addressing identified risks.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Growth Opportunities</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredInsights.filter(i => i.type === 'opportunities').length} optimization opportunities identified.
                            Focus on budget efficiency and team scaling for maximum impact.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Steps</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredInsights.filter(i => i.actionable).length} actionable insights ready for implementation.
                            Start with high-priority items for immediate impact.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


