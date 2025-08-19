'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    // Knowledge Base Icons
    Search,
    Filter,
    Star,
    ThumbsUp,
    Eye,
    Plus,

    // Category Icons
    Users,
    Settings,
    CreditCard,
    Shield,
    Smartphone,
    Globe,
    HelpCircle,
    Zap,

    // Navigation Icons
    ChevronRight,
    ExternalLink,
    ArrowRight,

    // Interaction Icons
    MessageSquare,
    Share2,

    // Status Icons
    Clock,
    CheckCircle2,
    TrendingUp
} from 'lucide-react'

interface KnowledgeArticle {
    id: string
    title: string
    content: string
    excerpt: string
    category: string
    tags: string[]
    views: number
    helpful: number
    notHelpful: number
    createdAt: Date
    updatedAt: Date
    author: string
    readTime: number
    featured: boolean
}

interface Category {
    id: string
    name: string
    description: string
    icon: any
    color: string
    articleCount: number
}

export default function KnowledgePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedArticle, setSelectedArticle] = useState<string | null>(null)

    // Categories
    const categories: Category[] = [
        {
            id: 'getting-started',
            name: 'Getting Started',
            description: 'Basic guides and setup instructions',
            icon: Zap,
            color: 'blue',
            articleCount: 12
        },
        {
            id: 'account',
            name: 'Account Management',
            description: 'Managing your account and profile',
            icon: Users,
            color: 'green',
            articleCount: 8
        },
        {
            id: 'billing',
            name: 'Billing & Payments',
            description: 'Payment methods and billing information',
            icon: CreditCard,
            color: 'purple',
            articleCount: 6
        },
        {
            id: 'security',
            name: 'Security & Privacy',
            description: 'Security features and privacy settings',
            icon: Shield,
            color: 'red',
            articleCount: 10
        },
        {
            id: 'mobile',
            name: 'Mobile Apps',
            description: 'Using our mobile applications',
            icon: Smartphone,
            color: 'orange',
            articleCount: 5
        },
        {
            id: 'integrations',
            name: 'Integrations',
            description: 'Third-party integrations and APIs',
            icon: Globe,
            color: 'teal',
            articleCount: 15
        },
        {
            id: 'troubleshooting',
            name: 'Troubleshooting',
            description: 'Common issues and solutions',
            icon: Settings,
            color: 'gray',
            articleCount: 20
        },
        {
            id: 'faq',
            name: 'FAQ',
            description: 'Frequently asked questions',
            icon: HelpCircle,
            color: 'indigo',
            articleCount: 25
        }
    ]

    // Sample Articles
    const articles: KnowledgeArticle[] = [
        {
            id: '1',
            title: 'Getting Started with AJUTAI Support Platform',
            content: 'Complete guide to setting up your support workspace...',
            excerpt: 'Learn how to set up your support workspace and configure basic settings to get started with AJUTAI.',
            category: 'getting-started',
            tags: ['setup', 'basics', 'configuration'],
            views: 1250,
            helpful: 89,
            notHelpful: 3,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-15'),
            author: 'Support Team',
            readTime: 5,
            featured: true
        },
        {
            id: '2',
            title: 'How to Create and Manage Support Tickets',
            content: 'Step-by-step guide for creating and managing support tickets...',
            excerpt: 'Comprehensive guide on creating, assigning, and resolving support tickets efficiently.',
            category: 'getting-started',
            tags: ['tickets', 'management', 'workflow'],
            views: 892,
            helpful: 67,
            notHelpful: 2,
            createdAt: new Date('2024-01-12'),
            updatedAt: new Date('2024-01-14'),
            author: 'Sarah Johnson',
            readTime: 8,
            featured: true
        },
        {
            id: '3',
            title: 'Setting Up Two-Factor Authentication',
            content: 'Security guide for enabling 2FA on your account...',
            excerpt: 'Enhance your account security by enabling two-factor authentication with our step-by-step guide.',
            category: 'security',
            tags: ['security', '2fa', 'authentication'],
            views: 654,
            helpful: 45,
            notHelpful: 1,
            createdAt: new Date('2024-01-08'),
            updatedAt: new Date('2024-01-10'),
            author: 'Security Team',
            readTime: 4,
            featured: false
        },
        {
            id: '4',
            title: 'Understanding Billing and Payment Methods',
            content: 'Complete guide to billing, invoices, and payment options...',
            excerpt: 'Learn about billing cycles, payment methods, and how to manage your subscription.',
            category: 'billing',
            tags: ['billing', 'payments', 'subscription'],
            views: 432,
            helpful: 32,
            notHelpful: 5,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-12'),
            author: 'Billing Team',
            readTime: 6,
            featured: false
        },
        {
            id: '5',
            title: 'Mobile App Installation and Setup',
            content: 'Guide for installing and configuring mobile apps...',
            excerpt: 'Download and set up the AJUTAI mobile app for iOS and Android devices.',
            category: 'mobile',
            tags: ['mobile', 'ios', 'android', 'setup'],
            views: 789,
            helpful: 56,
            notHelpful: 2,
            createdAt: new Date('2024-01-06'),
            updatedAt: new Date('2024-01-11'),
            author: 'Mobile Team',
            readTime: 7,
            featured: false
        }
    ]

    // Filter articles
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    // Popular articles
    const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)

    // Recent articles
    const recentArticles = [...articles].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5)

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Knowledge Base</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Find answers to your questions and learn how to make the most of AJUTAI
                </p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                    <input
                        type="text"
                        placeholder="Search for articles, guides, and FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                    />
                </div>
            </motion.div>

            {/* Categories */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((category) => {
                        const IconComponent = category.icon
                        const isSelected = selectedCategory === category.id

                        return (
                            <motion.button
                                key={category.id}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                                        ? `border-${category.color}-500 bg-${category.color}-50`
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className={`inline-flex p-2 rounded-lg bg-${category.color}-100 mb-3`}>
                                    <IconComponent className={`h-5 w-5 text-${category.color}-600`} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{category.articleCount} articles</span>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </motion.button>
                        )
                    })}
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Articles */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Featured Articles */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === 'all' ? 'Featured Articles' : `${categories.find(c => c.id === selectedCategory)?.name || ''} Articles`}
                            </h2>
                            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                                <Plus className="h-4 w-4" />
                                <span>Add Article</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {filteredArticles.map((article) => (
                                <motion.div
                                    key={article.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                                    onClick={() => setSelectedArticle(selectedArticle === article.id ? null : article.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                {article.featured && (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                )}
                                                <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                                            </div>
                                            <p className="text-gray-600 mb-3">{article.excerpt}</p>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Eye className="h-4 w-4" />
                                                    <span>{article.views} views</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    <span>{article.helpful}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{article.readTime} min read</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 mt-3">
                                                {article.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center space-y-2 ml-4">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Popular Articles */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span>Popular Articles</span>
                        </h3>
                        <div className="space-y-3">
                            {popularArticles.map((article, index) => (
                                <div key={article.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{article.views} views</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Updates */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <span>Recent Updates</span>
                        </h3>
                        <div className="space-y-3">
                            {recentArticles.map((article) => (
                                <div key={article.id} className="p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Updated {article.updatedAt.toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
                    >
                        <h3 className="text-lg font-bold mb-4">Need More Help?</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center space-x-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                <span>Contact Support</span>
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </button>
                            <button className="w-full flex items-center space-x-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                                <HelpCircle className="h-4 w-4" />
                                <span>Request Feature</span>
                                <ArrowRight className="h-4 w-4 ml-auto" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
