'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp,
    Heart,
    Brain,
    Users,
    Star,
    ArrowLeft,
    Target,
    Activity,
    BarChart3,
    PieChart,
    Zap,
    Shield,
    Eye,
    Coffee,
    MessageCircle,
    Calendar,
    ChevronRight,
    ChevronDown,
    Info,
    Award,
    Sparkles,
    Filter,
    RefreshCw,
    Download,
    Share2
} from 'lucide-react'
import Link from 'next/link'

interface CompatibilityScore {
    category: string
    score: number
    description: string
    factors: string[]
    icon: React.ReactNode
    color: string
}

interface PersonalityMatch {
    trait: string
    userScore: number
    partnerScore: number
    compatibility: number
    description: string
}

interface RelationshipInsight {
    id: string
    title: string
    type: 'strength' | 'challenge' | 'opportunity'
    description: string
    impact: 'high' | 'medium' | 'low'
    actionable: boolean
    recommendation?: string
}

interface CompatibilityReport {
    overallScore: number
    profileName: string
    profileAge: number
    analysisDate: string
    scores: CompatibilityScore[]
    personalityMatch: PersonalityMatch[]
    insights: RelationshipInsight[]
    projectedOutcome: {
        shortTerm: number
        longTerm: number
        marriage: number
    }
}

const CurtAICompatibilityPage: React.FC = () => {
    const [selectedProfile, setSelectedProfile] = useState(0)
    const [activeTab, setActiveTab] = useState<'overview' | 'personality' | 'insights' | 'predictions'>('overview')
    const [expandedInsight, setExpandedInsight] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(false)

    const compatibilityReports: CompatibilityReport[] = [
        {
            overallScore: 94,
            profileName: 'Sofia Chen',
            profileAge: 26,
            analysisDate: '2025-08-09',
            scores: [
                {
                    category: 'Emotional Intelligence',
                    score: 96,
                    description: 'Exceptional emotional understanding and empathy',
                    factors: ['High empathy levels', 'Emotional stability', 'Communication skills', 'Conflict resolution'],
                    icon: <Heart className="w-5 h-5" />,
                    color: 'text-red-500'
                },
                {
                    category: 'Intellectual Connection',
                    score: 92,
                    description: 'Strong mental compatibility and shared interests',
                    factors: ['Similar educational background', 'Shared curiosity', 'Problem-solving approach', 'Learning style'],
                    icon: <Brain className="w-5 h-5" />,
                    color: 'text-blue-500'
                },
                {
                    category: 'Lifestyle Compatibility',
                    score: 89,
                    description: 'Well-aligned life goals and daily habits',
                    factors: ['Work-life balance', 'Social preferences', 'Health habits', 'Financial goals'],
                    icon: <Coffee className="w-5 h-5" />,
                    color: 'text-green-500'
                },
                {
                    category: 'Communication Style',
                    score: 98,
                    description: 'Excellent communication synergy and understanding',
                    factors: ['Direct communication', 'Active listening', 'Conflict style', 'Emotional expression'],
                    icon: <MessageCircle className="w-5 h-5" />,
                    color: 'text-purple-500'
                },
                {
                    category: 'Future Vision',
                    score: 87,
                    description: 'Aligned long-term goals and aspirations',
                    factors: ['Career ambitions', 'Family planning', 'Life priorities', 'Value alignment'],
                    icon: <Target className="w-5 h-5" />,
                    color: 'text-orange-500'
                }
            ],
            personalityMatch: [
                {
                    trait: 'Openness to Experience',
                    userScore: 85,
                    partnerScore: 88,
                    compatibility: 92,
                    description: 'Both highly curious and creative, excellent match for exploring new experiences together'
                },
                {
                    trait: 'Conscientiousness',
                    userScore: 78,
                    partnerScore: 82,
                    compatibility: 89,
                    description: 'Well-balanced organization levels, complementary planning and execution styles'
                },
                {
                    trait: 'Extraversion',
                    userScore: 72,
                    partnerScore: 65,
                    compatibility: 88,
                    description: 'Balanced social energy, one slightly more outgoing creates healthy dynamic'
                },
                {
                    trait: 'Agreeableness',
                    userScore: 91,
                    partnerScore: 94,
                    compatibility: 95,
                    description: 'Exceptional harmony potential, both highly cooperative and considerate'
                },
                {
                    trait: 'Emotional Stability',
                    userScore: 84,
                    partnerScore: 89,
                    compatibility: 91,
                    description: 'Strong emotional foundation, mutual support during challenging times'
                }
            ],
            insights: [
                {
                    id: '1',
                    title: 'Shared Creative Passions',
                    type: 'strength',
                    description: 'Both of you have strong artistic inclinations and appreciate creative expression, creating natural bonding opportunities.',
                    impact: 'high',
                    actionable: true,
                    recommendation: 'Plan creative dates like art galleries, photography walks, or collaborative projects'
                },
                {
                    id: '2',
                    title: 'Communication Harmony',
                    type: 'strength',
                    description: 'Your communication styles are exceptionally compatible, with both preferring direct yet empathetic dialogue.',
                    impact: 'high',
                    actionable: false
                },
                {
                    id: '3',
                    title: 'Career Ambition Balance',
                    type: 'opportunity',
                    description: 'While both career-focused, your different industries offer mutual learning and support opportunities.',
                    impact: 'medium',
                    actionable: true,
                    recommendation: 'Share professional insights and support each other\'s career growth'
                },
                {
                    id: '4',
                    title: 'Social Energy Differences',
                    type: 'challenge',
                    description: 'Slight difference in social preferences may require negotiation for optimal balance.',
                    impact: 'low',
                    actionable: true,
                    recommendation: 'Communicate openly about social needs and find compromise on activities'
                }
            ],
            projectedOutcome: {
                shortTerm: 89,
                longTerm: 94,
                marriage: 87
            }
        }
    ]

    const currentReport = compatibilityReports[selectedProfile]

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100'
        if (score >= 80) return 'text-blue-600 bg-blue-100'
        if (score >= 70) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
    }

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'strength': return <Star className="w-5 h-5 text-green-500" />
            case 'challenge': return <Activity className="w-5 h-5 text-red-500" />
            case 'opportunity': return <Zap className="w-5 h-5 text-blue-500" />
            default: return <Info className="w-5 h-5 text-gray-500" />
        }
    }

    const getImpactBadge = (impact: string) => {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        }
        return colors[impact as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-8 shadow-xl"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Compatibility Analysis</h1>
                                <p className="text-pink-100">AI-Powered Relationship Intelligence</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Download className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Overall Compatibility Score */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    Compatibility with {currentReport.profileName}
                                </h2>
                                <p className="text-pink-100">
                                    Analysis completed on {new Date(currentReport.analysisDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold mb-2">{currentReport.overallScore}%</div>
                                <div className="text-pink-100">Overall Match</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                            { id: 'personality', label: 'Personality Match', icon: <Brain className="w-4 h-4" /> },
                            { id: 'insights', label: 'Relationship Insights', icon: <Eye className="w-4 h-4" /> },
                            { id: 'predictions', label: 'Future Predictions', icon: <Target className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 justify-center ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Compatibility Categories */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {currentReport.scores.map((score, index) => (
                                <motion.div
                                    key={score.category}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 bg-gray-100 rounded-lg ${score.color}`}>
                                                {score.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">{score.category}</h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score.score)}`}>
                                            {score.score}%
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4">{score.description}</p>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Compatibility Score</span>
                                            <span className="font-medium">{score.score}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${score.score}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Key Factors */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => setShowDetails(!showDetails)}
                                            className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
                                        >
                                            <span>Key Factors</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {showDetails && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 space-y-2"
                                                >
                                                    {score.factors.map((factor, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                                                            <span>{factor}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                                    <MessageCircle className="w-5 h-5 text-pink-600" />
                                    <span className="text-pink-700 font-medium">Start Conversation</span>
                                </button>
                                <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <span className="text-blue-700 font-medium">Schedule Date</span>
                                </button>
                                <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    <span className="text-purple-700 font-medium">View Full Profile</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Personality Match Tab */}
                {activeTab === 'personality' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {currentReport.personalityMatch.map((match, index) => (
                            <motion.div
                                key={match.trait}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{match.trait}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(match.compatibility)}`}>
                                        {match.compatibility}%
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-6">{match.description}</p>

                                <div className="space-y-4">
                                    {/* User Score */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">Your Score</span>
                                            <span className="font-medium">{match.userScore}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${match.userScore}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Partner Score */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">{currentReport.profileName}'s Score</span>
                                            <span className="font-medium">{match.partnerScore}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${match.partnerScore}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                                                className="bg-gradient-to-r from-pink-400 to-red-500 h-2 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {currentReport.insights.map((insight, index) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {getInsightIcon(insight.type)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactBadge(insight.impact)}`}>
                                                    {insight.impact} impact
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize">{insight.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {insight.actionable && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                            Actionable
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 mb-4">{insight.description}</p>

                                {insight.recommendation && (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">AI Recommendation</span>
                                        </div>
                                        <p className="text-blue-700 text-sm">{insight.recommendation}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Predictions Tab */}
                {activeTab === 'predictions' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Relationship Timeline Predictions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Relationship Timeline Predictions</h3>

                            <div className="space-y-6">
                                {[
                                    { period: 'Short-term (3-6 months)', score: currentReport.projectedOutcome.shortTerm, description: 'Initial dating phase success probability' },
                                    { period: 'Long-term (1-2 years)', score: currentReport.projectedOutcome.longTerm, description: 'Sustained relationship success probability' },
                                    { period: 'Marriage Potential', score: currentReport.projectedOutcome.marriage, description: 'Long-term commitment compatibility' }
                                ].map((prediction, index) => (
                                    <div key={prediction.period} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{prediction.period}</h4>
                                                <p className="text-sm text-gray-600">{prediction.description}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(prediction.score)}`}>
                                                {prediction.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${prediction.score}%` }}
                                                transition={{ duration: 1, delay: index * 0.2 }}
                                                className="bg-gradient-to-r from-pink-500 to-red-500 h-3 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Confidence Analysis */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Confidence</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-800">Data Quality</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Profile Completeness</span>
                                            <span className="font-medium">94%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Behavioral Data</span>
                                            <span className="font-medium">87%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-800">Algorithm Confidence</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Personality Match</span>
                                            <span className="font-medium">96%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Lifestyle Compatibility</span>
                                            <span className="font-medium">91%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '91%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Brain className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Advanced algorithms analyze 50+ compatibility factors for accurate predictions
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Learn More
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <Shield className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Privacy Protected</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Your compatibility data is encrypted and never shared with third parties
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Privacy Policy
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                        >
                            <TrendingUp className="w-8 h-8 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Continuous Learning</h3>
                            <p className="text-pink-100 text-sm mb-4">
                                Our AI improves predictions based on successful relationship outcomes
                            </p>
                            <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Success Stories
                            </button>
                        </motion.div>
                    </div>

                    <div className="text-center mt-8 pt-8 border-t border-white/20">
                        <p className="text-pink-100">
                            © 2025 CurtAI - AI-Powered Compatibility Analysis. Part of the CODAI Ecosystem.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default CurtAICompatibilityPage
