'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Box,
    Plus,
    Search,
    Grid,
    List,
    Code,
    Database,
    Globe,
    Mail,
    Cpu,
    GitBranch,
    Layers,
    Star,
    Download,
    ArrowRight
} from 'lucide-react'

// TypeScript interfaces for Module Builder
interface ModuleCategory {
    id: string
    name: string
    icon: React.ComponentType<any>
    count: number
    description: string
}

interface ModuleTemplate {
    id: string
    name: string
    type: 'Input' | 'Transform' | 'Output' | 'Logic' | 'Data' | 'AI'
    category: string
    description: string
    version: string
    downloads: number
    rating: number
    complexity: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    isOfficial: boolean
    lastUpdated: string
    icon: React.ComponentType<any>
}

export default function ModuleBuilder() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Module categories
    const categories: ModuleCategory[] = [
        {
            id: 'all',
            name: 'All Modules',
            icon: Layers,
            count: 156,
            description: 'Browse all available modules'
        },
        {
            id: 'input',
            name: 'Input Sources',
            icon: Globe,
            count: 28,
            description: 'Data input and API connectors'
        },
        {
            id: 'transform',
            name: 'Data Transform',
            icon: Database,
            count: 45,
            description: 'Data processing and transformation'
        },
        {
            id: 'output',
            name: 'Output Targets',
            icon: Mail,
            count: 32,
            description: 'Data output and notifications'
        },
        {
            id: 'logic',
            name: 'Logic Control',
            icon: GitBranch,
            count: 24,
            description: 'Conditional logic and flow control'
        },
        {
            id: 'ai',
            name: 'AI & ML',
            icon: Cpu,
            count: 18,
            description: 'Artificial intelligence modules'
        },
        {
            id: 'custom',
            name: 'Custom Modules',
            icon: Code,
            count: 9,
            description: 'User-created custom modules'
        }
    ]

    // Sample module templates
    const moduleTemplates: ModuleTemplate[] = [
        {
            id: 'http-request',
            name: 'HTTP Request',
            type: 'Input',
            category: 'input',
            description: 'Make HTTP requests to external APIs with authentication support',
            version: '2.1.0',
            downloads: 15420,
            rating: 4.8,
            complexity: 'beginner',
            tags: ['api', 'http', 'rest', 'authentication'],
            isOfficial: true,
            lastUpdated: '2025-08-05',
            icon: Globe
        },
        {
            id: 'data-transformer',
            name: 'Data Transformer',
            type: 'Transform',
            category: 'transform',
            description: 'Transform and manipulate data with advanced mapping capabilities',
            version: '1.8.3',
            downloads: 12890,
            rating: 4.9,
            complexity: 'intermediate',
            tags: ['data', 'transform', 'mapping', 'json'],
            isOfficial: true,
            lastUpdated: '2025-08-07',
            icon: Database
        },
        {
            id: 'email-sender',
            name: 'Email Sender',
            type: 'Output',
            category: 'output',
            description: 'Send emails with templates, attachments, and tracking',
            version: '1.5.2',
            downloads: 8765,
            rating: 4.7,
            complexity: 'beginner',
            tags: ['email', 'notification', 'templates', 'smtp'],
            isOfficial: true,
            lastUpdated: '2025-08-03',
            icon: Mail
        },
        {
            id: 'ai-classifier',
            name: 'AI Text Classifier',
            type: 'AI',
            category: 'ai',
            description: 'Classify text content using machine learning models',
            version: '1.2.1',
            downloads: 3456,
            rating: 4.6,
            complexity: 'advanced',
            tags: ['ai', 'ml', 'classification', 'text'],
            isOfficial: true,
            lastUpdated: '2025-08-01',
            icon: Cpu
        }
    ]

    // Filter modules based on category and search
    const filteredModules = moduleTemplates.filter(module => {
        const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory
        const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesCategory && matchesSearch
    })

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
                                    <Box className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                        Module Builder
                                    </h1>
                                    <p className="text-sm text-gray-500">Create and customize automation modules</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <span className="flex items-center space-x-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Module</span>
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Categories Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
                            <div className="space-y-2">
                                {categories.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <motion.button
                                            key={category.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${selectedCategory === category.id
                                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200'
                                                    : 'hover:bg-gray-50 text-gray-600'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <div className="flex-1 text-left">
                                                <p className="font-medium">{category.name}</p>
                                                <p className="text-xs opacity-75">{category.count} modules</p>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Modules Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        {/* Search and Controls */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search modules..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <List className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600">
                                Showing {filteredModules.length} modules in {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name.toLowerCase()}
                            </div>
                        </div>

                        {/* Modules Display */}
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredModules.map((module, index) => {
                                const Icon = module.icon
                                return (
                                    <motion.div
                                        key={module.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
                                                        <Icon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{module.name}</h3>
                                                        <p className="text-sm text-gray-500">{module.type} • v{module.version}</p>
                                                    </div>
                                                </div>
                                                {module.isOfficial && (
                                                    <div className="bg-purple-100 text-purple-700 p-1 rounded-full">
                                                        <Star className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {module.description}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                <div className="flex items-center space-x-1">
                                                    <Download className="h-3 w-3" />
                                                    <span>{module.downloads.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-3 w-3 text-yellow-500" />
                                                    <span>{module.rating}</span>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full ${module.complexity === 'beginner'
                                                        ? 'bg-green-100 text-green-700'
                                                        : module.complexity === 'intermediate'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {module.complexity}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-1">
                                                    {module.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-lg"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {module.tags.length > 2 && (
                                                        <span className="text-xs text-gray-400">
                                                            +{module.tags.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
