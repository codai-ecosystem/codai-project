'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    // Support Feature Icons
    HeadphonesIcon,
    MessageSquare,
    BookOpen,
    Bot,
    Video,

    // Advanced Feature Icons
    Brain,
    Search,
    BarChart3,
    Target,

    // Integration Icons
    Workflow,
    Smartphone,

    // Quality Icons
    Star,
    Award,
    CheckCircle2,

    // Interaction Icons
    ArrowRight,
    ExternalLink,
    Play,
    ChevronRight
} from 'lucide-react'

interface Feature {
    id: string
    title: string
    description: string
    longDescription: string
    icon: any
    color: string
    category: string
    benefits: string[]
    useCases: string[]
    metrics?: {
        improvement: string
        metric: string
    }
}

export default function FeaturesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

    // Feature Categories
    const categories = [
        { id: 'all', label: 'All Features', icon: Target },
        { id: 'support', label: 'Support Channels', icon: HeadphonesIcon },
        { id: 'ai', label: 'AI & Automation', icon: Bot },
        { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
        { id: 'integrations', label: 'Integrations', icon: Workflow },
        { id: 'quality', label: 'Quality Assurance', icon: Award }
    ]

    // Comprehensive Features Data
    const features: Feature[] = [
        // Support Channels
        {
            id: 'live-chat',
            title: 'Live Chat Support',
            description: 'Real-time messaging with customers and automated routing',
            longDescription: 'Engage with customers instantly through our advanced live chat system with intelligent routing, automated responses, and seamless handoffs.',
            icon: MessageSquare,
            color: 'blue',
            category: 'support',
            benefits: [
                'Instant customer engagement',
                'Automated routing to best agent',
                'Real-time typing indicators',
                'File and screen sharing',
                'Chat history and context'
            ],
            useCases: [
                'Technical support queries',
                'Sales inquiries',
                'Account assistance',
                'Product demonstrations'
            ],
            metrics: {
                improvement: '85%',
                metric: 'faster response times'
            }
        },
        {
            id: 'video-support',
            title: 'Video Support',
            description: 'Face-to-face support sessions with screen sharing capabilities',
            longDescription: 'Provide personalized support through HD video calls with screen sharing, recording, and co-browsing features.',
            icon: Video,
            color: 'purple',
            category: 'support',
            benefits: [
                'Personal connection with customers',
                'Visual problem-solving',
                'Screen sharing and control',
                'Session recording',
                'Multi-participant support'
            ],
            useCases: [
                'Complex technical issues',
                'Product walkthroughs',
                'Training sessions',
                'Troubleshooting guidance'
            ],
            metrics: {
                improvement: '92%',
                metric: 'issue resolution rate'
            }
        },
        {
            id: 'knowledge-base',
            title: 'Smart Knowledge Base',
            description: 'AI-powered knowledge management with intelligent search',
            longDescription: 'Comprehensive knowledge base with AI-powered search, automated content updates, and personalized recommendations.',
            icon: BookOpen,
            color: 'green',
            category: 'support',
            benefits: [
                'AI-powered content search',
                'Automatic content updates',
                'Personalized recommendations',
                'Multi-language support',
                'Analytics and insights'
            ],
            useCases: [
                'Self-service support',
                'Agent training materials',
                'Product documentation',
                'FAQ management'
            ],
            metrics: {
                improvement: '73%',
                metric: 'self-service resolution'
            }
        },

        // AI & Automation
        {
            id: 'ai-assistant',
            title: 'AI Support Assistant',
            description: 'Intelligent chatbot with natural language processing',
            longDescription: 'Advanced AI assistant that understands context, learns from interactions, and provides accurate automated responses.',
            icon: Bot,
            color: 'indigo',
            category: 'ai',
            benefits: [
                '24/7 availability',
                'Natural language understanding',
                'Context-aware responses',
                'Continuous learning',
                'Multilingual support'
            ],
            useCases: [
                'First-line support',
                'FAQ responses',
                'Ticket routing',
                'Information gathering'
            ],
            metrics: {
                improvement: '67%',
                metric: 'reduction in simple tickets'
            }
        },
        {
            id: 'smart-routing',
            title: 'Smart Ticket Routing',
            description: 'AI-powered ticket classification and agent assignment',
            longDescription: 'Intelligent routing system that analyzes ticket content, urgency, and agent expertise to ensure optimal assignments.',
            icon: Workflow,
            color: 'orange',
            category: 'ai',
            benefits: [
                'Automatic ticket classification',
                'Skills-based routing',
                'Priority assessment',
                'Workload balancing',
                'Escalation management'
            ],
            useCases: [
                'Technical support routing',
                'Priority escalation',
                'Specialist assignment',
                'Workload distribution'
            ],
            metrics: {
                improvement: '45%',
                metric: 'faster ticket resolution'
            }
        },
        {
            id: 'predictive-analytics',
            title: 'Predictive Analytics',
            description: 'Forecast trends and identify potential issues before they occur',
            longDescription: 'Advanced analytics engine that predicts customer behavior, identifies emerging issues, and optimizes support operations.',
            icon: Brain,
            color: 'pink',
            category: 'ai',
            benefits: [
                'Trend prediction',
                'Issue prevention',
                'Capacity planning',
                'Customer behavior insights',
                'Performance optimization'
            ],
            useCases: [
                'Peak time planning',
                'Issue prevention',
                'Resource allocation',
                'Customer satisfaction prediction'
            ],
            metrics: {
                improvement: '38%',
                metric: 'improvement in CSAT scores'
            }
        },

        // Analytics & Insights
        {
            id: 'real-time-dashboard',
            title: 'Real-time Dashboard',
            description: 'Comprehensive analytics with live performance metrics',
            longDescription: 'Interactive dashboard providing real-time insights into support performance, customer satisfaction, and operational metrics.',
            icon: BarChart3,
            color: 'blue',
            category: 'analytics',
            benefits: [
                'Real-time performance monitoring',
                'Customizable dashboards',
                'Automated reporting',
                'Trend analysis',
                'KPI tracking'
            ],
            useCases: [
                'Performance monitoring',
                'Team management',
                'Executive reporting',
                'Operational optimization'
            ],
            metrics: {
                improvement: '56%',
                metric: 'faster decision making'
            }
        },
        {
            id: 'customer-insights',
            title: 'Customer Insights',
            description: 'Deep customer behavior analysis and satisfaction tracking',
            longDescription: 'Comprehensive customer analytics providing insights into behavior patterns, satisfaction trends, and support effectiveness.',
            icon: Search,
            color: 'teal',
            category: 'analytics',
            benefits: [
                'Customer journey mapping',
                'Satisfaction tracking',
                'Behavior analysis',
                'Retention insights',
                'Segmentation analysis'
            ],
            useCases: [
                'Customer experience optimization',
                'Retention improvement',
                'Product development insights',
                'Service personalization'
            ],
            metrics: {
                improvement: '42%',
                metric: 'increase in customer retention'
            }
        },

        // Integrations
        {
            id: 'platform-integrations',
            title: 'Platform Integrations',
            description: 'Seamless integration with CRM, helpdesk, and business tools',
            longDescription: 'Extensive integration ecosystem connecting with popular business tools, CRMs, and communication platforms.',
            icon: Workflow,
            color: 'purple',
            category: 'integrations',
            benefits: [
                'CRM synchronization',
                'Unified customer data',
                'Workflow automation',
                'Single sign-on (SSO)',
                'Custom API access'
            ],
            useCases: [
                'CRM data sync',
                'Workflow automation',
                'Data consolidation',
                'Cross-platform communication'
            ],
            metrics: {
                improvement: '63%',
                metric: 'reduction in data entry time'
            }
        },
        {
            id: 'mobile-support',
            title: 'Mobile Support',
            description: 'Full-featured mobile apps for agents and customers',
            longDescription: 'Native mobile applications providing complete support functionality for both agents and customers on the go.',
            icon: Smartphone,
            color: 'green',
            category: 'integrations',
            benefits: [
                'Native mobile apps',
                'Offline capability',
                'Push notifications',
                'Touch-optimized interface',
                'Biometric authentication'
            ],
            useCases: [
                'Remote agent support',
                'Customer self-service',
                'Field support',
                'Emergency assistance'
            ],
            metrics: {
                improvement: '78%',
                metric: 'increase in mobile engagement'
            }
        },

        // Quality Assurance
        {
            id: 'quality-monitoring',
            title: 'Quality Monitoring',
            description: 'Automated quality scoring and agent performance tracking',
            longDescription: 'Comprehensive quality assurance system with automated scoring, performance tracking, and continuous improvement recommendations.',
            icon: Award,
            color: 'yellow',
            category: 'quality',
            benefits: [
                'Automated quality scoring',
                'Performance tracking',
                'Training recommendations',
                'Compliance monitoring',
                'Feedback management'
            ],
            useCases: [
                'Agent performance evaluation',
                'Compliance monitoring',
                'Training identification',
                'Service improvement'
            ],
            metrics: {
                improvement: '51%',
                metric: 'improvement in service quality'
            }
        },
        {
            id: 'satisfaction-tracking',
            title: 'Satisfaction Tracking',
            description: 'Comprehensive customer satisfaction measurement and analysis',
            longDescription: 'Advanced satisfaction tracking system with multiple feedback channels, sentiment analysis, and actionable insights.',
            icon: Star,
            color: 'orange',
            category: 'quality',
            benefits: [
                'Multi-channel feedback collection',
                'Sentiment analysis',
                'NPS tracking',
                'Trend identification',
                'Actionable insights'
            ],
            useCases: [
                'Service quality measurement',
                'Customer feedback analysis',
                'Improvement prioritization',
                'Performance benchmarking'
            ],
            metrics: {
                improvement: '34%',
                metric: 'increase in customer satisfaction'
            }
        }
    ]

    // Filter features based on selected category
    const filteredFeatures = selectedCategory === 'all'
        ? features
        : features.filter(feature => feature.category === selectedCategory)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl mx-6 mt-6 p-8 text-white shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold mb-4">AJUTAI Features</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Discover our comprehensive suite of intelligent support tools designed to transform your customer service experience
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex justify-center">
                    <div className="flex space-x-1 bg-white/10 rounded-xl p-1 backdrop-blur-sm">
                        {categories.map((category) => {
                            const IconComponent = category.icon
                            const isActive = selectedCategory === category.id

                            return (
                                <motion.button
                                    key={category.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-white text-purple-600 shadow-lg'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    <span className="font-medium">{category.label}</span>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Features Grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFeatures.map((feature, index) => {
                        const IconComponent = feature.icon
                        const isSelected = selectedFeature === feature.id

                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
                                    }`}
                                onClick={() => setSelectedFeature(isSelected ? null : feature.id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-${feature.color}-100`}>
                                        <IconComponent className={`h-6 w-6 text-${feature.color}-600`} />
                                    </div>
                                    {feature.metrics && (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {feature.metrics.improvement}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {feature.metrics.metric}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>

                                {/* Expanded Content */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-gray-700">{feature.longDescription}</p>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                                            <ul className="space-y-1">
                                                {feature.benefits.map((benefit, idx) => (
                                                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Use Cases:</h4>
                                            <ul className="space-y-1">
                                                {feature.useCases.map((useCase, idx) => (
                                                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <ArrowRight className="h-4 w-4 text-blue-500" />
                                                        <span>{useCase}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex items-center justify-between mt-4">
                                    <span className={`text-${feature.color}-600 text-sm font-medium capitalize`}>
                                        {feature.category}
                                    </span>
                                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''
                                        }`} />
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Call to Action Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6"
            >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Support?</h2>
                    <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                        Experience the future of customer support with AJUTAI's comprehensive platform
                    </p>
                    <div className="flex justify-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                        >
                            <Play className="h-5 w-5" />
                            <span>Start Free Trial</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center space-x-2"
                        >
                            <ExternalLink className="h-5 w-5" />
                            <span>View Demo</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
