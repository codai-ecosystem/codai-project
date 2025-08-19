'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Store,
    Search,
    Filter,
    Star,
    Download,
    Eye,
    Heart,
    Clock,
    Users,
    Zap,
    Shield,
    Database,
    Mail,
    Code,
    Cpu,
    Smartphone,
    Cloud,
    TrendingUp,
    Award,
    CheckCircle
} from 'lucide-react'

// TypeScript interfaces for Templates Gallery
interface Template {
    id: string
    name: string
    description: string
    category: string
    subcategory: string
    author: {
        name: string
        avatar: string
        verified: boolean
    }
    stats: {
        downloads: number
        rating: number
        reviews: number
        lastUpdated: string
    }
    tags: string[]
    price: 'free' | 'premium' | number
    featured: boolean
    complexity: 'beginner' | 'intermediate' | 'advanced'
    thumbnail: string
    workflows: number
    estimatedTime: string
}

interface TemplateCategory {
    id: string
    name: string
    icon: React.ComponentType<any>
    count: number
    description: string
}

export default function TemplatesGallery() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('popular')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showFilters, setShowFilters] = useState(false)

    // Template categories
    const categories: TemplateCategory[] = [
        { id: 'all', name: 'All Templates', icon: Store, count: 156, description: 'Browse all available templates' },
        { id: 'business', name: 'Business', icon: TrendingUp, count: 24, description: 'Business process automation' },
        { id: 'marketing', name: 'Marketing', icon: Users, count: 18, description: 'Marketing and lead generation' },
        { id: 'data', name: 'Data Processing', icon: Database, count: 22, description: 'Data transformation and analysis' },
        { id: 'communication', name: 'Communication', icon: Mail, count: 16, description: 'Email, SMS, and notifications' },
        { id: 'security', name: 'Security', icon: Shield, count: 12, description: 'Security and compliance workflows' },
        { id: 'integration', name: 'Integration', icon: Zap, count: 28, description: 'API and system integrations' },
        { id: 'ai', name: 'AI & ML', icon: Cpu, count: 14, description: 'AI and machine learning workflows' },
        { id: 'mobile', name: 'Mobile', icon: Smartphone, count: 10, description: 'Mobile app automation' },
        { id: 'cloud', name: 'Cloud', icon: Cloud, count: 12, description: 'Cloud services and deployment' }
    ]

    // Sample templates
    const templates: Template[] = [
        {
            id: 'temp-1',
            name: 'Customer Onboarding Flow',
            description: 'Complete customer onboarding workflow with email verification, welcome sequence, and account setup automation.',
            category: 'business',
            subcategory: 'onboarding',
            author: {
                name: 'WorkflowPro',
                avatar: '/avatars/workflowpro.jpg',
                verified: true
            },
            stats: {
                downloads: 2847,
                rating: 4.8,
                reviews: 156,
                lastUpdated: '2024-01-15'
            },
            tags: ['onboarding', 'email', 'automation', 'crm'],
            price: 'free',
            featured: true,
            complexity: 'intermediate',
            thumbnail: '/templates/onboarding.jpg',
            workflows: 8,
            estimatedTime: '2-3 hours'
        },
        {
            id: 'temp-2',
            name: 'E-commerce Order Processing',
            description: 'Automated order processing from checkout to fulfillment with inventory management and shipping notifications.',
            category: 'business',
            subcategory: 'ecommerce',
            author: {
                name: 'AutomationExperts',
                avatar: '/avatars/autoexperts.jpg',
                verified: true
            },
            stats: {
                downloads: 1923,
                rating: 4.9,
                reviews: 89,
                lastUpdated: '2024-01-12'
            },
            tags: ['ecommerce', 'orders', 'inventory', 'shipping'],
            price: 29,
            featured: true,
            complexity: 'advanced',
            thumbnail: '/templates/ecommerce.jpg',
            workflows: 12,
            estimatedTime: '4-6 hours'
        },
        {
            id: 'temp-3',
            name: 'Social Media Scheduler',
            description: 'Multi-platform social media content scheduling with analytics tracking and engagement monitoring.',
            category: 'marketing',
            subcategory: 'social',
            author: {
                name: 'SocialBot',
                avatar: '/avatars/socialbot.jpg',
                verified: false
            },
            stats: {
                downloads: 3421,
                rating: 4.6,
                reviews: 203,
                lastUpdated: '2024-01-18'
            },
            tags: ['social media', 'scheduling', 'analytics', 'content'],
            price: 'free',
            featured: false,
            complexity: 'beginner',
            thumbnail: '/templates/social.jpg',
            workflows: 6,
            estimatedTime: '1-2 hours'
        },
        {
            id: 'temp-4',
            name: 'Data Pipeline Builder',
            description: 'ETL pipeline for data extraction, transformation, and loading with error handling and monitoring.',
            category: 'data',
            subcategory: 'etl',
            author: {
                name: 'DataFlow',
                avatar: '/avatars/dataflow.jpg',
                verified: true
            },
            stats: {
                downloads: 1567,
                rating: 4.7,
                reviews: 78,
                lastUpdated: '2024-01-10'
            },
            tags: ['etl', 'data pipeline', 'monitoring', 'big data'],
            price: 49,
            featured: true,
            complexity: 'advanced',
            thumbnail: '/templates/datapipeline.jpg',
            workflows: 15,
            estimatedTime: '6-8 hours'
        },
        {
            id: 'temp-5',
            name: 'Lead Qualification System',
            description: 'Automated lead scoring and qualification with CRM integration and sales team notifications.',
            category: 'marketing',
            subcategory: 'leads',
            author: {
                name: 'SalesAutomation',
                avatar: '/avatars/salesauto.jpg',
                verified: true
            },
            stats: {
                downloads: 2156,
                rating: 4.5,
                reviews: 124,
                lastUpdated: '2024-01-14'
            },
            tags: ['leads', 'scoring', 'crm', 'sales'],
            price: 19,
            featured: false,
            complexity: 'intermediate',
            thumbnail: '/templates/leads.jpg',
            workflows: 9,
            estimatedTime: '3-4 hours'
        },
        {
            id: 'temp-6',
            name: 'AI Content Generator',
            description: 'AI-powered content generation for blogs, social media, and marketing materials with approval workflows.',
            category: 'ai',
            subcategory: 'content',
            author: {
                name: 'AI Creative',
                avatar: '/avatars/aicreative.jpg',
                verified: true
            },
            stats: {
                downloads: 4532,
                rating: 4.9,
                reviews: 287,
                lastUpdated: '2024-01-20'
            },
            tags: ['ai', 'content', 'generation', 'approval'],
            price: 39,
            featured: true,
            complexity: 'intermediate',
            thumbnail: '/templates/aigenerator.jpg',
            workflows: 7,
            estimatedTime: '2-3 hours'
        }
    ]

    // Filter templates based on search and category
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    // Sort templates
    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.stats.downloads - a.stats.downloads
            case 'rating':
                return b.stats.rating - a.stats.rating
            case 'newest':
                return new Date(b.stats.lastUpdated).getTime() - new Date(a.stats.lastUpdated).getTime()
            case 'price-low':
                const priceA = typeof a.price === 'number' ? a.price : a.price === 'free' ? 0 : 999
                const priceB = typeof b.price === 'number' ? b.price : b.price === 'free' ? 0 : 999
                return priceA - priceB
            default:
                return 0
        }
    })

    const getPriceDisplay = (price: Template['price']) => {
        if (price === 'free') return 'Free'
        if (price === 'premium') return 'Premium'
        return `$${price}`
    }

    const getComplexityColor = (complexity: Template['complexity']) => {
        switch (complexity) {
            case 'beginner': return 'text-green-600 bg-green-100'
            case 'intermediate': return 'text-yellow-600 bg-yellow-100'
            case 'advanced': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-xl">
                                    <Store className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        Templates Gallery
                                    </h1>
                                    <p className="text-sm text-gray-500">Discover and install workflow templates</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
                            >
                                <Filter className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Categories Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-80 space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <motion.button
                                            key={category.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedCategory === category.id
                                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Icon className="h-5 w-5" />
                                                    <div>
                                                        <div className="font-medium">{category.name}</div>
                                                        <div className={`text-xs ${selectedCategory === category.id ? 'text-purple-100' : 'text-gray-500'
                                                            }`}>
                                                            {category.count} templates
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="popular">Most Popular</option>
                                            <option value="rating">Highest Rated</option>
                                            <option value="newest">Newest</option>
                                            <option value="price-low">Price: Low to High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                                        <div className="flex space-x-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setViewMode('grid')}
                                                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${viewMode === 'grid'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                Grid
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setViewMode('list')}
                                                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${viewMode === 'list'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                List
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Templates Grid */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedCategory === 'all' ? 'All Templates' : categories.find(c => c.id === selectedCategory)?.name}
                                </h2>
                                <p className="text-gray-600 mt-1">{sortedTemplates.length} templates found</p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={viewMode === 'grid'
                                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                                : 'space-y-4'
                            }
                        >
                            {sortedTemplates.map((template, index) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-300 ${template.featured ? 'ring-2 ring-purple-300' : ''
                                        } ${viewMode === 'list' ? 'p-6' : 'p-4'}`}
                                >
                                    {template.featured && (
                                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-full inline-block mb-3">
                                            <Award className="h-3 w-3 inline mr-1" />
                                            Featured
                                        </div>
                                    )}

                                    <div className={viewMode === 'list' ? 'flex items-start space-x-6' : ''}>
                                        {viewMode === 'grid' && (
                                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                                                <Code className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-gray-600">{template.stats.rating}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>

                                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                                                <div className="flex items-center space-x-1">
                                                    <Download className="h-3 w-3" />
                                                    <span>{template.stats.downloads.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{template.estimatedTime}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Zap className="h-3 w-3" />
                                                    <span>{template.workflows} workflows</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(template.complexity)}`}>
                                                    {template.complexity}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${template.price === 'free'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {getPriceDisplay(template.price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                                        <span className="text-xs">{template.author.name[0]}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-xs font-medium text-gray-700">{template.author.name}</span>
                                                            {template.author.verified && (
                                                                <CheckCircle className="h-3 w-3 text-blue-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                                                    >
                                                        <Download className="h-4 w-4 inline mr-2" />
                                                        Install
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
