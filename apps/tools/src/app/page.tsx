'use client'

import React from 'react'

import { Wrench, Zap, Code, Database, FileText, Image, Music, Video, Calculator, Palette } from 'lucide-react'

interface ToolsStats {
    totalTools: number
    activeUsers: string
    toolsUsed: string
    categories: Array<{ name: string; count: number; icon: any }>
    popularTools: Array<{ name: string; category: string; usage: string; icon: any }>
    recentActivity: Array<{ tool: string; action: string; time: string }>
}

export default function ToolsDashboard() {
    const toolsStats: ToolsStats = {
        totalTools: 47,
        activeUsers: '8.4K',
        toolsUsed: '15.2K',
        categories: [
            { name: 'Text Processing', count: 12, icon: FileText },
            { name: 'Image Tools', count: 8, icon: Image },
            { name: 'Code Utilities', count: 9, icon: Code },
            { name: 'Data Tools', count: 7, icon: Database },
            { name: 'Media Tools', count: 6, icon: Music },
            { name: 'Calculators', count: 5, icon: Calculator }
        ],
        popularTools: [
            { name: 'Text Formatter', category: 'Text', usage: '2.4K uses', icon: FileText },
            { name: 'Image Converter', category: 'Image', usage: '1.8K uses', icon: Image },
            { name: 'JSON Validator', category: 'Code', usage: '1.5K uses', icon: Code },
            { name: 'CSV Parser', category: 'Data', usage: '1.2K uses', icon: Database },
            { name: 'Color Picker', category: 'Design', usage: '980 uses', icon: Palette },
            { name: 'Unit Converter', category: 'Math', usage: '756 uses', icon: Calculator }
        ],
        recentActivity: [
            { tool: 'Text Formatter', action: 'Process completed', time: '2 mins ago' },
            { tool: 'Image Converter', action: 'New conversion', time: '5 mins ago' },
            { tool: 'JSON Validator', action: 'Validation passed', time: '8 mins ago' }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Wrench className="h-8 w-8 text-orange-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
                            <p className="text-gray-600">AI Utilities & Standalone Tools</p>
                        </div>
                    </div>
                    <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        All Tools: Online
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Tools</p>
                                <p className="text-2xl font-bold text-gray-900">{toolsStats.totalTools}</p>
                            </div>
                            <Wrench className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900">{toolsStats.activeUsers}</p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tools Used Today</p>
                                <p className="text-2xl font-bold text-gray-900">{toolsStats.toolsUsed}</p>
                            </div>
                            <Code className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{toolsStats.categories.length}</p>
                            </div>
                            <Database className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tool Categories */}
                    <div className="p-6 border-0 shadow-sm lg:col-span-2 bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tool Categories</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {toolsStats.categories.map((category) => {
                                const IconComponent = category.icon
                                return (
                                    <div key={category.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="h-6 w-6 text-orange-600" />
                                            <div>
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                                <p className="text-sm text-gray-600">{category.count} tools</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {toolsStats.recentActivity.map((activity, index) => (
                                <div key={index} className="p-3 rounded-lg bg-gray-50">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="font-medium text-gray-900 text-sm">{activity.tool}</h4>
                                        <span className="text-xs text-gray-500">{activity.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{activity.action}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Popular Tools */}
                <div className="p-6 border-0 shadow-sm bg-white rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {toolsStats.popularTools.map((tool) => {
                            const IconComponent = tool.icon
                            return (
                                <div key={tool.name} className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <IconComponent className="h-8 w-8 text-orange-600" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                                            <p className="text-sm text-gray-600">{tool.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{tool.usage}</span>
                                        <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                            Popular
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">Processing Engine</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">All tools operational</p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">API Gateway</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">High availability active</p>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-orange-800">Tool Library</span>
                        </div>
                        <p className="text-sm text-orange-700 mt-1">47 tools available</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

