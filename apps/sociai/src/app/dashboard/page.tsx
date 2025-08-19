'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  Eye,
  Users,
  TrendingUp,
  Camera,
  Smile,
  Hash,
  Plus,
  Search,
  Filter,
  Bell,
  Settings,
  Home,
  User,
  MessageSquare,
  BarChart3,
  Edit3,
  Zap,
  Clock,
  Award,
  Star,
  Activity,
  Globe,
  Target,
  Play,
  RefreshCw,
  Headphones,
  Video,
  Image,
  Calendar,
  Rss
} from 'lucide-react'

// Enhanced dashboard interfaces
interface SocialMetrics {
  totalPosts: number
  totalFollowers: number
  totalEngagement: number
  aiAssistUsage: number
  weeklyGrowth: number
  monthlyReach: number
}

interface TrendingTopic {
  id: string
  hashtag: string
  posts: number
  growth: number
  category: string
}

interface AIInsight {
  id: string
  type: 'engagement' | 'timing' | 'content' | 'audience'
  title: string
  description: string
  actionLabel: string
  confidence: number
}

interface SocialPost {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  media?: string[]
  tags: string[]
  engagement: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  interactions: {
    liked: boolean
    commented: boolean
    shared: boolean
    bookmarked: boolean
  }
  aiGenerated: boolean
  createdAt: string
  boosted?: boolean
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: () => void
}

export default function SociAIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    setIsLoading(true)

    // Simulate API calls with realistic data
    setTimeout(() => {
      setMetrics({
        totalPosts: 1247,
        totalFollowers: 15600,
        totalEngagement: 89200,
        aiAssistUsage: 73,
        weeklyGrowth: 12.5,
        monthlyReach: 245000
      })

      setTrendingTopics([
        { id: '1', hashtag: '#AIRevolution', posts: 15600, growth: 23.5, category: 'Technology' },
        { id: '2', hashtag: '#SocialMedia', posts: 12300, growth: 18.2, category: 'Digital' },
        { id: '3', hashtag: '#Innovation', posts: 9800, growth: 15.7, category: 'Business' },
        { id: '4', hashtag: '#MachineLearning', posts: 8900, growth: 22.1, category: 'AI' },
        { id: '5', hashtag: '#TechTrends', posts: 7500, growth: 19.8, category: 'Technology' },
        { id: '6', hashtag: '#FutureOfWork', posts: 6200, growth: 16.3, category: 'Career' }
      ])

      setAiInsights([
        {
          id: '1',
          type: 'engagement',
          title: 'Optimal Posting Time',
          description: 'Your audience is most active between 2-4 PM. Consider scheduling posts during this window.',
          actionLabel: 'Schedule Post',
          confidence: 0.89
        },
        {
          id: '2',
          type: 'content',
          title: 'Content Performance',
          description: 'Videos get 340% more engagement than text posts in your network.',
          actionLabel: 'Create Video',
          confidence: 0.92
        },
        {
          id: '3',
          type: 'audience',
          title: 'Audience Growth',
          description: 'AI-enhanced posts are driving 25% more follower growth this week.',
          actionLabel: 'Use AI Assistant',
          confidence: 0.86
        }
      ])

      setPosts([
        {
          id: '1',
          author: {
            name: 'Alex Chen',
            username: 'alexchen',
            avatar: '/api/placeholder/40/40',
            verified: true
          },
          content: 'Just launched our new AI-powered social analytics dashboard! The insights are incredible - seeing 40% better engagement patterns already. Who else is leveraging AI for social media optimization? 🚀',
          media: ['/api/placeholder/400/300'],
          tags: ['AIAnalytics', 'SocialMedia', 'Innovation'],
          engagement: { likes: 342, comments: 89, shares: 156, views: 2847 },
          interactions: { liked: false, commented: false, shared: false, bookmarked: true },
          aiGenerated: false,
          createdAt: '2025-08-07T08:30:00Z',
          boosted: true
        },
        {
          id: '2',
          author: {
            name: 'Sarah Williams',
            username: 'sarahw_tech',
            avatar: '/api/placeholder/40/40',
            verified: false
          },
          content: 'The future of content creation is here! AI is helping me generate more engaging posts while maintaining my authentic voice. What are your thoughts on AI-assisted creativity?',
          tags: ['AICreativity', 'ContentCreation', 'TechTrends'],
          engagement: { likes: 234, comments: 67, shares: 98, views: 1923 },
          interactions: { liked: true, commented: false, shared: false, bookmarked: false },
          aiGenerated: true,
          createdAt: '2025-08-07T07:15:00Z'
        },
        {
          id: '3',
          author: {
            name: 'Tech Innovators',
            username: 'techinnovators',
            avatar: '/api/placeholder/40/40',
            verified: true
          },
          content: 'Breaking: AI-powered social platforms are seeing 500% growth in user engagement. The combination of personalization and intelligent content delivery is revolutionizing how we connect online.',
          tags: ['TechNews', 'AIGrowth', 'SocialPlatforms'],
          engagement: { likes: 1247, comments: 234, shares: 456, views: 8923 },
          interactions: { liked: false, commented: true, shared: false, bookmarked: true },
          aiGenerated: false,
          createdAt: '2025-08-07T06:45:00Z',
          boosted: true
        }
      ])

      setIsLoading(false)
    }, 1500)
  }

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Create Post',
      description: 'Share your thoughts with AI assistance',
      icon: <Edit3 className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      action: () => console.log('Create post')
    },
    {
      id: '2',
      title: 'View Profile',
      description: 'Manage your profile and settings',
      icon: <User className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      action: () => window.location.href = '/profile'
    },
    {
      id: '3',
      title: 'Messages',
      description: 'Chat with AI assistant and contacts',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      action: () => window.location.href = '/messages'
    },
    {
      id: '4',
      title: 'Schedule Posts',
      description: 'Plan your content calendar',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      action: () => console.log('Schedule posts')
    },
    {
      id: '5',
      title: 'Analytics',
      description: 'View detailed performance insights',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      action: () => window.location.href = '/analytics'
    },
    {
      id: '6',
      title: 'Content Creator',
      description: 'Create content with AI tools',
      icon: <Edit3 className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      action: () => window.location.href = '/content-creator'
    },
    {
      id: '7',
      title: 'Settings',
      description: 'Manage preferences and account',
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-500 to-slate-600',
      action: () => window.location.href = '/settings'
    },
    {
      id: '8',
      title: 'Live Stream',
      description: 'Go live with your audience',
      icon: <Video className="w-6 h-6" />,
      color: 'from-indigo-500 to-purple-500',
      action: () => console.log('Live stream')
    },
    {
      id: '9',
      title: 'Communities',
      description: 'Join topic-based groups',
      icon: <Users className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-500',
      action: () => window.location.href = '/communities'
    }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'feed', label: 'Feed', icon: <Rss className="w-4 h-4" /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Clock className="w-4 h-4" /> }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your social dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Enhanced Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SociAI Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Social Media Intelligence</p>
                </div>
              </div>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              {metrics && (
                <>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatNumber(metrics.totalPosts)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatNumber(metrics.totalFollowers)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{metrics.aiAssistUsage}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">AI Usage</div>
                  </div>
                </>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.totalEngagement)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+{metrics.weeklyGrowth}% this week</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Reach</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(metrics.monthlyReach)}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">AI Enhanced</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI Assistant Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.aiAssistUsage}%</p>
                  <p className="text-sm text-green-600 dark:text-green-400">High performance</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">+{metrics.weeklyGrowth}%</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">This week</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabbed Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-lg">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={action.action}
                        className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                          <div className="text-white">
                            {action.icon}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{action.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* AI Insights */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
                >
                  <div className="flex items-center space-x-2 mb-6">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</h2>
                  </div>
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h3>
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{insight.description}</p>
                        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                          {insight.actionLabel} →
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img
                            className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-800"
                            src={post.author.avatar}
                            alt="Author avatar"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{post.author.name}</h3>
                              {post.author.verified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                              {post.aiGenerated && (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full flex items-center space-x-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI</span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{post.author.username} • {formatTimeAgo(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-900 dark:text-white leading-relaxed">{post.content}</p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Media */}
                        {post.media && post.media.length > 0 && (
                          <div className="mt-4 rounded-xl overflow-hidden">
                            <img
                              src={post.media[0]}
                              alt="Post media"
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(post.engagement.views)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{formatNumber(post.engagement.likes)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{formatNumber(post.engagement.comments)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>{formatNumber(post.engagement.shares)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`flex items-center space-x-2 transition-colors ${post.interactions.liked
                                ? 'text-red-600'
                                : 'text-gray-500 hover:text-red-600'
                              }`}
                          >
                            <Heart className={`w-5 h-5 ${post.interactions.liked ? 'fill-current' : ''}`} />
                            <span className="text-sm">Like</span>
                          </motion.button>

                          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">Comment</span>
                          </button>

                          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm">Share</span>
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-lg transition-colors ${post.interactions.bookmarked
                              ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
                              : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                            }`}
                        >
                          <Bookmark className={`w-5 h-5 ${post.interactions.bookmarked ? 'fill-current' : ''}`} />
                        </motion.button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
                >
                  <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending Now</h2>
                  </div>
                  <div className="space-y-3">
                    {trendingTopics.slice(0, 5).map((trend, index) => (
                      <div key={trend.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{trend.hashtag}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(trend.posts)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Trending Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((trend, index) => (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400">{trend.hashtag}</h3>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                        +{trend.growth}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{formatNumber(trend.posts)} posts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{trend.category}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <BarChart3 className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-blue-100 text-sm">Deep insights into your social media performance with AI-powered recommendations.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Community Hub</h3>
              <p className="text-purple-100 text-sm">Connect with like-minded individuals and grow your social presence.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">AI Content Studio</h3>
              <p className="text-green-100 text-sm">Create engaging content with our advanced AI writing assistant.</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}
