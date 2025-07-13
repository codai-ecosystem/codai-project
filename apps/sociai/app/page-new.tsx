'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    Sparkles,
    TrendingUp,
    Users,
    Search,
    Bell,
    Settings,
    User,
    Hash,
    Camera,
    Smile,
    MapPin,
    CheckCircle,
    MoreVertical,
    Plus,
    Globe,
    Zap,
    Brain,
    Target,
    Filter,
    SortDesc,
    Eye,
    ArrowUp,
    Star,
    Flame,
    Award
} from 'lucide-react'
// Layout and services - using simple div wrapper for now

// Enhanced Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
    }
}

const containerTransition = {
    staggerChildren: 0.1,
    delayChildren: 0.2
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
    }
}

const itemTransition = {
    duration: 0.5,
    ease: "easeOut" as const
}

const floatingVariants = {
    animate: {
        y: [0, -10, 0],
    }
}

const floatingTransition = {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const
}

const sparkleVariants = {
    animate: {
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
    }
}

const sparkleTransition = {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const
}

const shimmerVariants = {
    animate: {
        x: [-100, 100],
    }
}

const shimmerTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut" as const
}

// Enhanced Mock Data
const enhancedPostsData = [
    {
        id: '1',
        author: {
            name: 'AI Explorer',
            username: 'ai_explorer',
            avatar: '/api/placeholder/48/48',
            verified: true,
            aiInfluencer: true,
            followers: 125000,
            badge: 'AI Pioneer'
        },
        content: 'Just discovered an incredible breakthrough in neural network optimization! The implications for real-time AI processing are mind-blowing. 🚀 Who else is excited about the future of AI acceleration?',
        aiGenerated: false,
        aiEnhanced: true,
        tags: ['#AIBreakthrough', '#NeuralNetworks', '#Innovation', '#TechFuture'],
        timestamps: {
            created: '2h ago',
            updated: '1h ago'
        },
        engagement: {
            likes: 2847,
            shares: 456,
            comments: 189,
            views: 15420
        },
        interactions: {
            liked: false,
            shared: false,
            bookmarked: true,
            following: true
        },
        aiInsights: {
            engagementPrediction: 0.94,
            viralPotential: 0.87,
            sentimentScore: 0.92
        },
        mediaAttachments: [],
        location: 'Silicon Valley, CA'
    },
    {
        id: '2',
        author: {
            name: 'Tech Visionary',
            username: 'tech_visionary',
            avatar: '/api/placeholder/48/48',
            verified: true,
            aiInfluencer: false,
            followers: 89000,
            badge: 'Innovation Leader'
        },
        content: 'The convergence of AI and quantum computing is creating unprecedented opportunities. Today I\'m sharing insights from our latest research collaboration with leading quantum labs. The future is quantum-enhanced AI! ⚛️',
        aiGenerated: false,
        aiEnhanced: true,
        tags: ['#QuantumAI', '#Research', '#FutureTech', '#Innovation'],
        timestamps: {
            created: '4h ago',
            updated: '3h ago'
        },
        engagement: {
            likes: 1923,
            shares: 298,
            comments: 156,
            views: 8765
        },
        interactions: {
            liked: true,
            shared: false,
            bookmarked: false,
            following: false
        },
        aiInsights: {
            engagementPrediction: 0.89,
            viralPotential: 0.76,
            sentimentScore: 0.95
        },
        mediaAttachments: [],
        location: 'Boston, MA'
    },
    {
        id: '3',
        author: {
            name: 'AI Ethics Advocate',
            username: 'ethics_ai',
            avatar: '/api/placeholder/48/48',
            verified: true,
            aiInfluencer: true,
            followers: 156000,
            badge: 'Ethics Champion'
        },
        content: 'As AI becomes more powerful, our responsibility to ensure ethical deployment grows exponentially. Today I\'m launching a new initiative for transparent AI development. Join us in shaping a responsible AI future! 🤝',
        aiGenerated: false,
        aiEnhanced: true,
        tags: ['#AIEthics', '#ResponsibleAI', '#Transparency', '#Community'],
        timestamps: {
            created: '6h ago',
            updated: '5h ago'
        },
        engagement: {
            likes: 3654,
            shares: 892,
            comments: 287,
            views: 21045
        },
        interactions: {
            liked: true,
            shared: true,
            bookmarked: true,
            following: true
        },
        aiInsights: {
            engagementPrediction: 0.96,
            viralPotential: 0.91,
            sentimentScore: 0.88
        },
        mediaAttachments: [],
        location: 'San Francisco, CA'
    }
]

const recommendationsData = [
    {
        id: '1',
        type: 'connection',
        title: 'Connect with AI Researchers',
        description: 'Discover researchers in your field of interest with 95% compatibility match',
        actionLabel: 'View Suggestions',
        confidence: 0.95,
        category: 'networking',
        priority: 'high'
    },
    {
        id: '2',
        type: 'community',
        title: 'Join AI Communities',
        description: 'Engage with communities that match your AI interests and expertise',
        actionLabel: 'Explore Communities',
        confidence: 0.88,
        category: 'engagement',
        priority: 'medium'
    },
    {
        id: '3',
        type: 'content',
        title: 'Content Optimization',
        description: 'AI suggestions to boost your post engagement and reach',
        actionLabel: 'Get Tips',
        confidence: 0.92,
        category: 'optimization',
        priority: 'high'
    },
    {
        id: '4',
        type: 'trending',
        title: 'Trending Topics',
        description: 'Jump on trending AI conversations to increase visibility',
        actionLabel: 'View Trends',
        confidence: 0.84,
        category: 'visibility',
        priority: 'medium'
    }
]

const trendingTopics = [
    { tag: '#AIRevolution', posts: 15000, growth: '+23%', category: 'Technology' },
    { tag: '#MachineLearning', posts: 13000, growth: '+18%', category: 'Research' },
    { tag: '#TechTrends', posts: 11000, growth: '+15%', category: 'Innovation' },
    { tag: '#Innovation', posts: 9000, growth: '+12%', category: 'Business' },
    { tag: '#FutureOfWork', posts: 7000, growth: '+8%', category: 'Society' },
    { tag: '#AIEthics', posts: 5500, growth: '+25%', category: 'Ethics' },
    { tag: '#DeepLearning', posts: 4800, growth: '+20%', category: 'Technology' }
]

const communityStats = {
    activeUsers: 2500000,
    aiEnhancedPosts: 1200000,
    satisfactionRate: 95,
    dailyActiveUsers: 850000,
    postsToday: 45000,
    communitiesActive: 12000
}

export default function SociAIFeed() {
    const [posts] = useState(enhancedPostsData)
    const [newPost, setNewPost] = useState('')
    const [showAIHelper, setShowAIHelper] = useState(false)
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [liveStats, setLiveStats] = useState(communityStats)

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveStats(prev => ({
                ...prev,
                dailyActiveUsers: prev.dailyActiveUsers + Math.floor(Math.random() * 100),
                postsToday: prev.postsToday + Math.floor(Math.random() * 50)
            }))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const handleCreatePost = () => {
        if (newPost.trim()) {
            setNewPost('')
            setShowAIHelper(false)
        }
    }

    const handleAIAssist = () => {
        if (newPost.trim()) {
            const enhanced = `${newPost} 🚀 #AIEnhanced #Innovation #TechTrends`
            setNewPost(enhanced)
            setShowAIHelper(false)
        }
    }

    const handleLike = (postId: string) => {
        console.log('Liked post:', postId)
    }

    const handleComment = (postId: string) => {
        console.log('Comment on post:', postId)
    }

    const handleShare = (postId: string) => {
        console.log('Share post:', postId)
    }

    const handleBookmark = (postId: string) => {
        console.log('Bookmark post:', postId)
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k'
        }
        return num.toString()
    }

    return (
        <div className="min-h-screen">{/* SociAI Layout Container */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">

                {/* Enhanced Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl"
                        variants={floatingVariants}
                        animate="animate"
                        transition={floatingTransition}
                    />
                    <motion.div
                        className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl"
                        variants={floatingVariants}
                        animate="animate"
                        transition={{ ...floatingTransition, delay: 1 }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl"
                        variants={floatingVariants}
                        animate="animate"
                        transition={{ ...floatingTransition, delay: 2 }}
                    />
                </div>

                {/* Enhanced Navigation */}
                <motion.nav
                    className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex items-center justify-between h-16">

                            {/* Enhanced Logo */}
                            <motion.div
                                className="flex items-center space-x-3"
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                                    variants={sparkleVariants}
                                    animate="animate"
                                    transition={sparkleTransition}
                                >
                                    <Brain className="w-6 h-6 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        SociAI
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Social Platform</p>
                                </div>
                            </motion.div>

                            {/* Enhanced Search */}
                            <div className="flex-1 max-w-xl mx-8">
                                <motion.div
                                    className="relative"
                                    whileFocus={{ scale: 1.02 }}
                                >
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search posts, people, topics..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                                    />
                                </motion.div>
                            </div>

                            {/* Enhanced Navigation Links */}
                            <div className="flex items-center space-x-6">
                                {[
                                    { icon: Globe, label: 'Feed', active: true },
                                    { icon: TrendingUp, label: 'Trending' },
                                    { icon: Users, label: 'Communities' },
                                    { icon: Sparkles, label: 'AI Assistant' }
                                ].map((item, index) => (
                                    <motion.button
                                        key={item.label}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${item.active
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                            }`}
                                        whileHover={{ scale: 1.05, y: -1 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </motion.button>
                                ))}

                                {/* Enhanced User Actions */}
                                <div className="flex items-center space-x-3 ml-6 border-l border-gray-200 dark:border-gray-700 pl-6">
                                    {[
                                        { icon: Bell, label: 'Notifications', badge: 3 },
                                        { icon: Settings, label: 'Settings' },
                                        { icon: User, label: 'Profile' }
                                    ].map((action, index) => (
                                        <motion.button
                                            key={action.label}
                                            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <action.icon className="w-5 h-5" />
                                            {action.badge && (
                                                <motion.span
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                                                >
                                                    {action.badge}
                                                </motion.span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.nav>

                {/* Enhanced Main Content */}
                <main className="pt-8 pb-8 min-h-screen relative z-10">
                    <motion.div
                        className="max-w-6xl mx-auto px-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={containerTransition}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Enhanced Main Feed */}
                            <div className="lg:col-span-2">

                                {/* Enhanced Create Post */}
                                <motion.div
                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={itemTransition}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                >
                                    {/* Floating decorative elements */}
                                    <motion.div
                                        className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-xl"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.6, 0.3]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    />

                                    <div className="relative z-10">
                                        <div className="flex items-start space-x-4">
                                            <motion.img
                                                className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg"
                                                src="/api/placeholder/48/48"
                                                alt="Your avatar"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            />
                                            <div className="flex-1">
                                                <motion.textarea
                                                    value={newPost}
                                                    onChange={(e) => setNewPost(e.target.value)}
                                                    placeholder="What's happening in your AI world? ✨"
                                                    className="w-full p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent resize-none transition-all duration-200"
                                                    rows={3}
                                                    whileFocus={{ scale: 1.01 }}
                                                />

                                                {/* Enhanced Post Actions */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center space-x-4">
                                                        {[
                                                            { icon: Camera, label: 'Photo', color: 'blue' },
                                                            { icon: Smile, label: 'Emoji', color: 'purple' },
                                                            { icon: Hash, label: 'Tags', color: 'green' },
                                                            { icon: MapPin, label: 'Location', color: 'red' }
                                                        ].map((action, index) => (
                                                            <motion.button
                                                                key={action.label}
                                                                className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors group"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                            >
                                                                <motion.div whileHover={{ rotate: 10 }}>
                                                                    <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                                </motion.div>
                                                                <span className="text-sm">{action.label}</span>
                                                            </motion.button>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center space-x-3">
                                                        <motion.button
                                                            onClick={() => setShowAIHelper(!showAIHelper)}
                                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 group relative overflow-hidden"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <motion.div
                                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                                                                variants={shimmerVariants}
                                                                animate="animate"
                                                            />
                                                            <motion.div
                                                                animate={{ rotate: [0, 360] }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            >
                                                                <Sparkles className="w-4 h-4 relative z-10" />
                                                            </motion.div>
                                                            <span className="text-sm font-medium relative z-10">AI Assist</span>
                                                        </motion.button>

                                                        <motion.button
                                                            onClick={handleCreatePost}
                                                            disabled={!newPost.trim()}
                                                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                                            whileHover={{ scale: 1.05, y: -1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Post
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Enhanced AI Helper */}
                                                <AnimatePresence>
                                                    {showAIHelper && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, y: -20 }}
                                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                            exit={{ opacity: 0, height: 0, y: -20 }}
                                                            transition={{ type: "spring", stiffness: 200, damping: 30 }}
                                                            className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 backdrop-blur-sm"
                                                        >
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.1, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                >
                                                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                                                </motion.div>
                                                                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Writing Assistant</span>
                                                                <motion.span
                                                                    className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 text-xs rounded-full"
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    Beta
                                                                </motion.span>
                                                            </div>
                                                            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3 leading-relaxed">
                                                                I can help enhance your post with engaging content, trending hashtags, optimal formatting, and sentiment analysis for maximum reach and engagement.
                                                            </p>
                                                            <div className="flex items-center space-x-3">
                                                                <motion.button
                                                                    onClick={handleAIAssist}
                                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors shadow-lg"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    Enhance Post
                                                                </motion.button>
                                                                <motion.button
                                                                    onClick={() => setShowAIHelper(false)}
                                                                    className="px-4 py-2 text-purple-600 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    Cancel
                                                                </motion.button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Enhanced Posts Feed */}
                                <div className="space-y-6">
                                    {posts.map((post, index) => (
                                        <motion.article
                                            key={post.id}
                                            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ ...itemTransition, delay: index * 0.1 }}
                                            whileHover={{ scale: 1.005, y: -3 }}
                                        >
                                            {/* Enhanced Post Header */}
                                            <div className="flex items-start justify-between mb-4 relative z-10">
                                                <div className="flex items-center space-x-3">
                                                    <motion.img
                                                        className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-lg"
                                                        src={post.author.avatar}
                                                        alt={post.author.name}
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                                                            {post.author.name}
                                                        </h3>
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">@{post.author.username}</p>
                                                            {post.author.verified && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <motion.span
                                                        className="text-sm text-gray-500 dark:text-gray-400"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        {post.timestamps.created}
                                                    </motion.span>
                                                    <motion.button
                                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Enhanced Post Content */}
                                            <div className="mb-4 relative z-10">
                                                <motion.p
                                                    className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    {post.content}
                                                </motion.p>

                                                {post.tags.length > 0 && (
                                                    <motion.div
                                                        className="flex flex-wrap gap-2 mb-3"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.5 }}
                                                    >
                                                        {post.tags.map((tag, idx) => (
                                                            <motion.span
                                                                key={tag}
                                                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                                                                whileHover={{ scale: 1.05 }}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 0.5 + idx * 0.1 }}
                                                            >
                                                                {tag}
                                                            </motion.span>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {/* AI Insights Badge */}
                                                {post.aiInsights && (
                                                    <motion.div
                                                        className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-800 mb-3"
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.6 }}
                                                    >
                                                        <motion.div
                                                            animate={{ rotate: [0, 360] }}
                                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                        </motion.div>
                                                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Enhanced</span>
                                                        <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full">
                                                            Score: {Math.round(post.aiInsights.engagementPrediction * 100)}%
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Enhanced Post Actions */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50 relative z-10">
                                                <div className="flex items-center space-x-6">
                                                    {[
                                                        {
                                                            icon: Heart,
                                                            count: post.engagement.likes,
                                                            action: () => handleLike(post.id),
                                                            color: 'red',
                                                            label: 'Like'
                                                        },
                                                        {
                                                            icon: MessageCircle,
                                                            count: post.engagement.comments,
                                                            action: () => handleComment(post.id),
                                                            color: 'blue',
                                                            label: 'Comment'
                                                        },
                                                        {
                                                            icon: Share2,
                                                            count: post.engagement.shares,
                                                            action: () => handleShare(post.id),
                                                            color: 'green',
                                                            label: 'Share'
                                                        }
                                                    ].map((action, idx) => (
                                                        <motion.button
                                                            key={action.label}
                                                            onClick={action.action}
                                                            aria-label={action.label}
                                                            className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.7 + idx * 0.1 }}
                                                        >
                                                            <motion.div
                                                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                            </motion.div>
                                                            <span className="text-sm font-medium">{action.count}</span>
                                                        </motion.button>
                                                    ))}
                                                </div>

                                                <motion.button
                                                    onClick={() => handleBookmark(post.id)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 1 }}
                                                >
                                                    <Bookmark className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </motion.article>
                                    ))}
                                </div>
                            </div>

                            {/* Enhanced AI-Powered Sidebar */}
                            <div className="space-y-6">

                                {/* AI Recommendations */}
                                <motion.div
                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <div className="flex items-center space-x-2 mb-4">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </motion.div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h2>
                                        <motion.span
                                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full font-medium"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            Personalized
                                        </motion.span>
                                    </div>

                                    <div className="space-y-4">
                                        {recommendationsData.slice(0, 3).map((rec, index) => (
                                            <motion.div
                                                key={rec.id}
                                                className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 cursor-pointer group"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                                                        {rec.title}
                                                    </h3>
                                                    <motion.span
                                                        className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full font-medium"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.7 + index * 0.1 }}
                                                    >
                                                        {Math.round(rec.confidence * 100)}%
                                                    </motion.span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                                                    {rec.description}
                                                </p>
                                                <motion.button
                                                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {rec.actionLabel} →
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Enhanced Trending Topics */}
                                <motion.div
                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <div className="flex items-center space-x-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Now</h2>
                                        <motion.div
                                            className="w-2 h-2 bg-red-500 rounded-full"
                                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        {trendingTopics.slice(0, 5).map((topic, index) => (
                                            <motion.div
                                                key={topic.tag}
                                                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 cursor-pointer group"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 + index * 0.05 }}
                                                whileHover={{ scale: 1.02, x: 2 }}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                                        {topic.tag}
                                                    </span>
                                                    <motion.span
                                                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.8 + index * 0.05 }}
                                                    >
                                                        {topic.growth}
                                                    </motion.span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                                    <span>{topic.posts.toLocaleString()} posts</span>
                                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                        {topic.category}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Enhanced Community Stats */}
                                <motion.div
                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Community Pulse</h2>
                                        <motion.div
                                            className="w-2 h-2 bg-green-500 rounded-full"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <motion.div
                                                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.7 }}
                                            >
                                                {formatNumber(liveStats.activeUsers)}
                                            </motion.div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
                                        </div>
                                        <div className="text-center">
                                            <motion.div
                                                className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.8 }}
                                            >
                                                {formatNumber(liveStats.aiEnhancedPosts)}
                                            </motion.div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">AI-Enhanced Posts</div>
                                        </div>
                                        <div className="text-center">
                                            <motion.div
                                                className="text-2xl font-bold text-green-600 dark:text-green-400"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.9 }}
                                            >
                                                {liveStats.satisfactionRate}%
                                            </motion.div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Satisfaction Rate</div>
                                        </div>
                                        <div className="text-center">
                                            <motion.div
                                                className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.0 }}
                                            >
                                                {formatNumber(liveStats.postsToday)}
                                            </motion.div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Posts Today</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
