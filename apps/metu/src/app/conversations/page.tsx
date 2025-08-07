'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  Download,
  Share2,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Bot,
  Star,
  Heart,
  Bookmark,
  Archive,
  Trash2,
  Edit,
  Copy,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Zap,
  TrendingUp,
  Activity,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Headphones,
  Radio,
  Waves,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Tag,
  FolderOpen,
  FileText,
  MessageCircle,
  Send,
  Paperclip,
  Smile
} from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  duration: string;
  messageCount: number;
  participants: string[];
  status: 'completed' | 'ongoing' | 'paused' | 'interrupted';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  category: 'productivity' | 'creative' | 'support' | 'casual' | 'business';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  starred: boolean;
  bookmarked: boolean;
  tags: string[];
  transcriptLength: number;
  audioSize: string;
}

interface Message {
  id: string;
  content: string;
  speaker: 'user' | 'assistant';
  timestamp: string;
  duration?: string;
  confidence?: number;
  emotion?: string;
  keywords?: string[];
}

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const conversations: Conversation[] = [
    {
      id: '1',
      title: 'Project Planning Discussion',
      summary: 'Detailed discussion about Q3 project roadmap, resource allocation, and timeline planning with focus on deliverables.',
      timestamp: '2 hours ago',
      duration: '15m 32s',
      messageCount: 42,
      participants: ['Sarah Johnson', 'METU AI'],
      status: 'completed',
      quality: 'excellent',
      category: 'business',
      deviceType: 'desktop',
      starred: true,
      bookmarked: false,
      tags: ['project', 'planning', 'roadmap', 'Q3'],
      transcriptLength: 2847,
      audioSize: '12.4 MB'
    },
    {
      id: '2',
      title: 'Creative Writing Session',
      summary: 'Brainstorming session for creative content ideas, story development, and character creation for upcoming novel.',
      timestamp: '5 hours ago',
      duration: '23m 18s',
      messageCount: 67,
      participants: ['Michael Chen', 'METU AI'],
      status: 'completed',
      quality: 'excellent',
      category: 'creative',
      deviceType: 'tablet',
      starred: false,
      bookmarked: true,
      tags: ['creative', 'writing', 'brainstorm', 'novel'],
      transcriptLength: 4231,
      audioSize: '18.7 MB'
    },
    {
      id: '3',
      title: 'Daily Productivity Check',
      summary: 'Quick daily review of tasks, priorities, and productivity optimization suggestions for better workflow management.',
      timestamp: '1 day ago',
      duration: '8m 45s',
      messageCount: 28,
      participants: ['Emma Wilson', 'METU AI'],
      status: 'completed',
      quality: 'good',
      category: 'productivity',
      deviceType: 'mobile',
      starred: false,
      bookmarked: false,
      tags: ['daily', 'productivity', 'tasks', 'workflow'],
      transcriptLength: 1562,
      audioSize: '7.2 MB'
    },
    {
      id: '4',
      title: 'Technical Support Session',
      summary: 'Troubleshooting audio configuration issues and optimizing voice recognition settings for better performance.',
      timestamp: '2 days ago',
      duration: '12m 07s',
      messageCount: 34,
      participants: ['David Rodriguez', 'METU AI'],
      status: 'completed',
      quality: 'good',
      category: 'support',
      deviceType: 'desktop',
      starred: false,
      bookmarked: false,
      tags: ['support', 'audio', 'configuration', 'troubleshooting'],
      transcriptLength: 2154,
      audioSize: '9.8 MB'
    },
    {
      id: '5',
      title: 'Casual Conversation',
      summary: 'Friendly chat about current events, weather, and general life updates with casual back-and-forth dialogue.',
      timestamp: '3 days ago',
      duration: '18m 52s',
      messageCount: 56,
      participants: ['Lisa Thompson', 'METU AI'],
      status: 'completed',
      quality: 'fair',
      category: 'casual',
      deviceType: 'mobile',
      starred: false,
      bookmarked: false,
      tags: ['casual', 'chat', 'general', 'friendly'],
      transcriptLength: 3421,
      audioSize: '15.1 MB'
    },
    {
      id: '6',
      title: 'Strategy Consultation',
      summary: 'In-depth business strategy discussion covering market analysis, competitive landscape, and growth opportunities.',
      timestamp: '1 week ago',
      duration: '31m 26s',
      messageCount: 89,
      participants: ['Alex Kim', 'METU AI'],
      status: 'completed',
      quality: 'excellent',
      category: 'business',
      deviceType: 'desktop',
      starred: true,
      bookmarked: true,
      tags: ['strategy', 'business', 'market', 'analysis', 'growth'],
      transcriptLength: 5647,
      audioSize: '25.3 MB'
    }
  ];

  const sampleMessages: Message[] = [
    {
      id: '1',
      content: "Hi METU, I'd like to discuss our Q3 project roadmap and get some insights on resource allocation.",
      speaker: 'user',
      timestamp: '14:32',
      duration: '4.2s',
      confidence: 96.5,
      emotion: 'neutral',
      keywords: ['Q3', 'project', 'roadmap', 'resource allocation']
    },
    {
      id: '2',
      content: "I'd be happy to help you plan your Q3 roadmap! Let's start by reviewing your current project portfolio and identifying key priorities. What are your main objectives for this quarter?",
      speaker: 'assistant',
      timestamp: '14:32',
      duration: '8.7s',
      confidence: 98.2,
      emotion: 'helpful',
      keywords: ['planning', 'priorities', 'objectives', 'quarter']
    },
    {
      id: '3',
      content: "Our main goals are to launch the new product feature, expand our user base by 25%, and improve customer satisfaction scores.",
      speaker: 'user',
      timestamp: '14:33',
      duration: '6.1s',
      confidence: 94.8,
      emotion: 'focused',
      keywords: ['product feature', 'user base', '25%', 'customer satisfaction']
    },
    {
      id: '4',
      content: "Excellent goals! For the product feature launch, I recommend breaking it down into development phases. For the 25% user growth, we should analyze your current acquisition channels and identify optimization opportunities. What's your current customer satisfaction baseline?",
      speaker: 'assistant',
      timestamp: '14:33',
      duration: '12.3s',
      confidence: 97.9,
      emotion: 'analytical',
      keywords: ['development phases', 'acquisition channels', 'optimization', 'baseline']
    }
  ];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'ongoing': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'interrupted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'text-blue-600 bg-blue-100';
      case 'creative': return 'text-purple-600 bg-purple-100';
      case 'support': return 'text-orange-600 bg-orange-100';
      case 'casual': return 'text-green-600 bg-green-100';
      case 'business': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || conversation.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || conversation.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Voice Conversations
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and review your voice interaction history
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Dashboard', href: '/metu', current: false },
              { name: 'Conversations', href: '/metu/conversations', current: true },
              { name: 'Training', href: '/metu/training', current: false },
              { name: 'Analytics', href: '/metu/analytics', current: false },
              { name: 'Personality', href: '/metu/personality', current: false },
              { name: 'Integrations', href: '/metu/integrations', current: false },
              { name: 'Settings', href: '/metu/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Categories</option>
                <option value="productivity">Productivity</option>
                <option value="creative">Creative</option>
                <option value="support">Support</option>
                <option value="casual">Casual</option>
                <option value="business">Business</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="paused">Paused</option>
                <option value="interrupted">Interrupted</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              >
                <option value="recent">Most Recent</option>
                <option value="duration">Longest Duration</option>
                <option value="quality">Best Quality</option>
                <option value="messages">Most Messages</option>
              </select>

              <div className="flex border border-gray-200 rounded-lg bg-white/50">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-blue-600">{filteredConversations.length}</div>
              <div className="text-sm text-gray-600">Total Conversations</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-green-600">
                {filteredConversations.reduce((total, conv) => total + conv.messageCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Messages</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(filteredConversations.reduce((total, conv) => total + parseInt(conv.duration.split('m')[0]), 0) / filteredConversations.length)}m
              </div>
              <div className="text-sm text-gray-600">Avg Duration</div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg border border-blue-50">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((filteredConversations.filter(c => c.quality === 'excellent').length / filteredConversations.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Excellent Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Conversations List/Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conversations Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Conversation History</span>
                </h2>
                <span className="text-sm text-gray-500">{filteredConversations.length} conversations</span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                      selectedConversation === conversation.id
                        ? 'bg-blue-50 border-blue-200 shadow-md'
                        : 'bg-white/50 border-blue-50 hover:bg-blue-25 hover:border-blue-100'
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{conversation.title}</h3>
                          {conversation.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          {conversation.bookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{conversation.summary}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(conversation.deviceType)}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">{conversation.timestamp}</span>
                        <span className="font-medium text-gray-700">{conversation.duration}</span>
                        <span className="text-gray-500">{conversation.messageCount} messages</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(conversation.category)}`}>
                          {conversation.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(conversation.quality)}`}>
                          {conversation.quality}
                        </span>
                      </div>
                    </div>

                    {conversation.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {conversation.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {conversation.tags.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{conversation.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Conversation Details Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            {selectedConversationData ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Conversation Details</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Conversation Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedConversationData.title}</h3>
                    <p className="text-sm text-gray-600">{selectedConversationData.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Duration:</span>
                      <br />
                      {selectedConversationData.duration}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Messages:</span>
                      <br />
                      {selectedConversationData.messageCount}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Quality:</span>
                      <br />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(selectedConversationData.quality)}`}>
                        {selectedConversationData.quality}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <br />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedConversationData.category)}`}>
                        {selectedConversationData.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Participants:</span>
                    <div className="mt-1">
                      {selectedConversationData.participants.map((participant, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mr-2">
                          {participant === 'METU AI' ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">File Info:</span>
                    <div className="mt-1 text-sm text-gray-600">
                      <div>Transcript: {selectedConversationData.transcriptLength.toLocaleString()} words</div>
                      <div>Audio: {selectedConversationData.audioSize}</div>
                    </div>
                  </div>
                </div>

                {/* Sample Messages */}
                <div className="border-t border-blue-100 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Message Preview</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sampleMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.speaker === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p>{message.content}</p>
                          <div className="mt-1 flex items-center justify-between text-xs opacity-70">
                            <span>{message.timestamp}</span>
                            {message.confidence && (
                              <span>{message.confidence}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-blue-100 pt-6 mt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
                      View Full Transcript
                    </button>
                    <button className="bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium">
                      Export Audio
                    </button>
                    <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200 text-sm font-medium">
                      Add Tags
                    </button>
                    <button className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors duration-200 text-sm font-medium">
                      Share Link
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to view details, transcript, and audio options.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modern Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">METU Conversations</h3>
              <p className="text-blue-200 mb-6 max-w-md">
                Explore and manage your complete voice conversation history. 
                Review transcripts, analyze patterns, and gain insights from your AI interactions.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Clock className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Conversation Features</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Full Transcripts</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Audio Playback</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Smart Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Export Options</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Analysis Tools</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Quality Metrics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Topic Tagging</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Sentiment Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Usage Patterns</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 METU Conversations. Your voice interaction history, organized and accessible.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                💬 {filteredConversations.length} Conversations Available
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
