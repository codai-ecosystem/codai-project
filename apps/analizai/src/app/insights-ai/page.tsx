'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Zap, Target, TrendingUp, AlertTriangle, CheckCircle,
    Lightbulb, BarChart3, Eye, Play, Pause, Settings, RefreshCw,
    Sparkles, Gauge, Clock, Users, Activity, Database, Filter,
    Search, Download, Share2, Bookmark, Star, ArrowUp, ArrowDown,
    Plus, Edit, Trash2, MoreHorizontal, LineChart, PieChart,
    Calendar, Bell, Shield, Award, Rocket, Layers, Archive,
    FileText, Send, Copy, ExternalLink, ThumbsUp, ThumbsDown
} from 'lucide-react'

// TypeScript interfaces for AI insights and analytics
interface AIInsight {
    id: string
    title: string
    description: string
    category: 'optimization' | 'prediction' | 'anomaly' | 'recommendation' | 'alert' | 'trend'
    priority: 'high' | 'medium' | 'low' | 'critical'
    confidence: number // 0-1 (as percentage)
    impact: 'high' | 'medium' | 'low'
    status: 'new' | 'reviewed' | 'implemented' | 'dismissed' | 'in_progress'
    createdAt: string
    updatedAt?: string
    actionTaken?: string
    datasource: string
    metrics: {
        accuracy: number
        relevance: number
        value: number
    }
    tags: string[]
    estimatedValue?: number // in currency
    timeToImplement?: number // in hours
    relatedMetrics: string[]
    aiModel: string
    isBookmarked: boolean
    userFeedback?: 'positive' | 'negative' | 'neutral'
}

interface PredictionModel {
    id: string
    name: string
    description: string
    type: 'regression' | 'classification' | 'timeseries' | 'clustering'
    status: 'active' | 'training' | 'paused' | 'archived'
    accuracy: number
    lastTrained: string
    nextTraining?: string
    dataPoints: number
    features: string[]
    predictions: number
    confidence: number
    performance: {
        precision: number
        recall: number
        f1Score: number
        mse?: number
    }
    version: string
    deployedAt?: string
}

interface AIAnalytics {
    totalInsights: number
    activeModels: number
    accuracyScore: number
    valueGenerated: number
    insightsImplemented: number
    predictionsMade: number
    modelUptime: number
    avgConfidence: number
    trendsIdentified: number
    anomaliesDetected: number
    recommendationsFollowed: number
    dataProcessed: number // in GB
}

interface TrendAnalysis {
    id: string
    name: string
    description: string
    trend: 'upward' | 'downward' | 'stable' | 'volatile'
    change: number // percentage
    timeframe: string
    significance: 'high' | 'medium' | 'low'
    dataPoints: number[]
    prediction: {
        direction: 'up' | 'down' | 'stable'
        confidence: number
        timeframe: string
    }
    category: string
    impact: string
}

// Mock data for demonstration
const mockInsights: AIInsight[] = [
    {
        id: 'ai-1',
        title: 'Revenue Optimization Opportunity',
        description: 'AI analysis indicates potential 23% revenue increase by adjusting pricing strategy for Premium tier customers during peak hours.',
        category: 'optimization',
        priority: 'high',
        confidence: 0.94,
        impact: 'high',
        status: 'new',
        createdAt: '2025-08-07T14:30:00Z',
        datasource: 'Customer Analytics',
        metrics: {
            accuracy: 0.94,
            relevance: 0.89,
            value: 0.92
        },
        tags: ['revenue', 'pricing', 'optimization'],
        estimatedValue: 45000,
        timeToImplement: 8,
        relatedMetrics: ['Monthly Recurring Revenue', 'Customer Lifetime Value', 'Churn Rate'],
        aiModel: 'Revenue Optimizer v2.1',
        isBookmarked: true
    },
    {
        id: 'ai-2',
        title: 'Customer Churn Prediction Alert',
        description: 'Machine learning model predicts 127 high-value customers at risk of churning within the next 30 days based on engagement patterns.',
        category: 'prediction',
        priority: 'critical',
        confidence: 0.87,
        impact: 'high',
        status: 'in_progress',
        createdAt: '2025-08-07T12:15:00Z',
        updatedAt: '2025-08-07T13:45:00Z',
        actionTaken: 'Automated retention campaigns initiated',
        datasource: 'Customer Behavior Analytics',
        metrics: {
            accuracy: 0.87,
            relevance: 0.95,
            value: 0.88
        },
        tags: ['churn', 'prediction', 'retention'],
        estimatedValue: 127000,
        timeToImplement: 4,
        relatedMetrics: ['Churn Rate', 'Customer Satisfaction', 'Engagement Score'],
        aiModel: 'Churn Predictor v3.0',
        isBookmarked: false,
        userFeedback: 'positive'
    },
    {
        id: 'ai-3',
        title: 'Anomaly in Server Performance',
        description: 'Unusual spike in response times detected on primary database cluster. Pattern suggests potential memory leak in application tier.',
        category: 'anomaly',
        priority: 'high',
        confidence: 0.91,
        impact: 'medium',
        status: 'reviewed',
        createdAt: '2025-08-07T10:22:00Z',
        updatedAt: '2025-08-07T11:15:00Z',
        actionTaken: 'Infrastructure team notified, monitoring increased',
        datasource: 'System Performance',
        metrics: {
            accuracy: 0.91,
            relevance: 0.78,
            value: 0.85
        },
        tags: ['performance', 'anomaly', 'infrastructure'],
        timeToImplement: 2,
        relatedMetrics: ['Response Time', 'Memory Usage', 'Error Rate'],
        aiModel: 'Anomaly Detector v1.8',
        isBookmarked: false
    },
    {
        id: 'ai-4',
        title: 'Marketing Campaign Optimization',
        description: 'AI recommends reallocating 35% of social media budget from Facebook to LinkedIn for B2B segment to improve conversion rates by 18%.',
        category: 'recommendation',
        priority: 'medium',
        confidence: 0.82,
        impact: 'medium',
        status: 'implemented',
        createdAt: '2025-08-06T16:45:00Z',
        updatedAt: '2025-08-07T09:30:00Z',
        actionTaken: 'Budget reallocation completed, tracking results',
        datasource: 'Marketing Analytics',
        metrics: {
            accuracy: 0.82,
            relevance: 0.88,
            value: 0.79
        },
        tags: ['marketing', 'optimization', 'conversion'],
        estimatedValue: 12500,
        timeToImplement: 6,
        relatedMetrics: ['Conversion Rate', 'Cost Per Acquisition', 'Return on Ad Spend'],
        aiModel: 'Marketing Optimizer v2.3',
        isBookmarked: true,
        userFeedback: 'positive'
    },
    {
        id: 'ai-5',
        title: 'Inventory Demand Forecast',
        description: 'Predictive model forecasts 40% increase in demand for Product Category A during Q4, recommending inventory increase by mid-September.',
        category: 'prediction',
        priority: 'medium',
        confidence: 0.76,
        impact: 'medium',
        status: 'new',
        createdAt: '2025-08-07T08:12:00Z',
        datasource: 'Sales & Inventory',
        metrics: {
            accuracy: 0.76,
            relevance: 0.84,
            value: 0.81
        },
        tags: ['inventory', 'forecasting', 'demand'],
        estimatedValue: 28000,
        timeToImplement: 12,
        relatedMetrics: ['Inventory Turnover', 'Sales Volume', 'Seasonal Trends'],
        aiModel: 'Demand Forecaster v1.5',
        isBookmarked: false
    }
]

const mockModels: PredictionModel[] = [
    {
        id: 'model-1',
        name: 'Customer Churn Predictor',
        description: 'Advanced ML model for predicting customer churn probability',
        type: 'classification',
        status: 'active',
        accuracy: 0.87,
        lastTrained: '2025-08-05T02:00:00Z',
        nextTraining: '2025-08-12T02:00:00Z',
        dataPoints: 245000,
        features: ['Engagement Score', 'Payment History', 'Support Tickets', 'Feature Usage', 'Login Frequency'],
        predictions: 1247,
        confidence: 0.89,
        performance: {
            precision: 0.84,
            recall: 0.81,
            f1Score: 0.82
        },
        version: 'v3.0',
        deployedAt: '2025-08-05T08:30:00Z'
    },
    {
        id: 'model-2',
        name: 'Revenue Forecaster',
        description: 'Time series model for monthly revenue prediction',
        type: 'timeseries',
        status: 'active',
        accuracy: 0.92,
        lastTrained: '2025-08-06T01:30:00Z',
        nextTraining: '2025-08-09T01:30:00Z',
        dataPoints: 180000,
        features: ['Historical Revenue', 'Seasonality', 'Marketing Spend', 'Customer Acquisition', 'Economic Indicators'],
        predictions: 856,
        confidence: 0.94,
        performance: {
            precision: 0.91,
            recall: 0.89,
            f1Score: 0.90,
            mse: 0.045
        },
        version: 'v2.1',
        deployedAt: '2025-08-06T07:15:00Z'
    },
    {
        id: 'model-3',
        name: 'Anomaly Detection Engine',
        description: 'Real-time anomaly detection for system performance',
        type: 'clustering',
        status: 'training',
        accuracy: 0.79,
        lastTrained: '2025-08-07T12:00:00Z',
        dataPoints: 520000,
        features: ['Response Time', 'Memory Usage', 'CPU Load', 'Error Rate', 'Throughput'],
        predictions: 2341,
        confidence: 0.82,
        performance: {
            precision: 0.76,
            recall: 0.78,
            f1Score: 0.77
        },
        version: 'v1.8',
        deployedAt: '2025-08-07T06:45:00Z'
    },
    {
        id: 'model-4',
        name: 'Market Trend Analyzer',
        description: 'Advanced regression model for market trend analysis',
        type: 'regression',
        status: 'paused',
        accuracy: 0.68,
        lastTrained: '2025-08-04T14:20:00Z',
        nextTraining: '2025-08-10T14:20:00Z',
        dataPoints: 95000,
        features: ['Market Indicators', 'Volume', 'Sentiment Analysis', 'News Impact', 'Historical Patterns'],
        predictions: 423,
        confidence: 0.71,
        performance: {
            precision: 0.65,
            recall: 0.72,
            f1Score: 0.68,
            mse: 0.078
        },
        version: 'v1.2'
    }
]

const mockAnalytics: AIAnalytics = {
    totalInsights: 1247,
    activeModels: 8,
    accuracyScore: 0.86,
    valueGenerated: 342500,
    insightsImplemented: 156,
    predictionsMade: 4867,
    modelUptime: 0.994,
    avgConfidence: 0.84,
    trendsIdentified: 23,
    anomaliesDetected: 47,
    recommendationsFollowed: 89,
    dataProcessed: 15.7 // GB
}

const mockTrends: TrendAnalysis[] = [
    {
        id: 'trend-1',
        name: 'Customer Engagement Growth',
        description: 'Steady increase in customer engagement across all platforms',
        trend: 'upward',
        change: 18.5,
        timeframe: 'Last 30 days',
        significance: 'high',
        dataPoints: [65, 68, 72, 75, 78, 82, 85],
        prediction: {
            direction: 'up',
            confidence: 0.87,
            timeframe: 'Next 14 days'
        },
        category: 'Customer',
        impact: 'Positive impact on retention and revenue'
    },
    {
        id: 'trend-2',
        name: 'System Performance Decline',
        description: 'Gradual degradation in response times during peak hours',
        trend: 'downward',
        change: -12.3,
        timeframe: 'Last 14 days',
        significance: 'medium',
        dataPoints: [95, 92, 88, 85, 82, 79, 76],
        prediction: {
            direction: 'down',
            confidence: 0.79,
            timeframe: 'Next 7 days'
        },
        category: 'Performance',
        impact: 'May affect user experience if not addressed'
    },
    {
        id: 'trend-3',
        name: 'Revenue Stability',
        description: 'Monthly revenue maintaining consistent levels with minor fluctuations',
        trend: 'stable',
        change: 2.1,
        timeframe: 'Last 90 days',
        significance: 'medium',
        dataPoints: [100, 102, 98, 101, 99, 103, 101],
        prediction: {
            direction: 'stable',
            confidence: 0.92,
            timeframe: 'Next 30 days'
        },
        category: 'Financial',
        impact: 'Consistent performance indicates stable business model'
    }
]

// Utility functions
const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
        case 'critical': return 'text-red-600 bg-red-50 border-red-200'
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'low': return 'text-green-600 bg-green-50 border-green-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getStatusColor = (status: AIInsight['status']) => {
    switch (status) {
        case 'new': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'reviewed': return 'text-purple-600 bg-purple-50 border-purple-200'
        case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'implemented': return 'text-green-600 bg-green-50 border-green-200'
        case 'dismissed': return 'text-gray-600 bg-gray-50 border-gray-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getCategoryIcon = (category: AIInsight['category']) => {
    switch (category) {
        case 'optimization': return <Zap className="h-4 w-4" />
        case 'prediction': return <Target className="h-4 w-4" />
        case 'anomaly': return <AlertTriangle className="h-4 w-4" />
        case 'recommendation': return <Lightbulb className="h-4 w-4" />
        case 'alert': return <Bell className="h-4 w-4" />
        case 'trend': return <TrendingUp className="h-4 w-4" />
        default: return <Brain className="h-4 w-4" />
    }
}

const getModelStatusColor = (status: PredictionModel['status']) => {
    switch (status) {
        case 'active': return 'text-green-600 bg-green-50 border-green-200'
        case 'training': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getTrendIcon = (trend: TrendAnalysis['trend']) => {
    switch (trend) {
        case 'upward': return <ArrowUp className="h-4 w-4 text-green-600" />
        case 'downward': return <ArrowDown className="h-4 w-4 text-red-600" />
        case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
        case 'volatile': return <Gauge className="h-4 w-4 text-orange-600" />
        default: return <Activity className="h-4 w-4 text-gray-600" />
    }
}

const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON'
    }).format(amount)
}

// AI Insight Card Component
const InsightCard: React.FC<{
    insight: AIInsight
    onBookmark: (id: string) => void
    onFeedback: (id: string, feedback: 'positive' | 'negative') => void
    onAction: (id: string, action: string) => void
}> = ({ insight, onBookmark, onFeedback, onAction }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        {getCategoryIcon(insight.category)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{insight.category} • {insight.datasource}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority.toUpperCase()}
                    </div>
                    <button
                        onClick={() => onBookmark(insight.id)}
                        className={`p-1 rounded ${insight.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                        <Bookmark className="h-4 w-4" fill={insight.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{insight.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Confidence</p>
                    <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${insight.confidence * 100}%` }}
                            />
                        </div>
                        <p className="text-sm font-medium">{Math.round(insight.confidence * 100)}%</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Impact</p>
                    <p className="text-sm font-medium capitalize">{insight.impact}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="text-sm font-medium">
                        {insight.estimatedValue ? formatCurrency(insight.estimatedValue) : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                <div>
                    <p className="font-medium">Time to Implement</p>
                    <p>{insight.timeToImplement ? `${insight.timeToImplement}h` : 'N/A'}</p>
                </div>
                <div>
                    <p className="font-medium">AI Model</p>
                    <p>{insight.aiModel}</p>
                </div>
            </div>

            {insight.tags && insight.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {insight.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(insight.status)}`}>
                        {insight.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-500">{formatTimeAgo(insight.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2">
                    {insight.userFeedback !== 'positive' && (
                        <button
                            onClick={() => onFeedback(insight.id, 'positive')}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Helpful"
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </button>
                    )}
                    {insight.userFeedback !== 'negative' && (
                        <button
                            onClick={() => onFeedback(insight.id, 'negative')}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Not helpful"
                        >
                            <ThumbsDown className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onAction(insight.id, 'implement')}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={insight.status === 'implemented'}
                    >
                        {insight.status === 'implemented' ? 'Implemented' : 'Take Action'}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Model Card Component
const ModelCard: React.FC<{
    model: PredictionModel
    onToggle: (id: string) => void
    onRetrain: (id: string) => void
}> = ({ model, onToggle, onRetrain }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getModelStatusColor(model.status)}`}>
                    {model.status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500">Accuracy</p>
                    <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${model.accuracy * 100}%` }}
                            />
                        </div>
                        <p className="text-sm font-medium">{Math.round(model.accuracy * 100)}%</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Confidence</p>
                    <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${model.confidence * 100}%` }}
                            />
                        </div>
                        <p className="text-sm font-medium">{Math.round(model.confidence * 100)}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-gray-600">
                <div>
                    <p className="font-medium">{model.dataPoints.toLocaleString()}</p>
                    <p>Data Points</p>
                </div>
                <div>
                    <p className="font-medium">{model.predictions}</p>
                    <p>Predictions</p>
                </div>
                <div>
                    <p className="font-medium">{model.version}</p>
                    <p>Version</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-600">
                <div className="text-center">
                    <p className="font-medium">{Math.round(model.performance.precision * 100)}%</p>
                    <p>Precision</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{Math.round(model.performance.recall * 100)}%</p>
                    <p>Recall</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{Math.round(model.performance.f1Score * 100)}%</p>
                    <p>F1 Score</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Features ({model.features.length})</p>
                <div className="flex flex-wrap gap-1">
                    {model.features.slice(0, 3).map((feature, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                            {feature}
                        </span>
                    ))}
                    {model.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{model.features.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    <p>Last trained: {formatTimeAgo(model.lastTrained)}</p>
                    {model.nextTraining && (
                        <p>Next training: {new Date(model.nextTraining).toLocaleDateString('ro-RO')}</p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onRetrain(model.id)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Retrain Model"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onToggle(model.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={model.status === 'active' ? 'Pause Model' : 'Activate Model'}
                    >
                        {model.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Trend Card Component
const TrendCard: React.FC<{ trend: TrendAnalysis }> = ({ trend }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">{trend.name}</h3>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {getTrendIcon(trend.trend)}
                    <span className={`text-sm font-medium ${trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                    </span>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Trend Data</span>
                    <span className="text-xs text-gray-500">{trend.timeframe}</span>
                </div>
                <div className="h-12 flex items-end space-x-1">
                    {trend.dataPoints.map((point, index) => (
                        <div
                            key={index}
                            className="flex-1 bg-purple-200 rounded-t"
                            style={{ height: `${(point / Math.max(...trend.dataPoints)) * 100}%` }}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                <div>
                    <p className="font-medium">Significance</p>
                    <p className="capitalize">{trend.significance}</p>
                </div>
                <div>
                    <p className="font-medium">Category</p>
                    <p>{trend.category}</p>
                </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Prediction</span>
                    <span className="text-xs text-gray-500">{trend.prediction.timeframe}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm capitalize">{trend.prediction.direction} trend</span>
                    <span className="text-sm font-medium">{Math.round(trend.prediction.confidence * 100)}% confidence</span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">{trend.impact}</p>
            </div>
        </motion.div>
    )
}

// Main Insights & AI Component
export default function InsightsAIPage() {
    const [insights, setInsights] = useState<AIInsight[]>(mockInsights)
    const [filteredInsights, setFilteredInsights] = useState<AIInsight[]>(mockInsights)
    const [models] = useState<PredictionModel[]>(mockModels)
    const [analytics] = useState<AIAnalytics>(mockAnalytics)
    const [trends] = useState<TrendAnalysis[]>(mockTrends)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'insights' | 'models' | 'trends' | 'analytics'>('insights')

    // Filter insights
    useEffect(() => {
        let filtered = insights

        if (searchTerm) {
            filtered = filtered.filter(insight =>
                insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                insight.datasource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                insight.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(insight => insight.category === categoryFilter)
        }

        if (priorityFilter !== 'all') {
            filtered = filtered.filter(insight => insight.priority === priorityFilter)
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(insight => insight.status === statusFilter)
        }

        setFilteredInsights(filtered)
    }, [insights, searchTerm, categoryFilter, priorityFilter, statusFilter])

    const handleBookmark = (id: string) => {
        setInsights(prev => prev.map(insight =>
            insight.id === id ? { ...insight, isBookmarked: !insight.isBookmarked } : insight
        ))
    }

    const handleFeedback = (id: string, feedback: 'positive' | 'negative') => {
        setInsights(prev => prev.map(insight =>
            insight.id === id ? { ...insight, userFeedback: feedback } : insight
        ))
    }

    const handleAction = (id: string, action: string) => {
        setInsights(prev => prev.map(insight =>
            insight.id === id ? {
                ...insight,
                status: 'in_progress',
                actionTaken: `Action initiated: ${action}`,
                updatedAt: new Date().toISOString()
            } : insight
        ))
    }

    const handleModelToggle = (id: string) => {
        console.log('Toggle model:', id)
        // Implementation for model toggle
    }

    const handleModelRetrain = (id: string) => {
        console.log('Retrain model:', id)
        // Implementation for model retrain
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Insights & AI
                            </h1>
                            <p className="text-gray-600">
                                AI-powered analytics insights and machine learning models
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="h-4 w-4 mr-2" />
                                Export Insights
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Model
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* AI Analytics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">AI Insights</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.totalInsights}</p>
                            </div>
                            <Brain className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-green-600">+{analytics.insightsImplemented} implemented</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Models</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics.activeModels}</p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-blue-600">{Math.round(analytics.modelUptime * 100)}% uptime</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Accuracy Score</p>
                                <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.accuracyScore * 100)}%</p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-gray-600">{Math.round(analytics.avgConfidence * 100)}% avg confidence</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Value Generated</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.valueGenerated)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-orange-600">{analytics.predictionsMade} predictions</p>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'insights'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                AI Insights ({insights.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('models')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'models'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                ML Models ({models.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('trends')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'trends'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Trend Analysis ({trends.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                AI Analytics
                            </button>
                        </div>

                        {activeTab === 'insights' && (
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search insights..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="optimization">Optimization</option>
                                        <option value="prediction">Prediction</option>
                                        <option value="anomaly">Anomaly</option>
                                        <option value="recommendation">Recommendation</option>
                                        <option value="alert">Alert</option>
                                        <option value="trend">Trend</option>
                                    </select>
                                    <select
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Priorities</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="new">New</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="implemented">Implemented</option>
                                        <option value="dismissed">Dismissed</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                {activeTab === 'insights' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {filteredInsights.map((insight) => (
                            <InsightCard
                                key={insight.id}
                                insight={insight}
                                onBookmark={handleBookmark}
                                onFeedback={handleFeedback}
                                onAction={handleAction}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'models' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {models.map((model) => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                onToggle={handleModelToggle}
                                onRetrain={handleModelRetrain}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'trends' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {trends.map((trend) => (
                            <TrendCard key={trend.id} trend={trend} />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Predictions Made</span>
                                    <span className="font-medium">{analytics.predictionsMade.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Trends Identified</span>
                                    <span className="font-medium">{analytics.trendsIdentified}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Anomalies Detected</span>
                                    <span className="font-medium">{analytics.anomaliesDetected}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Recommendations Followed</span>
                                    <span className="font-medium">{analytics.recommendationsFollowed}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Data Processed</span>
                                    <span className="font-medium">{analytics.dataProcessed} GB</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">AI Model Performance</h3>
                            <div className="space-y-4">
                                {models.filter(m => m.status === 'active').map((model) => (
                                    <div key={model.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{model.name}</p>
                                            <p className="text-xs text-gray-500">{model.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{Math.round(model.accuracy * 100)}%</p>
                                            <p className="text-xs text-gray-500">accuracy</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">AI Automation</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Set up automated AI insights and recommendations for continuous optimization.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Configure automation →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Database className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Model Training</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Train custom AI models on your data for specialized insights and predictions.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Start training →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Award className="h-6 w-6 text-green-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Track AI model performance and optimize for better accuracy and insights.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            View analytics →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
