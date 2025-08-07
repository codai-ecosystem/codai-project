'use client'

import React, { useState } from 'react'
import { 
  Users,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  Heart,
  Share2,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Brain,
  Globe,
  Video,
  FileText,
  Headphones,
  Code,
  Palette,
  Calculator,
  Microscope,
  Music,
  Camera,
  TrendingUp,
  Calendar,
  BookOpen,
  Tag,
  Info,
  ExternalLink,
  RefreshCw,
  MessageCircle,
  Send,
  Image,
  Paperclip,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  Pin,
  Flag,
  Award,
  Shield,
  Crown,
  Bookmark,
  Hash,
  Trending,
  Coffee,
  Lightbulb,
  HelpCircle,
  UserPlus,
  UserCheck,
  UserX,
  Bell,
  BellOff,
  Settings,
  Activity,
  Flame,
  Medal,
  Trophy,
  BadgeCheck,
  Users2,
  UserCircle,
  MapPin,
  Link,
  Twitter,
  Linkedin,
  Github,
  ExternalLink as External,
  Dot
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [postContent, setPostContent] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const communityStats = [
    { icon: Users, label: 'Community Members', value: '23.7K', change: '+1.2K', color: 'text-blue-600' },
    { icon: MessageCircle, label: 'Active Discussions', value: '156', change: '+24', color: 'text-green-600' },
    { icon: Trophy, label: 'Top Contributors', value: '89', change: '+12', color: 'text-purple-600' },
    { icon: Calendar, label: 'Events This Month', value: '8', change: '+3', color: 'text-yellow-600' }
  ]

  const discussionCategories = [
    { id: 'all', name: 'All Discussions', icon: Grid, count: 156, color: 'bg-gray-500' },
    { id: 'general', name: 'General', icon: MessageCircle, count: 34, color: 'bg-blue-500' },
    { id: 'help', name: 'Help & Support', icon: HelpCircle, count: 28, color: 'bg-green-500' },
    { id: 'study-groups', name: 'Study Groups', icon: Users2, count: 22, color: 'bg-purple-500' },
    { id: 'career', name: 'Career Advice', icon: Target, count: 18, color: 'bg-orange-500' },
    { id: 'projects', name: 'Project Showcase', icon: Lightbulb, count: 25, color: 'bg-pink-500' },
    { id: 'events', name: 'Events', icon: Calendar, count: 12, color: 'bg-indigo-500' },
    { id: 'announcements', name: 'Announcements', icon: Bell, count: 8, color: 'bg-red-500' },
    { id: 'off-topic', name: 'Off Topic', icon: Coffee, count: 9, color: 'bg-yellow-500' }
  ]

  const posts = [
    {
      id: 1,
      author: {
        name: 'Sarah Chen',
        avatar: '👩‍💻',
        role: 'AI Researcher',
        level: 'Expert',
        badges: ['Top Contributor', 'ML Specialist'],
        joinDate: 'Member since 2023',
        location: 'San Francisco, CA',
        verified: true
      },
      category: 'projects',
      title: 'Built an AI-powered recommendation system for e-commerce',
      content: 'Just finished implementing a collaborative filtering algorithm using TensorFlow. The system achieved 92% accuracy in predicting user preferences. Would love to get feedback from the community!',
      images: ['🖼️', '📊'],
      timestamp: '2 hours ago',
      likes: 47,
      comments: 12,
      shares: 8,
      tags: ['Machine Learning', 'TensorFlow', 'Recommendation Systems'],
      isPinned: false,
      isLiked: true,
      isBookmarked: false,
      engagement: 'high'
    },
    {
      id: 2,
      author: {
        name: 'Alex Rodriguez',
        avatar: '👨‍💼',
        role: 'Full Stack Developer',
        level: 'Advanced',
        badges: ['React Expert', 'Mentor'],
        joinDate: 'Member since 2022',
        location: 'New York, NY',
        verified: true
      },
      category: 'help',
      title: 'Need help with React Performance Optimization',
      content: 'Working on a large React application and experiencing performance issues with re-renders. Any tips on optimizing component rendering? Already tried useMemo and useCallback.',
      images: [],
      timestamp: '4 hours ago',
      likes: 23,
      comments: 18,
      shares: 5,
      tags: ['React', 'Performance', 'Optimization'],
      isPinned: false,
      isLiked: false,
      isBookmarked: true,
      engagement: 'medium'
    },
    {
      id: 3,
      author: {
        name: 'Emily Watson',
        avatar: '👩‍🔬',
        role: 'Data Scientist',
        level: 'Expert',
        badges: ['Data Guru', 'Python Expert'],
        joinDate: 'Member since 2021',
        location: 'London, UK',
        verified: true
      },
      category: 'study-groups',
      title: 'Starting a Data Science Study Group - Join us!',
      content: 'Looking to form a study group for advanced data science topics. We\'ll cover deep learning, NLP, and computer vision. Planning to meet twice a week via video calls. Comment if interested!',
      images: [],
      timestamp: '6 hours ago',
      likes: 89,
      comments: 34,
      shares: 22,
      tags: ['Study Group', 'Data Science', 'Deep Learning'],
      isPinned: true,
      isLiked: true,
      isBookmarked: true,
      engagement: 'high'
    },
    {
      id: 4,
      author: {
        name: 'Maria Gonzalez',
        avatar: '👩‍🎨',
        role: 'UX Designer',
        level: 'Intermediate',
        badges: ['Design Thinking'],
        joinDate: 'Member since 2024',
        location: 'Barcelona, Spain',
        verified: false
      },
      category: 'career',
      title: 'Tips for transitioning from graphic design to UX?',
      content: 'I\'ve been working as a graphic designer for 5 years and want to transition to UX design. What skills should I focus on learning? Any recommended courses or resources?',
      images: [],
      timestamp: '8 hours ago',
      likes: 31,
      comments: 15,
      shares: 7,
      tags: ['Career Transition', 'UX Design', 'Advice'],
      isPinned: false,
      isLiked: false,
      isBookmarked: false,
      engagement: 'medium'
    },
    {
      id: 5,
      author: {
        name: 'Michael Zhang',
        avatar: '👨‍💼',
        role: 'Cybersecurity Analyst',
        level: 'Expert',
        badges: ['Security Expert', 'Ethical Hacker'],
        joinDate: 'Member since 2020',
        location: 'Toronto, Canada',
        verified: true
      },
      category: 'announcements',
      title: 'Cybersecurity Workshop: Ethical Hacking Fundamentals',
      content: 'Excited to announce our upcoming workshop on ethical hacking! We\'ll cover penetration testing, vulnerability assessment, and security best practices. Register now - limited spots available.',
      images: ['🔒'],
      timestamp: '12 hours ago',
      likes: 156,
      comments: 28,
      shares: 45,
      tags: ['Cybersecurity', 'Workshop', 'Ethical Hacking'],
      isPinned: true,
      isLiked: true,
      isBookmarked: true,
      engagement: 'very-high'
    }
  ]

  const studyGroups = [
    {
      id: 1,
      name: 'Advanced Machine Learning',
      description: 'Deep dive into neural networks, deep learning, and AI research',
      members: 47,
      avatar: '🤖',
      category: 'AI/ML',
      meetingFrequency: 'Twice weekly',
      nextMeeting: 'Tomorrow 7PM EST',
      isJoined: true,
      level: 'Advanced',
      topics: ['Neural Networks', 'Deep Learning', 'Computer Vision'],
      moderator: 'Dr. Sarah Chen'
    },
    {
      id: 2,
      name: 'React Developers Circle',
      description: 'Everything React - hooks, performance, best practices',
      members: 89,
      avatar: '⚛️',
      category: 'Web Dev',
      meetingFrequency: 'Weekly',
      nextMeeting: 'Friday 6PM PST',
      isJoined: false,
      level: 'Intermediate',
      topics: ['React Hooks', 'State Management', 'Performance'],
      moderator: 'Alex Rodriguez'
    },
    {
      id: 3,
      name: 'Data Science Beginners',
      description: 'Learn data science fundamentals together',
      members: 156,
      avatar: '📊',
      category: 'Data Science',
      meetingFrequency: 'Twice weekly',
      nextMeeting: 'Sunday 3PM GMT',
      isJoined: true,
      level: 'Beginner',
      topics: ['Python', 'Statistics', 'Data Visualization'],
      moderator: 'Emily Watson'
    }
  ]

  const topContributors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      avatar: '👩‍💻',
      role: 'AI Researcher',
      points: 2847,
      contributions: 156,
      badge: 'Expert',
      specialties: ['Machine Learning', 'Deep Learning'],
      isFollowing: true,
      level: 12
    },
    {
      id: 2,
      name: 'Alex Rodriguez',
      avatar: '👨‍💼',
      role: 'Full Stack Developer',
      points: 2156,
      contributions: 134,
      badge: 'Mentor',
      specialties: ['React', 'Node.js'],
      isFollowing: false,
      level: 10
    },
    {
      id: 3,
      name: 'Emily Watson',
      avatar: '👩‍🔬',
      role: 'Data Scientist',
      points: 1923,
      contributions: 98,
      badge: 'Expert',
      specialties: ['Data Science', 'Python'],
      isFollowing: true,
      level: 9
    }
  ]

  const events = [
    {
      id: 1,
      title: 'AI Ethics Workshop',
      date: 'Aug 10, 2025',
      time: '2:00 PM EST',
      type: 'Workshop',
      attendees: 156,
      maxAttendees: 200,
      host: 'Dr. Sarah Chen',
      description: 'Exploring ethical considerations in AI development',
      isRegistered: true,
      category: 'AI/Ethics'
    },
    {
      id: 2,
      title: 'React Performance Masterclass',
      date: 'Aug 12, 2025',
      time: '6:00 PM PST',
      type: 'Masterclass',
      attendees: 89,
      maxAttendees: 150,
      host: 'Alex Rodriguez',
      description: 'Advanced techniques for optimizing React applications',
      isRegistered: false,
      category: 'Web Development'
    }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case 'very-high':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800'
      case 'Mentor':
        return 'bg-blue-100 text-blue-800'
      case 'Top Contributor':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Community
                </h1>
                <p className="text-sm text-gray-600">Connect, learn, and grow together</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-80"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {communityStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'feed', name: 'Discussion Feed', icon: MessageCircle },
              { id: 'groups', name: 'Study Groups', icon: Users2 },
              { id: 'contributors', name: 'Top Contributors', icon: Award },
              { id: 'events', name: 'Events', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-3">
              {/* Create Post */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    👤
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your thoughts with the community..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Image className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Smile className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 mb-6">
                <div className="flex flex-wrap gap-2">
                  {discussionCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion Posts */}
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
                  >
                    {/* Post Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                        {post.author.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                          {post.author.verified && (
                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{post.timestamp}</span>
                          {post.isPinned && (
                            <Pin className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-600">{post.author.role}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(post.author.level)}`}>
                            {post.author.level}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {post.author.badges.map((badge, index) => (
                            <span key={index} className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(badge)}`}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      
                      {/* Images */}
                      {post.images.length > 0 && (
                        <div className="flex space-x-2 mb-3">
                          {post.images.map((image, index) => (
                            <div key={index} className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                              {image}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6">
                        <button className={`flex items-center space-x-1 transition-colors ${
                          post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}>
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className={`p-2 transition-colors ${
                          post.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        }`}>
                          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <div className={`flex items-center space-x-1 ${getEngagementColor(post.engagement)}`}>
                          <Flame className="h-4 w-4" />
                          <span className="text-xs font-medium capitalize">{post.engagement.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Top Contributors */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
                <div className="space-y-3">
                  {topContributors.slice(0, 3).map((contributor) => (
                    <div key={contributor.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                        {contributor.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{contributor.name}</p>
                        <p className="text-xs text-gray-500">{contributor.points} points</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(contributor.badge)}`}>
                        {contributor.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {events.slice(0, 2).map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{event.date} • {event.time}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600">{event.attendees} attending</span>
                        <button className={`text-xs px-2 py-1 rounded transition-colors ${
                          event.isRegistered 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}>
                          {event.isRegistered ? 'Registered' : 'Register'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {studyGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    {group.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{group.members} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{group.meetingFrequency}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Next meeting: <span className="font-medium">{group.nextMeeting}</span></p>
                  <p className="text-sm text-gray-600">Moderator: <span className="font-medium">{group.moderator}</span></p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {group.topics.slice(0, 3).map((topic, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>

                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  group.isJoined
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {group.isJoined ? 'Joined' : 'Join Group'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'contributors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {topContributors.map((contributor) => (
              <motion.div
                key={contributor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                    {contributor.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{contributor.name}</h3>
                    <p className="text-sm text-gray-600">{contributor.role}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getBadgeColor(contributor.badge)}`}>
                      Level {contributor.level}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{contributor.points} points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{contributor.contributions} posts</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {contributor.specialties.map((specialty, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  contributor.isFollowing
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {contributor.isFollowing ? 'Following' : 'Follow'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {event.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees}/{event.maxAttendees}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-4 w-4" />
                    <span>{event.host}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  event.isRegistered
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {event.isRegistered ? 'Registered ✓' : 'Register Now'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Community
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Where learning minds connect and knowledge grows
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Community Guidelines</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Study Groups</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Events</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
