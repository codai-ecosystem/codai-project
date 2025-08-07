'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Zap,
    Target,
    Users,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    LineChart,
    Sparkles,
    Lightbulb,
    Shield,
    Rocket,
    Award
} from 'lucide-react'

interface AIInsight {
    id: string
    type: 'opportunity' | 'warning' | 'achievement' | 'prediction'
    title: string
    description: string
    impact: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    timestamp: Date
    data?: any
    actionable: boolean
    category: 'performance' | 'user_behavior' | 'security' | 'business' | 'technical'
}

interface PredictiveMetric {
    name: string
    current: number
    predicted: number
    trend: 'up' | 'down' | 'stable'
    confidence: number
    timeframe: string
    unit: string
}

interface UserBehaviorPattern {
    pattern: string
    frequency: number
    impact: string
    trend: 'increasing' | 'decreasing' | 'stable'
    recommendation: string
}

export function AIInsightsDashboard() {
    const [insights, setInsights] = useState<AIInsight[]>([
        {
            id: '1',
            type: 'opportunity',
            title: 'Peak Usage Optimization',
            description: 'AI detected that 73% of users access MEMORAI between 2-4 PM. Consider pre-loading memory data during off-peak hours to improve response times.',
            impact: 'high',
            confidence: 94,
            timestamp: new Date(),
            actionable: true,
            category: 'performance'
        },
        {
            id: '2',
            type: 'warning',
            title: 'Authentication Bottleneck',
            description: 'LOGAI authentication response time increased by 23% over the last 6 hours. Potential database connection pool exhaustion.',
            impact: 'medium',
            confidence: 87,
            timestamp: new Date(Date.now() - 1800000),
            actionable: true,
            category: 'technical'
        },
        {
            id: '3',
            type: 'achievement',
            title: 'User Retention Milestone',
            description: 'Congratulations! User retention rate reached 94.2%, exceeding the target of 90% for Q3 2025.',
            impact: 'high',
            confidence: 100,
            timestamp: new Date(Date.now() - 3600000),
            actionable: false,
            category: 'business'
        },
        {
            id: '4',
            type: 'prediction',
            title: 'Traffic Surge Forecast',
            description: 'AI predicts a 45% increase in traffic over the next 48 hours based on social media sentiment and historical patterns.',
            impact: 'medium',
            confidence: 79,
            timestamp: new Date(Date.now() - 900000),
            actionable: true,
            category: 'business'
        }
    ])

    const [predictiveMetrics, setPredictiveMetrics] = useState<PredictiveMetric[]>([
        { name: 'Daily Active Users', current: 6245, predicted: 7890, trend: 'up', confidence: 89, timeframe: '7 days', unit: 'users' },
        { name: 'Response Time', current: 45, predicted: 38, trend: 'down', confidence: 82, timeframe: '24 hours', unit: 'ms' },
        { name: 'Conversion Rate', current: 3.4, predicted: 4.1, trend: 'up', confidence: 76, timeframe: '14 days', unit: '%' },
        { name: 'Error Rate', current: 0.12, predicted: 0.08, trend: 'down', confidence: 91, timeframe: '48 hours', unit: '%' }
    ])

    const [behaviorPatterns, setBehaviorPatterns] = useState<UserBehaviorPattern[]>([
        {
            pattern: 'Multi-app Session Flow',
            frequency: 68,
            impact: 'Users who start with LOGAI are 40% more likely to use MEMORAI',
            trend: 'increasing',
            recommendation: 'Implement smart app suggestions in LOGAI dashboard'
        },
        {
            pattern: 'Mobile Peak Usage',
            frequency: 45,
            impact: 'Mobile usage peaks 300% during commute hours (7-9 AM, 5-7 PM)',
            trend: 'stable',
            recommendation: 'Optimize mobile performance and add offline capabilities'
        },
        {
            pattern: 'Feature Discovery Lag',
            frequency: 23,
            impact: 'Users take 8+ days to discover advanced features',
            trend: 'decreasing',
            recommendation: 'Implement progressive feature introduction with guided tours'
        }
    ])

    const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

    useEffect(() => {
        // Simulate AI generating new insights
        const interval = setInterval(() => {
            const newInsightTypes = ['opportunity', 'warning', 'prediction'] as const
            const categories = ['performance', 'user_behavior', 'security', 'business', 'technical'] as const

            const newInsight: AIInsight = {
                id: Date.now().toString(),
                type: newInsightTypes[Math.floor(Math.random() * newInsightTypes.length)],
                title: generateInsightTitle(),
                description: generateInsightDescription(),
                impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
                confidence: Math.floor(Math.random() * 30) + 70,
                timestamp: new Date(),
                actionable: Math.random() > 0.3,
                category: categories[Math.floor(Math.random() * categories.length)]
            }

            setInsights(prev => [newInsight, ...prev.slice(0, 9)]) // Keep last 10

            // Update predictive metrics
            setPredictiveMetrics(prev => prev.map(metric => ({
                ...metric,
                predicted: metric.predicted + (Math.random() - 0.5) * metric.predicted * 0.1,
                confidence: Math.max(60, Math.min(95, metric.confidence + (Math.random() - 0.5) * 10))
            })))
        }, 15000) // New insight every 15 seconds

        return () => clearInterval(interval)
    }, [])

    const generateInsightTitle = () => {
        const titles = [
            'Performance Optimization Opportunity',
            'User Engagement Pattern Detected',
            'Security Anomaly Analysis',
            'Business Metric Trending',
            'System Resource Prediction',
            'Cross-Platform Usage Correlation',
            'Feature Adoption Insights',
            'Load Balancing Recommendation'
        ]
        return titles[Math.floor(Math.random() * titles.length)]
    }

    const generateInsightDescription = () => {
        const descriptions = [
            'AI analysis reveals optimal resource allocation could improve performance by 15-25%.',
            'User behavior pattern suggests implementing smart caching could reduce load times.',
            'Predictive model indicates potential scaling needs based on growth trajectory.',
            'Cross-correlation analysis found significant user flow optimization opportunities.',
            'Machine learning model detected anomalous patterns requiring attention.',
            'Statistical analysis suggests feature A/B testing for improved user experience.'
        ]
        return descriptions[Math.floor(Math.random() * descriptions.length)]
    }

    const getInsightColor = (type: AIInsight['type']) => {
        switch (type) {
            case 'opportunity': return 'from-emerald-500 to-blue-500'
            case 'warning': return 'from-yellow-500 to-orange-500'
            case 'achievement': return 'from-purple-500 to-pink-500'
            case 'prediction': return 'from-blue-500 to-cyan-500'
        }
    }

    const getInsightIcon = (type: AIInsight['type']) => {
        switch (type) {
            case 'opportunity': return Lightbulb
            case 'warning': return AlertTriangle
            case 'achievement': return Award
            case 'prediction': return Brain
        }
    }

    const getImpactColor = (impact: AIInsight['impact']) => {
        switch (impact) {
            case 'low': return 'text-blue-400'
            case 'medium': return 'text-yellow-400'
            case 'high': return 'text-orange-400'
            case 'critical': return 'text-red-400'
        }
    }

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return TrendingUp
            case 'down': return TrendingDown
            case 'stable': return Activity
        }
    }

    const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodDirection = true) => {
        if (trend === 'stable') return 'text-blue-400'
        const isPositive = (trend === 'up' && isGoodDirection) || (trend === 'down' && !isGoodDirection)
        return isPositive ? 'text-emerald-400' : 'text-red-400'
    }

    return (
        <div className="space-y-6">
            {/* AI Dashboard Header */}
            <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">AI Insights Dashboard</h2>
                            <p className="text-slate-400">Powered by advanced machine learning algorithms</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-600/20 rounded-lg border border-emerald-500/30">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium">AI Active</span>
                    </div>
                </div>
            </div>

            {/* Predictive Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {predictiveMetrics.map((metric, index) => {
                    const TrendIcon = getTrendIcon(metric.trend)
                    const isPositiveTrend = metric.name.includes('Error') ? metric.trend === 'down' : metric.trend === 'up'

                    return (
                        <motion.div
                            key={metric.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glassmorphism rounded-xl p-4 border border-white/20"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">{metric.name}</span>
                                <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend, !metric.name.includes('Error'))}`} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-xl font-bold text-white">
                                        {metric.current.toLocaleString()}{metric.unit}
                                    </span>
                                    <span className="text-xs text-slate-500">current</span>
                                </div>

                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-lg font-semibold ${getTrendColor(metric.trend, !metric.name.includes('Error'))}`}>
                                        {metric.predicted.toLocaleString()}{metric.unit}
                                    </span>
                                    <span className="text-xs text-slate-500">predicted</span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">{metric.timeframe}</span>
                                    <span className="text-blue-400">{metric.confidence}% confidence</span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* AI Insights */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                        <Brain className="w-5 h-5" />
                        <span>Latest AI Insights</span>
                    </h3>

                    <div className="space-y-3">
                        {insights.map((insight, index) => {
                            const IconComponent = getInsightIcon(insight.type)

                            return (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glassmorphism rounded-xl p-4 border border-white/20 cursor-pointer hover:border-white/30 transition-all"
                                    onClick={() => setSelectedInsight(insight)}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <IconComponent className="w-5 h-5 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-white truncate">{insight.title}</h4>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)} bg-current/20`}>
                                                        {insight.impact}
                                                    </span>
                                                    {insight.actionable && (
                                                        <Target className="w-4 h-4 text-emerald-400" />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-300 mb-2 line-clamp-2">{insight.description}</p>

                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">{insight.category.replace('_', ' ')}</span>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-blue-400">{insight.confidence}% confidence</span>
                                                    <span className="text-slate-500">{insight.timestamp.toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* User Behavior Patterns */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Behavior Patterns</span>
                    </h3>

                    {behaviorPatterns.map((pattern, index) => (
                        <motion.div
                            key={pattern.pattern}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glassmorphism rounded-xl p-4 border border-white/20"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white">{pattern.pattern}</h4>
                                <span className="text-sm text-blue-400">{pattern.frequency}%</span>
                            </div>

                            <p className="text-sm text-slate-300 mb-3">{pattern.impact}</p>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400">Trend</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${pattern.trend === 'increasing' ? 'text-emerald-400 bg-emerald-400/20' :
                                    pattern.trend === 'decreasing' ? 'text-red-400 bg-red-400/20' :
                                        'text-blue-400 bg-blue-400/20'
                                    }`}>
                                    {pattern.trend}
                                </span>
                            </div>

                            <div className="text-xs text-slate-400 bg-white/5 rounded-lg p-2">
                                <strong>Recommendation:</strong> {pattern.recommendation}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Insight Detail Modal */}
            <AnimatePresence>
                {selectedInsight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedInsight(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glassmorphism rounded-2xl p-6 border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${getInsightColor(selectedInsight.type)} rounded-xl flex items-center justify-center`}>
                                        {(() => {
                                            const IconComponent = getInsightIcon(selectedInsight.type)
                                            return <IconComponent className="w-6 h-6 text-white" />
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedInsight.title}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`text-sm px-2 py-1 rounded-full ${getImpactColor(selectedInsight.impact)} bg-current/20`}>
                                                {selectedInsight.impact} impact
                                            </span>
                                            <span className="text-sm text-blue-400">{selectedInsight.confidence}% confidence</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedInsight(null)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-white mb-2">Analysis</h4>
                                    <p className="text-slate-300">{selectedInsight.description}</p>
                                </div>

                                {selectedInsight.actionable && (
                                    <div>
                                        <h4 className="font-semibold text-white mb-2">Recommended Actions</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-emerald-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm">Review and implement optimization suggestions</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-emerald-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm">Monitor metrics for improvement validation</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-emerald-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm">Schedule follow-up analysis in 48 hours</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-white/10">
                                    <span>Category: {selectedInsight.category.replace('_', ' ')}</span>
                                    <span>{selectedInsight.timestamp.toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

