'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, LineChart, PieChart, AreaChart, ScatterChart, TrendingUp,
    Palette, Layers, Settings, Eye, Download, Share2, Plus, Edit,
    Trash2, Copy, Save, RefreshCw, Filter, Search, Grid, List,
    Maximize2, Minimize2, RotateCcw, Zap, Sparkles, Target,
    Database, FileImage, Code, Layout, Paintbrush, Sliders,
    Monitor, Smartphone, Tablet, Globe, Calendar, Clock,
    Users, Activity, Award, Bookmark, Star, Heart, ThumbsUp,
    ArrowUp, ArrowDown, TrendingDown, MousePointer, Move,
    MoreHorizontal, Expand, Shrink, Image, Video, Music
} from 'lucide-react'

// TypeScript interfaces for data visualization
interface ChartTemplate {
    id: string
    name: string
    description: string
    type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'treemap'
    category: 'business' | 'analytics' | 'financial' | 'operational' | 'custom'
    preview: string // Base64 or URL
    config: {
        xAxis?: string
        yAxis?: string
        colorScheme: string[]
        layout: 'horizontal' | 'vertical' | 'circular' | 'grid'
        animation: boolean
        responsive: boolean
    }
    dataRequirements: string[]
    complexity: 'simple' | 'moderate' | 'advanced'
    popularity: number // 1-5 stars
    tags: string[]
    createdAt: string
    updatedAt?: string
    isBuiltIn: boolean
    usageCount: number
}

interface CustomVisualization {
    id: string
    title: string
    description?: string
    type: 'chart' | 'dashboard' | 'report' | 'widget'
    chartType: ChartTemplate['type']
    status: 'draft' | 'published' | 'archived' | 'shared'
    visibility: 'private' | 'team' | 'public'
    createdAt: string
    updatedAt?: string
    author: {
        id: string
        name: string
        avatar?: string
    }
    config: {
        title: string
        subtitle?: string
        dimensions: {
            width: number
            height: number
        }
        theme: 'light' | 'dark' | 'auto'
        colorScheme: string[]
        animation: boolean
        interactive: boolean
        responsive: boolean
        showLegend: boolean
        showTooltips: boolean
        showDataLabels: boolean
    }
    dataSource: {
        id: string
        name: string
        type: 'csv' | 'json' | 'api' | 'database'
        columns: string[]
        rows: number
        lastSync?: string
    }
    metrics: {
        views: number
        shares: number
        downloads: number
        likes: number
        bookmarks: number
    }
    tags: string[]
    isBookmarked: boolean
    isFavorite: boolean
}

interface ChartBuilder {
    selectedTemplate?: ChartTemplate
    selectedDataSource?: string
    configuration: {
        title: string
        subtitle: string
        width: number
        height: number
        theme: 'light' | 'dark' | 'auto'
        colorScheme: string[]
        animation: boolean
        responsive: boolean
        showLegend: boolean
        showTooltips: boolean
    }
    preview: boolean
    step: 'template' | 'data' | 'config' | 'preview' | 'save'
}

interface VisualizationMetrics {
    totalVisualizations: number
    activeCharts: number
    templatesUsed: number
    dataSourcesConnected: number
    viewsThisMonth: number
    sharesThisMonth: number
    avgCreationTime: number // in minutes
    popularChartType: string
    teamCollaborations: number
    exportCount: number
}

// Mock data for demonstration
const mockTemplates: ChartTemplate[] = [
    {
        id: 'tpl-1',
        name: 'Sales Performance Bar Chart',
        description: 'Professional bar chart template for sales and revenue analysis',
        type: 'bar',
        category: 'business',
        preview: '/charts/bar-sales.png',
        config: {
            xAxis: 'Month',
            yAxis: 'Revenue',
            colorScheme: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
            layout: 'vertical',
            animation: true,
            responsive: true
        },
        dataRequirements: ['Time Period', 'Revenue Data', 'Categories'],
        complexity: 'simple',
        popularity: 5,
        tags: ['sales', 'revenue', 'business', 'monthly'],
        createdAt: '2025-07-15T10:00:00Z',
        isBuiltIn: true,
        usageCount: 142
    },
    {
        id: 'tpl-2',
        name: 'Trend Analysis Line Chart',
        description: 'Multi-line chart for tracking trends and performance over time',
        type: 'line',
        category: 'analytics',
        preview: '/charts/line-trends.png',
        config: {
            xAxis: 'Date',
            yAxis: 'Value',
            colorScheme: ['#06B6D4', '#0891B2', '#0E7490'],
            layout: 'horizontal',
            animation: true,
            responsive: true
        },
        dataRequirements: ['Time Series Data', 'Multiple Metrics', 'Date Range'],
        complexity: 'moderate',
        popularity: 4,
        tags: ['trends', 'analytics', 'time-series', 'multi-metric'],
        createdAt: '2025-07-20T14:30:00Z',
        isBuiltIn: true,
        usageCount: 98
    },
    {
        id: 'tpl-3',
        name: 'Market Share Pie Chart',
        description: 'Interactive pie chart for market share and distribution analysis',
        type: 'pie',
        category: 'business',
        preview: '/charts/pie-market.png',
        config: {
            colorScheme: ['#F59E0B', '#EAB308', '#FDE047', '#FACC15'],
            layout: 'circular',
            animation: true,
            responsive: true
        },
        dataRequirements: ['Categories', 'Percentage Values', 'Labels'],
        complexity: 'simple',
        popularity: 4,
        tags: ['market-share', 'distribution', 'percentage', 'categories'],
        createdAt: '2025-07-18T16:45:00Z',
        isBuiltIn: true,
        usageCount: 87
    },
    {
        id: 'tpl-4',
        name: 'Performance Area Chart',
        description: 'Stacked area chart for cumulative performance tracking',
        type: 'area',
        category: 'operational',
        preview: '/charts/area-performance.png',
        config: {
            xAxis: 'Time',
            yAxis: 'Cumulative Value',
            colorScheme: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
            layout: 'horizontal',
            animation: true,
            responsive: true
        },
        dataRequirements: ['Time Data', 'Cumulative Metrics', 'Stacked Categories'],
        complexity: 'moderate',
        popularity: 3,
        tags: ['performance', 'cumulative', 'stacked', 'operational'],
        createdAt: '2025-07-22T11:20:00Z',
        isBuiltIn: true,
        usageCount: 65
    },
    {
        id: 'tpl-5',
        name: 'Financial Scatter Plot',
        description: 'Advanced scatter plot for financial correlation analysis',
        type: 'scatter',
        category: 'financial',
        preview: '/charts/scatter-financial.png',
        config: {
            xAxis: 'Risk',
            yAxis: 'Return',
            colorScheme: ['#EF4444', '#F87171', '#FCA5A5'],
            layout: 'grid',
            animation: true,
            responsive: true
        },
        dataRequirements: ['X-Axis Data', 'Y-Axis Data', 'Point Categories'],
        complexity: 'advanced',
        popularity: 3,
        tags: ['financial', 'correlation', 'risk-return', 'advanced'],
        createdAt: '2025-07-25T09:15:00Z',
        isBuiltIn: true,
        usageCount: 43
    },
    {
        id: 'tpl-6',
        name: 'Custom Dashboard Widget',
        description: 'Flexible template for custom dashboard widgets and components',
        type: 'gauge',
        category: 'custom',
        preview: '/charts/gauge-custom.png',
        config: {
            colorScheme: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
            layout: 'circular',
            animation: true,
            responsive: true
        },
        dataRequirements: ['Single Metric', 'Target Value', 'Threshold Ranges'],
        complexity: 'simple',
        popularity: 4,
        tags: ['dashboard', 'gauge', 'kpi', 'widget'],
        createdAt: '2025-07-28T13:40:00Z',
        isBuiltIn: true,
        usageCount: 76
    }
]

const mockVisualizations: CustomVisualization[] = [
    {
        id: 'viz-1',
        title: 'Q3 Revenue Dashboard',
        description: 'Comprehensive revenue analysis for Q3 2025 with regional breakdown',
        type: 'dashboard',
        chartType: 'bar',
        status: 'published',
        visibility: 'team',
        createdAt: '2025-08-01T10:30:00Z',
        updatedAt: '2025-08-06T14:20:00Z',
        author: {
            id: 'user-1',
            name: 'Maria Popescu',
            avatar: '/avatars/maria.jpg'
        },
        config: {
            title: 'Q3 Revenue Analysis',
            subtitle: 'Regional performance breakdown',
            dimensions: { width: 800, height: 600 },
            theme: 'light',
            colorScheme: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
            animation: true,
            interactive: true,
            responsive: true,
            showLegend: true,
            showTooltips: true,
            showDataLabels: false
        },
        dataSource: {
            id: 'ds-1',
            name: 'Revenue Data 2025',
            type: 'csv',
            columns: ['Region', 'Month', 'Revenue', 'Growth'],
            rows: 24,
            lastSync: '2025-08-06T08:00:00Z'
        },
        metrics: {
            views: 247,
            shares: 12,
            downloads: 34,
            likes: 18,
            bookmarks: 6
        },
        tags: ['revenue', 'quarterly', 'regional'],
        isBookmarked: true,
        isFavorite: false
    },
    {
        id: 'viz-2',
        title: 'Customer Engagement Trends',
        description: 'Monthly customer engagement analysis with trend predictions',
        type: 'chart',
        chartType: 'line',
        status: 'published',
        visibility: 'public',
        createdAt: '2025-08-03T16:45:00Z',
        updatedAt: '2025-08-05T11:30:00Z',
        author: {
            id: 'user-2',
            name: 'Alexandru Ionescu',
            avatar: '/avatars/alex.jpg'
        },
        config: {
            title: 'Customer Engagement Trends',
            subtitle: 'Monthly analysis with predictions',
            dimensions: { width: 1000, height: 400 },
            theme: 'auto',
            colorScheme: ['#06B6D4', '#0891B2', '#0E7490'],
            animation: true,
            interactive: true,
            responsive: true,
            showLegend: true,
            showTooltips: true,
            showDataLabels: true
        },
        dataSource: {
            id: 'ds-2',
            name: 'Customer Analytics',
            type: 'api',
            columns: ['Date', 'Engagement_Score', 'Active_Users', 'Sessions'],
            rows: 180,
            lastSync: '2025-08-07T07:30:00Z'
        },
        metrics: {
            views: 189,
            shares: 8,
            downloads: 21,
            likes: 14,
            bookmarks: 4
        },
        tags: ['engagement', 'trends', 'prediction'],
        isBookmarked: false,
        isFavorite: true
    },
    {
        id: 'viz-3',
        title: 'Market Share Distribution',
        description: 'Current market share analysis across product categories',
        type: 'widget',
        chartType: 'pie',
        status: 'draft',
        visibility: 'private',
        createdAt: '2025-08-07T09:15:00Z',
        author: {
            id: 'user-3',
            name: 'Elena Georgescu',
            avatar: '/avatars/elena.jpg'
        },
        config: {
            title: 'Market Share Distribution',
            subtitle: 'Product category breakdown',
            dimensions: { width: 600, height: 600 },
            theme: 'light',
            colorScheme: ['#F59E0B', '#EAB308', '#FDE047', '#FACC15'],
            animation: true,
            interactive: false,
            responsive: true,
            showLegend: true,
            showTooltips: true,
            showDataLabels: true
        },
        dataSource: {
            id: 'ds-3',
            name: 'Market Data',
            type: 'json',
            columns: ['Category', 'Market_Share', 'Revenue_Contribution'],
            rows: 8,
            lastSync: '2025-08-07T06:00:00Z'
        },
        metrics: {
            views: 23,
            shares: 0,
            downloads: 2,
            likes: 1,
            bookmarks: 0
        },
        tags: ['market-share', 'categories', 'distribution'],
        isBookmarked: false,
        isFavorite: false
    }
]

const mockMetrics: VisualizationMetrics = {
    totalVisualizations: 47,
    activeCharts: 34,
    templatesUsed: 12,
    dataSourcesConnected: 8,
    viewsThisMonth: 1247,
    sharesThisMonth: 89,
    avgCreationTime: 12.5,
    popularChartType: 'Bar Chart',
    teamCollaborations: 23,
    exportCount: 156
}

// Utility functions
const getStatusColor = (status: CustomVisualization['status']) => {
    switch (status) {
        case 'published': return 'text-green-600 bg-green-50 border-green-200'
        case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200'
        case 'shared': return 'text-blue-600 bg-blue-50 border-blue-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getVisibilityIcon = (visibility: CustomVisualization['visibility']) => {
    switch (visibility) {
        case 'public': return <Globe className="h-4 w-4" />
        case 'team': return <Users className="h-4 w-4" />
        case 'private': return <Eye className="h-4 w-4" />
        default: return <Eye className="h-4 w-4" />
    }
}

const getChartTypeIcon = (type: ChartTemplate['type']) => {
    switch (type) {
        case 'bar': return <BarChart3 className="h-5 w-5" />
        case 'line': return <LineChart className="h-5 w-5" />
        case 'pie': return <PieChart className="h-5 w-5" />
        case 'area': return <AreaChart className="h-5 w-5" />
        case 'scatter': return <ScatterChart className="h-5 w-5" />
        case 'gauge': return <Target className="h-5 w-5" />
        default: return <BarChart3 className="h-5 w-5" />
    }
}

const getComplexityColor = (complexity: ChartTemplate['complexity']) => {
    switch (complexity) {
        case 'simple': return 'text-green-600 bg-green-50'
        case 'moderate': return 'text-yellow-600 bg-yellow-50'
        case 'advanced': return 'text-red-600 bg-red-50'
        default: return 'text-gray-600 bg-gray-50'
    }
}

const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
}

// Template Card Component
const TemplateCard: React.FC<{
    template: ChartTemplate
    onSelect: (template: ChartTemplate) => void
    onPreview: (template: ChartTemplate) => void
}> = ({ template, onSelect, onPreview }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg mr-3">
                        {getChartTypeIcon(template.type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{template.category}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                        {template.complexity}
                    </div>
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-xs ${i < template.popularity ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="mb-4">
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center">
                        {getChartTypeIcon(template.type)}
                        <p className="text-xs text-gray-500 mt-1">Preview</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                <div>
                    <p className="font-medium">Used {template.usageCount} times</p>
                    <p>Popular template</p>
                </div>
                <div>
                    <p className="font-medium">{template.dataRequirements.length} requirements</p>
                    <p>Data fields needed</p>
                </div>
            </div>

            {template.tags && template.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {template.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                +{template.tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                    {template.isBuiltIn ? 'Built-in' : 'Custom'} • {formatTimeAgo(template.createdAt)}
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onPreview(template)
                        }}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Preview"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onSelect(template)}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Use Template
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Visualization Card Component
const VisualizationCard: React.FC<{
    visualization: CustomVisualization
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onDuplicate: (id: string) => void
    onShare: (id: string) => void
    onBookmark: (id: string) => void
    onFavorite: (id: string) => void
}> = ({ visualization, onEdit, onDelete, onDuplicate, onShare, onBookmark, onFavorite }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        {getChartTypeIcon(visualization.chartType)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{visualization.title}</h3>
                        <p className="text-sm text-gray-600">{visualization.type} • {visualization.author.name}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(visualization.status)}`}>
                        {visualization.status.toUpperCase()}
                    </div>
                    <div className="flex items-center text-gray-400">
                        {getVisibilityIcon(visualization.visibility)}
                    </div>
                </div>
            </div>

            {visualization.description && (
                <p className="text-sm text-gray-600 mb-4">{visualization.description}</p>
            )}

            <div className="mb-4">
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center">
                        {getChartTypeIcon(visualization.chartType)}
                        <p className="text-xs text-gray-500 mt-1">{visualization.config.title}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4 text-xs text-gray-600">
                <div className="text-center">
                    <p className="font-medium">{visualization.metrics.views}</p>
                    <p>Views</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{visualization.metrics.shares}</p>
                    <p>Shares</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{visualization.metrics.likes}</p>
                    <p>Likes</p>
                </div>
                <div className="text-center">
                    <p className="font-medium">{visualization.dataSource.rows}</p>
                    <p>Data Points</p>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Data Source</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{visualization.dataSource.name}</span>
                    <span className="text-xs text-gray-500">{visualization.dataSource.type.toUpperCase()}</span>
                </div>
            </div>

            {visualization.tags && visualization.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {visualization.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onBookmark(visualization.id)}
                        className={`p-1 rounded transition-colors ${visualization.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                        title="Bookmark"
                    >
                        <Bookmark className="h-4 w-4" fill={visualization.isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={() => onFavorite(visualization.id)}
                        className={`p-1 rounded transition-colors ${visualization.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                            }`}
                        title="Favorite"
                    >
                        <Heart className="h-4 w-4" fill={visualization.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <span className="text-xs text-gray-500">
                        {formatTimeAgo(visualization.updatedAt || visualization.createdAt)}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onShare(visualization.id)}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Share"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDuplicate(visualization.id)}
                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Duplicate"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onEdit(visualization.id)}
                        className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(visualization.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Main Data Visualization Component
export default function DataVisualizationPage() {
    const [templates] = useState<ChartTemplate[]>(mockTemplates)
    const [visualizations, setVisualizations] = useState<CustomVisualization[]>(mockVisualizations)
    const [filteredTemplates, setFilteredTemplates] = useState<ChartTemplate[]>(mockTemplates)
    const [filteredVisualizations, setFilteredVisualizations] = useState<CustomVisualization[]>(mockVisualizations)
    const [metrics] = useState<VisualizationMetrics>(mockMetrics)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'templates' | 'visualizations' | 'builder' | 'gallery'>('templates')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showBuilder, setShowBuilder] = useState(false)
    const [builder, setBuilder] = useState<ChartBuilder>({
        configuration: {
            title: '',
            subtitle: '',
            width: 800,
            height: 600,
            theme: 'light',
            colorScheme: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
            animation: true,
            responsive: true,
            showLegend: true,
            showTooltips: true
        },
        preview: false,
        step: 'template'
    })

    // Filter templates and visualizations
    useEffect(() => {
        let filteredTemps = templates
        let filteredVizs = visualizations

        if (searchTerm) {
            filteredTemps = filteredTemps.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            filteredVizs = filteredVizs.filter(viz =>
                viz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                viz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                viz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        if (categoryFilter !== 'all') {
            filteredTemps = filteredTemps.filter(template => template.category === categoryFilter)
        }

        if (typeFilter !== 'all') {
            filteredTemps = filteredTemps.filter(template => template.type === typeFilter)
            filteredVizs = filteredVizs.filter(viz => viz.chartType === typeFilter)
        }

        if (statusFilter !== 'all') {
            filteredVizs = filteredVizs.filter(viz => viz.status === statusFilter)
        }

        setFilteredTemplates(filteredTemps)
        setFilteredVisualizations(filteredVizs)
    }, [templates, visualizations, searchTerm, categoryFilter, typeFilter, statusFilter])

    const handleTemplateSelect = (template: ChartTemplate) => {
        setBuilder(prev => ({
            ...prev,
            selectedTemplate: template,
            step: 'data'
        }))
        setShowBuilder(true)
        setActiveTab('builder')
    }

    const handleTemplatePreview = (template: ChartTemplate) => {
        console.log('Preview template:', template)
        // Implementation for template preview
    }

    const handleVisualizationEdit = (id: string) => {
        console.log('Edit visualization:', id)
        // Implementation for edit functionality
    }

    const handleVisualizationDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this visualization?')) {
            setVisualizations(prev => prev.filter(viz => viz.id !== id))
        }
    }

    const handleVisualizationDuplicate = (id: string) => {
        const viz = visualizations.find(v => v.id === id)
        if (viz) {
            const duplicate = {
                ...viz,
                id: `viz-${Date.now()}`,
                title: `${viz.title} (Copy)`,
                status: 'draft' as const,
                createdAt: new Date().toISOString(),
                updatedAt: undefined,
                metrics: {
                    views: 0,
                    shares: 0,
                    downloads: 0,
                    likes: 0,
                    bookmarks: 0
                }
            }
            setVisualizations(prev => [duplicate, ...prev])
        }
    }

    const handleVisualizationShare = (id: string) => {
        console.log('Share visualization:', id)
        // Implementation for share functionality
    }

    const handleVisualizationBookmark = (id: string) => {
        setVisualizations(prev => prev.map(viz =>
            viz.id === id ? { ...viz, isBookmarked: !viz.isBookmarked } : viz
        ))
    }

    const handleVisualizationFavorite = (id: string) => {
        setVisualizations(prev => prev.map(viz =>
            viz.id === id ? { ...viz, isFavorite: !viz.isFavorite } : viz
        ))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Data Visualization
                            </h1>
                            <p className="text-gray-600">
                                Create, customize, and share powerful data visualizations
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                            >
                                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                            </button>
                            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Download className="h-4 w-4 mr-2" />
                                Export Library
                            </button>
                            <button
                                onClick={() => {
                                    setShowBuilder(true)
                                    setActiveTab('builder')
                                }}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Visualization
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
                >
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Charts</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalVisualizations}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Charts</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.activeCharts}</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Templates Used</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.templatesUsed}</p>
                            </div>
                            <Layers className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Views (Month)</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.viewsThisMonth}</p>
                            </div>
                            <Eye className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Collaborations</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.teamCollaborations}</p>
                            </div>
                            <Users className="h-8 w-8 text-teal-600" />
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'templates'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Templates ({templates.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('visualizations')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'visualizations'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                My Charts ({visualizations.length})
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('builder')
                                    setShowBuilder(true)
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'builder'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Chart Builder
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'gallery'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Public Gallery
                            </button>
                        </div>

                        {(activeTab === 'templates' || activeTab === 'visualizations') && (
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search charts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    {activeTab === 'templates' && (
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="business">Business</option>
                                            <option value="analytics">Analytics</option>
                                            <option value="financial">Financial</option>
                                            <option value="operational">Operational</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    )}
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="pie">Pie Chart</option>
                                        <option value="area">Area Chart</option>
                                        <option value="scatter">Scatter Plot</option>
                                        <option value="gauge">Gauge</option>
                                    </select>
                                    {activeTab === 'visualizations' && (
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                            <option value="archived">Archived</option>
                                            <option value="shared">Shared</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                {activeTab === 'templates' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                    >
                        {filteredTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={handleTemplateSelect}
                                onPreview={handleTemplatePreview}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'visualizations' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
                    >
                        {filteredVisualizations.map((visualization) => (
                            <VisualizationCard
                                key={visualization.id}
                                visualization={visualization}
                                onEdit={handleVisualizationEdit}
                                onDelete={handleVisualizationDelete}
                                onDuplicate={handleVisualizationDuplicate}
                                onShare={handleVisualizationShare}
                                onBookmark={handleVisualizationBookmark}
                                onFavorite={handleVisualizationFavorite}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'builder' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
                    >
                        <div className="text-center">
                            <Zap className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chart Builder</h3>
                            <p className="text-gray-600 mb-6">
                                Interactive chart builder coming soon. Create custom visualizations with drag-and-drop interface.
                            </p>
                            <div className="flex items-center justify-center space-x-4">
                                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Start Building
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Watch Tutorial
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'gallery' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm"
                    >
                        <div className="text-center">
                            <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Public Gallery</h3>
                            <p className="text-gray-600 mb-6">
                                Explore charts shared by the community and discover new visualization ideas.
                            </p>
                            <button className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                <Globe className="h-4 w-4 mr-2" />
                                Browse Gallery
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                >
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Palette className="h-6 w-6 text-purple-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Custom Themes</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Create and apply custom color schemes and styling to match your brand.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Manage themes →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Database className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Data Connections</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Connect to various data sources for real-time visualization updates.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Connect data →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Users className="h-6 w-6 text-green-600 mr-3" />
                            <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Share visualizations with team members and collaborate in real-time.
                        </p>
                        <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                            Invite team →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
