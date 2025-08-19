'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Brain,
    TrendingUp,
    TrendingDown,
    Zap,
    Settings,
    Target,
    Lightbulb,
    Eye,
    Download,
    Share2,
    RefreshCw,
    Calendar,
    Filter,
    Clock,
    Users,
    DollarSign,
    ShoppingCart,
    Globe,
    Star,
    AlertTriangle,
    CheckCircle,
    Info,
    BarChart3,
    LineChart,
    PieChart,
    Activity,
    Layers,
    Cpu,
    Database,
    Network,
    Signal,
    Smartphone,
    Monitor,
    Tablet,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Plus,
    PlayCircle,
    PauseCircle,
    RotateCcw,
    Search,
    BookOpen,
    FileText,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Award,
    Shield,
    Gauge
} from 'lucide-react'

// TypeScript interfaces for business intelligence
interface AIInsight {
    id: string
    title: string
    description: string
    type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation'
    priority: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    impact: number
    category: 'revenue' | 'users' | 'performance' | 'market' | 'operations'
    timestamp: string
    data: any
    actionItems: string[]
    source: string
}

interface PredictiveModel {
    id: string
    name: string
    description: string
    type: 'revenue' | 'churn' | 'demand' | 'performance' | 'risk'
    accuracy: number
    lastTrained: string
    predictions: Prediction[]
    status: 'active' | 'training' | 'inactive'
    dataPoints: number
}

interface Prediction {
    id: string
    metric: string
    currentValue: number
    predictedValue: number
    timeframe: string
    confidence: number
    trend: 'up' | 'down' | 'stable'
    factors: string[]
}

interface SmartRecommendation {
    id: string
    title: string
    description: string
    category: 'optimization' | 'growth' | 'retention' | 'efficiency' | 'risk'
    impact: 'low' | 'medium' | 'high'
    effort: 'low' | 'medium' | 'high'
    timeline: string
    expectedOutcome: string
    metrics: string[]
    priority: number
}

interface MarketIntelligence {
    id: string
    title: string
    summary: string
    type: 'competitor' | 'trend' | 'opportunity' | 'threat'
    relevance: number
    source: string
    timestamp: string
    insights: string[]
    impact: 'positive' | 'negative' | 'neutral'
}

export default function BusinessIntelligencePage() {
    const [activeTab, setActiveTab] = useState('insights')
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isAutoRefresh, setIsAutoRefresh] = useState(true)

    // AI Insights
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([
        {
            id: '1',
            title: 'Revenue Growth Opportunity',
            description: 'AI analysis suggests a 23% revenue increase potential by optimizing pricing strategy for premium features',
            type: 'opportunity',
            priority: 'high',
            confidence: 87,
            impact: 9.2,
            category: 'revenue',
            timestamp: '2 hours ago',
            data: { potentialIncrease: 230000, timeframe: '3 months' },
            actionItems: [
                'Implement dynamic pricing for premium tiers',
                'A/B test new pricing models',
                'Analyze customer willingness to pay'
            ],
            source: 'Revenue Optimization Engine'
        },
        {
            id: '2',
            title: 'Customer Churn Risk Alert',
            description: 'Machine learning model detected 15% of premium customers showing early churn indicators',
            type: 'risk',
            priority: 'critical',
            confidence: 92,
            impact: 8.7,
            category: 'users',
            timestamp: '4 hours ago',
            data: { riskCustomers: 847, potentialLoss: 425000 },
            actionItems: [
                'Launch targeted retention campaign',
                'Implement personalized engagement flows',
                'Provide proactive customer support'
            ],
            source: 'Churn Prediction Model'
        },
        {
            id: '3',
            title: 'Performance Optimization',
            description: 'System performance could be improved by 35% through API caching and database optimization',
            type: 'recommendation',
            priority: 'medium',
            confidence: 78,
            impact: 7.1,
            category: 'performance',
            timestamp: '6 hours ago',
            data: { performanceGain: 35, estimatedCost: 15000 },
            actionItems: [
                'Implement Redis caching layer',
                'Optimize database queries',
                'Deploy CDN for static assets'
            ],
            source: 'Performance Analytics Engine'
        },
        {
            id: '4',
            title: 'Market Trend Detection',
            description: 'Emerging trend in mobile usage patterns suggests 67% increase in mobile transactions',
            type: 'trend',
            priority: 'medium',
            confidence: 84,
            impact: 8.3,
            category: 'market',
            timestamp: '1 day ago',
            data: { mobileGrowth: 67, projectedRevenue: 180000 },
            actionItems: [
                'Enhance mobile app features',
                'Optimize mobile checkout flow',
                'Increase mobile marketing spend'
            ],
            source: 'Market Intelligence Scanner'
        },
        {
            id: '5',
            title: 'Anomaly in User Behavior',
            description: 'Unusual spike in feature usage detected - potential viral feature that could drive growth',
            type: 'anomaly',
            priority: 'high',
            confidence: 91,
            impact: 8.9,
            category: 'users',
            timestamp: '8 hours ago',
            data: { usageIncrease: 340, feature: 'collaboration_tools' },
            actionItems: [
                'Investigate feature usage patterns',
                'Promote viral feature in marketing',
                'Enhance feature capabilities'
            ],
            source: 'Behavioral Analytics Engine'
        }
    ])

    // Predictive Models
    const [predictiveModels] = useState<PredictiveModel[]>([
        {
            id: '1',
            name: 'Revenue Forecasting',
            description: 'Predicts monthly revenue based on historical data and market trends',
            type: 'revenue',
            accuracy: 94.2,
            lastTrained: '2 days ago',
            status: 'active',
            dataPoints: 24576,
            predictions: [
                {
                    id: '1',
                    metric: 'Monthly Revenue',
                    currentValue: 847000,
                    predictedValue: 892000,
                    timeframe: 'Next month',
                    confidence: 89,
                    trend: 'up',
                    factors: ['Seasonal trends', 'Marketing campaigns', 'Product updates']
                },
                {
                    id: '2',
                    metric: 'Quarterly Revenue',
                    currentValue: 2541000,
                    predictedValue: 2834000,
                    timeframe: 'Next quarter',
                    confidence: 86,
                    trend: 'up',
                    factors: ['Market expansion', 'New features', 'Customer growth']
                }
            ]
        },
        {
            id: '2',
            name: 'Customer Churn Prediction',
            description: 'Identifies customers likely to churn in the next 30 days',
            type: 'churn',
            accuracy: 91.7,
            lastTrained: '1 day ago',
            status: 'active',
            dataPoints: 18432,
            predictions: [
                {
                    id: '3',
                    metric: 'Churn Rate',
                    currentValue: 5.2,
                    predictedValue: 6.8,
                    timeframe: 'Next month',
                    confidence: 92,
                    trend: 'up',
                    factors: ['Support tickets', 'Usage decline', 'Payment issues']
                }
            ]
        },
        {
            id: '3',
            name: 'Demand Forecasting',
            description: 'Predicts product demand and resource requirements',
            type: 'demand',
            accuracy: 88.9,
            lastTrained: '3 days ago',
            status: 'training',
            dataPoints: 31248,
            predictions: [
                {
                    id: '4',
                    metric: 'API Requests',
                    currentValue: 150000,
                    predictedValue: 178000,
                    timeframe: 'Next week',
                    confidence: 85,
                    trend: 'up',
                    factors: ['User growth', 'Feature adoption', 'Integration usage']
                }
            ]
        }
    ])

    // Smart Recommendations
    const [recommendations] = useState<SmartRecommendation[]>([
        {
            id: '1',
            title: 'Implement AI-Powered Chatbot',
            description: 'Deploy intelligent customer support chatbot to reduce response times and improve satisfaction',
            category: 'efficiency',
            impact: 'high',
            effort: 'medium',
            timeline: '6-8 weeks',
            expectedOutcome: '40% reduction in support tickets, 60% faster response times',
            metrics: ['Support ticket volume', 'Response time', 'Customer satisfaction'],
            priority: 9.2
        },
        {
            id: '2',
            title: 'Premium Feature Upselling',
            description: 'Target free users with personalized premium feature recommendations based on usage patterns',
            category: 'growth',
            impact: 'high',
            effort: 'low',
            timeline: '2-3 weeks',
            expectedOutcome: '15% increase in conversion rate, $180K additional MRR',
            metrics: ['Conversion rate', 'MRR', 'Feature adoption'],
            priority: 8.7
        },
        {
            id: '3',
            title: 'Customer Retention Program',
            description: 'Launch automated retention campaigns for at-risk customers identified by ML models',
            category: 'retention',
            impact: 'high',
            effort: 'medium',
            timeline: '4-5 weeks',
            expectedOutcome: '25% reduction in churn rate, $320K saved revenue',
            metrics: ['Churn rate', 'Customer lifetime value', 'Retention rate'],
            priority: 8.9
        },
        {
            id: '4',
            title: 'Mobile App Optimization',
            description: 'Enhance mobile experience based on user behavior analytics and performance data',
            category: 'optimization',
            impact: 'medium',
            effort: 'high',
            timeline: '8-10 weeks',
            expectedOutcome: '30% improvement in mobile conversion, 45% faster load times',
            metrics: ['Mobile conversion rate', 'App load time', 'User engagement'],
            priority: 7.4
        }
    ])

    // Market Intelligence
    const [marketIntel] = useState<MarketIntelligence[]>([
        {
            id: '1',
            title: 'Competitor Launched Similar Feature',
            summary: 'Main competitor introduced AI-powered analytics dashboard, potential impact on competitive positioning',
            type: 'competitor',
            relevance: 85,
            source: 'Market Research Bot',
            timestamp: '3 hours ago',
            insights: [
                'Feature similarity score: 78%',
                'Potential market share impact: 5-8%',
                'Opportunity to differentiate with advanced features'
            ],
            impact: 'negative'
        },
        {
            id: '2',
            title: 'Growing Demand for Real-time Analytics',
            summary: 'Industry trend shows 45% increase in demand for real-time business intelligence solutions',
            type: 'opportunity',
            relevance: 92,
            source: 'Industry Trend Analysis',
            timestamp: '1 day ago',
            insights: [
                'Market size projected to grow 34% YoY',
                'Early movers capturing 60% more market share',
                'Strong demand in SMB segment'
            ],
            impact: 'positive'
        },
        {
            id: '3',
            title: 'Regulatory Changes in Data Privacy',
            summary: 'New data privacy regulations could impact analytics and reporting capabilities',
            type: 'threat',
            relevance: 76,
            source: 'Regulatory Monitor',
            timestamp: '2 days ago',
            insights: [
                'Compliance deadline: 6 months',
                'Potential impact on data collection',
                'Opportunity to lead in privacy-first analytics'
            ],
            impact: 'negative'
        }
    ])

    // Simulate data updates
    useEffect(() => {
        if (!isAutoRefresh) return

        const interval = setInterval(() => {
            // Update AI insights confidence scores
            setAiInsights(prev => prev.map(insight => ({
                ...insight,
                confidence: Math.max(50, Math.min(100, insight.confidence + (Math.random() - 0.5) * 5))
            })))
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoRefresh])

    const getInsightTypeIcon = (type: string) => {
        switch (type) {
            case 'opportunity': return <Target className="w-5 h-5 text-green-500" />
            case 'risk': return <AlertTriangle className="w-5 h-5 text-red-500" />
            case 'trend': return <TrendingUp className="w-5 h-5 text-blue-500" />
            case 'anomaly': return <Zap className="w-5 h-5 text-purple-500" />
            case 'recommendation': return <Lightbulb className="w-5 h-5 text-orange-500" />
            default: return <Info className="w-5 h-5 text-gray-500" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100 border-red-200'
            case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
            case 'low': return 'text-green-600 bg-green-100 border-green-200'
            default: return 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-100'
            case 'medium': return 'text-yellow-600 bg-yellow-100'
            case 'low': return 'text-green-600 bg-green-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getModelStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100'
            case 'training': return 'text-yellow-600 bg-yellow-100'
            case 'inactive': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getMarketImpactColor = (impact: string) => {
        switch (impact) {
            case 'positive': return 'text-green-600 bg-green-100'
            case 'negative': return 'text-red-600 bg-red-100'
            case 'neutral': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const filteredInsights = selectedCategory === 'all'
        ? aiInsights
        : aiInsights.filter(insight => insight.category === selectedCategory)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-bold">Business Intelligence</h1>
                                        <div className="flex items-center space-x-2 text-purple-200">
                                            <Sparkles className="w-4 h-4" />
                                            <span className="text-sm">AI-Powered</span>
                                        </div>
                                    </div>
                                    <p className="text-blue-100">AI-driven insights and predictive analytics for smarter decisions</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                                className={`px-4 py-2 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors ${isAutoRefresh
                                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100'
                                        : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                {isAutoRefresh ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                <span>{isAutoRefresh ? 'Pause AI' : 'Start AI'}</span>
                            </button>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>New Analysis</span>
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* AI Insights Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Active Insights</div>
                                <div className="text-2xl font-bold text-gray-900">{aiInsights.length}</div>
                            </div>
                            <Brain className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">High Priority</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {aiInsights.filter(i => i.priority === 'high' || i.priority === 'critical').length}
                                </div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Avg Confidence</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {Math.round(aiInsights.reduce((sum, i) => sum + i.confidence, 0) / aiInsights.length)}%
                                </div>
                            </div>
                            <Target className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Recommendations</div>
                                <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
                            </div>
                            <Lightbulb className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-1 p-1">
                            {[
                                { id: 'insights', label: 'AI Insights', icon: Brain },
                                { id: 'predictions', label: 'Predictions', icon: TrendingUp },
                                { id: 'recommendations', label: 'Smart Recommendations', icon: Lightbulb },
                                { id: 'market', label: 'Market Intelligence', icon: Globe }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights Tab */}
                    {activeTab === 'insights' && (
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="revenue">Revenue</option>
                                        <option value="users">Users</option>
                                        <option value="performance">Performance</option>
                                        <option value="market">Market</option>
                                        <option value="operations">Operations</option>
                                    </select>
                                </div>
                                <select
                                    value={selectedTimeframe}
                                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="24h">Last 24 hours</option>
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                    <option value="90d">Last 90 days</option>
                                </select>
                            </div>

                            {/* Insights Grid */}
                            <div className="space-y-6">
                                {filteredInsights.map((insight) => (
                                    <motion.div
                                        key={insight.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`border-2 rounded-xl p-6 ${getPriorityColor(insight.priority)}`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-white rounded-lg">
                                                    {getInsightTypeIcon(insight.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-xl font-semibold text-gray-900">{insight.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                                                            {insight.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 mb-3">{insight.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span>Confidence: {insight.confidence}%</span>
                                                        <span>•</span>
                                                        <span>Impact: {insight.impact}/10</span>
                                                        <span>•</span>
                                                        <span>{insight.timestamp}</span>
                                                        <span>•</span>
                                                        <span>{insight.source}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Items */}
                                        {insight.actionItems.length > 0 && (
                                            <div className="bg-white/50 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">Recommended Actions:</h4>
                                                <ul className="space-y-2">
                                                    {insight.actionItems.map((action, index) => (
                                                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Predictions Tab */}
                    {activeTab === 'predictions' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {predictiveModels.map((model) => (
                                    <div key={model.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelStatusColor(model.status)}`}>
                                                    {model.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Accuracy: {model.accuracy}%</span>
                                                <span>•</span>
                                                <span>Trained: {model.lastTrained}</span>
                                                <span>•</span>
                                                <span>{model.dataPoints.toLocaleString()} data points</span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {model.predictions.map((prediction) => (
                                                    <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-medium text-gray-900">{prediction.metric}</h4>
                                                            <span className="text-sm text-gray-500">{prediction.timeframe}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <div className="text-sm text-gray-600">Current</div>
                                                                <div className="text-lg font-bold text-gray-900">
                                                                    {prediction.currentValue.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                {prediction.trend === 'up' ?
                                                                    <ArrowUpRight className="w-6 h-6 text-green-500 mx-auto" /> :
                                                                    prediction.trend === 'down' ?
                                                                        <ArrowDownRight className="w-6 h-6 text-red-500 mx-auto" /> :
                                                                        <Minus className="w-6 h-6 text-gray-500 mx-auto" />
                                                                }
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-gray-600">Predicted</div>
                                                                <div className="text-lg font-bold text-gray-900">
                                                                    {prediction.predictedValue.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mb-2">
                                                            Confidence: {prediction.confidence}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Key factors: {prediction.factors.join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {recommendations.map((rec) => (
                                    <div key={rec.id} className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                                                        {rec.impact} impact
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.effort)}`}>
                                                        {rec.effort} effort
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-3">{rec.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Timeline:</span>
                                                        <span className="ml-2 text-gray-900">{rec.timeline}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Category:</span>
                                                        <span className="ml-2 text-gray-900 capitalize">{rec.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 ml-4">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-medium">{rec.priority.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Expected Outcome:</h4>
                                            <p className="text-sm text-gray-700">{rec.expectedOutcome}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Metrics to track: {rec.metrics.join(', ')}
                                            </div>
                                            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                                                Implement
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Market Intelligence Tab */}
                    {activeTab === 'market' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {marketIntel.map((intel) => (
                                    <div key={intel.id} className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{intel.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMarketImpactColor(intel.impact)}`}>
                                                        {intel.impact}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-3">{intel.summary}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>Relevance: {intel.relevance}%</span>
                                                    <span>•</span>
                                                    <span>{intel.source}</span>
                                                    <span>•</span>
                                                    <span>{intel.timestamp}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-3">Key Insights:</h4>
                                            <ul className="space-y-2">
                                                {intel.insights.map((insight, index) => (
                                                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                                                        <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
                                                        <span>{insight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
