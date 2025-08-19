'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BookOpen,
    Search,
    FileText,
    Code,
    Play,
    Star,
    Clock,
    User,
    Tag,
    ChevronRight,
    ExternalLink,
    Download,
    Share2,
    Edit,
    Plus,
    Filter,
    Grid,
    List,
    Bookmark,
    Eye,
    ThumbsUp,
    MessageCircle,
    GitBranch,
    Zap,
    Shield,
    Globe,
    Database,
    Server,
    Smartphone,
    Monitor,
    Layers,
    Settings,
    HelpCircle,
    Lightbulb,
    Target,
    Rocket
} from 'lucide-react'

interface DocumentationItem {
    id: string
    title: string
    description: string
    category: string
    subcategory: string
    type: 'guide' | 'tutorial' | 'reference' | 'example' | 'api'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: string
    lastUpdated: string
    author: string
    tags: string[]
    views: number
    likes: number
    bookmarks: number
    featured: boolean
    content: string
    codeExamples: number
}

interface DocumentationMetrics {
    totalDocs: number
    totalViews: number
    weeklyViews: number
    popularCategories: {
        name: string
        count: number
        growth: number
    }[]
    recentUpdates: number
    communityContributions: number
    averageRating: number
    topContributors: {
        name: string
        contributions: number
    }[]
}

interface DocCategory {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    count: number
    color: string
    subcategories: {
        id: string
        name: string
        count: number
    }[]
}

const AIDE_Documentation: React.FC = () => {
    const [docs, setDocs] = useState<DocumentationItem[]>([])
    const [metrics, setMetrics] = useState<DocumentationMetrics | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('popular')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const categories: DocCategory[] = [
        {
            id: 'getting-started',
            name: 'Getting Started',
            description: 'Quick start guides and basic setup',
            icon: <Rocket className="w-5 h-5" />,
            count: 24,
            color: 'bg-emerald-100 text-emerald-700',
            subcategories: [
                { id: 'installation', name: 'Installation', count: 8 },
                { id: 'quickstart', name: 'Quick Start', count: 12 },
                { id: 'first-project', name: 'First Project', count: 4 }
            ]
        },
        {
            id: 'development',
            name: 'Development',
            description: 'Core development features and workflows',
            icon: <Code className="w-5 h-5" />,
            count: 89,
            color: 'bg-blue-100 text-blue-700',
            subcategories: [
                { id: 'editor', name: 'Editor Features', count: 23 },
                { id: 'debugging', name: 'Debugging', count: 18 },
                { id: 'testing', name: 'Testing', count: 15 },
                { id: 'version-control', name: 'Version Control', count: 12 },
                { id: 'workflows', name: 'Workflows', count: 21 }
            ]
        },
        {
            id: 'ai-features',
            name: 'AI Features',
            description: 'AI-powered development tools and capabilities',
            icon: <Zap className="w-5 h-5" />,
            count: 45,
            color: 'bg-purple-100 text-purple-700',
            subcategories: [
                { id: 'code-generation', name: 'Code Generation', count: 15 },
                { id: 'ai-assistant', name: 'AI Assistant', count: 12 },
                { id: 'smart-suggestions', name: 'Smart Suggestions', count: 10 },
                { id: 'ai-review', name: 'AI Code Review', count: 8 }
            ]
        },
        {
            id: 'integrations',
            name: 'Integrations',
            description: 'Third-party services and platform integrations',
            icon: <Globe className="w-5 h-5" />,
            count: 67,
            color: 'bg-orange-100 text-orange-700',
            subcategories: [
                { id: 'github', name: 'GitHub', count: 18 },
                { id: 'docker', name: 'Docker', count: 15 },
                { id: 'cloud', name: 'Cloud Platforms', count: 22 },
                { id: 'databases', name: 'Databases', count: 12 }
            ]
        },
        {
            id: 'deployment',
            name: 'Deployment',
            description: 'Deployment strategies and DevOps practices',
            icon: <Server className="w-5 h-5" />,
            count: 34,
            color: 'bg-red-100 text-red-700',
            subcategories: [
                { id: 'ci-cd', name: 'CI/CD', count: 14 },
                { id: 'containers', name: 'Containers', count: 12 },
                { id: 'monitoring', name: 'Monitoring', count: 8 }
            ]
        },
        {
            id: 'api-reference',
            name: 'API Reference',
            description: 'Complete API documentation and examples',
            icon: <Database className="w-5 h-5" />,
            count: 156,
            color: 'bg-yellow-100 text-yellow-700',
            subcategories: [
                { id: 'rest-api', name: 'REST API', count: 67 },
                { id: 'graphql', name: 'GraphQL', count: 34 },
                { id: 'websockets', name: 'WebSockets', count: 23 },
                { id: 'sdk', name: 'SDK', count: 32 }
            ]
        }
    ]

    useEffect(() => {
        // Simulate loading documentation metrics
        setMetrics({
            totalDocs: 415,
            totalViews: 2847561,
            weeklyViews: 34782,
            popularCategories: [
                { name: 'Development', count: 89, growth: 15.3 },
                { name: 'API Reference', count: 156, growth: 8.7 },
                { name: 'Integrations', count: 67, growth: 22.1 }
            ],
            recentUpdates: 18,
            communityContributions: 67,
            averageRating: 4.7,
            topContributors: [
                { name: 'Sarah Chen', contributions: 34 },
                { name: 'Mike Johnson', contributions: 28 },
                { name: 'Alex Rivera', contributions: 23 }
            ]
        })

        // Simulate loading documentation items
        setDocs([
            {
                id: '1',
                title: 'Getting Started with AIDE',
                description: 'Complete guide to setting up and using AIDE for the first time',
                category: 'getting-started',
                subcategory: 'quickstart',
                type: 'guide',
                difficulty: 'beginner',
                estimatedTime: '15 min',
                lastUpdated: '2 days ago',
                author: 'AIDE Team',
                tags: ['setup', 'beginner', 'quickstart'],
                views: 45782,
                likes: 892,
                bookmarks: 234,
                featured: true,
                content: 'Learn how to get started with AIDE in just 15 minutes...',
                codeExamples: 8
            },
            {
                id: '2',
                title: 'AI Code Generation Best Practices',
                description: 'Advanced techniques for leveraging AI to generate high-quality code',
                category: 'ai-features',
                subcategory: 'code-generation',
                type: 'tutorial',
                difficulty: 'advanced',
                estimatedTime: '45 min',
                lastUpdated: '1 week ago',
                author: 'Sarah Chen',
                tags: ['ai', 'code-generation', 'best-practices'],
                views: 23456,
                likes: 567,
                bookmarks: 189,
                featured: true,
                content: 'Master AI-powered code generation with these proven techniques...',
                codeExamples: 15
            },
            {
                id: '3',
                title: 'REST API Reference',
                description: 'Complete reference documentation for AIDE REST API endpoints',
                category: 'api-reference',
                subcategory: 'rest-api',
                type: 'reference',
                difficulty: 'intermediate',
                estimatedTime: '30 min',
                lastUpdated: '3 days ago',
                author: 'API Team',
                tags: ['api', 'rest', 'reference'],
                views: 18923,
                likes: 345,
                bookmarks: 567,
                featured: false,
                content: 'Comprehensive REST API documentation with examples...',
                codeExamples: 45
            },
            {
                id: '4',
                title: 'Docker Integration Guide',
                description: 'Step-by-step guide to integrating Docker with your AIDE projects',
                category: 'integrations',
                subcategory: 'docker',
                type: 'tutorial',
                difficulty: 'intermediate',
                estimatedTime: '35 min',
                lastUpdated: '5 days ago',
                author: 'DevOps Team',
                tags: ['docker', 'containers', 'integration'],
                views: 15678,
                likes: 298,
                bookmarks: 156,
                featured: false,
                content: 'Learn how to seamlessly integrate Docker into your workflow...',
                codeExamples: 12
            },
            {
                id: '5',
                title: 'Debugging with AI Assistant',
                description: 'Use AI to identify and fix bugs faster than ever before',
                category: 'development',
                subcategory: 'debugging',
                type: 'guide',
                difficulty: 'intermediate',
                estimatedTime: '25 min',
                lastUpdated: '1 day ago',
                author: 'Mike Johnson',
                tags: ['debugging', 'ai', 'troubleshooting'],
                views: 12345,
                likes: 456,
                bookmarks: 123,
                featured: true,
                content: 'Leverage AI to streamline your debugging process...',
                codeExamples: 6
            },
            {
                id: '6',
                title: 'CI/CD Pipeline Setup',
                description: 'Configure automated deployment pipelines for your projects',
                category: 'deployment',
                subcategory: 'ci-cd',
                type: 'tutorial',
                difficulty: 'advanced',
                estimatedTime: '60 min',
                lastUpdated: '1 week ago',
                author: 'Alex Rivera',
                tags: ['ci-cd', 'deployment', 'automation'],
                views: 9876,
                likes: 234,
                bookmarks: 89,
                featured: false,
                content: 'Build robust CI/CD pipelines with AIDE integration...',
                codeExamples: 20
            }
        ])
    }, [])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700'
            case 'intermediate': return 'bg-yellow-100 text-yellow-700'
            case 'advanced': return 'bg-red-100 text-red-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'guide': return <BookOpen className="w-4 h-4" />
            case 'tutorial': return <Play className="w-4 h-4" />
            case 'reference': return <FileText className="w-4 h-4" />
            case 'example': return <Code className="w-4 h-4" />
            case 'api': return <Database className="w-4 h-4" />
            default: return <FileText className="w-4 h-4" />
        }
    }

    const filteredDocs = docs.filter(doc => {
        const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
        const matchesSubcategory = selectedSubcategory === 'all' || doc.subcategory === selectedSubcategory
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesType = filterType === 'all' || doc.type === filterType
        const matchesDifficulty = filterDifficulty === 'all' || doc.difficulty === filterDifficulty

        return matchesCategory && matchesSubcategory && matchesSearch && matchesType && matchesDifficulty
    })

    const sortedDocs = [...filteredDocs].sort((a, b) => {
        switch (sortBy) {
            case 'popular': return b.views - a.views
            case 'recent': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            case 'likes': return b.likes - a.likes
            case 'title': return a.title.localeCompare(b.title)
            default: return 0
        }
    })

    const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                                Documentation Hub
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Comprehensive guides, tutorials, and API documentation for AIDE
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                Contribute
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Documentation Metrics */}
                {metrics && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Total Documentation</p>
                                    <p className="text-2xl font-bold text-slate-900">{metrics.totalDocs}</p>
                                    <p className="text-xs text-emerald-600 mt-1">+{metrics.recentUpdates} this week</p>
                                </div>
                                <BookOpen className="w-8 h-8 text-blue-600" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Total Views</p>
                                    <p className="text-2xl font-bold text-emerald-600">{metrics.totalViews.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">{metrics.weeklyViews.toLocaleString()} this week</p>
                                </div>
                                <Eye className="w-8 h-8 text-emerald-600" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Average Rating</p>
                                    <p className="text-2xl font-bold text-yellow-600">{metrics.averageRating}</p>
                                    <p className="text-xs text-slate-500 mt-1">Out of 5 stars</p>
                                </div>
                                <Star className="w-8 h-8 text-yellow-600" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm">Contributors</p>
                                    <p className="text-2xl font-bold text-purple-600">{metrics.topContributors.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">{metrics.communityContributions} community</p>
                                </div>
                                <User className="w-8 h-8 text-purple-600" />
                            </div>
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Categories and Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Categories */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Categories
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all')
                                        setSelectedSubcategory('all')
                                    }}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedCategory === 'all'
                                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                            : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">All Documentation</span>
                                        <span className="text-sm text-slate-500">{docs.length}</span>
                                    </div>
                                </button>

                                {categories.map((category) => (
                                    <div key={category.id}>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory(category.id)
                                                setSelectedSubcategory('all')
                                            }}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedCategory === category.id
                                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className={`p-1 rounded ${category.color}`}>
                                                    {category.icon}
                                                </div>
                                                <span className="font-medium">{category.name}</span>
                                                <span className="text-sm text-slate-500 ml-auto">{category.count}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 ml-9">{category.description}</p>
                                        </button>

                                        {selectedCategory === category.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="ml-6 mt-2 space-y-1"
                                            >
                                                <button
                                                    onClick={() => setSelectedSubcategory('all')}
                                                    className={`w-full text-left p-2 rounded text-sm transition-all duration-200 ${selectedSubcategory === 'all'
                                                            ? 'bg-slate-100 text-slate-900'
                                                            : 'hover:bg-slate-50 text-slate-600'
                                                        }`}
                                                >
                                                    All Subcategories
                                                </button>
                                                {category.subcategories.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => setSelectedSubcategory(sub.id)}
                                                        className={`w-full text-left p-2 rounded text-sm transition-all duration-200 ${selectedSubcategory === sub.id
                                                                ? 'bg-slate-100 text-slate-900'
                                                                : 'hover:bg-slate-50 text-slate-600'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{sub.name}</span>
                                                            <span className="text-xs text-slate-400">{sub.count}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm">Submit Feedback</span>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">Request Tutorial</span>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                                    <Download className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">Download PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Search and Filters */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg mb-8">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search documentation..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="guide">Guides</option>
                                        <option value="tutorial">Tutorials</option>
                                        <option value="reference">Reference</option>
                                        <option value="example">Examples</option>
                                        <option value="api">API</option>
                                    </select>

                                    <select
                                        value={filterDifficulty}
                                        onChange={(e) => setFilterDifficulty(e.target.value)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="popular">Most Popular</option>
                                        <option value="recent">Recently Updated</option>
                                        <option value="likes">Most Liked</option>
                                        <option value="title">Title A-Z</option>
                                    </select>

                                    <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documentation Grid/List */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                            {sortedDocs.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{doc.title}</h3>
                                                {doc.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                            </div>

                                            <p className="text-slate-600 text-sm mb-3">{doc.description}</p>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(doc.difficulty)}`}>
                                                    {doc.difficulty}
                                                </span>
                                                <span className="text-slate-500 text-xs">•</span>
                                                <span className="text-slate-500 text-xs capitalize">{doc.type}</span>
                                                <span className="text-slate-500 text-xs">•</span>
                                                <span className="text-slate-500 text-xs">{doc.estimatedTime}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {doc.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {doc.tags.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        +{doc.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {getTypeIcon(doc.type)}
                                        </div>
                                    </div>

                                    {/* Documentation Stats */}
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Eye className="w-3 h-3" />
                                                <span>Views</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 text-sm">{doc.views.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <ThumbsUp className="w-3 h-3" />
                                                <span>Likes</span>
                                            </div>
                                            <p className="font-semibold text-blue-600 text-sm">{doc.likes}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Bookmark className="w-3 h-3" />
                                                <span>Saves</span>
                                            </div>
                                            <p className="font-semibold text-emerald-600 text-sm">{doc.bookmarks}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Code className="w-3 h-3" />
                                                <span>Examples</span>
                                            </div>
                                            <p className="font-semibold text-purple-600 text-sm">{doc.codeExamples}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Read
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                        >
                                            <Bookmark className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>

                                    {/* Author and Last Updated */}
                                    <div className="flex items-center justify-between mt-3 text-slate-500 text-xs">
                                        <span>By {doc.author}</span>
                                        <span>Updated {doc.lastUpdated}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More */}
                        {sortedDocs.length > 0 && (
                            <div className="mt-8 text-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/70 backdrop-blur-sm border border-slate-300 px-6 py-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200"
                                >
                                    Load More Documentation
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Community-Driven Documentation
                        </h3>
                        <p className="text-slate-600 max-w-3xl mx-auto">
                            AIDE's documentation is maintained by our vibrant community of developers.
                            With over 400 guides, tutorials, and references, you'll find everything
                            you need to master AI-powered development with searchable, interactive content.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_Documentation
