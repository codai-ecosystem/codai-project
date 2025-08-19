'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Database, Download, Search, Filter, Code, Key, Globe,
    FileText, BarChart3, Map, Calendar, DollarSign, Users,
    Building2, TreePine, Car, Shield, Heart, School, Home,
    Zap, RefreshCw, ExternalLink, Copy, CheckCircle, Eye,
    Lock, Unlock, Star, Bookmark, Share2, Activity, Clock,
    AlertCircle, Info, ArrowRight, Play, Pause, Settings,
    Terminal, Book, Layers, TrendingUp, Target, Award
} from 'lucide-react'

interface Dataset {
    id: string
    title: string
    description: string
    category: string
    format: string[]
    size: string
    lastUpdated: string
    downloads: number
    apiEndpoint: string
    accessLevel: 'public' | 'registered' | 'restricted'
    updateFrequency: string
    tags: string[]
    department: string
    license: string
    rating: number
    documentation: string
}

interface APIEndpoint {
    id: string
    name: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    description: string
    parameters: { name: string; type: string; required: boolean; description: string }[]
    response: string
    rateLimit: string
    authentication: 'none' | 'api-key' | 'oauth'
    status: 'active' | 'deprecated' | 'beta'
}

interface DataCategory {
    id: string
    name: string
    icon: any
    color: string
    count: number
    description: string
}

export default function PublicDataPortal() {
    const [activeTab, setActiveTab] = useState('datasets')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedFormat, setSelectedFormat] = useState('all')
    const [apiKey, setApiKey] = useState('')
    const [showApiKey, setShowApiKey] = useState(false)

    const [datasets, setDatasets] = useState<Dataset[]>([
        {
            id: 'budget-data-2025',
            title: 'Municipal Budget Data 2025',
            description: 'Comprehensive budget allocations and expenditures across all city departments',
            category: 'Financial',
            format: ['JSON', 'CSV', 'XML'],
            size: '45.2 MB',
            lastUpdated: '2025-08-07',
            downloads: 15847,
            apiEndpoint: '/api/v1/budget/2025',
            accessLevel: 'public',
            updateFrequency: 'Monthly',
            tags: ['budget', 'finance', 'spending', 'departments'],
            department: 'Finance',
            license: 'CC BY 4.0',
            rating: 4.8,
            documentation: '/docs/budget-api'
        },
        {
            id: 'traffic-patterns',
            title: 'Real-time Traffic Patterns',
            description: 'Live traffic data including congestion levels, average speeds, and incident reports',
            category: 'Transportation',
            format: ['JSON', 'GeoJSON'],
            size: '125.7 MB',
            lastUpdated: '2025-08-07',
            downloads: 8932,
            apiEndpoint: '/api/v1/traffic/live',
            accessLevel: 'registered',
            updateFrequency: 'Real-time',
            tags: ['traffic', 'transportation', 'real-time', 'geospatial'],
            department: 'Transportation',
            license: 'Open Data',
            rating: 4.6,
            documentation: '/docs/traffic-api'
        },
        {
            id: 'air-quality-monitoring',
            title: 'Air Quality Monitoring Data',
            description: 'Hourly air quality measurements from sensors across the city',
            category: 'Environment',
            format: ['JSON', 'CSV'],
            size: '78.3 MB',
            lastUpdated: '2025-08-07',
            downloads: 6234,
            apiEndpoint: '/api/v1/air-quality',
            accessLevel: 'public',
            updateFrequency: 'Hourly',
            tags: ['environment', 'air-quality', 'sensors', 'health'],
            department: 'Environmental Services',
            license: 'CC BY 4.0',
            rating: 4.7,
            documentation: '/docs/air-quality-api'
        },
        {
            id: 'population-demographics',
            title: 'Population Demographics',
            description: 'Census data and demographic information by district and neighborhood',
            category: 'Demographics',
            format: ['JSON', 'CSV', 'XLSX'],
            size: '32.1 MB',
            lastUpdated: '2025-07-15',
            downloads: 12456,
            apiEndpoint: '/api/v1/demographics',
            accessLevel: 'public',
            updateFrequency: 'Annually',
            tags: ['demographics', 'census', 'population', 'statistics'],
            department: 'Planning',
            license: 'Public Domain',
            rating: 4.9,
            documentation: '/docs/demographics-api'
        },
        {
            id: 'crime-statistics',
            title: 'Public Safety Statistics',
            description: 'Crime statistics and public safety incident data (anonymized)',
            category: 'Safety',
            format: ['JSON', 'CSV'],
            size: '23.8 MB',
            lastUpdated: '2025-08-05',
            downloads: 7891,
            apiEndpoint: '/api/v1/public-safety',
            accessLevel: 'registered',
            updateFrequency: 'Weekly',
            tags: ['safety', 'crime', 'incidents', 'statistics'],
            department: 'Public Safety',
            license: 'Open Data',
            rating: 4.3,
            documentation: '/docs/safety-api'
        },
        {
            id: 'business-licenses',
            title: 'Business License Registry',
            description: 'Active business licenses and permits database',
            category: 'Business',
            format: ['JSON', 'CSV', 'XML'],
            size: '18.9 MB',
            lastUpdated: '2025-08-06',
            downloads: 4567,
            apiEndpoint: '/api/v1/business-licenses',
            accessLevel: 'public',
            updateFrequency: 'Daily',
            tags: ['business', 'licenses', 'permits', 'registry'],
            department: 'Business Services',
            license: 'CC BY 4.0',
            rating: 4.5,
            documentation: '/docs/business-api'
        }
    ])

    const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([
        {
            id: 'get-budget',
            name: 'Get Budget Data',
            path: '/api/v1/budget/{year}',
            method: 'GET',
            description: 'Retrieve budget data for a specific year',
            parameters: [
                { name: 'year', type: 'integer', required: true, description: 'Budget year (e.g., 2025)' },
                { name: 'department', type: 'string', required: false, description: 'Filter by department' },
                { name: 'format', type: 'string', required: false, description: 'Response format (json, csv, xml)' }
            ],
            response: '{"budget": {...}, "total": 180000000, "departments": [...]}',
            rateLimit: '100 requests/hour',
            authentication: 'none',
            status: 'active'
        },
        {
            id: 'get-traffic',
            name: 'Get Traffic Data',
            path: '/api/v1/traffic/live',
            method: 'GET',
            description: 'Get real-time traffic information',
            parameters: [
                { name: 'location', type: 'string', required: false, description: 'Specific location or area' },
                { name: 'radius', type: 'number', required: false, description: 'Radius in kilometers' },
                { name: 'include_incidents', type: 'boolean', required: false, description: 'Include traffic incidents' }
            ],
            response: '{"traffic": [...], "incidents": [...], "timestamp": "..."}',
            rateLimit: '500 requests/hour',
            authentication: 'api-key',
            status: 'active'
        },
        {
            id: 'post-feedback',
            name: 'Submit Citizen Feedback',
            path: '/api/v1/feedback',
            method: 'POST',
            description: 'Submit public feedback or suggestions',
            parameters: [
                { name: 'title', type: 'string', required: true, description: 'Feedback title' },
                { name: 'description', type: 'string', required: true, description: 'Detailed description' },
                { name: 'category', type: 'string', required: true, description: 'Feedback category' },
                { name: 'location', type: 'object', required: false, description: 'Geographic location' }
            ],
            response: '{"id": "fb-123", "status": "submitted", "reference": "..."}',
            rateLimit: '10 requests/hour',
            authentication: 'api-key',
            status: 'beta'
        }
    ])

    const categories: DataCategory[] = [
        { id: 'all', name: 'All Categories', icon: Database, color: 'bg-gray-500', count: datasets.length, description: 'All available datasets' },
        { id: 'Financial', name: 'Financial', icon: DollarSign, color: 'bg-green-500', count: datasets.filter(d => d.category === 'Financial').length, description: 'Budget and financial data' },
        { id: 'Transportation', name: 'Transportation', icon: Car, color: 'bg-blue-500', count: datasets.filter(d => d.category === 'Transportation').length, description: 'Traffic and transit data' },
        { id: 'Environment', name: 'Environment', icon: TreePine, color: 'bg-emerald-500', count: datasets.filter(d => d.category === 'Environment').length, description: 'Environmental monitoring data' },
        { id: 'Demographics', name: 'Demographics', icon: Users, color: 'bg-purple-500', count: datasets.filter(d => d.category === 'Demographics').length, description: 'Population and census data' },
        { id: 'Safety', name: 'Safety', icon: Shield, color: 'bg-red-500', count: datasets.filter(d => d.category === 'Safety').length, description: 'Public safety statistics' },
        { id: 'Business', name: 'Business', icon: Building2, color: 'bg-indigo-500', count: datasets.filter(d => d.category === 'Business').length, description: 'Business and commerce data' }
    ]

    const formats = ['all', 'JSON', 'CSV', 'XML', 'GeoJSON', 'XLSX']

    const tabs = [
        { id: 'datasets', label: 'Datasets', icon: Database },
        { id: 'api', label: 'API Explorer', icon: Code },
        { id: 'documentation', label: 'Documentation', icon: Book },
        { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 }
    ]

    const getAccessBadgeColor = (level: string) => {
        switch (level) {
            case 'public': return 'bg-green-100 text-green-800'
            case 'registered': return 'bg-blue-100 text-blue-800'
            case 'restricted': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'beta': return 'bg-yellow-100 text-yellow-800'
            case 'deprecated': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredDatasets = datasets.filter(dataset => {
        const matchesCategory = selectedCategory === 'all' || dataset.category === selectedCategory
        const matchesFormat = selectedFormat === 'all' || dataset.format.includes(selectedFormat)
        const matchesSearch = dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesCategory && matchesFormat && matchesSearch
    })

    const generateApiKey = () => {
        const key = 'pk_' + Math.random().toString(36).substr(2, 32)
        setApiKey(key)
        setShowApiKey(true)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    useEffect(() => {
        // Simulate real-time data updates
        const interval = setInterval(() => {
            setDatasets(prev => prev.map(dataset => ({
                ...dataset,
                downloads: dataset.downloads + Math.floor(Math.random() * 3)
            })))
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
            {/* Enhanced Header */}
            <motion.div
                className="bg-white/80 backdrop-blur-sm border-b border-teal-200/50 sticky top-0 z-40"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                    Public Data Portal
                                </h1>
                                <p className="text-sm text-gray-600">Open Data Access & API Management</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Database className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{datasets.length} Datasets</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Code className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">{apiEndpoints.length} API Endpoints</span>
                                </div>
                            </div>

                            <button
                                onClick={generateApiKey}
                                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors"
                            >
                                <Key className="w-4 h-4 inline mr-2" />
                                Get API Key
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-1">
                        <div className="flex space-x-1 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* API Key Modal */}
                {showApiKey && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowApiKey(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl border border-teal-200/50 p-6 max-w-md w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Your API Key</h3>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <code className="text-sm font-mono text-gray-800">{apiKey}</code>
                                    <button
                                        onClick={() => copyToClipboard(apiKey)}
                                        className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Keep this API key secure. Rate limits apply based on your usage tier.
                            </p>
                            <button
                                onClick={() => setShowApiKey(false)}
                                className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Datasets Tab */}
                {activeTab === 'datasets' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Categories */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {categories.map((category, index) => {
                                const Icon = category.icon
                                return (
                                    <motion.button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`p-4 rounded-xl border transition-all ${selectedCategory === category.id
                                                ? 'border-teal-500 bg-teal-50 text-teal-900'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="font-medium text-sm text-center">{category.name}</h3>
                                        <p className="text-xs text-gray-600 text-center mt-1">{category.count} datasets</p>
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search datasets..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <select
                                        value={selectedFormat}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                                    >
                                        {formats.map((format) => (
                                            <option key={format} value={format}>
                                                {format === 'all' ? 'All Formats' : format}
                                            </option>
                                        ))}
                                    </select>

                                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Filter className="w-4 h-4 inline mr-2" />
                                        More Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Datasets Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredDatasets.map((dataset, index) => (
                                <motion.div
                                    key={dataset.id}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6 hover:shadow-lg transition-all"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{dataset.title}</h3>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessBadgeColor(dataset.accessLevel)}`}>
                                                    {dataset.accessLevel}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">{dataset.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(dataset.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                        <div>
                                            <span className="font-medium">Category:</span> {dataset.category}
                                        </div>
                                        <div>
                                            <span className="font-medium">Size:</span> {dataset.size}
                                        </div>
                                        <div>
                                            <span className="font-medium">Updated:</span> {new Date(dataset.lastUpdated).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Downloads:</span> {dataset.downloads.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {dataset.format.map((format) => (
                                            <span
                                                key={format}
                                                className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium"
                                            >
                                                {format}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {dataset.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <button className="px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors text-sm">
                                                <Download className="w-4 h-4 inline mr-1" />
                                                Download
                                            </button>
                                            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                                <Code className="w-4 h-4 inline mr-1" />
                                                API
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Bookmark className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* API Explorer Tab */}
                {activeTab === 'api' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">API Endpoints</h2>
                            <div className="space-y-6">
                                {apiEndpoints.map((endpoint, index) => (
                                    <motion.div
                                        key={endpoint.id}
                                        className="border border-gray-200 rounded-lg p-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold text-white ${endpoint.method === 'GET' ? 'bg-green-500' :
                                                        endpoint.method === 'POST' ? 'bg-blue-500' :
                                                            endpoint.method === 'PUT' ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                    }`}>
                                                    {endpoint.method}
                                                </span>
                                                <h3 className="text-lg font-semibold text-gray-900">{endpoint.name}</h3>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(endpoint.status)}`}>
                                                {endpoint.status}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                                        </div>

                                        <p className="text-gray-600 mb-4">{endpoint.description}</p>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
                                                <div className="space-y-2">
                                                    {endpoint.parameters.map((param) => (
                                                        <div key={param.name} className="bg-gray-50 rounded p-3">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="font-mono text-sm text-gray-900">{param.name}</span>
                                                                <span className="text-xs text-gray-500">({param.type})</span>
                                                                {param.required && (
                                                                    <span className="text-xs text-red-600 font-medium">required</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600">{param.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Response Example</h4>
                                                <div className="bg-gray-900 rounded-lg p-3">
                                                    <code className="text-sm text-green-400 font-mono">{endpoint.response}</code>
                                                </div>

                                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Rate Limit:</span> {endpoint.rateLimit}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Authentication:</span> {endpoint.authentication}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                                            <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                                                <Play className="w-4 h-4 inline mr-2" />
                                                Try It Out
                                            </button>

                                            <div className="flex items-center space-x-2">
                                                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Copy className="w-4 h-4 inline mr-1" />
                                                    Copy cURL
                                                </button>
                                                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Book className="w-4 h-4 inline mr-1" />
                                                    Docs
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other tabs placeholder */}
                {!['datasets', 'api'].includes(activeTab) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200/50 p-12 text-center"
                    >
                        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Portal</h3>
                        <p className="text-gray-600 mb-6">Advanced {activeTab} features are being implemented.</p>
                        <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors">
                            Coming Soon
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Modern Footer */}
            <motion.footer
                className="bg-white/80 backdrop-blur-sm border-t border-teal-200/50 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Database className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Open Data</h3>
                            <p className="text-teal-100 text-sm">Promoting transparency through accessible public data.</p>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Code className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">API Access</h3>
                            <p className="text-blue-100 text-sm">Developer-friendly APIs for building civic applications.</p>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white"
                            whileHover={{ scale: 1.02 }}
                        >
                            <Globe className="w-8 h-8 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Public Innovation</h3>
                            <p className="text-indigo-100 text-sm">Enabling innovation through government data accessibility.</p>
                        </motion.div>
                    </div>
                </div>
            </motion.footer>
        </div>
    )
}
