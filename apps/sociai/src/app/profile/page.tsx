'use client';

import { useState } from 'react';
import {
  User, Settings, Camera, Edit3, MapPin, Calendar,
  Link as LinkIcon, Mail, Globe, Phone, Twitter,
  Instagram, Linkedin, Github, Heart, MessageCircle,
  Share2, Bookmark, TrendingUp, Award, Users, Star,
  MoreHorizontal, Image, Video, FileText, Music,
  Upload, Save, X, Check, Bell, Shield, Eye,
  Activity, BarChart3, Zap, Target, Trophy,
  Crown, Verified, PlusCircle, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Alex Rodriguez',
    username: '@alexrodriguezai',
    bio: 'AI enthusiast & content creator 🤖 | Building the future of social media | Tech evangelist | Coffee addict ☕',
    location: 'San Francisco, CA',
    website: 'alexrodriguez.tech',
    joinDate: 'March 2022',
    followers: '24.7K',
    following: '892',
    posts: '1,847'
  });

  const [socialLinks, setSocialLinks] = useState({
    twitter: '@alexrodriguez',
    instagram: '@alexr_tech',
    linkedin: 'alexrodriguez-ai',
    github: 'alexrodriguez-dev'
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'connections', label: 'Connections', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const achievements = [
    {
      icon: Crown,
      title: 'Content Creator Pro',
      description: '1000+ high-quality posts',
      color: 'text-yellow-400',
      earned: true
    },
    {
      icon: TrendingUp,
      title: 'Viral Content',
      description: 'Post reached 100K+ views',
      color: 'text-green-400',
      earned: true
    },
    {
      icon: Users,
      title: 'Community Builder',
      description: '10K+ followers milestone',
      color: 'text-blue-400',
      earned: true
    },
    {
      icon: Trophy,
      title: 'AI Pioneer',
      description: 'Early AI content adopter',
      color: 'text-purple-400',
      earned: true
    },
    {
      icon: Target,
      title: 'Engagement Master',
      description: '95% engagement rate',
      color: 'text-pink-400',
      earned: false
    },
    {
      icon: Zap,
      title: 'Consistency King',
      description: '365 day posting streak',
      color: 'text-orange-400',
      earned: false
    }
  ];

  const recentPosts = [
    {
      id: 1,
      content: 'Just discovered an amazing AI tool for content creation! The future of social media is here 🚀 #AI #SocialMedia #Innovation',
      timestamp: '2 hours ago',
      likes: 342,
      comments: 28,
      shares: 15,
      media: { type: 'image', url: '/api/placeholder/400/300' },
      engagement: 94
    },
    {
      id: 2,
      content: 'Building in public: Day 30 of my AI journey. Here\'s what I\'ve learned about machine learning so far... 🧠',
      timestamp: '1 day ago',
      likes: 189,
      comments: 45,
      shares: 12,
      media: null,
      engagement: 87
    },
    {
      id: 3,
      content: 'Quick tutorial on optimizing your social media presence with AI analytics 📊 Link in bio!',
      timestamp: '3 days ago',
      likes: 567,
      comments: 89,
      shares: 34,
      media: { type: 'video', url: '/api/placeholder/400/300' },
      engagement: 96
    }
  ];

  const connections = [
    {
      id: 1,
      name: 'Sarah Chen',
      username: '@sarahchen_ai',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 12,
      isFollowing: true,
      isVerified: true
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      username: '@marcus_tech',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 8,
      isFollowing: true,
      isVerified: false
    },
    {
      id: 3,
      name: 'Emily Zhang',
      username: '@emilyzhang',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 24,
      isFollowing: false,
      isVerified: true
    }
  ];

  const analyticsData = {
    profileViews: '12.4K',
    postReach: '89.2K',
    engagement: '8.7%',
    topContent: 'AI Tutorials',
    bestDay: 'Tuesday',
    audienceGrowth: '+15.3%'
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    // Save logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Profile Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/80">
                <div className="text-center">
                  <div className="text-lg font-semibold">{profileData.followers}</div>
                  <div className="text-xs">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{profileData.following}</div>
                  <div className="text-xs">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{profileData.posts}</div>
                  <div className="text-xs">Posts</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(!editMode)}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
              {editMode && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </motion.button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {editMode ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="text-2xl font-bold text-gray-900 bg-gray-100 rounded-lg px-3 py-1 border-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                )}
                <Verified className="h-6 w-6 text-blue-500" />
              </div>

              <p className="text-gray-600 mb-3">{profileData.username}</p>

              {editMode ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full text-gray-700 bg-gray-100 rounded-lg px-3 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 mb-4">{profileData.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-blue-600 hover:underline cursor-pointer">{profileData.website}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 cursor-pointer">
                  <Twitter className="h-4 w-4" />
                  <span className="text-sm">{socialLinks.twitter}</span>
                </div>
                <div className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 cursor-pointer">
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm">{socialLinks.instagram}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-700 hover:text-blue-800 cursor-pointer">
                  <Linkedin className="h-4 w-4" />
                  <span className="text-sm">{socialLinks.linkedin}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-700 hover:text-gray-800 cursor-pointer">
                  <Github className="h-4 w-4" />
                  <span className="text-sm">{socialLinks.github}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Follow
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Message
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Share Profile
              </motion.button>
            </div>
          </div>

          {editMode && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } transition-colors`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Profile Views</p>
                          <p className="text-2xl font-bold">{analyticsData.profileViews}</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Post Reach</p>
                          <p className="text-2xl font-bold">{analyticsData.postReach}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-200" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Engagement Rate</p>
                          <p className="text-2xl font-bold">{analyticsData.engagement}</p>
                        </div>
                        <Activity className="h-8 w-8 text-green-200" />
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-lg border-2 transition-colors ${achievement.earned
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-200 bg-gray-50 opacity-60'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className={`h-8 w-8 ${achievement.color}`} />
                              <div>
                                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                                <p className="text-sm text-gray-600">{achievement.description}</p>
                              </div>
                              {achievement.earned && <Check className="h-5 w-5 text-green-500" />}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-900 mb-3">{post.content}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{post.timestamp}</span>
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Share2 className="h-4 w-4" />
                                <span>{post.shares}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">All Posts ({profileData.posts})</h3>
                    <div className="flex items-center space-x-3">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>All Posts</option>
                        <option>Most Popular</option>
                        <option>Recent</option>
                        <option>Most Commented</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Create Post</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {recentPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-gray-900">{profileData.name}</span>
                              <Verified className="h-4 w-4 text-blue-500" />
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-500 text-sm">{post.timestamp}</span>
                            </div>
                            <p className="text-gray-900 mb-4">{post.content}</p>
                            {post.media && (
                              <div className="mb-4">
                                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {post.media.type === 'image' ? (
                                    <Image className="h-16 w-16 text-gray-400" />
                                  ) : (
                                    <Video className="h-16 w-16 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6">
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                                  <Heart className="h-5 w-5" />
                                  <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                                  <MessageCircle className="h-5 w-5" />
                                  <span>{post.comments}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                                  <Share2 className="h-5 w-5" />
                                  <span>{post.shares}</span>
                                </button>
                                <button className="text-gray-500 hover:text-yellow-500 transition-colors">
                                  <Bookmark className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Engagement:</span>
                                <span className="text-sm font-semibold text-green-600">{post.engagement}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Profile Analytics</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Profile Views</h4>
                        <Eye className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{analyticsData.profileViews}</p>
                      <p className="text-sm text-green-600 mt-2">+23% this week</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Post Reach</h4>
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{analyticsData.postReach}</p>
                      <p className="text-sm text-green-600 mt-2">+15% this month</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Engagement Rate</h4>
                        <Activity className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{analyticsData.engagement}</p>
                      <p className="text-sm text-green-600 mt-2">Above average</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Top Content Type</h4>
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.topContent}</p>
                      <p className="text-sm text-gray-600 mt-2">Highest engagement</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Best Posting Day</h4>
                        <Calendar className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData.bestDay}</p>
                      <p className="text-sm text-gray-600 mt-2">Peak engagement</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Audience Growth</h4>
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{analyticsData.audienceGrowth}</p>
                      <p className="text-sm text-green-600 mt-2">This quarter</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'connections' && (
                <motion.div
                  key="connections"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Connections</h3>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Search connections..."
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
                      />
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>All</option>
                        <option>Following</option>
                        <option>Followers</option>
                        <option>Mutual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connections.map((connection) => (
                      <motion.div
                        key={connection.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{connection.name}</h4>
                              {connection.isVerified && <Verified className="h-4 w-4 text-blue-500" />}
                            </div>
                            <p className="text-gray-600 text-sm">{connection.username}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {connection.mutualConnections} mutual connections
                        </p>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${connection.isFollowing
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                              }`}
                          >
                            {connection.isFollowing ? 'Following' : 'Follow'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                          >
                            Message
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>

                  <div className="space-y-6">
                    {/* Privacy Settings */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Privacy Settings</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Private Profile</p>
                            <p className="text-sm text-gray-600">Only followers can see your posts</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Show Activity Status</p>
                            <p className="text-sm text-gray-600">Let others see when you're active</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Notification Preferences</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">New Followers</p>
                            <p className="text-sm text-gray-600">Get notified when someone follows you</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Comments & Mentions</p>
                            <p className="text-sm text-gray-600">Get notified about interactions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Account Actions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Account Actions</h4>
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Upload className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900">Export Data</p>
                              <p className="text-sm text-gray-600">Download your profile data</p>
                            </div>
                          </div>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Minus className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="font-medium text-red-900">Deactivate Account</p>
                              <p className="text-sm text-red-600">Temporarily disable your profile</p>
                            </div>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <TrendingUp className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Growth Analytics</h3>
              <p className="text-white/80">Track your profile growth and engagement metrics with detailed insights.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Users className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community Building</h3>
              <p className="text-white/80">Connect with like-minded creators and build meaningful relationships.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Zap className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-white/80">Get intelligent recommendations to optimize your social media presence.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
