'use client'

import React from 'react'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    FolderTree,
    Search,
    Code,
    FileText,
    GitBranch,
    Navigation,
    Eye,
    Filter,
    BarChart3,
    Folder,
    File,
    ArrowRight,
    Zap,
    Target,
    Activity
} from 'lucide-react'

interface ExplorerStats {
    totalProjects: number
    totalFiles: number
    codeFiles: number
    documentation: number
    searchQueries: number
    explorationTime: string
}

export function ExplorerDashboard() {
    const [stats] = useState<ExplorerStats>({
        totalProjects: 156,
        totalFiles: 12847,
        codeFiles: 8923,
        documentation: 1456,
        searchQueries: 2341,
        explorationTime: '2h 34m'
    })

    const recentExplorations = [
        { name: 'CODAI Core', type: 'project', files: 234, lastVisited: '2 min ago' },
        { name: 'API Gateway', type: 'service', files: 67, lastVisited: '15 min ago' },
        { name: 'User Dashboard', type: 'component', files: 12, lastVisited: '1h ago' },
        { name: 'Database Schema', type: 'documentation', files: 8, lastVisited: '2h ago' }
    ]

    const popularPaths = [
        { path: '/src/components', visits: 89, trend: '+12%' },
        { path: '/api/routes', visits: 67, trend: '+8%' },
        { path: '/docs/guides', visits: 45, trend: '+5%' },
        { path: '/config', visits: 34, trend: '+3%' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                            <FolderTree className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">EXPLORER</h1>
                            <p className="text-slate-600">Code Explorer and Navigation Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <Activity className="mr-1 h-3 w-3" />
                            Live Exploration
                        </Badge>
                        <Badge variant="outline">v4.2.1</Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
                            <Folder className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
                            <p className="text-xs text-slate-500">+12% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Files</CardTitle>
                            <File className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalFiles.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Across all projects</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Code Files</CardTitle>
                            <Code className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.codeFiles.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">{Math.round((stats.codeFiles / stats.totalFiles) * 100)}% of total files</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Documentation</CardTitle>
                            <FileText className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.documentation}</div>
                            <p className="text-xs text-slate-500">Docs and guides</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Search Queries</CardTitle>
                            <Search className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.searchQueries}</div>
                            <p className="text-xs text-slate-500">This week</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Exploration Time</CardTitle>
                            <Activity className="h-4 w-4 text-rose-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.explorationTime}</div>
                            <p className="text-xs text-slate-500">Today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Explorations */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-blue-600" />
                                Recent Explorations
                            </CardTitle>
                            <CardDescription>Recently visited projects and files</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentExplorations.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                            {item.type === 'project' ? <Folder className="h-4 w-4" /> :
                                                item.type === 'service' ? <Code className="h-4 w-4" /> :
                                                    item.type === 'component' ? <GitBranch className="h-4 w-4" /> :
                                                        <FileText className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.files} files • {item.lastVisited}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Popular Paths */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                Popular Paths
                            </CardTitle>
                            <CardDescription>Most visited directories and files</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {popularPaths.map((path, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-sm font-mono">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm text-slate-900">{path.path}</p>
                                            <p className="text-xs text-slate-500">{path.visits} visits</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        {path.trend}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
                        <Search className="mr-2 h-4 w-4" />
                        Start Exploring
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Filter className="mr-2 h-4 w-4" />
                        Advanced Search
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate Code
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Zap className="mr-2 h-4 w-4" />
                        Quick Actions
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>EXPLORER - Code Explorer and Navigation Platform</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                                <Target className="mr-1 h-3 w-3" />
                                Exploration Ready
                            </Badge>
                            <p>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

