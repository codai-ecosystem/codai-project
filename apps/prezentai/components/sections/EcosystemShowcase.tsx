'use client'

import { motion } from 'framer-motion'
import {
    Code, Brain, CreditCard, TrendingUp, GraduationCap,
    GamepadIcon, Video, Shield, Search, Network,
    Bot, Database, Sparkles, Zap, Globe,
    ChevronRight, ExternalLink, Star
} from 'lucide-react'
import { useState } from 'react'

interface EcosystemApp {
    name: string
    port: number
    category: string
    description: string
    icon: any
    features: string[]
    status: 'live' | 'development' | 'planned'
    color: string
    gradient: string
}

const ecosystemApps: EcosystemApp[] = [
    {
        name: 'CODAI',
        port: 4030,
        category: 'Development',
        description: 'Advanced AI-powered code generation and development assistant with intelligent automation.',
        icon: Code,
        features: ['Code Generation', 'Auto-completion', 'Bug Detection', 'Optimization'],
        status: 'live',
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600'
    },
    {
        name: 'MEMORAI',
        port: 4031,
        category: 'Intelligence',
        description: 'Hyper-fast memory management system with advanced context retrieval and storage.',
        icon: Brain,
        features: ['Context Storage', 'Fast Retrieval', 'Memory Search', 'Smart Indexing'],
        status: 'live',
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-purple-600'
    },
    {
        name: 'BANCAI',
        port: 4033,
        category: 'Finance',
        description: 'Intelligent banking and financial management system with AI-driven insights.',
        icon: CreditCard,
        features: ['Smart Banking', 'Financial Analytics', 'Investment Tracking', 'Security'],
        status: 'live',
        color: 'text-green-600',
        gradient: 'from-green-500 to-green-600'
    },
    {
        name: 'STOCAI',
        port: 4063,
        category: 'Trading',
        description: 'Advanced stock market analysis and trading platform with AI predictions.',
        icon: TrendingUp,
        features: ['Market Analysis', 'Trading Signals', 'Portfolio Management', 'Risk Assessment'],
        status: 'live',
        color: 'text-yellow-600',
        gradient: 'from-yellow-500 to-yellow-600'
    },
    {
        name: 'STUDIAI',
        port: 4012,
        category: 'Education',
        description: 'Personalized learning platform with AI tutoring and educational content.',
        icon: GraduationCap,
        features: ['AI Tutoring', 'Personalized Learning', 'Progress Tracking', 'Study Plans'],
        status: 'live',
        color: 'text-indigo-600',
        gradient: 'from-indigo-500 to-indigo-600'
    },
    {
        name: 'JUCAI',
        port: 4070,
        category: 'Gaming',
        description: 'AI-powered gaming platform with intelligent game mechanics and player analytics.',
        icon: GamepadIcon,
        features: ['Game AI', 'Player Analytics', 'Dynamic Content', 'Performance Metrics'],
        status: 'live',
        color: 'text-red-600',
        gradient: 'from-red-500 to-red-600'
    },
    {
        name: 'CURTAI',
        port: 4050,
        category: 'Media',
        description: 'AI-enhanced video and media processing platform with content optimization.',
        icon: Video,
        features: ['Video Processing', 'Content Optimization', 'AI Enhancement', 'Media Analytics'],
        status: 'live',
        color: 'text-pink-600',
        gradient: 'from-pink-500 to-pink-600'
    },
    {
        name: 'ADMIN',
        port: 4062,
        category: 'Management',
        description: 'Comprehensive administration panel for ecosystem management and monitoring.',
        icon: Shield,
        features: ['System Monitoring', 'User Management', 'Analytics Dashboard', 'Security Controls'],
        status: 'live',
        color: 'text-gray-600',
        gradient: 'from-gray-500 to-gray-600'
    },
    {
        name: 'EXPLORER',
        port: 4060,
        category: 'Discovery',
        description: 'Advanced search and discovery platform for ecosystem navigation and exploration.',
        icon: Search,
        features: ['Smart Search', 'Content Discovery', 'Data Exploration', 'Analytics'],
        status: 'live',
        color: 'text-cyan-600',
        gradient: 'from-cyan-500 to-cyan-600'
    },
    {
        name: 'HUB',
        port: 4001,
        category: 'Integration',
        description: 'Central hub for ecosystem integration and inter-application communication.',
        icon: Network,
        features: ['App Integration', 'API Gateway', 'Service Mesh', 'Communication Hub'],
        status: 'live',
        color: 'text-orange-600',
        gradient: 'from-orange-500 to-orange-600'
    }
]

const categories = ['All', ...Array.from(new Set(ecosystemApps.map(app => app.category)))]

export function EcosystemShowcase() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [hoveredApp, setHoveredApp] = useState<string | null>(null)

    const filteredApps = activeCategory === 'All'
        ? ecosystemApps
        : ecosystemApps.filter(app => app.category === activeCategory)

    return (
        <section id="ecosystem" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full mb-6 border border-gray-200/50 dark:border-gray-700/50">
                        <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            AI Ecosystem Portfolio
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        30+ Cutting-Edge{' '}
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            AI Applications
                        </span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Explore our comprehensive ecosystem of AI-powered applications, each designed to solve
                        specific challenges across different industries and domains.
                    </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-2 mb-12"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeCategory === category
                                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                                : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 border border-gray-200/50 dark:border-gray-700/50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredApps.map((app, index) => (
                        <motion.div
                            key={app.name}
                            layout="position"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02 }}
                            onMouseEnter={() => setHoveredApp(app.name)}
                            onMouseLeave={() => setHoveredApp(null)}
                            className="group"
                        >
                            <div className="relative h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20 overflow-hidden">
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'live'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : app.status === 'development'
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                        }`}>
                                        {app.status === 'live' ? 'LIVE' : app.status === 'development' ? 'DEV' : 'PLANNED'}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-8">
                                    {/* Icon and Header */}
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className={`p-3 rounded-xl bg-gradient-to-r ${app.gradient} group-hover:scale-110 transition-transform duration-300`}>
                                            <app.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {app.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Port {app.port} • {app.category}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                        {app.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-2 mb-6">
                                        {app.features.map((feature, featureIndex) => (
                                            <motion.div
                                                key={feature}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                                                className="flex items-center space-x-2"
                                            >
                                                <Star className="w-3 h-3 text-primary-500" fill="currentColor" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {feature}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        {app.status === 'live' && (
                                            <a
                                                href={`http://localhost:${app.port}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 group/btn"
                                            >
                                                <span>Launch App</span>
                                                <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                                            </a>
                                        )}
                                        <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl mb-6">
                        <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="font-medium text-primary-700 dark:text-primary-300">
                            More applications in development
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Our ecosystem is constantly evolving. Stay tuned for more innovative AI applications
                        that will continue to push the boundaries of what's possible.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
