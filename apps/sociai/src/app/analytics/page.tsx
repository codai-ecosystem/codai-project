'use client';

import { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Share2,
  Calendar, Clock, Target, Zap, Bot, Star, Award, Globe,
  Filter, Download, RefreshCw, Settings, ArrowUp, ArrowDown,
  ChevronRight, ChevronLeft, Play, Pause, MoreHorizontal,
  PieChart, Activity, Bookmark, Hash, Image, Video, Link,
  UserPlus, UserMinus, Repeat, Volume2, Flag, Search,
  Sparkles, Brain, Lightbulb, AlertCircle, CheckCircle,
  XCircle, Clock3, Calendar as CalendarIcon, Sun, Moon,
  Smartphone, Monitor, Tablet, MapPin, DollarSign, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'percentage' | 'currency' | 'time';
  description: string;
}

interface PerformanceData {
  date: string;
  impressions: number;
  engagement: number;
  reach: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  followers: number;
}

interface ContentAnalytics {
  id: string;
  type: 'post' | 'story' | 'reel' | 'live';
  content: string;
  platform: string;
  publishedAt: string;
  metrics: {
    impressions: number;
    reach: number;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
  };
  audience: {
    ageGroups: Array<{ range: string; percentage: number }>;
    genderSplit: { male: number; female: number; other: number };
    topLocations: Array<{ location: string; percentage: number }>;
    devices: Array<{ device: string; percentage: number }>;
  };
  aiInsights: Array<{
    type: 'optimization' | 'trend' | 'timing' | 'audience';
    insight: string;
    confidence: number;
  }>;
}

interface AIRecommendation {
  id: string;
  type: 'content' | 'timing' | 'audience' | 'hashtags' | 'engagement';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  estimatedImprovement: number;
}

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [isRealTime, setIsRealTime] = useState(false);

  const timeRanges = [
    { id: '24h', label: '24 Hours', days: 1 },
    { id: '7d', label: '7 Days', days: 7 },
    { id: '30d', label: '30 Days', days: 30 },
    { id: '90d', label: '90 Days', days: 90 },
    { id: '1y', label: '1 Year', days: 365 },
    { id: 'custom', label: 'Custom', days: 0 }
  ];

  const platforms = [
    { id: 'all', name: 'All Platforms', color: 'bg-gray-500' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500' }
  ];

  const keyMetrics: AnalyticsMetric[] = [
    {
      id: 'total_reach',
      label: 'Total Reach',
      value: 147500,
      previousValue: 132800,
      change: 11.1,
      changeType: 'increase',
      format: 'number',
      description: 'Unique accounts reached across all platforms'
    },
    {
      id: 'engagement_rate',
      label: 'Engagement Rate',
      value: 8.7,
      previousValue: 7.9,
      change: 10.1,
      changeType: 'increase',
      format: 'percentage',
      description: 'Average engagement rate across all content'
    },
    {
      id: 'follower_growth',
      label: 'Follower Growth',
      value: 3.2,
      previousValue: 2.1,
      change: 52.4,
      changeType: 'increase',
      format: 'percentage',
      description: 'Weekly follower growth rate'
    },
    {
      id: 'ai_usage_score',
      label: 'AI Usage Score',
      value: 94.5,
      previousValue: 89.2,
      change: 5.9,
      changeType: 'increase',
      format: 'number',
      description: 'AI assistant utilization effectiveness'
    },
    {
      id: 'content_performance',
      label: 'Content Performance',
      value: 76.8,
      previousValue: 71.3,
      change: 7.7,
      changeType: 'increase',
      format: 'number',
      description: 'Overall content performance score'
    },
    {
      id: 'response_time',
      label: 'Avg Response Time',
      value: 2.3,
      previousValue: 3.1,
      change: -25.8,
      changeType: 'increase',
      format: 'time',
      description: 'Average response time to messages/comments'
    }
  ];

  const performanceData: PerformanceData[] = [
    { date: '2025-08-01', impressions: 45200, engagement: 3920, reach: 38400, clicks: 1240, shares: 189, comments: 156, likes: 2890, followers: 12847 },
    { date: '2025-08-02', impressions: 52100, engagement: 4580, reach: 42100, clicks: 1450, shares: 234, comments: 189, likes: 3420, followers: 12889 },
    { date: '2025-08-03', impressions: 48900, engagement: 4210, reach: 39800, clicks: 1320, shares: 198, comments: 167, likes: 3180, followers: 12923 },
    { date: '2025-08-04', impressions: 61300, engagement: 5670, reach: 48200, clicks: 1780, shares: 289, comments: 234, likes: 4120, followers: 12987 },
    { date: '2025-08-05', impressions: 58700, engagement: 5240, reach: 45600, clicks: 1690, shares: 267, comments: 212, likes: 3890, followers: 13034 },
    { date: '2025-08-06', impressions: 64500, engagement: 6120, reach: 51200, clicks: 1920, shares: 312, comments: 278, likes: 4520, followers: 13098 },
    { date: '2025-08-07', impressions: 59800, engagement: 5680, reach: 47900, clicks: 1780, shares: 289, comments: 245, likes: 4230, followers: 13156 }
  ];

  const topContent: ContentAnalytics[] = [
    {
      id: '1',
      type: 'post',
      content: 'The future of AI in social media: 5 trends that will shape 2025 and beyond. From personalized content curation to real-time sentiment analysis.',
      platform: 'LinkedIn',
      publishedAt: '2025-08-06T14:30:00Z',
      metrics: {
        impressions: 12400,
        reach: 9800,
        engagement: 1240,
        likes: 890,
        comments: 67,
        shares: 156,
        saves: 234,
        clicks: 345
      },
      audience: {
        ageGroups: [
          { range: '18-24', percentage: 15 },
          { range: '25-34', percentage: 42 },
          { range: '35-44', percentage: 28 },
          { range: '45-54', percentage: 12 },
          { range: '55+', percentage: 3 }
        ],
        genderSplit: { male: 58, female: 40, other: 2 },
        topLocations: [
          { location: 'United States', percentage: 34 },
          { location: 'United Kingdom', percentage: 18 },
          { location: 'Canada', percentage: 12 },
          { location: 'Germany', percentage: 9 },
          { location: 'Australia', percentage: 7 }
        ],
        devices: [
          { device: 'Mobile', percentage: 67 },
          { device: 'Desktop', percentage: 28 },
          { device: 'Tablet', percentage: 5 }
        ]
      },
      aiInsights: [
        {
          type: 'optimization',
          insight: 'Adding 2-3 relevant hashtags could increase reach by 15-20%',
          confidence: 87
        },
        {
          type: 'timing',
          insight: 'Posting 2 hours earlier would reach 23% more of your audience',
          confidence: 92
        },
        {
          type: 'audience',
          insight: 'Content resonates strongly with 25-34 demographic',
          confidence: 95
        }
      ]
    },
    {
      id: '2',
      type: 'reel',
      content: 'Quick tutorial: How to use AI to optimize your social media strategy in under 60 seconds',
      platform: 'Instagram',
      publishedAt: '2025-08-05T18:45:00Z',
      metrics: {
        impressions: 28900,
        reach: 23400,
        engagement: 2890,
        likes: 2340,
        comments: 189,
        shares: 234,
        saves: 567,
        clicks: 123
      },
      audience: {
        ageGroups: [
          { range: '18-24', percentage: 32 },
          { range: '25-34', percentage: 38 },
          { range: '35-44', percentage: 20 },
          { range: '45-54', percentage: 8 },
          { range: '55+', percentage: 2 }
        ],
        genderSplit: { male: 45, female: 52, other: 3 },
        topLocations: [
          { location: 'United States', percentage: 28 },
          { location: 'Brazil', percentage: 15 },
          { location: 'India', percentage: 12 },
          { location: 'United Kingdom', percentage: 10 },
          { location: 'Mexico', percentage: 8 }
        ],
        devices: [
          { device: 'Mobile', percentage: 89 },
          { device: 'Desktop', percentage: 8 },
          { device: 'Tablet', percentage: 3 }
        ]
      },
      aiInsights: [
        {
          type: 'content',
          insight: 'Tutorial format performs 340% better than regular posts',
          confidence: 96
        },
        {
          type: 'trend',
          insight: 'Short-form educational content is trending upward',
          confidence: 91
        }
      ]
    }
  ];

  const aiRecommendations: AIRecommendation[] = [
    {
      id: '1',
      type: 'timing',
      title: 'Optimal Posting Schedule',
      description: 'Post between 2-4 PM on weekdays for 28% higher engagement',
      impact: 'high',
      confidence: 94,
      actionable: true,
      estimatedImprovement: 28
    },
    {
      id: '2',
      type: 'content',
      title: 'Video Content Strategy',
      description: 'Increase video content by 40% - your audience engages 3x more with videos',
      impact: 'high',
      confidence: 89,
      actionable: true,
      estimatedImprovement: 45
    },
    {
      id: '3',
      type: 'hashtags',
      title: 'Hashtag Optimization',
      description: 'Use 5-8 hashtags per post instead of 3-4 for broader reach',
      impact: 'medium',
      confidence: 82,
      actionable: true,
      estimatedImprovement: 18
    },
    {
      id: '4',
      type: 'audience',
      title: 'Audience Expansion',
      description: 'Target 25-34 age group more aggressively - showing highest engagement',
      impact: 'medium',
      confidence: 91,
      actionable: true,
      estimatedImprovement: 22
    },
    {
      id: '5',
      type: 'engagement',
      title: 'Response Strategy',
      description: 'Respond to comments within 2 hours to boost algorithmic visibility',
      impact: 'medium',
      confidence: 86,
      actionable: true,
      estimatedImprovement: 15
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'content', label: 'Content Analytics', icon: Image },
    { id: 'audience', label: 'Audience Insights', icon: Users },
    { id: 'ai-insights', label: 'AI Recommendations', icon: Brain },
    { id: 'competitors', label: 'Competitor Analysis', icon: Target },
    { id: 'reports', label: 'Reports', icon: Download }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'time':
        return `${value}h`;
      default:
        return formatNumber(value);
    }
  };

  const getChangeIcon = (changeType: string) => {
    return changeType === 'increase' ? 
      <ArrowUp className="h-4 w-4 text-green-600" /> : 
      <ArrowDown className="h-4 w-4 text-red-600" />;
  };

  const getChangeColor = (changeType: string) => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/80">
                <div className="text-center">
                  <div className="text-lg font-semibold">147.5K</div>
                  <div className="text-xs">Total Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">8.7%</div>
                  <div className="text-xs">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">94.5</div>
                  <div className="text-xs">AI Score</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsRealTime(!isRealTime)}
                  className={`px-3 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 ${
                    isRealTime ? 'bg-green-500' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
                  }`}
                >
                  {isRealTime ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isRealTime ? 'Live' : 'Refresh'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Controls */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeRanges.map((range) => (
                      <option key={range.id} value={range.id}>{range.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>{platform.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    showAIInsights ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Bot className="h-4 w-4" />
                  <span>AI Insights</span>
                </motion.button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

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
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Key Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {keyMetrics.map((metric, index) => (
                        <motion.div
                          key={metric.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                              <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatValue(metric.value, metric.format)}
                              </p>
                            </div>
                            <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                              {getChangeIcon(metric.changeType)}
                              <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">{metric.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              vs. previous {selectedTimeRange === '24h' ? 'day' : 'period'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Interactive Performance Chart</p>
                          <p className="text-sm text-gray-500">Showing {selectedTimeRange} performance data</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {platforms.filter(p => p.id !== 'all').map((platform, index) => (
                        <motion.div
                          key={platform.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                            <h4 className="font-medium text-gray-900">{platform.name}</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Reach</span>
                              <span className="font-medium">{formatNumber(Math.floor(Math.random() * 50000 + 10000))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Engagement</span>
                              <span className="font-medium">{(Math.random() * 5 + 2).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Growth</span>
                              <span className="font-medium text-green-600">+{(Math.random() * 10 + 2).toFixed(1)}%</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Content</h3>
                    <div className="flex items-center space-x-2">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Sort by Engagement</option>
                        <option>Sort by Reach</option>
                        <option>Sort by Impressions</option>
                        <option>Sort by Date</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {topContent.map((content, index) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            {content.type === 'post' && <Image className="h-8 w-8 text-white" />}
                            {content.type === 'reel' && <Video className="h-8 w-8 text-white" />}
                            {content.type === 'story' && <Clock3 className="h-8 w-8 text-white" />}
                            {content.type === 'live' && <Play className="h-8 w-8 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                {content.type}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {content.platform}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(content.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-3 line-clamp-2">{content.content}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(content.metrics.impressions)}
                                </div>
                                <div className="text-xs text-gray-500">Impressions</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(content.metrics.reach)}
                                </div>
                                <div className="text-xs text-gray-500">Reach</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatNumber(content.metrics.engagement)}
                                </div>
                                <div className="text-xs text-gray-500">Engagement</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {((content.metrics.engagement / content.metrics.impressions) * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Rate</div>
                              </div>
                            </div>

                            {showAIInsights && content.aiInsights.length > 0 && (
                              <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-700">AI Insights</span>
                                </div>
                                <div className="space-y-2">
                                  {content.aiInsights.map((insight, idx) => (
                                    <div key={idx} className="flex items-start space-x-2">
                                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                      <div className="flex-1">
                                        <p className="text-sm text-purple-700">{insight.insight}</p>
                                        <p className="text-xs text-purple-600">
                                          Confidence: {insight.confidence}%
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai-insights' && (
                <motion.div
                  key="ai-insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-6 w-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh Insights</span>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {aiRecommendations.map((recommendation, index) => (
                      <motion.div
                        key={recommendation.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {recommendation.type === 'content' && <Image className="h-5 w-5 text-blue-600" />}
                            {recommendation.type === 'timing' && <Clock className="h-5 w-5 text-green-600" />}
                            {recommendation.type === 'audience' && <Users className="h-5 w-5 text-purple-600" />}
                            {recommendation.type === 'hashtags' && <Hash className="h-5 w-5 text-orange-600" />}
                            {recommendation.type === 'engagement' && <Heart className="h-5 w-5 text-red-600" />}
                            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(recommendation.impact)}`}>
                              {recommendation.impact} impact
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{recommendation.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className={`text-lg font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                                {recommendation.confidence}%
                              </div>
                              <div className="text-xs text-gray-500">Confidence</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">
                                +{recommendation.estimatedImprovement}%
                              </div>
                              <div className="text-xs text-gray-500">Est. Improvement</div>
                            </div>
                          </div>
                        </div>

                        {recommendation.actionable && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                          >
                            <Zap className="h-4 w-4" />
                            <span>Apply Recommendation</span>
                          </motion.button>
                        )}
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
              <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-white/80">Get intelligent recommendations to optimize your social media performance and engagement.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <BarChart3 className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-white/80">Monitor your performance with live data and comprehensive reporting across all platforms.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Target className="h-8 w-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Performance Optimization</h3>
              <p className="text-white/80">Actionable insights and recommendations to improve your content strategy and audience engagement.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
