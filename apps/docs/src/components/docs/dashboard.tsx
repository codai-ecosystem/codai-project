'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    BookOpen,
    FileText,
    Search,
    Edit3,
    Archive,
    Users,
    Star,
    Calendar,
    TrendingUp,
    Database,
    Settings,
    Plus,
    Filter
} from 'lucide-react'

interface DocStats {
    totalDocs: number
    totalViews: number
    recentUpdates: number
    pendingReviews: number
    searchQueries: number
    contributors: number
}

interface Document {
    id: string
    title: string
    category: string
    lastUpdated: string
    author: string
    views: number
    status: 'published' | 'draft' | 'review'
}

export function DocsDashboard() {
    const [stats, setStats] = useState<DocStats>({
        totalDocs: 342,
        totalViews: 12456,
        recentUpdates: 8,
        pendingReviews: 3,
        searchQueries: 189,
        contributors: 12
    })

    const [recentDocs] = useState<Document[]>([
        {
            id: '1',
            title: 'API Documentation Guidelines',
            category: 'Development',
            lastUpdated: '2 hours ago',
            author: 'John Doe',
            views: 234,
            status: 'published'
        },
        {
            id: '2',
            title: 'User Onboarding Process',
            category: 'Product',
            lastUpdated: '4 hours ago',
            author: 'Jane Smith',
            views: 156,
            status: 'review'
        },
        {
            id: '3',
            title: 'Security Best Practices',
            category: 'Security',
            lastUpdated: '1 day ago',
            author: 'Mike Johnson',
            views: 89,
            status: 'published'
        },
        {
            id: '4',
            title: 'Design System Components',
            category: 'Design',
            lastUpdated: '2 days ago',
            author: 'Sarah Wilson',
            views: 312,
            status: 'draft'
        }
    ])

    const [searchTerm, setSearchTerm] = useState('')

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                totalViews: prev.totalViews + Math.floor(Math.random() * 3),
                searchQueries: prev.searchQueries + Math.floor(Math.random() * 2)
            }))
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800 border-green-200'
            case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            DOCS Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Documentation and Knowledge Management Hub</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                Total Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.totalDocs.toLocaleString()}</div>
                            <p className="text-xs text-gray-500 mt-1">+12 this week</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                Total Views
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalViews.toLocaleString()}</div>
                            <p className="text-xs text-gray-500 mt-1">+8.2% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                <Edit3 className="w-4 h-4 mr-2 text-orange-500" />
                                Recent Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.recentUpdates}</div>
                            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                <Archive className="w-4 h-4 mr-2 text-purple-500" />
                                Pending Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.pendingReviews}</div>
                            <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                <Search className="w-4 h-4 mr-2 text-indigo-500" />
                                Search Queries
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">{stats.searchQueries}</div>
                            <p className="text-xs text-gray-500 mt-1">Today</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-pink-500" />
                                Contributors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-600">{stats.contributors}</div>
                            <p className="text-xs text-gray-500 mt-1">Active this month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Document
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                Start writing a new documentation page
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                New Document
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <Search className="w-5 h-5 mr-2" />
                                Search Knowledge Base
                            </CardTitle>
                            <CardDescription className="text-green-100">
                                Find information across all documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Input
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    className="bg-white text-gray-900 border-0"
                                />
                                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <Archive className="w-5 h-5 mr-2" />
                                Review Queue
                            </CardTitle>
                            <CardDescription className="text-purple-100">
                                Review pending documentation changes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-white text-purple-600 hover:bg-purple-50">
                                Review Documents ({stats.pendingReviews})
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Documents */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                    Recent Documents
                                </CardTitle>
                                <CardDescription>Latest updates to your documentation</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDocs.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                            <Badge className={getStatusColor(doc.status)}>
                                                {doc.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Database className="w-4 h-4 mr-1" />
                                                {doc.category}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {doc.lastUpdated}
                                            </span>
                                            <span className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                {doc.author}
                                            </span>
                                            <span className="flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                {doc.views} views
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button size="sm" variant="outline">
                                            <Edit3 className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                            <Star className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Documentation Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center pb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">API Documentation</CardTitle>
                            <CardDescription>Technical API references and guides</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">89</div>
                            <p className="text-sm text-gray-500">Documents</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center pb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg">User Guides</CardTitle>
                            <CardDescription>End-user documentation and tutorials</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">124</div>
                            <p className="text-sm text-gray-500">Documents</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center pb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Settings className="w-6 h-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-lg">Internal Processes</CardTitle>
                            <CardDescription>Company procedures and workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-2">67</div>
                            <p className="text-sm text-gray-500">Documents</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="text-center pb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Archive className="w-6 h-6 text-orange-600" />
                            </div>
                            <CardTitle className="text-lg">Knowledge Base</CardTitle>
                            <CardDescription>FAQs and troubleshooting guides</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-2">62</div>
                            <p className="text-sm text-gray-500">Documents</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

