'use client'

import React, { useState, useEffect } from 'react'
import SociAILayout from '../../components/layout/SociAILayout'
import SociAIService from '../../services/sociaiService'
import type { SocialPost, AIRecommendation } from '../../services/sociaiService'
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
  Hash
} from 'lucide-react'

export default function SociAIFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [newPost, setNewPost] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAIHelper, setShowAIHelper] = useState(false)

  const sociaiService = SociAIService.getInstance()

  useEffect(() => {
    loadFeedData()
  }, [])

  const loadFeedData = async () => {
    try {
      setIsLoading(true)
      const [feedData, aiRecs] = await Promise.all([
        sociaiService.getFeed(),
        sociaiService.getAIRecommendations()
      ])
      setPosts(feedData)
      setRecommendations(aiRecs)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    await sociaiService.likePost(postId)
    loadFeedData() // Refresh feed
  }

  const handleCreatePost = async () => {
    if (!newPost.trim()) return

    await sociaiService.createPost({
      content: newPost,
      visibility: 'public'
    })
    setNewPost('')
    loadFeedData() // Refresh feed
  }

  const handleAIAssist = async () => {
    if (!newPost.trim()) return

    const aiSuggestion = await sociaiService.generateAIPost(newPost)
    setNewPost(aiSuggestion)
    setShowAIHelper(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
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

  if (isLoading) {
    return (
      <SociAILayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SociAILayout>
    )
  }

  return (
    <SociAILayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <img
                  className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800"
                  src="/api/placeholder/48/48"
                  alt="Your avatar"
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's happening in your AI world?"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                    rows={3}
                  />

                  {/* Post Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <Camera className="w-5 h-5" />
                        <span className="text-sm">Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                        <Smile className="w-5 h-5" />
                        <span className="text-sm">Emoji</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                        <Hash className="w-5 h-5" />
                        <span className="text-sm">Tags</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAIHelper(!showAIHelper)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm">AI Assist</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post
                      </motion.button>
                    </div>
                  </div>

                  {/* AI Helper */}
                  {showAIHelper && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Writing Assistant</span>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        I can help enhance your post with engaging content, trending hashtags, or optimal formatting.
                      </p>
                      <button
                        onClick={handleAIAssist}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                      >
                        Enhance Post
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-800"
                        src={typeof post.author === 'object' ? post.author.avatar : '/api/placeholder/40/40'}
                        alt="Author avatar"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {typeof post.author === 'object' ? post.author.name : 'User'}
                          </h3>
                          {typeof post.author === 'object' && post.author.verified && (
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
                          @{typeof post.author === 'object' ? post.author.username : 'user'} • {formatTimeAgo(post.timestamps.created)}
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
                          src={post.media[0].url}
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
                        onClick={() => handleLikePost(post.id)}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h2>
              </div>

              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">{rec.title}</h3>
                      <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{rec.description}</p>
                    <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                      {rec.actionLabel} →
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Now</h2>
              </div>

              <div className="space-y-3">
                {['#AIRevolution', '#MachineLearning', '#TechTrends', '#Innovation', '#FutureOfWork'].map((trend, index) => (
                  <div key={trend} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{trend}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{15 - index * 2}k posts</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Community</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.5M</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.2M</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">AI-Enhanced Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">95%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Satisfaction Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SociAILayout>
  )
}