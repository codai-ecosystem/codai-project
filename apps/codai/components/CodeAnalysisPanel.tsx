/**
 * Code Analysis Panel Component
 * Displays AI-powered code analysis results with interactive insights
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
    Brain,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    Shield,
    Zap,
    RefreshCw,
    FileText,
    Target,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronRight,
    Search,
    Filter,
    Download,
    Play,
    X
} from 'lucide-react'

interface CodeAnalysisResult {
    analysisId: string
    timestamp: string
    projectPath: string
    overallScore: number
    metrics: {
        complexity: number
        maintainability: number
        testCoverage: number
        performance: number
        security: number
    }
    insights: CodeInsight[]
    recommendations: CodeRecommendation[]
    fileAnalysis: FileAnalysis[]
    dependencies: DependencyAnalysis
    codeSmells: CodeSmell[]
    patterns: CodePattern[]
}

interface CodeInsight {
    id: string
    type: 'optimization' | 'refactoring' | 'performance' | 'security' | 'maintainability'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    location: {
        file: string
        line?: number
        column?: number
    }
    suggestion: string
    estimatedImpact: 'low' | 'medium' | 'high'
    confidence: number
}

interface CodeRecommendation {
    id: string
    category: 'architecture' | 'patterns' | 'performance' | 'security' | 'testing'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    implementation: string
    benefits: string[]
    effort: 'small' | 'medium' | 'large'
    tags: string[]
}

interface FileAnalysis {
    filePath: string
    language: string
    size: number
    lines: number
    complexity: number
    maintainabilityIndex: number
    issues: CodeInsight[]
}

interface DependencyAnalysis {
    total: number
    outdated: number
    vulnerable: number
    unused: string[]
    heavy: Array<{
        name: string
        size: string
        impact: 'low' | 'medium' | 'high'
    }>
}

interface CodeSmell {
    id: string
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    location: {
        file: string
        startLine: number
        endLine: number
    }
}

interface CodePattern {
    id: string
    type: string
    name: string
    confidence: number
    description: string
}

interface CodeAnalysisPanelProps {
    projectId: string
    onFileSelect?: (filePath: string, line?: number) => void
}

export default function CodeAnalysisPanel({ projectId, onFileSelect }: CodeAnalysisPanelProps) {
    const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'recommendations' | 'files' | 'dependencies'>('overview')
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metrics']))
    const [filters, setFilters] = useState({
        severity: 'all',
        type: 'all',
        category: 'all'
    })
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchAnalysis()
    }, [projectId])

    const fetchAnalysis = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/projects/${projectId}/analyze`)

            if (!response.ok) {
                throw new Error('Failed to fetch analysis')
            }

            const data = await response.json()
            setAnalysis(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const runAnalysis = async (scope: 'full' | 'incremental' = 'full') => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/projects/${projectId}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ scope })
            })

            if (!response.ok) {
                throw new Error('Failed to run analysis')
            }

            const data = await response.json()
            setAnalysis(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const exportAnalysis = () => {
        if (!analysis) return

        const blob = new Blob([JSON.stringify(analysis, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `code-analysis-${projectId}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50'
            case 'high': return 'text-orange-600 bg-orange-50'
            case 'medium': return 'text-yellow-600 bg-yellow-50'
            case 'low': return 'text-blue-600 bg-blue-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600'
        if (score >= 80) return 'text-yellow-600'
        if (score >= 70) return 'text-orange-600'
        return 'text-red-600'
    }

    const filteredInsights = analysis?.insights.filter(insight => {
        const matchesSeverity = filters.severity === 'all' || insight.severity === filters.severity
        const matchesType = filters.type === 'all' || insight.type === filters.type
        const matchesSearch = searchTerm === '' ||
            insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insight.description.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSeverity && matchesType && matchesSearch
    }) || []

    const filteredRecommendations = analysis?.recommendations.filter(rec => {
        const matchesCategory = filters.category === 'all' || rec.category === filters.category
        const matchesPriority = filters.severity === 'all' || rec.priority === filters.severity
        const matchesSearch = searchTerm === '' ||
            rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.description.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesCategory && matchesPriority && matchesSearch
    }) || []

    if (loading && !analysis) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Running code analysis...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex items-center space-x-2 text-red-600 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Analysis Error</span>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                    onClick={fetchAnalysis}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry Analysis
                </button>
            </div>
        )
    }

    if (!analysis) {
        return (
            <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600 mb-6">Run your first code analysis to get AI-powered insights.</p>
                <button
                    onClick={() => runAnalysis('full')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                    <Play className="h-5 w-5" />
                    <span>Run Full Analysis</span>
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Code Analysis</h2>
                            <p className="text-sm text-gray-600">
                                Last analyzed {new Date(analysis.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={exportAnalysis}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Export Analysis"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => runAnalysis('incremental')}
                            disabled={loading}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Incremental</span>
                        </button>
                        <button
                            onClick={() => runAnalysis('full')}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                            <Play className="h-4 w-4" />
                            <span>Full Analysis</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'insights', label: 'Insights', icon: AlertCircle, count: analysis.insights.length },
                        { id: 'recommendations', label: 'Recommendations', icon: Target, count: analysis.recommendations.length },
                        { id: 'files', label: 'Files', icon: FileText, count: analysis.fileAnalysis.length },
                        { id: 'dependencies', label: 'Dependencies', icon: Shield }
                    ].map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                {tab.count && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                                    <p className="text-gray-600">Combined analysis of all metrics</p>
                                </div>
                                <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                                    {analysis.overallScore}
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {Object.entries(analysis.metrics).map(([key, value]) => {
                                const icons = {
                                    complexity: TrendingUp,
                                    maintainability: CheckCircle,
                                    testCoverage: Shield,
                                    performance: Zap,
                                    security: Shield
                                }
                                const Icon = icons[key as keyof typeof icons] || Info

                                return (
                                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Icon className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                        </div>
                                        <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                                            {value}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-900">Critical Issues</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                    {analysis.insights.filter(i => i.severity === 'critical').length}
                                </div>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <span className="font-medium text-orange-900">Code Smells</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {analysis.codeSmells.length}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">Files Analyzed</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {analysis.fileAnalysis.length}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search insights..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                    />
                                </div>
                            </div>
                            <select
                                value={filters.severity}
                                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="optimization">Optimization</option>
                                <option value="refactoring">Refactoring</option>
                                <option value="performance">Performance</option>
                                <option value="security">Security</option>
                                <option value="maintainability">Maintainability</option>
                            </select>
                        </div>

                        {/* Insights List */}
                        <div className="space-y-3">
                            {filteredInsights.map(insight => (
                                <div
                                    key={insight.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onFileSelect?.(insight.location.file, insight.location.line)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                                                {insight.severity}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">{insight.type}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            Confidence: {Math.round(insight.confidence * 100)}%
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{insight.location.file}{insight.location.line ? `:${insight.location.line}` : ''}</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            Impact: {insight.estimatedImpact}
                                        </span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-sm text-blue-600">{insight.suggestion}</p>
                                    </div>
                                </div>
                            ))}

                            {filteredInsights.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Info className="h-8 w-8 mx-auto mb-2" />
                                    <p>No insights match your current filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search recommendations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                    />
                                </div>
                            </div>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                <option value="architecture">Architecture</option>
                                <option value="patterns">Patterns</option>
                                <option value="performance">Performance</option>
                                <option value="security">Security</option>
                                <option value="testing">Testing</option>
                            </select>
                        </div>

                        {/* Recommendations List */}
                        <div className="space-y-4">
                            {filteredRecommendations.map(rec => (
                                <div key={rec.id} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rec.priority)}`}>
                                                {rec.priority} priority
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {rec.effort} effort
                                        </span>
                                    </div>

                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h4>
                                    <p className="text-gray-600 mb-4">{rec.description}</p>

                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-1">Implementation</h5>
                                            <p className="text-sm text-gray-600">{rec.implementation}</p>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-1">Benefits</h5>
                                            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                                {rec.benefits.map((benefit, index) => (
                                                    <li key={index}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {rec.tags.length > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">Tags:</span>
                                                {rec.tags.map(tag => (
                                                    <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {filteredRecommendations.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Target className="h-8 w-8 mx-auto mb-2" />
                                    <p>No recommendations match your current filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'files' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {analysis.fileAnalysis.map(file => (
                                <div
                                    key={file.filePath}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => onFileSelect?.(file.filePath)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium text-gray-900">{file.filePath}</span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {file.language}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>{file.lines} lines</span>
                                            <span>{(file.size / 1024).toFixed(1)}KB</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-xs text-gray-500">Complexity</span>
                                            <div className={`text-sm font-medium ${getScoreColor(100 - file.complexity * 5)}`}>
                                                {file.complexity}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">Maintainability</span>
                                            <div className={`text-sm font-medium ${getScoreColor(file.maintainabilityIndex)}`}>
                                                {Math.round(file.maintainabilityIndex)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">Issues</span>
                                            <div className={`text-sm font-medium ${file.issues.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {file.issues.length}
                                            </div>
                                        </div>
                                    </div>

                                    {file.issues.length > 0 && (
                                        <div className="space-y-1">
                                            {file.issues.slice(0, 3).map(issue => (
                                                <div key={issue.id} className="flex items-center space-x-2 text-xs">
                                                    <span className={`px-1 py-0.5 rounded ${getSeverityColor(issue.severity)}`}>
                                                        {issue.severity}
                                                    </span>
                                                    <span className="text-gray-600">{issue.title}</span>
                                                </div>
                                            ))}
                                            {file.issues.length > 3 && (
                                                <div className="text-xs text-gray-500">
                                                    +{file.issues.length - 3} more issues
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'dependencies' && (
                    <div className="space-y-6">
                        {/* Dependencies Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-600">{analysis.dependencies.total}</div>
                                <div className="text-sm text-blue-700">Total Dependencies</div>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-orange-600">{analysis.dependencies.outdated}</div>
                                <div className="text-sm text-orange-700">Outdated</div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-600">{analysis.dependencies.vulnerable}</div>
                                <div className="text-sm text-red-700">Vulnerable</div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-600">{analysis.dependencies.unused.length}</div>
                                <div className="text-sm text-gray-700">Unused</div>
                            </div>
                        </div>

                        {/* Heavy Dependencies */}
                        {analysis.dependencies.heavy.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Heavy Dependencies</h4>
                                <div className="space-y-2">
                                    {analysis.dependencies.heavy.map(dep => (
                                        <div key={dep.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <span className="font-medium text-gray-900">{dep.name}</span>
                                                <span className="text-sm text-gray-500 ml-2">{dep.size}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${dep.impact === 'high' ? 'bg-red-100 text-red-700' :
                                                    dep.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {dep.impact} impact
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unused Dependencies */}
                        {analysis.dependencies.unused.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Unused Dependencies</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.dependencies.unused.map(dep => (
                                        <span key={dep} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">
                                            {dep}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
