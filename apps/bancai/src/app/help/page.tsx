'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, HelpCircle, MessageCircle, Phone, Mail, Video,
  FileText, BookOpen, AlertCircle, CheckCircle, Clock,
  ChevronDown, ChevronRight, ExternalLink, User, ArrowRight,
  Lightbulb, Shield, CreditCard, Smartphone, Globe, Settings,
  Download, Star, Heart, Users, Zap, Target, TrendingUp,
  Filter, BarChart3, Activity, Award, DollarSign, Banknote,
  Calculator, RefreshCw, SortDesc, Layers, Bell, Database,
  Monitor, Palette, Key, Lock, Wifi, Edit, Plus, Minus,
  Play, Pause, Volume2, Headphones, Eye, EyeOff, Map,
  Navigation, Compass, Calendar, Archive, Folder, Tags,
  Bookmark, Share2, Copy, Link, QrCode, Camera, Mic,
  PresentationChart, LineChart, PieChart, Grid3X3, List,
  Table, Image, Film, Music, Code, Command, Terminal,
  Home, X
} from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  updated: string;
  views: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface HelpCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  articleCount: number;
  color: string;
  popularTopics: string[];
}

interface ContactOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  available: string;
  response: string;
  color: string;
  rating: number;
  waitTime: string;
}

interface HelpAnalytics {
  totalQuestions: number;
  resolvedToday: number;
  avgResponseTime: string;
  userSatisfaction: number;
  popularSearches: number;
  activeUsers: number;
}

export default function HelpPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterTags, setShowFilterTags] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Enhanced analytics state
  const [helpAnalytics, setHelpAnalytics] = useState<HelpAnalytics>({
    totalQuestions: 2847,
    resolvedToday: 156,
    avgResponseTime: '2.3 min',
    userSatisfaction: 4.8,
    popularSearches: 342,
    activeUsers: 89
  });

  // Update analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHelpAnalytics(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 20) + 80,
        resolvedToday: prev.resolvedToday + Math.floor(Math.random() * 3)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: Lightbulb,
      description: 'Basic setup and account creation',
      articleCount: 12,
      color: 'blue',
      popularTopics: ['Account Setup', 'First Login', 'Profile Creation']
    },
    {
      id: 'accounts',
      name: 'Accounts & Banking',
      icon: CreditCard,
      description: 'Managing your accounts and transactions',
      articleCount: 18,
      color: 'green',
      popularTopics: ['Account Types', 'Balance Inquiry', 'Transaction History']
    },
    {
      id: 'security',
      name: 'Security & Privacy',
      icon: Shield,
      description: 'Keeping your account safe and secure',
      articleCount: 15,
      color: 'red',
      popularTopics: ['2FA Setup', 'Password Reset', 'Fraud Protection']
    },
    {
      id: 'mobile',
      name: 'Mobile Banking',
      icon: Smartphone,
      description: 'Using our mobile app features',
      articleCount: 10,
      color: 'purple',
      popularTopics: ['App Download', 'Mobile Deposit', 'Notifications']
    },
    {
      id: 'payments',
      name: 'Payments & Transfers',
      icon: ArrowRight,
      description: 'Sending and receiving money',
      articleCount: 22,
      color: 'orange',
      popularTopics: ['Wire Transfer', 'Bill Pay', 'Peer-to-Peer']
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: TrendingUp,
      description: 'Investment accounts and portfolio management',
      articleCount: 14,
      color: 'indigo',
      popularTopics: ['Portfolio Management', 'Trading', 'Market Analysis']
    }
  ];

  const contactOptions: ContactOption[] = [
    {
      id: 'chat',
      name: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: MessageCircle,
      available: '24/7',
      response: 'Instant',
      color: 'blue',
      rating: 4.9,
      waitTime: '< 30 sec'
    },
    {
      id: 'phone',
      name: 'Phone Support',
      description: 'Speak directly with a banking specialist',
      icon: Phone,
      available: 'Mon-Fri 8AM-8PM EST',
      response: 'Immediate',
      color: 'green',
      rating: 4.7,
      waitTime: '2-5 min'
    },
    {
      id: 'email',
      name: 'Email Support',
      description: 'Send us a detailed message about your issue',
      icon: Mail,
      available: '24/7',
      response: '2-4 hours',
      color: 'orange',
      rating: 4.6,
      waitTime: '2-4 hrs'
    },
    {
      id: 'video',
      name: 'Video Call',
      description: 'Schedule a one-on-one video consultation',
      icon: Video,
      available: 'By appointment',
      response: 'Scheduled',
      color: 'purple',
      rating: 4.8,
      waitTime: 'Same day'
    }
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox. For security, password reset links expire after 24 hours.',
      category: 'security',
      tags: ['password', 'login', 'security'],
      helpful: 245,
      updated: '2025-01-15',
      views: 1520,
      difficulty: 'beginner'
    },
    {
      id: '2',
      question: 'What are the daily transfer limits?',
      answer: 'Daily transfer limits depend on your account type: Standard accounts have a $5,000 daily limit, Premium accounts have a $10,000 limit, and Business accounts have a $25,000 limit. You can view your specific limits in your account settings.',
      category: 'accounts',
      tags: ['transfer', 'limits', 'daily'],
      helpful: 189,
      updated: '2025-01-10',
      views: 980,
      difficulty: 'beginner'
    },
    {
      id: '3',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Settings > Security > Two-Factor Authentication. Choose between SMS or authenticator app. For SMS, enter your phone number and verify with the code sent. For authenticator apps, scan the QR code with your preferred app.',
      category: 'security',
      tags: ['2fa', 'security', 'authentication'],
      helpful: 167,
      updated: '2025-01-12',
      views: 756,
      difficulty: 'intermediate'
    },
    {
      id: '4',
      question: 'Can I deposit checks with my phone?',
      answer: 'Yes! Use our mobile app to deposit checks up to $5,000 per day. Simply take photos of both sides of your check, enter the amount, and submit. Funds are typically available within 1-2 business days.',
      category: 'mobile',
      tags: ['mobile', 'deposit', 'check'],
      helpful: 203,
      updated: '2025-01-08',
      views: 1234,
      difficulty: 'beginner'
    },
    {
      id: '5',
      question: 'How do I dispute a transaction?',
      answer: 'To dispute a transaction, go to your transaction history, find the transaction, and click "Dispute". Provide details about why you\'re disputing it. We\'ll investigate and typically resolve disputes within 10 business days.',
      category: 'accounts',
      tags: ['dispute', 'transaction', 'fraud'],
      helpful: 156,
      updated: '2025-01-14',
      views: 623,
      difficulty: 'intermediate'
    },
    {
      id: '6',
      question: 'What investment options are available?',
      answer: 'We offer various investment options including individual stocks, ETFs, mutual funds, bonds, and robo-advisor portfolios. Minimum investment amounts vary by product, starting from $100 for ETFs and $1,000 for mutual funds.',
      category: 'investments',
      tags: ['investments', 'stocks', 'etf', 'mutual funds'],
      helpful: 134,
      updated: '2025-01-09',
      views: 892,
      difficulty: 'advanced'
    }
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesFilter = filterType === 'all' ||
      (filterType === 'popular' && faq.helpful > 150) ||
      (filterType === 'recent' && new Date(faq.updated) > new Date('2025-01-10')) ||
      (filterType === 'beginner' && faq.difficulty === 'beginner') ||
      (filterType === 'advanced' && faq.difficulty === 'advanced');
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const sortedFAQs = [...filteredFAQs].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.helpful - a.helpful;
      case 'recent':
        return new Date(b.updated).getTime() - new Date(a.updated).getTime();
      case 'views':
        return b.views - a.views;
      case 'alphabetical':
        return a.question.localeCompare(b.question);
      default:
        return 0;
    }
  });

  const quickActions = [
    { name: 'Live Chat', icon: MessageCircle, description: 'Start instant conversation', color: 'blue' },
    { name: 'Call Support', icon: Phone, description: 'Speak with an agent', color: 'green' },
    { name: 'Video Tutorial', icon: Video, description: 'Watch helpful videos', color: 'purple' },
    { name: 'User Guide', icon: BookOpen, description: 'Download complete guide', color: 'orange' },
    { name: 'Community', icon: Users, description: 'Join user discussions', color: 'indigo' },
    { name: 'Feedback', icon: Heart, description: 'Share your experience', color: 'pink' },
    { name: 'Service Status', icon: Activity, description: 'Check system status', color: 'red' },
    { name: 'Account Recovery', icon: Shield, description: 'Reset access', color: 'yellow' }
  ];

  const quickLinks = [
    { name: 'Account Security', icon: Shield, description: 'Learn how to keep your account safe', views: 2340 },
    { name: 'Mobile Banking Guide', icon: Smartphone, description: 'Complete guide to our mobile app', views: 1890 },
    { name: 'Transfer Money', icon: ArrowRight, description: 'How to send and receive money', views: 3210 },
    { name: 'Investment Basics', icon: TrendingUp, description: 'Getting started with investing', views: 1560 },
    { name: 'Fee Schedule', icon: FileText, description: 'Complete list of account fees', views: 987 },
    { name: 'Service Status', icon: Globe, description: 'Check current system status', views: 654 }
  ];

  const tabNavigation = [
    { id: 'overview', name: 'Overview', icon: Home, count: faqItems.length },
    { id: 'faq', name: 'FAQ', icon: HelpCircle, count: faqItems.length },
    { id: 'guides', name: 'Guides', icon: BookOpen, count: 42 },
    { id: 'videos', name: 'Videos', icon: Video, count: 28 },
    { id: 'contact', name: 'Contact', icon: MessageCircle, count: 4 },
    { id: 'community', name: 'Community', icon: Users, count: 156 }
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const markHelpful = (id: string) => {
    // Implementation for marking as helpful
    console.log(`Marked FAQ ${id} as helpful`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const renderAnalyticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Total Questions</p>
            <p className="text-white text-2xl font-bold">{helpAnalytics.totalQuestions.toLocaleString()}</p>
          </div>
          <HelpCircle className="h-8 w-8 text-white/60" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Resolved Today</p>
            <p className="text-white text-2xl font-bold">{helpAnalytics.resolvedToday}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-white/60" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Response Time</p>
            <p className="text-white text-2xl font-bold">{helpAnalytics.avgResponseTime}</p>
          </div>
          <Clock className="h-8 w-8 text-white/60" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Satisfaction</p>
            <p className="text-white text-2xl font-bold">{helpAnalytics.userSatisfaction}/5.0</p>
          </div>
          <Star className="h-8 w-8 text-white/60" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Popular Searches</p>
            <p className="text-white text-2xl font-bold">{helpAnalytics.popularSearches}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-white/60" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Active Users</p>
            <p className="text-white text-2xl font-bold">{helpAnalytics.activeUsers}</p>
          </div>
          <Users className="h-8 w-8 text-white/60" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2">Help Center</h1>
              <p className="text-white/80 text-lg">Find answers, get support, and learn banking solutions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30">
                <Download className="h-4 w-4 mr-2" />
                Download Guide
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
                <MessageCircle className="h-4 w-4 mr-2" />
                Get Support
              </button>
            </div>
          </div>

          {/* Analytics Cards */}
          {renderAnalyticsCards()}

          {/* Enhanced Tab Navigation */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
            {tabNavigation.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white/80'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Help Articles</p>
                <p className="text-2xl font-bold">{faqItems.length}</p>
                <p className="text-blue-100 text-sm">Available topics</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Avg Response</p>
                <p className="text-2xl font-bold">{helpAnalytics.avgResponseTime}</p>
                <p className="text-green-100 text-sm">Support speed</p>
              </div>
              <Clock className="h-10 w-10 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Satisfaction</p>
                <p className="text-2xl font-bold">{helpAnalytics.userSatisfaction}/5.0</p>
                <p className="text-purple-100 text-sm">User rating</p>
              </div>
              <Star className="h-10 w-10 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Support</p>
                <p className="text-2xl font-bold">{helpAnalytics.activeUsers}</p>
                <p className="text-orange-100 text-sm">Users online</p>
              </div>
              <Users className="h-10 w-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`p-4 bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-lg text-white hover:from-${action.color}-600 hover:to-${action.color}-700 transition-all duration-200 group shadow-lg hover:shadow-xl`}
                >
                  <Icon className="h-6 w-6 mb-2 mx-auto group-hover:scale-110 transition-transform duration-200" />
                  <p className="text-sm font-medium text-center">{action.name}</p>
                  <p className="text-xs text-white/80 text-center mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Help Articles</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for help articles, FAQs, and guides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="popular">Popular</option>
                  <option value="recent">Recent</option>
                  <option value="beginner">Beginner</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popularity">Popularity</option>
                  <option value="recent">Most Recent</option>
                  <option value="views">Most Viewed</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Filter Tags */}
            {showFilterTags && (searchTerm || selectedCategory !== 'all' || filterType !== 'all') && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-blue-600">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Category: {helpCategories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('all')} className="ml-2 hover:text-green-600">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
                {filterType !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Filter: {filterType}
                    <button onClick={() => setFilterType('all')} className="ml-2 hover:text-purple-600">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setFilterType('all');
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Found {sortedFAQs.length} result{sortedFAQs.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center space-x-2">
                <span>View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, and guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                Found {sortedFAQs.length} result{sortedFAQs.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{link.name}</h3>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-left p-6 rounded-lg border-2 transition-colors duration-200 ${selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${category.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      <p className="text-sm text-gray-400 mt-2">{category.articleCount} articles</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedCategory !== 'all' && (
            <div className="mt-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← View all categories
              </button>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="bg-white rounded-lg shadow">
            {sortedFAQs.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sortedFAQs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-md font-medium text-gray-900">{faq.question}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full bg-${getDifficultyColor(faq.difficulty)}-100 text-${getDifficultyColor(faq.difficulty)}-800`}>
                            {faq.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Updated {new Date(faq.updated).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{faq.helpful} helpful</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{faq.views} views</span>
                          </div>
                        </div>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-wrap gap-2">
                            {faq.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Was this helpful?</span>
                            <button
                              onClick={() => markHelpful(faq.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Yes</span>
                            </button>
                            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                              <AlertCircle className="h-4 w-4" />
                              <span>No</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No FAQs found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setFilterType('all');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Still Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200"
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 bg-${option.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-6 w-6 text-${option.color}-600`} />
                    </div>
                    <h3 className="text-md font-medium text-gray-900 mb-2">{option.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{option.description}</p>

                    {/* Enhanced Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Available:</span>
                        <span className="text-gray-900 font-medium">{option.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Response:</span>
                        <span className="text-gray-900 font-medium">{option.response}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Wait time:</span>
                        <span className="text-gray-900 font-medium">{option.waitTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-gray-900 font-medium">{option.rating}</span>
                        </div>
                      </div>
                    </div>

                    <button className={`w-full px-4 py-2 bg-${option.color}-600 text-white rounded-md hover:bg-${option.color}-700 transition-colors duration-200 font-medium`}>
                      Contact Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h4 className="text-md font-medium text-gray-900 mb-2">User Guide</h4>
              <p className="text-sm text-gray-500 mb-3">Comprehensive guide to all features</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Download PDF
              </button>
            </div>
            <div className="text-center">
              <Video className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h4 className="text-md font-medium text-gray-900 mb-2">Video Tutorials</h4>
              <p className="text-sm text-gray-500 mb-3">Step-by-step video instructions</p>
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                Watch Videos
              </button>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h4 className="text-md font-medium text-gray-900 mb-2">Community Forum</h4>
              <p className="text-sm text-gray-500 mb-3">Connect with other users</p>
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Join Forum
              </button>
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-lg p-8 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
            <p className="text-white/80">Our support team is here 24/7 to assist you with all your banking needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center border border-white/20">
              <Phone className="h-8 w-8 mx-auto mb-3 text-white/80" />
              <h4 className="text-lg font-semibold mb-2">Call Support</h4>
              <p className="text-white/80 text-sm mb-4">Speak with our banking specialists</p>
              <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30">
                1-800-BANCAI
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center border border-white/20">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 text-white/80" />
              <h4 className="text-lg font-semibold mb-2">Live Chat</h4>
              <p className="text-white/80 text-sm mb-4">Get instant help from our agents</p>
              <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30">
                Start Chat
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center border border-white/20">
              <Globe className="h-8 w-8 mx-auto mb-3 text-white/80" />
              <h4 className="text-lg font-semibold mb-2">Help Center</h4>
              <p className="text-white/80 text-sm mb-4">Browse our complete knowledge base</p>
              <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30">
                Browse Articles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
