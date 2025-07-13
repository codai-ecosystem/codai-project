'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    FileTemplate,
    Plus,
    Search,
    Filter,
    Star,
    Download,
    Eye,
    Code,
    Share,
    Heart,
    MoreVertical,
    Calendar,
    User,
    Tag,
    TrendingUp,
    Zap,
    Copy,
    BookOpen,
    Layers,
    Github,
    Play
} from 'lucide-react'

interface Template {
    id: string
    name: string
    description: string
    category: string
    language: string
    framework?: string
    downloads: number
    rating: number
    author: string
    tags: string[]
    lastUpdated: string
    preview?: string
    complexity: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: string
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [languageFilter, setLanguageFilter] = useState<string>('all')
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set())

    const fabricaiService = FabricAIService.getInstance()

    const categories = ['Frontend', 'Backend', 'Machine Learning', 'Database', 'DevOps', 'Mobile', 'API', 'Utility']
    const languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Rust', 'Go', 'PHP']

    useEffect(() => {
        loadTemplates()
    }, [])

    useEffect(() => {
        filterTemplates()
    }, [templates, searchQuery, categoryFilter, languageFilter])

    const loadTemplates = async () => {
        try {
            setIsLoading(true)
            const templatesData = await fabricaiService.getTemplates()

            // Enhanced template data with additional properties
            const enhancedTemplates = templatesData.map(template => ({
                ...template,
                complexity: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'advanced',
                estimatedTime: ['5 min', '10 min', '15 min', '30 min', '1 hour'][Math.floor(Math.random() * 5)]
            }))

            setTemplates(enhancedTemplates)
        } catch (error) {
            console.error('Failed to load templates:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filterTemplates = () => {
        let filtered = templates

        if (searchQuery) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(template => template.category === categoryFilter)
        }

        if (languageFilter !== 'all') {
            filtered = filtered.filter(template => template.language === languageFilter)
        }

        setFilteredTemplates(filtered)
    }

    const toggleLike = (templateId: string) => {
        setLikedTemplates(prev => {
            const newLikes = new Set(prev)
            if (newLikes.has(templateId)) {
                newLikes.delete(templateId)
            } else {
                newLikes.add(templateId)
            }
            return newLikes
        })
    }

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'beginner':
                return 'bg-emerald-500/20 text-emerald-400'
            case 'intermediate':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'advanced':
                return 'bg-red-500/20 text-red-400'
            default:
                return 'bg-slate-500/20 text-slate-400'
        }
    }

    const getCategoryIcon = (category: string) => {
        const icons = {
            Frontend: Code,
            Backend: Layers,
            'Machine Learning': Zap,
            Database: BookOpen,
            DevOps: Github,
            Mobile: FileTemplate,
            API: Share,
            Utility: Play
        }
        return icons[category as keyof typeof icons] || FileTemplate
    }

    const TemplateCard = ({ template }: { template: Template }) => {
        const CategoryIcon = getCategoryIcon(template.category)

        return (
            <motion.div
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
            >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                                {template.name}
                            </h3>
                            <p className="text-slate-400 text-sm">{template.category}</p>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                        <button
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                        >
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>

                        <AnimatePresence>
                            {selectedTemplate === template.id && (
                                <motion.div
                                    className="absolute right-0 top-full mt-2 w-48 bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/20 py-2 z-10"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <Copy className="w-4 h-4" />
                                        <span>Use Template</span>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <Share className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                    <hr className="border-white/20 my-2" />
                                    <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <p className="text-slate-300 text-sm mb-4">{template.description}</p>

                {/* Tech Stack */}
                <div className="flex items-center space-x-3 mb-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {template.language}
                    </span>
                    {template.framework && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs">
                            {template.framework}
                        </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${getComplexityColor(template.complexity)}`}>
                        {template.complexity}
                    </span>
                </div>

                {/* Tags */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                        {template.tags.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-slate-400 rounded text-xs">
                                +{template.tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{template.downloads.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>{template.rating}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{template.estimatedTime}</span>
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-slate-400 text-sm flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{template.author}</span>
                        </span>
                        <span className="text-slate-500 text-sm">{template.lastUpdated}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <motion.button
                            className={`p-2 rounded-lg transition-all ${likedTemplates.has(template.id)
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-white/10 text-slate-400 hover:text-red-400'
                                }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleLike(template.id)}
                        >
                            <Heart className={`w-4 h-4 ${likedTemplates.has(template.id) ? 'fill-current' : ''}`} />
                        </motion.button>

                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg text-white text-sm font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Copy className="w-3 h-3" />
                            <span>Use</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (isLoading) {
        return (
            <FabricAILayout>
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="flex items-center space-x-3 text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-lg font-medium">Loading Templates...</span>
                    </motion.div>
                </div>
            </FabricAILayout>
        )
    }

    return (
        <FabricAILayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <FileTemplate className="w-8 h-8 mr-3 text-purple-400" />
                            Templates
                        </h1>
                        <p className="text-slate-300">Discover and use code templates to accelerate development</p>
                    </div>

                    <motion.button
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Template</span>
                    </motion.button>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Total Templates</p>
                                <p className="text-2xl font-bold text-white">{templates.length}</p>
                            </div>
                            <FileTemplate className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Total Downloads</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {templates.reduce((acc, t) => acc + t.downloads, 0).toLocaleString()}
                                </p>
                            </div>
                            <Download className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Avg Rating</p>
                                <p className="text-2xl font-bold text-yellow-400">
                                    {(templates.reduce((acc, t) => acc + t.rating, 0) / templates.length).toFixed(1)}
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Categories</p>
                                <p className="text-2xl font-bold text-purple-400">{categories.length}</p>
                            </div>
                            <Tag className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Search */}
                <motion.div
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <div className="relative">
                                <Filter className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={languageFilter}
                                onChange={(e) => setLanguageFilter(e.target.value)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">All Languages</option>
                                {languages.map(language => (
                                    <option key={language} value={language}>{language}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-slate-400 text-sm">
                        Showing {filteredTemplates.length} of {templates.length} templates
                    </div>
                </motion.div>

                {/* Featured Templates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-white font-semibold text-lg">Trending Templates</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredTemplates
                            .sort((a, b) => b.downloads - a.downloads)
                            .slice(0, 3)
                            .map((template, index) => (
                                <motion.div
                                    key={`featured-${template.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                                        TRENDING
                                    </div>
                                    <TemplateCard template={template} />
                                </motion.div>
                            ))}
                    </div>
                </motion.div>

                {/* All Templates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-white font-semibold text-lg mb-6">All Templates</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredTemplates.map((template, index) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <TemplateCard template={template} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Empty State */}
                {filteredTemplates.length === 0 && (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FileTemplate className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold text-lg mb-2">No templates found</h3>
                        <p className="text-slate-400 mb-6">
                            {searchQuery || categoryFilter !== 'all' || languageFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first template to get started'
                            }
                        </p>
                        {!searchQuery && categoryFilter === 'all' && languageFilter === 'all' && (
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Your First Template
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </div>
        </FabricAILayout>
    )
}
