'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Store,
    Search,
    Filter,
    Star,
    Download,
    Play,
    Code,
    Zap,
    Shield,
    Users,
    Heart,
    Eye,
    DollarSign,
    Gift,
    Crown,
    Award,
    Sparkles,
    TrendingUp,
    Clock,
    Tag,
    Grid,
    List,
    Plus,
    Settings,
    Bookmark,
    Share2,
    ExternalLink,
    CheckCircle,
    Package,
    Layers,
    Cpu,
    Database,
    Globe,
    Smartphone,
    Monitor,
    GitBranch,
    Terminal,
    Image,
    FileText,
    Workflow
} from 'lucide-react'

interface MarketplaceItem {
    id: string
    name: string
    description: string
    shortDescription: string
    category: string
    subcategory: string
    type: 'extension' | 'template' | 'theme' | 'tool' | 'integration'
    version: string
    price: number
    originalPrice?: number
    author: string
    authorType: 'individual' | 'team' | 'verified' | 'official'
    downloads: number
    rating: number
    reviewCount: number
    tags: string[]
    featured: boolean
    trending: boolean
    recentlyUpdated: boolean
    screenshots: string[]
    compatibility: string[]
    requirements: string[]
    lastUpdated: string
    size: string
    license: 'free' | 'premium' | 'pro' | 'enterprise'
    verified: boolean
}

interface MarketplaceMetrics {
    totalItems: number
    totalDownloads: number
    activeUsers: number
    verifiedDevelopers: number
    categoryCounts: {
        [key: string]: number
    }
    trendingCategories: {
        name: string
        growth: number
    }[]
    featuredItems: number
    newThisWeek: number
}

interface MarketplaceCategory {
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

const AIDE_Marketplace: React.FC = () => {
    const [items, setItems] = useState<MarketplaceItem[]>([])
    const [metrics, setMetrics] = useState<MarketplaceMetrics | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterLicense, setFilterLicense] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('popular')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [priceRange, setPriceRange] = useState<string>('all')

    const categories: MarketplaceCategory[] = [
        {
            id: 'extensions',
            name: 'Extensions',
            description: 'Enhance AIDE with powerful plugins and add-ons',
            icon: <Package className="w-5 h-5" />,
            count: 234,
            color: 'bg-blue-100 text-blue-700',
            subcategories: [
                { id: 'productivity', name: 'Productivity', count: 67 },
                { id: 'debugging', name: 'Debugging', count: 45 },
                { id: 'testing', name: 'Testing', count: 38 },
                { id: 'ai-tools', name: 'AI Tools', count: 52 },
                { id: 'collaboration', name: 'Collaboration', count: 32 }
            ]
        },
        {
            id: 'templates',
            name: 'Templates',
            description: 'Ready-to-use project templates and boilerplates',
            icon: <FileText className="w-5 h-5" />,
            count: 189,
            color: 'bg-emerald-100 text-emerald-700',
            subcategories: [
                { id: 'web-apps', name: 'Web Applications', count: 78 },
                { id: 'mobile-apps', name: 'Mobile Apps', count: 43 },
                { id: 'apis', name: 'APIs', count: 34 },
                { id: 'microservices', name: 'Microservices', count: 21 },
                { id: 'dashboards', name: 'Dashboards', count: 13 }
            ]
        },
        {
            id: 'themes',
            name: 'Themes',
            description: 'Beautiful themes and UI customizations',
            icon: <Image className="w-5 h-5" />,
            count: 145,
            color: 'bg-purple-100 text-purple-700',
            subcategories: [
                { id: 'dark-themes', name: 'Dark Themes', count: 56 },
                { id: 'light-themes', name: 'Light Themes', count: 34 },
                { id: 'colorful', name: 'Colorful', count: 28 },
                { id: 'minimal', name: 'Minimal', count: 27 }
            ]
        },
        {
            id: 'tools',
            name: 'Developer Tools',
            description: 'Specialized tools for enhanced development',
            icon: <Terminal className="w-5 h-5" />,
            count: 156,
            color: 'bg-orange-100 text-orange-700',
            subcategories: [
                { id: 'code-analysis', name: 'Code Analysis', count: 45 },
                { id: 'performance', name: 'Performance', count: 38 },
                { id: 'security', name: 'Security', count: 29 },
                { id: 'documentation', name: 'Documentation', count: 24 },
                { id: 'deployment', name: 'Deployment', count: 20 }
            ]
        },
        {
            id: 'integrations',
            name: 'Integrations',
            description: 'Connect AIDE with your favorite services',
            icon: <Globe className="w-5 h-5" />,
            count: 178,
            color: 'bg-red-100 text-red-700',
            subcategories: [
                { id: 'version-control', name: 'Version Control', count: 45 },
                { id: 'cloud-services', name: 'Cloud Services', count: 56 },
                { id: 'databases', name: 'Databases', count: 34 },
                { id: 'communication', name: 'Communication', count: 28 },
                { id: 'monitoring', name: 'Monitoring', count: 15 }
            ]
        },
        {
            id: 'ai-assistants',
            name: 'AI Assistants',
            description: 'Advanced AI-powered development assistants',
            icon: <Zap className="w-5 h-5" />,
            count: 89,
            color: 'bg-yellow-100 text-yellow-700',
            subcategories: [
                { id: 'code-generation', name: 'Code Generation', count: 34 },
                { id: 'code-review', name: 'Code Review', count: 23 },
                { id: 'documentation-ai', name: 'Documentation', count: 18 },
                { id: 'testing-ai', name: 'Testing', count: 14 }
            ]
        }
    ]

    useEffect(() => {
        // Simulate loading marketplace metrics
        setMetrics({
            totalItems: 991,
            totalDownloads: 4567891,
            activeUsers: 234567,
            verifiedDevelopers: 1234,
            categoryCounts: {
                extensions: 234,
                templates: 189,
                themes: 145,
                tools: 156,
                integrations: 178,
                'ai-assistants': 89
            },
            trendingCategories: [
                { name: 'AI Assistants', growth: 45.7 },
                { name: 'Templates', growth: 32.1 },
                { name: 'Extensions', growth: 28.4 }
            ],
            featuredItems: 24,
            newThisWeek: 15
        })

        // Simulate loading marketplace items
        setItems([
            {
                id: '1',
                name: 'AI Code Reviewer Pro',
                description: 'Advanced AI-powered code review assistant that provides intelligent feedback, suggests improvements, and enforces coding standards automatically.',
                shortDescription: 'AI-powered code review with intelligent feedback',
                category: 'ai-assistants',
                subcategory: 'code-review',
                type: 'extension',
                version: '2.1.4',
                price: 29.99,
                originalPrice: 39.99,
                author: 'CodeAI Labs',
                authorType: 'verified',
                downloads: 45623,
                rating: 4.8,
                reviewCount: 1234,
                tags: ['ai', 'code-review', 'productivity', 'quality'],
                featured: true,
                trending: true,
                recentlyUpdated: true,
                screenshots: [],
                compatibility: ['VS Code', 'JetBrains', 'Sublime'],
                requirements: ['Node.js 16+', 'OpenAI API Key'],
                lastUpdated: '2 days ago',
                size: '2.3 MB',
                license: 'premium',
                verified: true
            },
            {
                id: '2',
                name: 'Dark Ocean Theme',
                description: 'A beautiful dark theme with ocean-inspired colors, perfect for long coding sessions with reduced eye strain.',
                shortDescription: 'Beautiful dark theme with ocean colors',
                category: 'themes',
                subcategory: 'dark-themes',
                type: 'theme',
                version: '1.0.8',
                price: 0,
                author: 'Design Studio',
                authorType: 'team',
                downloads: 123456,
                rating: 4.9,
                reviewCount: 5678,
                tags: ['dark', 'theme', 'ocean', 'minimal'],
                featured: true,
                trending: false,
                recentlyUpdated: false,
                screenshots: [],
                compatibility: ['All Platforms'],
                requirements: ['AIDE 2.0+'],
                lastUpdated: '1 week ago',
                size: '512 KB',
                license: 'free',
                verified: true
            },
            {
                id: '3',
                name: 'React Dashboard Template',
                description: 'Complete React dashboard template with modern design, responsive layout, and comprehensive component library.',
                shortDescription: 'Modern React dashboard with comprehensive components',
                category: 'templates',
                subcategory: 'dashboards',
                type: 'template',
                version: '3.2.1',
                price: 49.99,
                author: 'Frontend Masters',
                authorType: 'verified',
                downloads: 8901,
                rating: 4.7,
                reviewCount: 234,
                tags: ['react', 'dashboard', 'template', 'responsive'],
                featured: false,
                trending: true,
                recentlyUpdated: true,
                screenshots: [],
                compatibility: ['React 18+', 'TypeScript'],
                requirements: ['Node.js 18+', 'npm/yarn'],
                lastUpdated: '3 days ago',
                size: '15.2 MB',
                license: 'premium',
                verified: true
            },
            {
                id: '4',
                name: 'Security Scanner',
                description: 'Comprehensive security scanner that identifies vulnerabilities, checks dependencies, and provides security recommendations.',
                shortDescription: 'Comprehensive security vulnerability scanner',
                category: 'tools',
                subcategory: 'security',
                type: 'tool',
                version: '1.5.3',
                price: 19.99,
                author: 'SecureDev',
                authorType: 'individual',
                downloads: 12345,
                rating: 4.6,
                reviewCount: 456,
                tags: ['security', 'vulnerabilities', 'scanning', 'dependencies'],
                featured: false,
                trending: false,
                recentlyUpdated: false,
                screenshots: [],
                compatibility: ['Multiple Languages'],
                requirements: ['AIDE Security Module'],
                lastUpdated: '2 weeks ago',
                size: '8.7 MB',
                license: 'premium',
                verified: true
            },
            {
                id: '5',
                name: 'GitHub Enhanced',
                description: 'Enhanced GitHub integration with advanced features like PR templates, issue automation, and team collaboration tools.',
                shortDescription: 'Enhanced GitHub integration with advanced features',
                category: 'integrations',
                subcategory: 'version-control',
                type: 'integration',
                version: '2.0.1',
                price: 0,
                author: 'Open Source Community',
                authorType: 'team',
                downloads: 67890,
                rating: 4.5,
                reviewCount: 890,
                tags: ['github', 'integration', 'collaboration', 'automation'],
                featured: true,
                trending: false,
                recentlyUpdated: true,
                screenshots: [],
                compatibility: ['Git', 'GitHub'],
                requirements: ['GitHub Account', 'Git CLI'],
                lastUpdated: '1 day ago',
                size: '3.4 MB',
                license: 'free',
                verified: true
            },
            {
                id: '6',
                name: 'Performance Profiler Pro',
                description: 'Advanced performance profiling tool with real-time monitoring, bottleneck detection, and optimization suggestions.',
                shortDescription: 'Advanced performance profiling with real-time monitoring',
                category: 'tools',
                subcategory: 'performance',
                type: 'tool',
                version: '1.8.2',
                price: 79.99,
                author: 'Performance Labs',
                authorType: 'verified',
                downloads: 5432,
                rating: 4.9,
                reviewCount: 123,
                tags: ['performance', 'profiling', 'optimization', 'monitoring'],
                featured: false,
                trending: true,
                recentlyUpdated: false,
                screenshots: [],
                compatibility: ['JavaScript', 'Python', 'Java'],
                requirements: ['Advanced Monitoring License'],
                lastUpdated: '5 days ago',
                size: '12.1 MB',
                license: 'pro',
                verified: true
            }
        ])
    }, [])

    const getLicenseColor = (license: string) => {
        switch (license) {
            case 'free': return 'bg-green-100 text-green-700'
            case 'premium': return 'bg-blue-100 text-blue-700'
            case 'pro': return 'bg-purple-100 text-purple-700'
            case 'enterprise': return 'bg-orange-100 text-orange-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const getAuthorIcon = (authorType: string) => {
        switch (authorType) {
            case 'official': return <Crown className="w-4 h-4 text-yellow-600" />
            case 'verified': return <CheckCircle className="w-4 h-4 text-blue-600" />
            case 'team': return <Users className="w-4 h-4 text-purple-600" />
            default: return <Users className="w-4 h-4 text-slate-600" />
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'extension': return <Package className="w-4 h-4" />
            case 'template': return <FileText className="w-4 h-4" />
            case 'theme': return <Image className="w-4 h-4" />
            case 'tool': return <Terminal className="w-4 h-4" />
            case 'integration': return <Globe className="w-4 h-4" />
            default: return <Package className="w-4 h-4" />
        }
    }

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
        const matchesSubcategory = selectedSubcategory === 'all' || item.subcategory === selectedSubcategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesType = filterType === 'all' || item.type === filterType
        const matchesLicense = filterLicense === 'all' || item.license === filterLicense
        const matchesPrice = priceRange === 'all' ||
            (priceRange === 'free' && item.price === 0) ||
            (priceRange === 'paid' && item.price > 0) ||
            (priceRange === 'under-50' && item.price > 0 && item.price <= 50) ||
            (priceRange === 'over-50' && item.price > 50)

        return matchesCategory && matchesSubcategory && matchesSearch && matchesType && matchesLicense && matchesPrice
    })

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'popular': return b.downloads - a.downloads
            case 'rating': return b.rating - a.rating
            case 'recent': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            case 'price-low': return a.price - b.price
            case 'price-high': return b.price - a.price
            case 'name': return a.name.localeCompare(b.name)
            default: return 0
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                                Marketplace
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Discover extensions, themes, templates, and tools to enhance your development experience
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                Publish
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Marketplace Metrics */}
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
                                    <p className="text-slate-600 text-sm">Total Items</p>
                                    <p className="text-2xl font-bold text-slate-900">{metrics.totalItems}</p>
                                    <p className="text-xs text-emerald-600 mt-1">+{metrics.newThisWeek} this week</p>
                                </div>
                                <Store className="w-8 h-8 text-blue-600" />
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
                                    <p className="text-slate-600 text-sm">Total Downloads</p>
                                    <p className="text-2xl font-bold text-emerald-600">{metrics.totalDownloads.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">Across all items</p>
                                </div>
                                <Download className="w-8 h-8 text-emerald-600" />
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
                                    <p className="text-slate-600 text-sm">Active Users</p>
                                    <p className="text-2xl font-bold text-purple-600">{metrics.activeUsers.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">Monthly active</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-600" />
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
                                    <p className="text-slate-600 text-sm">Developers</p>
                                    <p className="text-2xl font-bold text-orange-600">{metrics.verifiedDevelopers}</p>
                                    <p className="text-xs text-slate-500 mt-1">Verified publishers</p>
                                </div>
                                <Award className="w-8 h-8 text-orange-600" />
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Featured Items Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <Sparkles className="w-6 h-6" />
                                Featured Items
                            </h2>
                            <p className="text-blue-100">
                                Discover hand-picked extensions and tools selected by our team
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-200"
                        >
                            View All Featured
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Categories and Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Categories */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Store className="w-5 h-5 text-blue-600" />
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
                                        <span className="font-medium">All Items</span>
                                        <span className="text-sm text-slate-500">{items.length}</span>
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

                        {/* Price Filter */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                                Price Range
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'all', label: 'All Items', count: items.length },
                                    { id: 'free', label: 'Free', count: items.filter(i => i.price === 0).length },
                                    { id: 'under-50', label: 'Under $50', count: items.filter(i => i.price > 0 && i.price <= 50).length },
                                    { id: 'over-50', label: 'Over $50', count: items.filter(i => i.price > 50).length }
                                ].map((range) => (
                                    <button
                                        key={range.id}
                                        onClick={() => setPriceRange(range.id)}
                                        className={`w-full text-left p-2 rounded text-sm transition-all duration-200 ${priceRange === range.id
                                                ? 'bg-blue-100 text-blue-900'
                                                : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{range.label}</span>
                                            <span className="text-xs text-slate-400">{range.count}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* License Filter */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                License Type
                            </h3>
                            <div className="space-y-2">
                                {['all', 'free', 'premium', 'pro', 'enterprise'].map((license) => (
                                    <button
                                        key={license}
                                        onClick={() => setFilterLicense(license)}
                                        className={`w-full text-left p-2 rounded text-sm transition-all duration-200 capitalize ${filterLicense === license
                                                ? 'bg-blue-100 text-blue-900'
                                                : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                    >
                                        {license === 'all' ? 'All Licenses' : license}
                                    </button>
                                ))}
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
                                        placeholder="Search marketplace..."
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
                                        <option value="extension">Extensions</option>
                                        <option value="template">Templates</option>
                                        <option value="theme">Themes</option>
                                        <option value="tool">Tools</option>
                                        <option value="integration">Integrations</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="popular">Most Popular</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="recent">Recently Updated</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name">Name A-Z</option>
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

                        {/* Marketplace Grid/List */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                            {sortedItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                                                {item.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                {item.trending && <TrendingUp className="w-4 h-4 text-orange-500" />}
                                                {item.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                            </div>

                                            <p className="text-slate-600 text-sm mb-3">{item.shortDescription}</p>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseColor(item.license)}`}>
                                                    {item.license}
                                                </span>
                                                <span className="text-slate-500 text-xs">•</span>
                                                <span className="text-slate-500 text-xs">v{item.version}</span>
                                                <span className="text-slate-500 text-xs">•</span>
                                                <span className="text-slate-500 text-xs">{item.size}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {item.tags.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        +{item.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {getTypeIcon(item.type)}
                                            <span className="text-xs text-slate-500 capitalize ml-1">{item.type}</span>
                                        </div>
                                    </div>

                                    {/* Item Stats */}
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Download className="w-3 h-3" />
                                                <span>Downloads</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 text-sm">{item.downloads.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Star className="w-3 h-3" />
                                                <span>Rating</span>
                                            </div>
                                            <p className="font-semibold text-yellow-600 text-sm">{item.rating}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Eye className="w-3 h-3" />
                                                <span>Reviews</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 text-sm">{item.reviewCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span>Price</span>
                                            </div>
                                            <p className="font-semibold text-emerald-600 text-sm">
                                                {item.price === 0 ? 'Free' : `$${item.price}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            {item.price === 0 ? (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    Install
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="w-4 h-4" />
                                                    Buy ${item.price}
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                        >
                                            <Heart className="w-4 h-4" />
                                        </motion.button>
                                    </div>

                                    {/* Author and Last Updated */}
                                    <div className="flex items-center justify-between mt-3 text-slate-500 text-xs">
                                        <div className="flex items-center gap-1">
                                            {getAuthorIcon(item.authorType)}
                                            <span>By {item.author}</span>
                                        </div>
                                        <span>Updated {item.lastUpdated}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More */}
                        {sortedItems.length > 0 && (
                            <div className="mt-8 text-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/70 backdrop-blur-sm border border-slate-300 px-6 py-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200"
                                >
                                    Load More Items
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Developer Marketplace Ecosystem
                        </h3>
                        <p className="text-slate-600 max-w-3xl mx-auto">
                            AIDE's marketplace connects developers with powerful tools, beautiful themes,
                            and productivity extensions. With over 990 verified items and 4.5M+ downloads,
                            find everything you need to enhance your development workflow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_Marketplace
