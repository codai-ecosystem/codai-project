'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    // Community Icons
    Users,
    MessageSquare,
    Heart,
    Share2,
    Bookmark,
    Search,

    // User Icons
    Crown,
    Shield,
    Star,
    Award,

    // Content Icons
    Clock,
    TrendingUp,
    ThumbsUp,
    MessageCircle,

    // Navigation Icons
    ChevronDown,
    Plus,
    MoreHorizontal
} from 'lucide-react'

interface CommunityPost {
    id: string
    title: string
    content: string
    author: {
        name: string
        avatar: string
        role: 'user' | 'moderator' | 'admin'
        reputation: number
    }
    category: string
    tags: string[]
    stats: {
        views: number
        likes: number
        replies: number
        bookmarks: number
    }
    createdAt: Date
    isResolved?: boolean
    isPinned?: boolean
    isTrending?: boolean
}

interface Category {
    id: string
    name: string
    description: string
    postCount: number
    color: string
    icon: any
}

export default function CommunityPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('recent')

    const categories: Category[] = [
        {
            id: 'all',
            name: 'All Posts',
            description: 'View all community discussions',
            postCount: 1247,
            color: 'gray',
            icon: MessageSquare
        },
        {
            id: 'general',
            name: 'General Discussion',
            description: 'General platform discussions and questions',
            postCount: 523,
            color: 'blue',
            icon: Users
        },
        {
            id: 'feature-requests',
            name: 'Feature Requests',
            description: 'Suggest new features and improvements',
            postCount: 189,
            color: 'green',
            icon: TrendingUp
        },
        {
            id: 'help',
            name: 'Help & Support',
            description: 'Get help with technical issues',
            postCount: 267,
            color: 'yellow',
            icon: Shield
        },
        {
            id: 'announcements',
            name: 'Announcements',
            description: 'Official platform updates and news',
            postCount: 45,
            color: 'purple',
            icon: Crown
        },
        {
            id: 'feedback',
            name: 'Feedback',
            description: 'Share feedback about your experience',
            postCount: 156,
            color: 'pink',
            icon: Heart
        },
        {
            id: 'showcase',
            name: 'Showcase',
            description: 'Show off your projects and achievements',
            postCount: 67,
            color: 'indigo',
            icon: Award
        }
    ]

    const posts: CommunityPost[] = [
        {
            id: '1',
            title: 'How to optimize ticket response times in large organizations?',
            content: 'We\'re seeing increased ticket volumes and need strategies to maintain our SLA. What approaches have worked for your teams?',
            author: {
                name: 'Sarah Chen',
                avatar: 'SC',
                role: 'user',
                reputation: 1247
            },
            category: 'help',
            tags: ['performance', 'sla', 'optimization'],
            stats: {
                views: 342,
                likes: 23,
                replies: 15,
                bookmarks: 8
            },
            createdAt: new Date('2024-01-15T10:30:00'),
            isResolved: false,
            isPinned: false,
            isTrending: true
        },
        {
            id: '2',
            title: 'New AI-powered auto-categorization feature is live!',
            content: 'Excited to announce our latest feature that automatically categorizes support tickets using machine learning. This should reduce manual work by 60%.',
            author: {
                name: 'AjutAI Team',
                avatar: 'AT',
                role: 'admin',
                reputation: 5000
            },
            category: 'announcements',
            tags: ['ai', 'automation', 'features'],
            stats: {
                views: 1205,
                likes: 156,
                replies: 34,
                bookmarks: 89
            },
            createdAt: new Date('2024-01-14T15:45:00'),
            isResolved: false,
            isPinned: true,
            isTrending: true
        },
        {
            id: '3',
            title: 'Feature Request: Advanced reporting dashboard',
            content: 'Would love to see more detailed analytics and custom report builders. Current reporting is good but could be more flexible for enterprise needs.',
            author: {
                name: 'Mike Rodriguez',
                avatar: 'MR',
                role: 'user',
                reputation: 892
            },
            category: 'feature-requests',
            tags: ['reporting', 'analytics', 'enterprise'],
            stats: {
                views: 178,
                likes: 45,
                replies: 12,
                bookmarks: 23
            },
            createdAt: new Date('2024-01-13T09:15:00'),
            isResolved: false,
            isPinned: false,
            isTrending: false
        },
        {
            id: '4',
            title: 'Showcase: Our customer satisfaction went from 3.2 to 4.8!',
            content: 'After implementing AjutAI for 6 months, we\'ve seen incredible improvements. Here\'s our journey and what made the difference...',
            author: {
                name: 'Jennifer Liu',
                avatar: 'JL',
                role: 'user',
                reputation: 567
            },
            category: 'showcase',
            tags: ['success-story', 'customer-satisfaction', 'results'],
            stats: {
                views: 689,
                likes: 78,
                replies: 19,
                bookmarks: 45
            },
            createdAt: new Date('2024-01-12T14:20:00'),
            isResolved: false,
            isPinned: false,
            isTrending: true
        },
        {
            id: '5',
            title: 'Integration with Slack - webhook configuration help needed',
            content: 'Having trouble setting up the Slack integration. The webhooks seem to timeout. Has anyone encountered this issue?',
            author: {
                name: 'David Park',
                avatar: 'DP',
                role: 'user',
                reputation: 234
            },
            category: 'help',
            tags: ['slack', 'integration', 'webhooks'],
            stats: {
                views: 123,
                likes: 12,
                replies: 8,
                bookmarks: 5
            },
            createdAt: new Date('2024-01-11T11:30:00'),
            isResolved: true,
            isPinned: false,
            isTrending: false
        }
    ]

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return b.createdAt.getTime() - a.createdAt.getTime()
            case 'popular':
                return b.stats.likes - a.stats.likes
            case 'trending':
                return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)
            case 'replies':
                return b.stats.replies - a.stats.replies
            default:
                return 0
        }
    })

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-600 bg-red-100'
            case 'moderator': return 'text-purple-600 bg-purple-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const formatTimeAgo = (date: Date) => {
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours}h ago`
        if (diffInHours < 48) return '1 day ago'
        return `${Math.floor(diffInHours / 24)} days ago`
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
                            <p className="text-gray-600 mt-2">Connect, share, and learn with the AjutAI community</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>New Post</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search posts, tags, or content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                            </div>

                            {/* Sort Filter */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="trending">Trending</option>
                                    <option value="replies">Most Replies</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
                            <div className="space-y-2">
                                {categories.map((category) => {
                                    const IconComponent = category.icon
                                    const isActive = selectedCategory === category.id

                                    return (
                                        <motion.button
                                            key={category.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${isActive
                                                    ? `bg-${category.color}-100 text-${category.color}-700 border-${category.color}-200`
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <IconComponent className="h-5 w-5" />
                                                <div>
                                                    <div className="font-medium">{category.name}</div>
                                                    <div className="text-xs text-gray-500">{category.postCount} posts</div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Posts Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="space-y-4">
                            <AnimatePresence>
                                {sortedPosts.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200"
                                    >
                                        {/* Post Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">{post.author.avatar}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900">{post.author.name}</span>
                                                        <span className={`px-2 py-1 text-xs rounded ${getRoleColor(post.author.role)}`}>
                                                            {post.author.role}
                                                        </span>
                                                        {post.author.reputation > 1000 && (
                                                            <Star className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{formatTimeAgo(post.createdAt)}</span>
                                                        <span>•</span>
                                                        <span>{post.stats.views} views</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {post.isPinned && (
                                                    <div className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                                        Pinned
                                                    </div>
                                                )}
                                                {post.isTrending && (
                                                    <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                        Trending
                                                    </div>
                                                )}
                                                {post.isResolved && (
                                                    <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                        Resolved
                                                    </div>
                                                )}
                                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                                            <p className="text-gray-600">{post.content}</p>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 cursor-pointer"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Post Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center space-x-6">
                                                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    <span className="text-sm">{post.stats.likes}</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-sm">{post.stats.replies}</span>
                                                </button>
                                                <button className="flex items-center space-x-2 text-gray-500 hover:text-yellow-600 transition-colors">
                                                    <Bookmark className="h-4 w-4" />
                                                    <span className="text-sm">{post.stats.bookmarks}</span>
                                                </button>
                                            </div>
                                            <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                                                <Share2 className="h-4 w-4" />
                                                <span className="text-sm">Share</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {sortedPosts.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                                    <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
