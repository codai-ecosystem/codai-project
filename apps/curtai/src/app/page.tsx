'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Calendar,
  Target,
  Star,
  Eye,
  Coffee,
  MapPin,
  Clock,
  Zap,
  Award,
  Shield,
  ArrowRight,
  Filter,
  Search,
  Bell,
  Settings,
  User,
  ChevronRight
} from 'lucide-react'

// TypeScript interfaces for dating platform data
interface DatingMetrics {
  totalMatches: number
  activeConversations: number
  profileViews: number
  compatibilityScore: number
  thisWeekMatches: number
  responseRate: number
  averageCompatibility: number
  successfulDates: number
}

interface Match {
  id: string
  name: string
  age: number
  location: string
  compatibility: number
  interests: string[]
  lastSeen: string
  profileImage: string
  isOnline: boolean
  mutualFriends: number
  verified: boolean
}

interface Activity {
  id: string
  type: 'match' | 'like' | 'message' | 'view'
  user: string
  message: string
  timestamp: string
  compatibility?: number
}

interface DatingTip {
  id: string
  title: string
  description: string
  category: 'profile' | 'conversation' | 'dating' | 'compatibility'
  icon: React.ReactNode
}

export default function DatingDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<DatingMetrics>({
    totalMatches: 247,
    activeConversations: 12,
    profileViews: 1834,
    compatibilityScore: 87,
    thisWeekMatches: 23,
    responseRate: 76,
    averageCompatibility: 82,
    successfulDates: 15
  })

  const [recentMatches] = useState<Match[]>([
    {
      id: '1',
      name: 'Emma Rodriguez',
      age: 28,
      location: 'Bucharest, 2km away',
      compatibility: 94,
      interests: ['Photography', 'Travel', 'Yoga', 'Coffee'],
      lastSeen: '2 minutes ago',
      profileImage: '/api/placeholder/80/80',
      isOnline: true,
      mutualFriends: 3,
      verified: true
    },
    {
      id: '2',
      name: 'Sofia Chen',
      age: 26,
      location: 'Cluj-Napoca, 5km away',
      compatibility: 91,
      interests: ['Art', 'Music', 'Hiking', 'Books'],
      lastSeen: '1 hour ago',
      profileImage: '/api/placeholder/80/80',
      isOnline: true,
      mutualFriends: 1,
      verified: true
    },
    {
      id: '3',
      name: 'Ana Popescu',
      age: 30,
      location: 'Timișoara, 3km away',
      compatibility: 88,
      interests: ['Fitness', 'Cooking', 'Movies', 'Dancing'],
      lastSeen: '3 hours ago',
      profileImage: '/api/placeholder/80/80',
      isOnline: false,
      mutualFriends: 5,
      verified: true
    },
    {
      id: '4',
      name: 'Maria Ionescu',
      age: 27,
      location: 'Brașov, 1km away',
      compatibility: 86,
      interests: ['Nature', 'Psychology', 'Wine', 'Theater'],
      lastSeen: '5 hours ago',
      profileImage: '/api/placeholder/80/80',
      isOnline: false,
      mutualFriends: 2,
      verified: false
    }
  ])

  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'match',
      user: 'Emma Rodriguez',
      message: 'You have a new match! 94% compatibility',
      timestamp: '5 minutes ago',
      compatibility: 94
    },
    {
      id: '2',
      type: 'message',
      user: 'Sofia Chen',
      message: 'Sent you a message about your travel photos',
      timestamp: '1 hour ago'
    },
    {
      id: '3',
      type: 'like',
      user: 'Ana Popescu',
      message: 'Liked your profile - Check compatibility!',
      timestamp: '2 hours ago',
      compatibility: 88
    },
    {
      id: '4',
      type: 'view',
      user: 'Maria Ionescu',
      message: 'Viewed your profile multiple times',
      timestamp: '3 hours ago'
    }
  ])

  const [datingTips] = useState<DatingTip[]>([
    {
      id: '1',
      title: 'Enhance Your Profile',
      description: 'AI suggests adding 2 more photos and updating your bio for 23% better matches',
      category: 'profile',
      icon: <User className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'Conversation Starter',
      description: 'Ask about Emma\'s photography passion - 87% success rate for this topic',
      category: 'conversation',
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'Perfect Date Timing',
      description: 'Best time to ask Sofia for coffee: Weekend afternoon (92% acceptance rate)',
      category: 'dating',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: '4',
      title: 'Compatibility Boost',
      description: 'Mention your shared interest in hiking to increase compatibility by 12%',
      category: 'compatibility',
      icon: <Target className="w-5 h-5" />
    }
  ])

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        profileViews: prev.profileViews + Math.floor(Math.random() * 3),
        compatibilityScore: Math.max(85, Math.min(95, prev.compatibilityScore + (Math.random() - 0.5) * 2))
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match': return <Heart className="w-4 h-4 text-pink-500" />
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'like': return <Star className="w-4 h-4 text-yellow-500" />
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />
      default: return <Sparkles className="w-4 h-4 text-gray-500" />
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-8 shadow-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">CurtAI Dating Dashboard</h1>
                <p className="text-pink-100">AI-Powered Matchmaking & Love Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-pink-100">Your Compatibility Score</div>
                <div className="text-2xl font-bold">{metrics.compatibilityScore}%</div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Dating Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-pink-100 text-sm">Total Matches</div>
                  <div className="text-2xl font-bold">{metrics.totalMatches}</div>
                </div>
                <Heart className="w-8 h-8 text-pink-200" />
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-pink-100 text-sm">Active Chats</div>
                  <div className="text-2xl font-bold">{metrics.activeConversations}</div>
                </div>
                <MessageCircle className="w-8 h-8 text-pink-200" />
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-pink-100 text-sm">Profile Views</div>
                  <div className="text-2xl font-bold">{metrics.profileViews.toLocaleString()}</div>
                </div>
                <Eye className="w-8 h-8 text-pink-200" />
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-pink-100 text-sm">Response Rate</div>
                  <div className="text-2xl font-bold">{metrics.responseRate}%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-200" />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabbed Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-1 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
              { id: 'matches', label: 'New Matches', icon: <Heart className="w-4 h-4" />, count: recentMatches.length },
              { id: 'activity', label: 'Recent Activity', icon: <Clock className="w-4 h-4" />, count: recentActivity.length },
              { id: 'tips', label: 'AI Dating Tips', icon: <Sparkles className="w-4 h-4" />, count: datingTips.length },
              { id: 'insights', label: 'Love Insights', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'goals', label: 'Relationship Goals', icon: <Award className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
                {tab.count && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-white text-pink-600' : 'bg-pink-100 text-pink-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Stats */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Week Matches</span>
                      <span className="font-bold text-pink-600">{metrics.thisWeekMatches}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg. Compatibility</span>
                      <span className="font-bold text-blue-600">{metrics.averageCompatibility}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Successful Dates</span>
                      <span className="font-bold text-green-600">{metrics.successfulDates}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>Discover New Matches</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Optimize Profile</span>
                    </button>
                    <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>View Conversations</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Top Matches */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      Top AI Matches
                    </h3>
                    <button className="text-pink-600 hover:text-pink-700 flex items-center space-x-1">
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentMatches.slice(0, 4).map((match) => (
                      <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            {match.isOnline && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 flex items-center">
                                {match.name}
                                {match.verified && (
                                  <Shield className="w-4 h-4 text-blue-500 ml-1" />
                                )}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(match.compatibility)}`}>
                                {match.compatibility}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {match.location}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Coffee className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {match.interests.slice(0, 2).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 text-blue-500 mr-2" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                        {activity.compatibility && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(activity.compatibility)}`}>
                            {activity.compatibility}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">New AI Matches</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentMatches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        {match.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(match.compatibility)}`}>
                        {match.compatibility}% Match
                      </span>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        {match.name}, {match.age}
                        {match.verified && (
                          <Shield className="w-4 h-4 text-blue-500 ml-1" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {match.location}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Last seen: {match.lastSeen}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.interests.map((interest, index) => (
                          <span key={index} className="px-2 py-1 bg-pink-100 text-pink-600 rounded-md text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>Like</span>
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{activity.user}</h4>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.message}</p>
                      {activity.compatibility && (
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(activity.compatibility)}`}>
                          {activity.compatibility}% Compatibility
                        </span>
                      )}
                    </div>
                    <button className="text-pink-600 hover:text-pink-700">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">AI Dating Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {datingTips.map((tip) => (
                  <div key={tip.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{tip.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                          {tip.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Love Insights</h3>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h4>
                <p className="text-gray-600">Deep insights into your dating patterns, success rates, and AI-powered relationship predictions.</p>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Relationship Goals</h3>
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Goal Setting Coming Soon</h4>
                <p className="text-gray-600">Set and track your relationship goals with AI-powered recommendations and milestone tracking.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Heart className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Find Your Match</h3>
              <p className="text-pink-100 text-sm mb-4">
                Discover compatible partners with our advanced AI matchmaking algorithm
              </p>
              <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                Start Matching
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Sparkles className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Dating Coach</h3>
              <p className="text-pink-100 text-sm mb-4">
                Get personalized dating advice and conversation tips powered by AI
              </p>
              <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                Get Coaching
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Shield className="w-8 h-8 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
              <p className="text-pink-100 text-sm mb-4">
                Your privacy and safety are our top priorities with verified profiles
              </p>
              <button className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                Learn More
              </button>
            </motion.div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-white/20">
            <p className="text-pink-100">
              © 2025 CurtAI - AI-Powered Matchmaking Platform. Part of the CODAI Ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
