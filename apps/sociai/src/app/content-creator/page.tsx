'use client';

import { useState } from 'react';
import { 
  Edit3, Plus, Sparkles, Wand2, Image, Video, FileText, Mic,
  Calendar, Clock, Target, Hash, AtSign, Globe, Lock, Eye,
  Save, Download, Share2, Copy, Trash2, MoreHorizontal,
  Play, Pause, Square, RotateCcw, Volume2, VolumeX,
  Palette, Type, Layout, Filter, Adjust, Crop, Move,
  Layers, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, List, Link, Quote, Code, Heading, Smile,
  Camera, Upload, FolderOpen, Search, Star, Heart,
  MessageCircle, TrendingUp, Users, Bot, Brain, Lightbulb,
  Zap, CheckCircle, XCircle, AlertCircle, Info, Settings,
  RefreshCw, ChevronDown, ChevronRight, ArrowRight, Send,
  Bookmark, Flag, Award, Crown, Shield, Activity, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  type: 'post' | 'story' | 'reel' | 'carousel' | 'video';
  platform: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  aiGenerated: boolean;
  popularity: number;
}

interface ContentDraft {
  id: string;
  title: string;
  content: string;
  type: 'post' | 'story' | 'reel' | 'carousel' | 'video';
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledFor?: Date;
  media: Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
    duration?: number;
  }>;
  hashtags: string[];
  mentions: string[];
  aiAssisted: boolean;
  lastModified: Date;
  performance?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'text' | 'image' | 'video' | 'audio' | 'hashtags' | 'scheduling';
  isPremium: boolean;
  usageCount: number;
  maxUsage: number;
}

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  type: string;
  platform: string;
  estimatedEngagement: number;
  trendingScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToCreate: number;
  keywords: string[];
}

export default function ContentCreatorPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'post' | 'story' | 'reel' | 'carousel' | 'video'>('post');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', icon: '📷' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '👥' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500', icon: '📺' }
  ];

  const contentTypes = [
    { id: 'post', name: 'Post', icon: FileText, description: 'Standard social media post' },
    { id: 'story', name: 'Story', icon: Clock, description: '24-hour ephemeral content' },
    { id: 'reel', name: 'Reel', icon: Video, description: 'Short-form video content' },
    { id: 'carousel', name: 'Carousel', icon: Layers, description: 'Multi-image post' },
    { id: 'video', name: 'Video', icon: Play, description: 'Long-form video content' }
  ];

  const templates: ContentTemplate[] = [
    {
      id: '1',
      name: 'AI Trend Analysis',
      description: 'Share insights about the latest AI trends and developments',
      category: 'Technology',
      thumbnail: '/api/placeholder/300/200',
      type: 'post',
      platform: ['linkedin', 'twitter'],
      tags: ['AI', 'Technology', 'Trends', 'Analysis'],
      difficulty: 'intermediate',
      estimatedTime: 15,
      aiGenerated: true,
      popularity: 94
    },
    {
      id: '2',
      name: 'Behind the Scenes',
      description: 'Show your work process and daily routine',
      category: 'Lifestyle',
      thumbnail: '/api/placeholder/300/200',
      type: 'story',
      platform: ['instagram', 'facebook'],
      tags: ['BTS', 'Lifestyle', 'Work', 'Process'],
      difficulty: 'beginner',
      estimatedTime: 10,
      aiGenerated: false,
      popularity: 87
    },
    {
      id: '3',
      name: 'Quick Tips Reel',
      description: 'Share actionable tips in a 30-second video format',
      category: 'Educational',
      thumbnail: '/api/placeholder/300/200',
      type: 'reel',
      platform: ['instagram', 'tiktok'],
      tags: ['Tips', 'Educational', 'Quick', 'Tutorial'],
      difficulty: 'intermediate',
      estimatedTime: 45,
      aiGenerated: true,
      popularity: 92
    },
    {
      id: '4',
      name: 'Product Showcase',
      description: 'Highlight features and benefits of your product',
      category: 'Business',
      thumbnail: '/api/placeholder/300/200',
      type: 'carousel',
      platform: ['instagram', 'facebook', 'linkedin'],
      tags: ['Product', 'Business', 'Features', 'Benefits'],
      difficulty: 'advanced',
      estimatedTime: 30,
      aiGenerated: false,
      popularity: 89
    },
    {
      id: '5',
      name: 'Motivational Quote',
      description: 'Inspiring quotes with beautiful visuals',
      category: 'Inspiration',
      thumbnail: '/api/placeholder/300/200',
      type: 'post',
      platform: ['instagram', 'facebook', 'twitter'],
      tags: ['Motivation', 'Quotes', 'Inspiration', 'Mindset'],
      difficulty: 'beginner',
      estimatedTime: 5,
      aiGenerated: true,
      popularity: 85
    },
    {
      id: '6',
      name: 'Tutorial Video',
      description: 'Step-by-step instructional content',
      category: 'Educational',
      thumbnail: '/api/placeholder/300/200',
      type: 'video',
      platform: ['youtube', 'linkedin'],
      tags: ['Tutorial', 'Education', 'How-to', 'Learning'],
      difficulty: 'advanced',
      estimatedTime: 120,
      aiGenerated: false,
      popularity: 91
    }
  ];

  const drafts: ContentDraft[] = [
    {
      id: '1',
      title: 'The Future of AI in Social Media',
      content: 'Artificial Intelligence is revolutionizing how we create, curate, and consume social media content. From personalized feeds to automated content generation, AI is reshaping the digital landscape...',
      type: 'post',
      platforms: ['linkedin', 'twitter'],
      status: 'draft',
      media: [
        {
          id: 'm1',
          type: 'image',
          url: '/api/placeholder/600/400',
          thumbnail: '/api/placeholder/150/150'
        }
      ],
      hashtags: ['#AI', '#SocialMedia', '#Technology', '#Future', '#Innovation'],
      mentions: ['@tech_leader', '@ai_expert'],
      aiAssisted: true,
      lastModified: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      title: 'Quick Social Media Tips',
      content: 'Boost your engagement with these 5 proven strategies...',
      type: 'reel',
      platforms: ['instagram', 'tiktok'],
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 86400000),
      media: [
        {
          id: 'm2',
          type: 'video',
          url: '/api/placeholder/video.mp4',
          thumbnail: '/api/placeholder/300/300',
          duration: 30
        }
      ],
      hashtags: ['#SocialMediaTips', '#ContentCreator', '#Marketing'],
      mentions: [],
      aiAssisted: true,
      lastModified: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      title: 'Product Launch Announcement',
      content: 'Excited to announce our latest innovation that will change how you think about...',
      type: 'carousel',
      platforms: ['instagram', 'facebook', 'linkedin'],
      status: 'published',
      media: [
        {
          id: 'm3',
          type: 'image',
          url: '/api/placeholder/600/600',
          thumbnail: '/api/placeholder/150/150'
        },
        {
          id: 'm4',
          type: 'image',
          url: '/api/placeholder/600/600',
          thumbnail: '/api/placeholder/150/150'
        }
      ],
      hashtags: ['#ProductLaunch', '#Innovation', '#NewProduct'],
      mentions: ['@company_ceo'],
      aiAssisted: false,
      lastModified: new Date(Date.now() - 14400000),
      performance: {
        views: 12400,
        likes: 890,
        comments: 67,
        shares: 156
      }
    }
  ];

  const aiTools: AITool[] = [
    {
      id: '1',
      name: 'Content Generator',
      description: 'Generate engaging content using AI based on your topic and audience',
      icon: <Wand2 className="h-5 w-5" />,
      category: 'text',
      isPremium: false,
      usageCount: 23,
      maxUsage: 50
    },
    {
      id: '2',
      name: 'Image Creator',
      description: 'Create stunning visuals and graphics with AI assistance',
      icon: <Image className="h-5 w-5" />,
      category: 'image',
      isPremium: true,
      usageCount: 8,
      maxUsage: 20
    },
    {
      id: '3',
      name: 'Hashtag Optimizer',
      description: 'Find the best hashtags for maximum reach and engagement',
      icon: <Hash className="h-5 w-5" />,
      category: 'hashtags',
      isPremium: false,
      usageCount: 15,
      maxUsage: 100
    },
    {
      id: '4',
      name: 'Voice Narrator',
      description: 'Convert text to natural-sounding voice narration',
      icon: <Mic className="h-5 w-5" />,
      category: 'audio',
      isPremium: true,
      usageCount: 5,
      maxUsage: 15
    },
    {
      id: '5',
      name: 'Video Editor',
      description: 'Edit and enhance videos with AI-powered tools',
      icon: <Video className="h-5 w-5" />,
      category: 'video',
      isPremium: true,
      usageCount: 12,
      maxUsage: 25
    },
    {
      id: '6',
      name: 'Smart Scheduler',
      description: 'Find optimal posting times using AI analysis',
      icon: <Calendar className="h-5 w-5" />,
      category: 'scheduling',
      isPremium: false,
      usageCount: 7,
      maxUsage: 30
    }
  ];

  const contentIdeas: ContentIdea[] = [
    {
      id: '1',
      title: 'AI Tools Comparison Post',
      description: 'Compare popular AI tools and their use cases',
      type: 'Carousel Post',
      platform: 'LinkedIn',
      estimatedEngagement: 87,
      trendingScore: 94,
      difficulty: 'medium',
      timeToCreate: 25,
      keywords: ['AI tools', 'comparison', 'productivity', 'technology']
    },
    {
      id: '2',
      title: 'Day in the Life Reel',
      description: 'Show your typical workday as a content creator',
      type: 'Reel',
      platform: 'Instagram',
      estimatedEngagement: 92,
      trendingScore: 89,
      difficulty: 'easy',
      timeToCreate: 30,
      keywords: ['lifestyle', 'creator', 'routine', 'productivity']
    },
    {
      id: '3',
      title: 'Industry Trend Analysis',
      description: 'Break down the latest trends in your industry',
      type: 'Video',
      platform: 'YouTube',
      estimatedEngagement: 78,
      trendingScore: 96,
      difficulty: 'hard',
      timeToCreate: 90,
      keywords: ['trends', 'analysis', 'industry', 'insights']
    }
  ];

  const tabs = [
    { id: 'create', label: 'Create Content', icon: Edit3 },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'drafts', label: 'My Drafts', icon: FileText },
    { id: 'ai-tools', label: 'AI Tools', icon: Bot },
    { id: 'ideas', label: 'Content Ideas', icon: Lightbulb },
    { id: 'library', label: 'Media Library', icon: FolderOpen }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'published': return 'text-green-600 bg-green-100';
      case 'archived': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleContentGeneration = async () => {
    setIsGenerating(true);
    // Simulate AI content generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Edit3 className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Content Creator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/80">
                <div className="text-center">
                  <div className="text-lg font-semibold">{drafts.length}</div>
                  <div className="text-xs">Active Drafts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{templates.length}</div>
                  <div className="text-xs">Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{aiTools.length}</div>
                  <div className="text-xs">AI Tools</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContentGeneration}
                disabled={isGenerating}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
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
              {activeTab === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Content Type Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Content Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {contentTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <motion.button
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setContentType(type.id as any)}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              contentType === type.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="h-8 w-8 mx-auto mb-2" />
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platforms</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {platforms.map((platform) => (
                        <motion.button
                          key={platform.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (selectedPlatforms.includes(platform.id)) {
                              setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                            } else {
                              setSelectedPlatforms([...selectedPlatforms, platform.id]);
                            }
                          }}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            selectedPlatforms.includes(platform.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{platform.icon}</div>
                          <div className="text-sm font-medium">{platform.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Content Editor</h3>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Bold className="h-4 w-4" />
                            </button>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Italic className="h-4 w-4" />
                            </button>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Link className="h-4 w-4" />
                            </button>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Smile className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          placeholder="Start creating your content..."
                          className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Image className="h-4 w-4" />
                              <span>Add Media</span>
                            </button>
                            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Hash className="h-4 w-4" />
                              <span>Hashtags</span>
                            </button>
                          </div>
                          <div className="text-sm text-gray-500">0 / 2200 characters</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* AI Assistant */}
                      {showAIAssistant && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-purple-50 border border-purple-200 rounded-lg p-6"
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <Bot className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-700">AI Assistant</h4>
                          </div>
                          <div className="space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium text-gray-900">Generate Ideas</div>
                              <div className="text-sm text-gray-600">Get AI-powered content suggestions</div>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium text-gray-900">Optimize Text</div>
                              <div className="text-sm text-gray-600">Improve clarity and engagement</div>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium text-gray-900">Find Hashtags</div>
                              <div className="text-sm text-gray-600">Discover trending hashtags</div>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Publishing Options */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Publishing Options</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Publishing Schedule
                            </label>
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                              <option>Publish Now</option>
                              <option>Schedule for Later</option>
                              <option>Save as Draft</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="auto-optimize" className="rounded" />
                            <label htmlFor="auto-optimize" className="text-sm text-gray-700">
                              Auto-optimize for each platform
                            </label>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>Publish Content</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Content Templates</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search templates..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select className="border border-gray-300 rounded-lg px-3 py-2">
                        <option>All Categories</option>
                        <option>Technology</option>
                        <option>Business</option>
                        <option>Lifestyle</option>
                        <option>Educational</option>
                        <option>Inspiration</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                          <div className="absolute top-3 left-3 flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                              {template.difficulty}
                            </span>
                            {template.aiGenerated && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                AI Generated
                              </span>
                            )}
                          </div>
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center space-x-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span className="text-white text-xs">{template.popularity}</span>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex flex-wrap gap-1">
                              {template.platform.slice(0, 3).map((platform, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(template.estimatedTime)}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                              Use Template
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'drafts' && (
                <motion.div
                  key="drafts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">My Drafts</h3>
                    <div className="flex items-center space-x-2">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>All Statuses</option>
                        <option>Draft</option>
                        <option>Scheduled</option>
                        <option>Published</option>
                      </select>
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Sort by Date</option>
                        <option>Sort by Performance</option>
                        <option>Sort by Platform</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {drafts.map((draft, index) => (
                      <motion.div
                        key={draft.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{draft.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(draft.status)}`}>
                                {draft.status}
                              </span>
                              {draft.aiAssisted && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  AI Assisted
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{draft.content}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="capitalize">{draft.type}</span>
                              <span>{draft.platforms.join(', ')}</span>
                              <span>Modified {new Date(draft.lastModified).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Copy className="h-4 w-4" />
                            </motion.button>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {draft.performance && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Performance</h5>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(draft.performance.views)}
                                </div>
                                <div className="text-xs text-gray-500">Views</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(draft.performance.likes)}
                                </div>
                                <div className="text-xs text-gray-500">Likes</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(draft.performance.comments)}
                                </div>
                                <div className="text-xs text-gray-500">Comments</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(draft.performance.shares)}
                                </div>
                                <div className="text-xs text-gray-500">Shares</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai-tools' && (
                <motion.div
                  key="ai-tools"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bot className="h-6 w-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">AI-Powered Tools</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      Upgrade to Premium
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white">
                              {tool.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                              {tool.isPremium && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{tool.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Usage</span>
                            <span>{tool.usageCount} / {tool.maxUsage}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                              style={{ width: `${(tool.usageCount / tool.maxUsage) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={tool.isPremium && tool.usageCount >= tool.maxUsage}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            tool.isPremium && tool.usageCount >= tool.maxUsage
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                          }`}
                        >
                          {tool.isPremium && tool.usageCount >= tool.maxUsage ? 'Upgrade Required' : 'Use Tool'}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'ideas' && (
                <motion.div
                  key="ideas"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-900">AI Content Ideas</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Generate New Ideas</span>
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {contentIdeas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{idea.title}</h4>
                            <p className="text-gray-600 mb-3">{idea.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {idea.keywords.map((keyword, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                              Create Content
                            </motion.button>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              <Bookmark className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {idea.estimatedEngagement}%
                            </div>
                            <div className="text-gray-500">Est. Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">
                              {idea.trendingScore}
                            </div>
                            <div className="text-gray-500">Trending Score</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${
                              idea.difficulty === 'easy' ? 'text-green-600' :
                              idea.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {idea.difficulty}
                            </div>
                            <div className="text-gray-500">Difficulty</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {idea.timeToCreate}m
                            </div>
                            <div className="text-gray-500">Time to Create</div>
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
              <Sparkles className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Creation</h3>
              <p className="text-white/80">Generate engaging content with advanced AI tools and templates designed for maximum impact.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Edit3 className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Platform Publishing</h3>
              <p className="text-white/80">Create once and optimize automatically for all your social media platforms with smart formatting.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Brain className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Content Strategy</h3>
              <p className="text-white/80">Get AI-driven insights and recommendations to optimize your content strategy and engagement.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
