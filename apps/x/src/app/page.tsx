'use client'

import React from 'react'
import { redirect } from 'next/navigation'

export default function XPage() {
  // Redirect to dashboard as the main landing page
  redirect('/dashboard')
}
  Play,
  Image,
  Video,
  Mic,
  Camera,
  MapPin,
  Link,
  Smile,
  Filter,
  Zap,
  Fire,
  Crown,
  Diamond,
  Target,
  Award,
  Sparkles,
  Headphones,
  Rss,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react'

// TypeScript Interfaces
interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  verified: boolean
  followers: number
  following: number
  bio: string
}

interface Post {
  id: string
  user: User
  content: string
  media?: {
    type: 'image' | 'video' | 'gif'
    url: string
    alt: string
  }[]
  timestamp: string
  likes: number
  comments: number
  reposts: number
  views: number
  liked: boolean
  reposted: boolean
  bookmarked: boolean
  engagement: number
}

interface TrendingTopic {
  id: string
  hashtag: string
  posts: number
  category: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

interface DashboardMetrics {
  totalPosts: number
  totalUsers: number
  activeUsers: number
  engagement: number
  dailyPosts: number
  dailyGrowth: number
  trendsCount: number
  messagesCount: number
}

const XDashboardPage = () => {
  const [isOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState<'feed' | 'trending' | 'following'>('feed')
  const [showComposer, setShowComposer] = useState(false)
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const [metrics] = useState<DashboardMetrics>({
    totalPosts: 2847592,
    totalUsers: 89432,
    activeUsers: 12847,
    engagement: 87.3,
    dailyPosts: 4892,
    dailyGrowth: 12.5,
    trendsCount: 156,
    messagesCount: 892
  })

  const [currentUser] = useState<User>({
    id: '1',
    username: 'alexcoder',
    displayName: 'Alex Johnson',
    avatar: 'AJ',
    verified: true,
    followers: 12450,
    following: 847,
    bio: 'Full-stack developer | AI enthusiast | Building the future'
  })

  const [posts] = useState<Post[]>([
    {
      id: '1',
      user: {
        id: '2',
        username: 'techguru',
        displayName: 'Sarah Tech',
        avatar: 'ST',
        verified: true,
        followers: 45680,
        following: 1250,
        bio: 'Tech innovator and startup founder'
      },
      content: 'Just shipped a major update to our AI platform! The new features are incredible. Machine learning has never been more accessible. 🚀 #AI #TechNews #Innovation',
      media: [
        {
          type: 'image',
          url: '/api/placeholder/600/400',
          alt: 'AI Platform Dashboard'
        }
      ],
      timestamp: '2025-08-07T14:30:00Z',
      likes: 2847,
      comments: 124,
      reposts: 456,
      views: 15680,
      liked: false,
      reposted: false,
      bookmarked: true,
      engagement: 89.4
    },
    {
      id: '2',
      user: {
        id: '3',
        username: 'designpro',
        displayName: 'Mike Design',
        avatar: 'MD',
        verified: false,
        followers: 8920,
        following: 567,
        bio: 'UI/UX Designer creating beautiful experiences'
      },
      content: 'The future of design is here! AI-powered tools are revolutionizing how we create user interfaces. What are your thoughts on AI in design? 🎨',
      timestamp: '2025-08-07T13:45:00Z',
      likes: 1234,
      comments: 89,
      reposts: 156,
      views: 8920,
      liked: true,
      reposted: false,
      bookmarked: false,
      engagement: 76.8
    },
    {
      id: '3',
      user: {
        id: '4',
        username: 'startupceo',
        displayName: 'Emma Startup',
        avatar: 'ES',
        verified: true,
        followers: 67890,
        following: 2340,
        bio: 'CEO & Founder | Building tomorrow\'s solutions'
      },
      content: 'Excited to announce our Series A funding round! 🎉 Thank you to all our investors and supporters. This is just the beginning of our journey.',
      timestamp: '2025-08-07T12:20:00Z',
      likes: 5678,
      comments: 234,
      reposts: 892,
      views: 23450,
      liked: false,
      reposted: true,
      bookmarked: true,
      engagement: 94.2
    },
    {
      id: '4',
      user: {
        id: '5',
        username: 'airesearcher',
        displayName: 'Dr. Kevin AI',
        avatar: 'KA',
        verified: true,
        followers: 34560,
        following: 890,
        bio: 'AI Researcher | PhD in Machine Learning'
      },
      content: 'New paper published on quantum-enhanced machine learning! The possibilities are endless when we combine quantum computing with AI. Research link in bio.',
      timestamp: '2025-08-07T11:15:00Z',
      likes: 3456,
      comments: 167,
      reposts: 234,
      views: 12890,
      liked: true,
      reposted: false,
      bookmarked: true,
      engagement: 82.7
    }
  ])

  const [trendingTopics] = useState<TrendingTopic[]>([
    { id: '1', hashtag: 'AI', posts: 45690, category: 'Technology', trend: 'up', changePercent: 25.4 },
    { id: '2', hashtag: 'WebDev', posts: 23450, category: 'Programming', trend: 'up', changePercent: 18.7 },
    { id: '3', hashtag: 'Startup', posts: 18920, category: 'Business', trend: 'up', changePercent: 12.3 },
    { id: '4', hashtag: 'Design', posts: 15680, category: 'Creative', trend: 'stable', changePercent: 2.1 },
    { id: '5', hashtag: 'Tech', posts: 34560, category: 'Technology', trend: 'up', changePercent: 8.9 },
    { id: '6', hashtag: 'Innovation', posts: 12340, category: 'General', trend: 'down', changePercent: -3.2 }
  ])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
      default: return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const handleLike = (postId: string) => {
    // Like functionality
    console.log('Liked post:', postId)
  }

  const handleRepost = (postId: string) => {
    // Repost functionality
    console.log('Reposted:', postId)
  }

  const handleBookmark = (postId: string) => {
    // Bookmark functionality
    console.log('Bookmarked:', postId)
  }

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // Submit post logic
      console.log('New post:', newPost)
      setNewPost('')
      setShowComposer(false)
    }
  }

  const PostCard = ({ post }: { post: Post }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
          {post.user.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-white">{post.user.displayName}</h4>
            {post.user.verified && <Star className="w-4 h-4 text-blue-400 fill-current" />}
            <span className="text-slate-400">@{post.user.username}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{formatTimeAgo(post.timestamp)}</span>
            <div className="ml-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </motion.button>
            </div>
          </div>
          
          <p className="text-white mb-4 leading-relaxed">{post.content}</p>
          
          {post.media && post.media.length > 0 && (
            <div className="mb-4">
              {post.media.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                    <Image className="w-12 h-12 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                post.liked ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:bg-red-400/10 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{formatNumber(post.likes)}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-400 hover:bg-blue-400/10 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{formatNumber(post.comments)}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRepost(post.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                post.reposted ? 'text-green-400 bg-green-400/10' : 'text-slate-400 hover:bg-green-400/10 hover:text-green-400'
              }`}
            >
              <Repeat2 className="w-4 h-4" />
              <span className="text-sm">{formatNumber(post.reposts)}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleBookmark(post.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                post.bookmarked ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 hover:bg-yellow-400/10 hover:text-yellow-400'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-400 hover:bg-purple-400/10 hover:text-purple-400 transition-colors"
            >
              <Share className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-pink-900">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <XIcon className="w-8 h-8 text-slate-400" />
                X Platform
              </h1>
              <p className="text-slate-300 mt-1">Connect, share, and discover amazing content</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalPosts)}</p>
                  <p className="text-slate-300">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{formatNumber(metrics.activeUsers)}</p>
                  <p className="text-slate-300">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{metrics.engagement}%</p>
                  <p className="text-slate-300">Engagement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{metrics.trendsCount}</p>
                  <p className="text-slate-300">Trends</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  <span className="text-sm text-green-300">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text animate-gradient-x">
                X Trading
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              AI Trading Platform
            </p>
            <div className="flex items-center justify-center space-x-2 text-red-400">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Running on port 4039</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-slate-400">Live data streaming and real-time updates across all components.</p>
            </div>

            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M10 12h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern UI</h3>
              <p className="text-slate-400">Beautiful animations, glass morphism, and responsive design.</p>
            </div>

            <div className="glass-card p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tested & Reliable</h3>
              <p className="text-slate-400">Comprehensive Playwright testing for all user flows.</p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 glass-card">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-3"></div>
              <span className="text-red-400 font-medium">System Operational • Live Data Streaming</span>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-red-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">&lt;100ms</div>
              <div className="text-sm text-slate-400">Response</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-slate-400">Available</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">AI</div>
              <div className="text-sm text-slate-400">Powered</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
