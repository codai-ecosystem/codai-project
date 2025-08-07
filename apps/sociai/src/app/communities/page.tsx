'use client';

import { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Star, TrendingUp, MessageCircle,
  Calendar, MapPin, Globe, Lock, Eye, Settings, MoreHorizontal,
  Crown, Shield, Award, Zap, Bot, Heart, Share2, Bookmark,
  User, Hash, Pin, Flame, Clock, ChevronRight, ChevronDown,
  Image, Video, FileText, Link, Smile, Send, Edit3,
  UserPlus, UserMinus, Volume2, VolumeX, Flag, Archive,
  Target, Activity, BarChart3, Sparkles, Check, X,
  Coffee, Code, Briefcase, Gamepad2, Music, Camera,
  Palette, Book, Cpu, Lightbulb, Megaphone, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  isVerified: boolean;
  coverImage?: string;
  avatar?: string;
  tags: string[];
  growthRate: number;
  activityLevel: 'low' | 'medium' | 'high' | 'very-high';
  moderators: Array<{
    id: string;
    name: string;
    role: 'admin' | 'moderator';
  }>;
  aiModerationEnabled: boolean;
  rules: string[];
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  isVerified: boolean;
  communityId: string;
  communityName: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isPinned: boolean;
  isAIGenerated?: boolean;
  tags: string[];
  media?: Array<{
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
  }>;
}

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe, count: 156 },
    { id: 'tech', name: 'Technology', icon: Cpu, count: 28 },
    { id: 'ai', name: 'AI & ML', icon: Bot, count: 24 },
    { id: 'design', name: 'Design', icon: Palette, count: 18 },
    { id: 'business', name: 'Business', icon: Briefcase, count: 22 },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, count: 15 },
    { id: 'music', name: 'Music', icon: Music, count: 12 },
    { id: 'photography', name: 'Photography', icon: Camera, count: 14 },
    { id: 'education', name: 'Education', icon: Book, count: 19 },
    { id: 'startup', name: 'Startups', icon: Lightbulb, count: 16 }
  ];

  const communities: Community[] = [
    {
      id: '1',
      name: 'AI Innovators Hub',
      description: 'A community for AI enthusiasts, researchers, and innovators to share insights, discuss trends, and collaborate on cutting-edge projects.',
      category: 'ai',
      memberCount: 12847,
      postCount: 3429,
      isPrivate: false,
      isJoined: true,
      isVerified: true,
      tags: ['AI', 'Machine Learning', 'Innovation', 'Research'],
      growthRate: 23.5,
      activityLevel: 'very-high',
      moderators: [
        { id: 'mod1', name: 'Dr. Sarah Chen', role: 'admin' },
        { id: 'mod2', name: 'Alex Rodriguez', role: 'moderator' }
      ],
      aiModerationEnabled: true,
      rules: [
        'Keep discussions AI-related and constructive',
        'No spam or self-promotion without approval',
        'Respect all community members',
        'Share reliable sources for claims'
      ]
    },
    {
      id: '2',
      name: 'Social Media Strategists',
      description: 'Connect with fellow social media professionals, share strategies, get feedback on campaigns, and stay updated with platform changes.',
      category: 'business',
      memberCount: 8956,
      postCount: 2847,
      isPrivate: false,
      isJoined: true,
      isVerified: true,
      tags: ['Social Media', 'Marketing', 'Strategy', 'Growth'],
      growthRate: 18.2,
      activityLevel: 'high',
      moderators: [
        { id: 'mod3', name: 'Marcus Johnson', role: 'admin' },
        { id: 'mod4', name: 'Emily Zhang', role: 'moderator' }
      ],
      aiModerationEnabled: true,
      rules: [
        'Focus on social media strategy and marketing',
        'No direct selling or cold pitches',
        'Provide value in every post',
        'Use appropriate tags for better discovery'
      ]
    },
    {
      id: '3',
      name: 'UX/UI Design Collective',
      description: 'A creative space for designers to showcase work, get feedback, discuss design trends, and find inspiration from the community.',
      category: 'design',
      memberCount: 15234,
      postCount: 4578,
      isPrivate: false,
      isJoined: false,
      isVerified: true,
      tags: ['UX', 'UI', 'Design', 'Creativity', 'Portfolio'],
      growthRate: 15.7,
      activityLevel: 'high',
      moderators: [
        { id: 'mod5', name: 'Jessica Wu', role: 'admin' },
        { id: 'mod6', name: 'David Kim', role: 'moderator' }
      ],
      aiModerationEnabled: false,
      rules: [
        'Design-focused content only',
        'Provide constructive feedback',
        'Credit original creators',
        'No off-topic discussions'
      ]
    },
    {
      id: '4',
      name: 'Startup Founders Network',
      description: 'Exclusive community for startup founders to network, share experiences, get advice, and collaborate on entrepreneurial ventures.',
      category: 'startup',
      memberCount: 5678,
      postCount: 1834,
      isPrivate: true,
      isJoined: false,
      isVerified: true,
      tags: ['Startups', 'Entrepreneurship', 'Funding', 'Growth'],
      growthRate: 28.9,
      activityLevel: 'medium',
      moderators: [
        { id: 'mod7', name: 'Robert Chen', role: 'admin' }
      ],
      aiModerationEnabled: true,
      rules: [
        'Verified startup founders only',
        'No competitor bashing',
        'Share genuine experiences',
        'Help fellow entrepreneurs'
      ]
    },
    {
      id: '5',
      name: 'Tech News & Trends',
      description: 'Stay updated with the latest technology news, emerging trends, product launches, and industry insights from around the globe.',
      category: 'tech',
      memberCount: 23456,
      postCount: 7892,
      isPrivate: false,
      isJoined: true,
      isVerified: true,
      tags: ['Technology', 'News', 'Trends', 'Innovation'],
      growthRate: 12.3,
      activityLevel: 'very-high',
      moderators: [
        { id: 'mod8', name: 'Lisa Wang', role: 'admin' },
        { id: 'mod9', name: 'James Liu', role: 'moderator' }
      ],
      aiModerationEnabled: true,
      rules: [
        'Technology-related content only',
        'Verify news sources',
        'No duplicate posts',
        'Engage respectfully in discussions'
      ]
    },
    {
      id: '6',
      name: 'Content Creators United',
      description: 'A supportive community for content creators across all platforms to share tips, collaborate, and grow their audiences together.',
      category: 'business',
      memberCount: 9876,
      postCount: 3456,
      isPrivate: false,
      isJoined: false,
      isVerified: false,
      tags: ['Content Creation', 'Creators', 'Growth', 'Collaboration'],
      growthRate: 21.4,
      activityLevel: 'high',
      moderators: [
        { id: 'mod10', name: 'Anna Martinez', role: 'admin' }
      ],
      aiModerationEnabled: false,
      rules: [
        'Support fellow creators',
        'Share valuable insights',
        'No plagiarism',
        'Collaborative mindset only'
      ]
    }
  ];

  const recentPosts: Post[] = [
    {
      id: '1',
      authorId: 'user1',
      authorName: 'Dr. Sarah Chen',
      authorUsername: '@sarahchen_ai',
      isVerified: true,
      communityId: '1',
      communityName: 'AI Innovators Hub',
      content: 'Exciting developments in transformer architecture! The new attention mechanisms are showing 40% improvement in efficiency. What are your thoughts on the implications for real-time AI applications? 🚀',
      timestamp: new Date(Date.now() - 1800000),
      likes: 156,
      comments: 23,
      shares: 12,
      isPinned: true,
      isAIGenerated: false,
      tags: ['Transformers', 'AI Efficiency', 'Real-time'],
      media: [
        {
          type: 'image',
          url: '/api/placeholder/600/300',
          thumbnail: '/api/placeholder/150/150'
        }
      ]
    },
    {
      id: '2',
      authorId: 'user2',
      authorName: 'Marcus Johnson',
      authorUsername: '@marcus_tech',
      isVerified: true,
      communityId: '2',
      communityName: 'Social Media Strategists',
      content: 'New Instagram algorithm update is prioritizing authentic engagement over follower count. Here\'s what we\'ve learned from analyzing 1000+ accounts:\n\n• Genuine comments matter more than likes\n• Story engagement boosts main feed visibility\n• Consistent posting beats viral spikes\n\nWhat strategies are working for you?',
      timestamp: new Date(Date.now() - 3600000),
      likes: 89,
      comments: 34,
      shares: 18,
      isPinned: false,
      tags: ['Instagram', 'Algorithm', 'Engagement'],
      media: []
    },
    {
      id: '3',
      authorId: 'ai-bot',
      authorName: 'SociAI Community Bot',
      authorUsername: '@sociai_bot',
      isVerified: true,
      communityId: '1',
      communityName: 'AI Innovators Hub',
      content: '🤖 AI-Generated Weekly Summary:\n\nTop trending topics this week:\n• Quantum-classical hybrid algorithms\n• Edge AI deployment strategies\n• Ethical AI governance frameworks\n• Multi-modal learning breakthroughs\n\nMost engaged post: "Real-time emotion detection in customer service"\n\nWould you like me to elaborate on any of these topics?',
      timestamp: new Date(Date.now() - 7200000),
      likes: 67,
      comments: 15,
      shares: 8,
      isPinned: false,
      isAIGenerated: true,
      tags: ['Weekly Summary', 'Trending', 'AI Generated']
    }
  ];

  const tabs = [
    { id: 'discover', label: 'Discover', icon: Globe },
    { id: 'my-communities', label: 'My Communities', icon: Users },
    { id: 'feed', label: 'Community Feed', icon: MessageCircle },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'events', label: 'Events', icon: Calendar }
  ];

  const filteredCommunities = communities.filter(community => {
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'text-green-600';
      case 'high': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityDot = (level: string) => {
    switch (level) {
      case 'very-high': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Communities</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/80">
                <div className="text-center">
                  <div className="text-lg font-semibold">{communities.length}</div>
                  <div className="text-xs">Total Communities</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {communities.filter(c => c.isJoined).length}
                  </div>
                  <div className="text-xs">Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {communities.reduce((sum, c) => sum + c.memberCount, 0).toLocaleString()}
                  </div>
                  <div className="text-xs">Total Members</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Community</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
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
              {activeTab === 'discover' && (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Filters and Search */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search communities..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="trending">Trending</option>
                        <option value="newest">Newest</option>
                        <option value="members">Most Members</option>
                        <option value="activity">Most Active</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <div className="grid grid-cols-2 gap-1 w-4 h-4">
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                        </div>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <div className="space-y-1 w-4 h-4">
                          <div className="bg-current h-1 rounded-sm"></div>
                          <div className="bg-current h-1 rounded-sm"></div>
                          <div className="bg-current h-1 rounded-sm"></div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <motion.button
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              selectedCategory === category.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="h-6 w-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.count} communities</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Communities Grid/List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedCategory === 'all' ? 'All Communities' : 
                         categories.find(c => c.id === selectedCategory)?.name + ' Communities'}
                        <span className="text-gray-500 ml-2">({filteredCommunities.length})</span>
                      </h3>
                    </div>

                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommunities.map((community) => (
                          <motion.div
                            key={community.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedCommunity(community.id)}
                          >
                            {/* Community Header */}
                            <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                              <div className="absolute top-3 right-3 flex items-center space-x-2">
                                {community.isPrivate && (
                                  <div className="bg-black/20 backdrop-blur-sm rounded-full p-1">
                                    <Lock className="h-4 w-4 text-white" />
                                  </div>
                                )}
                                {community.isVerified && (
                                  <div className="bg-blue-500 rounded-full p-1">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-6 left-4">
                                <div className="w-12 h-12 bg-white rounded-lg border-4 border-white flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                            </div>

                            {/* Community Info */}
                            <div className="p-4 pt-8">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 flex-1 pr-2">{community.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${getActivityDot(community.activityLevel)}`}></div>
                                  <span className={`text-xs ${getActivityColor(community.activityLevel)} capitalize`}>
                                    {community.activityLevel.replace('-', ' ')}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{community.description}</p>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{formatNumber(community.memberCount)} members</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{formatNumber(community.postCount)} posts</span>
                                </span>
                                <span className="flex items-center space-x-1 text-green-600">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>+{community.growthRate}%</span>
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {community.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                                {community.tags.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{community.tags.length - 3}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                    community.isJoined
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                                  }`}
                                >
                                  {community.isJoined ? 'Joined' : community.isPrivate ? 'Request to Join' : 'Join Community'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <Bookmark className="h-4 w-4 text-gray-600" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredCommunities.map((community) => (
                          <motion.div
                            key={community.id}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors"
                            onClick={() => setSelectedCommunity(community.id)}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="h-8 w-8 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-gray-900">{community.name}</h4>
                                    {community.isVerified && (
                                      <Check className="h-4 w-4 text-blue-500" />
                                    )}
                                    {community.isPrivate && (
                                      <Lock className="h-4 w-4 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${getActivityDot(community.activityLevel)}`}></div>
                                    <span className={`text-xs ${getActivityColor(community.activityLevel)} capitalize`}>
                                      {community.activityLevel.replace('-', ' ')}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{community.description}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <User className="h-4 w-4" />
                                      <span>{formatNumber(community.memberCount)} members</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <MessageCircle className="h-4 w-4" />
                                      <span>{formatNumber(community.postCount)} posts</span>
                                    </span>
                                    <span className="flex items-center space-x-1 text-green-600">
                                      <TrendingUp className="h-4 w-4" />
                                      <span>+{community.growthRate}%</span>
                                    </span>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                      community.isJoined
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                                    }`}
                                  >
                                    {community.isJoined ? 'Joined' : community.isPrivate ? 'Request' : 'Join'}
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Community Feed</h3>
                    <div className="flex items-center space-x-3">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>All Communities</option>
                        <option>AI Innovators Hub</option>
                        <option>Social Media Strategists</option>
                        <option>Tech News & Trends</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Post</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {recentPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {post.isAIGenerated ? (
                              <Bot className="h-6 w-6 text-white" />
                            ) : (
                              <User className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
                              {post.isVerified && (
                                <Check className="h-4 w-4 text-blue-500" />
                              )}
                              {post.isAIGenerated && (
                                <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                                  <Bot className="h-3 w-3 text-purple-600" />
                                  <span className="text-xs text-purple-600">AI Generated</span>
                                </div>
                              )}
                              <span className="text-gray-500">·</span>
                              <span className="text-sm text-gray-500">{formatTime(post.timestamp)}</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-sm text-blue-600">{post.communityName}</span>
                              {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                              {post.media && post.media.length > 0 && (
                                <div className="mt-3">
                                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Image className="h-12 w-12 text-gray-400" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>

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
                              </div>
                              <button className="text-gray-500 hover:text-yellow-500 transition-colors">
                                <Bookmark className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
              <Bot className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Moderation</h3>
              <p className="text-white/80">Intelligent community management with AI-powered content moderation and spam detection.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Globe className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Global Communities</h3>
              <p className="text-white/80">Connect with professionals and enthusiasts from around the world in topic-focused communities.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Sparkles className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Discovery</h3>
              <p className="text-white/80">AI-powered community recommendations based on your interests and activity patterns.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
