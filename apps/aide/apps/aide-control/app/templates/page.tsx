'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Code,
    Copy,
    Download,
    Star,
    Plus,
    Search,
    Filter,
    Layers,
    Zap,
    Heart,
    Eye,
    GitBranch,
    Clock,
    Users,
    Tag,
    Folder,
    Settings,
    Play,
    Edit,
    Trash2,
    Share2,
    BookOpen,
    Rocket,
    Database,
    Globe,
    Smartphone,
    Monitor,
    CheckCircle
} from 'lucide-react'

interface Template {
    id: string
    name: string
    description: string
    category: string
    language: string
    framework: string
    tags: string[]
    author: string
    downloads: number
    stars: number
    lastUpdated: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: string
    filesCount: number
    size: string
    featured: boolean
    verified: boolean
    type: 'component' | 'page' | 'feature' | 'project' | 'snippet'
    preview: string
    dependencies: string[]
}

interface TemplateMetrics {
    totalTemplates: number
    totalDownloads: number
    popularCategories: {
        name: string
        count: number
        growth: number
    }[]
    recentTemplates: number
    communityContributions: number
    averageRating: number
    totalAuthors: number
    templatesByLanguage: {
        [key: string]: number
    }
}

interface TemplateCategory {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    count: number
    color: string
}

const AIDE_Templates: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([])
    const [metrics, setMetrics] = useState<TemplateMetrics | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<string>('popular')
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const categories: TemplateCategory[] = [
        {
            id: 'frontend',
            name: 'Frontend',
            description: 'React, Vue, Angular components and pages',
            icon: <Monitor className="w-5 h-5" />,
            count: 156,
            color: 'bg-blue-100 text-blue-700'
        },
        {
            id: 'backend',
            name: 'Backend',
            description: 'APIs, microservices, and server logic',
            icon: <Database className="w-5 h-5" />,
            count: 89,
            color: 'bg-green-100 text-green-700'
        },
        {
            id: 'mobile',
            name: 'Mobile',
            description: 'React Native, Flutter apps and components',
            icon: <Smartphone className="w-5 h-5" />,
            count: 67,
            color: 'bg-purple-100 text-purple-700'
        },
        {
            id: 'fullstack',
            name: 'Full Stack',
            description: 'Complete application templates',
            icon: <Layers className="w-5 h-5" />,
            count: 45,
            color: 'bg-orange-100 text-orange-700'
        },
        {
            id: 'ai-ml',
            name: 'AI/ML',
            description: 'Machine learning and AI model templates',
            icon: <Zap className="w-5 h-5" />,
            count: 34,
            color: 'bg-yellow-100 text-yellow-700'
        },
        {
            id: 'devops',
            name: 'DevOps',
            description: 'CI/CD, deployment, and infrastructure',
            icon: <Rocket className="w-5 h-5" />,
            count: 28,
            color: 'bg-red-100 text-red-700'
        }
    ]

    useEffect(() => {
        // Simulate loading template metrics
        setMetrics({
            totalTemplates: 419,
            totalDownloads: 87456,
            popularCategories: [
                { name: 'Frontend', count: 156, growth: 12.3 },
                { name: 'Backend', count: 89, growth: 8.7 },
                { name: 'Mobile', count: 67, growth: 15.2 }
            ],
            recentTemplates: 23,
            communityContributions: 156,
            averageRating: 4.6,
            totalAuthors: 89,
            templatesByLanguage: {
                'TypeScript': 187,
                'JavaScript': 134,
                'Python': 89,
                'Go': 45,
                'Rust': 23
            }
        })

        // Simulate loading templates
        setTemplates([
            {
                id: '1',
                name: 'Modern Dashboard Template',
                description: 'Complete React dashboard with dark mode, charts, and responsive design',
                category: 'frontend',
                language: 'TypeScript',
                framework: 'React',
                tags: ['dashboard', 'charts', 'responsive', 'dark-mode'],
                author: 'John Doe',
                downloads: 12847,
                stars: 456,
                lastUpdated: '2 days ago',
                difficulty: 'intermediate',
                estimatedTime: '2-3 hours',
                filesCount: 23,
                size: '1.2 MB',
                featured: true,
                verified: true,
                type: 'project',
                preview: 'Modern, clean dashboard with advanced data visualization components',
                dependencies: ['react', 'typescript', 'tailwindcss', 'recharts', 'framer-motion']
            },
            {
                id: '2',
                name: 'REST API Starter',
                description: 'Node.js REST API with authentication, validation, and database integration',
                category: 'backend',
                language: 'TypeScript',
                framework: 'Express',
                tags: ['api', 'auth', 'database', 'validation'],
                author: 'Jane Smith',
                downloads: 8734,
                stars: 234,
                lastUpdated: '1 week ago',
                difficulty: 'beginner',
                estimatedTime: '1-2 hours',
                filesCount: 18,
                size: '856 KB',
                featured: false,
                verified: true,
                type: 'project',
                preview: 'Complete REST API template with JWT authentication and MongoDB integration',
                dependencies: ['express', 'typescript', 'mongoose', 'jsonwebtoken', 'joi']
            },
            {
                id: '3',
                name: 'React Native Shopping App',
                description: 'E-commerce mobile app with product catalog, cart, and payment integration',
                category: 'mobile',
                language: 'TypeScript',
                framework: 'React Native',
                tags: ['mobile', 'ecommerce', 'payment', 'navigation'],
                author: 'Mike Johnson',
                downloads: 6789,
                stars: 189,
                lastUpdated: '3 days ago',
                difficulty: 'advanced',
                estimatedTime: '4-6 hours',
                filesCount: 34,
                size: '2.1 MB',
                featured: true,
                verified: true,
                type: 'project',
                preview: 'Full-featured shopping app with product search, cart management, and checkout',
                dependencies: ['react-native', 'typescript', 'react-navigation', 'stripe', 'async-storage']
            },
            {
                id: '4',
                name: 'AI Chat Component',
                description: 'Reusable chat interface component with AI response handling',
                category: 'ai-ml',
                language: 'TypeScript',
                framework: 'React',
                tags: ['ai', 'chat', 'component', 'streaming'],
                author: 'AI Team',
                downloads: 5432,
                stars: 298,
                lastUpdated: '1 day ago',
                difficulty: 'intermediate',
                estimatedTime: '1 hour',
                filesCount: 8,
                size: '234 KB',
                featured: false,
                verified: true,
                type: 'component',
                preview: 'Interactive chat component with streaming responses and message history',
                dependencies: ['react', 'typescript', 'openai', 'framer-motion']
            },
            {
                id: '5',
                name: 'Docker Deployment Pipeline',
                description: 'Complete CI/CD pipeline with Docker, GitHub Actions, and AWS deployment',
                category: 'devops',
                language: 'YAML',
                framework: 'GitHub Actions',
                tags: ['docker', 'cicd', 'aws', 'deployment'],
                author: 'DevOps Team',
                downloads: 4567,
                stars: 167,
                lastUpdated: '5 days ago',
                difficulty: 'advanced',
                estimatedTime: '3-4 hours',
                filesCount: 12,
                size: '145 KB',
                featured: false,
                verified: true,
                type: 'feature',
                preview: 'Automated deployment pipeline with testing, building, and deployment stages',
                dependencies: ['docker', 'github-actions', 'aws-cli', 'terraform']
            },
            {
                id: '6',
                name: 'NextJS Blog Template',
                description: 'SEO-optimized blog template with MDX support and dynamic routing',
                category: 'fullstack',
                language: 'TypeScript',
                framework: 'Next.js',
                tags: ['blog', 'seo', 'mdx', 'static'],
                author: 'Content Team',
                downloads: 7891,
                stars: 345,
                lastUpdated: '4 days ago',
                difficulty: 'intermediate',
                estimatedTime: '2-3 hours',
                filesCount: 28,
                size: '1.8 MB',
                featured: true,
                verified: true,
                type: 'project',
                preview: 'Complete blog template with content management and SEO optimization',
                dependencies: ['next', 'typescript', 'mdx', 'tailwindcss', 'next-seo']
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
            case 'component': return <Code className="w-4 h-4" />
            case 'page': return <FileText className="w-4 h-4" />
            case 'feature': return <Zap className="w-4 h-4" />
            case 'project': return <Folder className="w-4 h-4" />
            case 'snippet': return <BookOpen className="w-4 h-4" />
            default: return <FileText className="w-4 h-4" />
        }
    }

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesDifficulty = filterDifficulty === 'all' || template.difficulty === filterDifficulty
        return matchesCategory && matchesSearch && matchesDifficulty
    })

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortBy) {
            case 'popular': return b.downloads - a.downloads
            case 'stars': return b.stars - a.stars
            case 'recent': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
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
                                Templates & Scaffolding
                            </h1>
                            <p className="text-slate-600 mt-1">
                                AI-powered code templates for rapid development and best practices
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                Create Template
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Template Metrics */}
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
                                    <p className="text-slate-600 text-sm">Total Templates</p>
                                    <p className="text-2xl font-bold text-slate-900">{metrics.totalTemplates}</p>
                                    <p className="text-xs text-emerald-600 mt-1">+{metrics.recentTemplates} this week</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-600" />
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
                                    <p className="text-xs text-slate-500 mt-1">Across all templates</p>
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
                                    <p className="text-2xl font-bold text-purple-600">{metrics.totalAuthors}</p>
                                    <p className="text-xs text-slate-500 mt-1">{metrics.communityContributions} community</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-600" />
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
                                <Folder className="w-5 h-5 text-blue-600" />
                                Categories
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedCategory === 'all'
                                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                            : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">All Templates</span>
                                        <span className="text-sm text-slate-500">{templates.length}</span>
                                    </div>
                                </button>

                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
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
                                ))}
                            </div>
                        </div>

                        {/* Language Filter */}
                        {metrics && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-600" />
                                    Languages
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(metrics.templatesByLanguage).map(([language, count]) => (
                                        <div key={language} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700">{language}</span>
                                            <span className="text-slate-500">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                        placeholder="Search templates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
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
                                        <option value="stars">Most Starred</option>
                                        <option value="recent">Recently Updated</option>
                                        <option value="name">Name A-Z</option>
                                    </select>

                                    <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                                        >
                                            Grid
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
                                        >
                                            List
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Templates Grid */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                            {sortedTemplates.map((template, index) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                                                {template.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                                {template.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                            </div>

                                            <p className="text-slate-600 text-sm mb-3">{template.description}</p>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                                                    {template.difficulty}
                                                </span>
                                                <span className="text-slate-500 text-xs">•</span>
                                                <span className="text-slate-500 text-xs">{template.framework}</span>
                                                <span className="text-slate-500 text-xs">•</span>
                                                <span className="text-slate-500 text-xs">{template.estimatedTime}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {template.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {template.tags.length > 3 && (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                        +{template.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {getTypeIcon(template.type)}
                                            <span className="text-xs text-slate-500 capitalize">{template.type}</span>
                                        </div>
                                    </div>

                                    {/* Template Stats */}
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Download className="w-3 h-3" />
                                                <span>Downloads</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 text-sm">{template.downloads.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Star className="w-3 h-3" />
                                                <span>Stars</span>
                                            </div>
                                            <p className="font-semibold text-yellow-600 text-sm">{template.stars}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <FileText className="w-3 h-3" />
                                                <span>Files</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 text-sm">{template.filesCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Size</span>
                                            </div>
                                            <p className="font-semibold text-slate-900 text-sm">{template.size}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" />
                                            Use Template
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
                                        <span>By {template.author}</span>
                                        <span>Updated {template.lastUpdated}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            AI-Powered Template Ecosystem
                        </h3>
                        <p className="text-slate-600 max-w-3xl mx-auto">
                            AIDE's template system leverages AI to provide intelligent code scaffolding,
                            best practice enforcement, and rapid development acceleration with over 400+
                            community-verified templates across all major frameworks and languages.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_Templates
