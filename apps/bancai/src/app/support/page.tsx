'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MessageCircle, Clock, User, Search, Filter,
  MoreHorizontal, Star, ChevronRight, FileText, Calendar,
  AlertCircle, CheckCircle, Headphones, MessageSquare,
  Video, MapPin, ExternalLink, Download, RefreshCw,
  BarChart3, TrendingUp, Target, Activity, Award, Zap, Users,
  DollarSign, Banknote, Calculator, BookOpen, Heart, ArrowRight,
  SortDesc, Layers, HelpCircle, Bell, Settings, Shield, Database,
  Monitor, Palette, Key, Lock, Wifi, Globe, Smartphone, Edit
} from 'lucide-react';
import { useSession } from '../../lib/auth';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  responses: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  views: number;
}

interface ContactMethod {
  id: string;
  type: 'phone' | 'email' | 'chat' | 'video';
  title: string;
  description: string;
  availability: string;
  responseTime: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

export default function SupportPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Enhanced state management
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilterTags, setShowFilterTags] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Support analytics state
  const [supportAnalytics, setSupportAnalytics] = useState({
    totalTickets: 23,
    resolvedTickets: 19,
    avgResponseTime: '2.4 hours',
    satisfactionScore: 4.8,
    activeChats: 2,
    availableAgents: 12
  });

  const supportTickets: SupportTicket[] = [
    {
      id: '1',
      title: 'Unable to transfer money to external account',
      description: 'I am getting an error when trying to transfer $500 to my external savings account.',
      category: 'Transfers',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2025-08-05T10:30:00Z',
      updatedAt: '2025-08-06T09:15:00Z',
      assignedAgent: 'Sarah Johnson',
      responses: 3
    },
    {
      id: '2',
      title: 'Question about monthly fees',
      description: 'I noticed a fee on my account and want to understand what it is for.',
      category: 'Account',
      priority: 'low',
      status: 'resolved',
      createdAt: '2025-08-04T14:20:00Z',
      updatedAt: '2025-08-04T16:45:00Z',
      assignedAgent: 'Mike Davis',
      responses: 2
    },
    {
      id: '3',
      title: 'Mobile app not working properly',
      description: 'The app crashes when I try to view my transaction history.',
      category: 'Technical',
      priority: 'medium',
      status: 'waiting',
      createdAt: '2025-08-03T11:10:00Z',
      updatedAt: '2025-08-03T11:10:00Z',
      responses: 1
    }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I transfer money to another bank?',
      answer: 'You can transfer money to external banks by going to Transfers > Send Money, selecting "Bank Account" as the recipient type, and entering the recipient\'s bank details including routing number and account number.',
      category: 'Transfers',
      helpful: 45,
      views: 234
    },
    {
      id: '2',
      question: 'What are the daily transfer limits?',
      answer: 'Daily transfer limits vary by account type: Standard accounts have a $2,500 daily limit, Premium accounts have a $10,000 daily limit, and Business accounts have a $25,000 daily limit.',
      category: 'Transfers',
      helpful: 38,
      views: 189
    },
    {
      id: '3',
      question: 'How do I enable two-factor authentication?',
      answer: 'To enable 2FA, go to Settings > Security > Two-Factor Authentication. You can choose between SMS, email, or authenticator app methods.',
      category: 'Security',
      helpful: 52,
      views: 156
    },
    {
      id: '4',
      question: 'What fees does BancAI charge?',
      answer: 'BancAI offers fee-free checking and savings accounts. We charge $2.99 for instant transfers, $25 for wire transfers, and $3 for out-of-network ATM usage.',
      category: 'Account',
      helpful: 29,
      views: 145
    }
  ];

  const contactMethods: ContactMethod[] = [
    {
      id: '1',
      type: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      availability: '24/7',
      responseTime: 'Immediate',
      icon: Phone,
      color: 'bg-green-100 text-green-600',
      action: () => window.open('tel:+1-800-BANCAI-1')
    },
    {
      id: '2',
      type: 'chat',
      title: 'Live Chat',
      description: 'Chat with our AI assistant or human agent',
      availability: '24/7',
      responseTime: '< 2 minutes',
      icon: MessageCircle,
      color: 'bg-blue-100 text-blue-600',
      action: () => console.log('Open chat')
    },
    {
      id: '3',
      type: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: 'Business hours',
      responseTime: '< 4 hours',
      icon: Mail,
      color: 'bg-purple-100 text-purple-600',
      action: () => window.open('mailto:support@bancai.com')
    },
    {
      id: '4',
      type: 'video',
      title: 'Video Call',
      description: 'Schedule a video consultation',
      availability: 'By appointment',
      responseTime: 'Same day',
      icon: Video,
      color: 'bg-orange-100 text-orange-600',
      action: () => console.log('Schedule video call')
    }
  ];

  const supportNavigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3, count: supportAnalytics.totalTickets },
    { id: 'help', name: 'Help Center', icon: FileText, count: faqs.length },
    { id: 'tickets', name: 'My Tickets', icon: MessageSquare, count: supportTickets.filter(t => t.status !== 'closed').length },
    { id: 'contact', name: 'Contact Support', icon: Headphones, count: contactMethods.length },
    { id: 'guides', name: 'Guides', icon: BookOpen, count: 24 },
    { id: 'community', name: 'Community', icon: Users, count: 156 }
  ];

  const quickActions = [
    { icon: MessageCircle, label: 'Live Chat', description: 'Instant help', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { icon: Phone, label: 'Call Us', description: 'Phone support', color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { icon: FileText, label: 'New Ticket', description: 'Create ticket', color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { icon: Video, label: 'Video Call', description: 'Schedule call', color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { icon: Download, label: 'Guides', description: 'Download docs', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { icon: MapPin, label: 'Locations', description: 'Find branch', color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { icon: Search, label: 'Search', description: 'Find answers', color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { icon: Settings, label: 'Preferences', description: 'Support settings', color: 'bg-gradient-to-br from-gray-500 to-gray-600' }
  ];

  // Analytics update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSupportAnalytics(prev => ({
        ...prev,
        activeChats: Math.max(0, prev.activeChats + Math.floor(Math.random() * 3) - 1)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Help & Support Center</h1>
                <p className="text-green-100 text-lg">Get instant help, find answers, and connect with our support team</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <button className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Download Guides
                </button>
                <button className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-all duration-200">
                  <MessageCircle className="h-4 w-4 mr-2 inline" />
                  Get Help Now
                </button>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Tickets</p>
                    <p className="text-2xl font-bold">{supportAnalytics.totalTickets}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Resolved</p>
                    <p className="text-2xl font-bold">{supportAnalytics.resolvedTickets}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Response Time</p>
                    <p className="text-lg font-bold">{supportAnalytics.avgResponseTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Satisfaction</p>
                    <p className="text-2xl font-bold">{supportAnalytics.satisfactionScore}</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">Active Chats</p>
                    <p className="text-2xl font-bold">{supportAnalytics.activeChats}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-indigo-200" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm">Agents</p>
                    <p className="text-2xl font-bold">{supportAnalytics.availableAgents}</p>
                  </div>
                  <Headphones className="h-8 w-8 text-teal-200" />
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
              {supportNavigation.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
                      }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.name}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-blue-600 text-sm font-medium">Tickets</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{supportAnalytics.resolvedTickets}/{supportAnalytics.totalTickets}</p>
                  <p className="text-sm text-gray-600">Resolved Tickets</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(supportAnalytics.resolvedTickets / supportAnalytics.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-medium">Response</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{supportAnalytics.avgResponseTime}</p>
                  <p className="text-sm text-gray-600">Average Response Time</p>
                  <p className="text-xs text-green-600 font-medium">Excellent Service</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-purple-600 text-sm font-medium">Satisfaction</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{supportAnalytics.satisfactionScore}/5.0</p>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                  <p className="text-xs text-purple-600 font-medium">Highly Rated</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-orange-600 text-sm font-medium">Support</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{supportAnalytics.availableAgents}</p>
                  <p className="text-sm text-gray-600">Available Agents</p>
                  <p className="text-xs text-orange-600 font-medium">{supportAnalytics.activeChats} active chats</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Quick Support Actions</h3>
                <span className="text-sm text-gray-500">{quickActions.length} options available</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className={`${action.color} p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 text-center">{action.label}</span>
                      <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Support Activity</h3>
                <div className="space-y-4">
                  {supportTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(ticket.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                        <p className="text-xs text-gray-500">#{ticket.id} • {formatDate(ticket.updatedAt)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  View All Tickets
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Help Topics</h3>
                <div className="space-y-3">
                  {faqs.slice(0, 4).map((faq) => (
                    <div key={faq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                        <p className="text-xs text-gray-500">{faq.views} views • {faq.helpful} helpful</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                  Browse Help Center
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('help')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'help'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Help Center
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                My Tickets ({supportTickets.filter(t => t.status !== 'closed').length})
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Headphones className="h-4 w-4 inline mr-2" />
                Contact Support
              </button>
            </nav>
          </div>

          {/* Help Center Tab */}
          {activeTab === 'help' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
                  <div className="flex-1 max-w-lg">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search help articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Getting Started</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Learn the basics of using your BancAI account</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Guide <ChevronRight className="h-4 w-4 inline ml-1" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Security Tips</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Keep your account safe with these best practices</p>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    View Guide <ChevronRight className="h-4 w-4 inline ml-1" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Advanced Features</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Explore powerful features to maximize your banking</p>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    View Guide <ChevronRight className="h-4 w-4 inline ml-1" />
                  </button>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Frequently Asked Questions ({filteredFAQs.length})
                </h3>
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900 mb-2">{faq.question}</h4>
                          <p className="text-sm text-gray-600 mb-3">{faq.answer}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {faq.category}
                            </span>
                            <span>{faq.views} views</span>
                            <span>{faq.helpful} people found this helpful</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">My Support Tickets</h3>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create New Ticket
                </button>
              </div>

              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-medium text-gray-900">{ticket.title}</h4>
                          {getStatusIcon(ticket.status)}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>#{ticket.id}</span>
                          <span>{ticket.category}</span>
                          <span>Created {formatDate(ticket.createdAt)}</span>
                          <span>Updated {formatDate(ticket.updatedAt)}</span>
                          {ticket.assignedAgent && <span>Assigned to {ticket.assignedAgent}</span>}
                          <span>{ticket.responses} responses</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {supportTickets.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No support tickets yet.</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Your First Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Contact Support Tab */}
          {activeTab === 'contact' && (
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Choose How to Contact Us</h3>
                <p className="text-sm text-gray-500">We're here to help! Choose the contact method that works best for you.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {contactMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={method.action}
                      className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.color} group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{method.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-green-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {method.availability}
                            </div>
                            <div className="flex items-center text-blue-600">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {method.responseTime}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Branch Locations */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Visit a Branch</h4>
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1" />
                    Find Locations
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get in-person help at one of our branch locations. Our banking specialists are ready to assist you with complex transactions and account management.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Downtown Branch</h5>
                    <p className="text-sm text-gray-600 mb-2">123 Main Street, New York, NY 10001</p>
                    <p className="text-sm text-gray-500">Mon-Fri: 9AM-5PM, Sat: 9AM-2PM</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Midtown Branch</h5>
                    <p className="text-sm text-gray-600 mb-2">456 Park Avenue, New York, NY 10016</p>
                    <p className="text-sm text-gray-500">Mon-Fri: 9AM-5PM, Sat: 9AM-2PM</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 mr-3" />
                <h3 className="text-lg font-semibold">Live Support</h3>
              </div>
              <p className="text-blue-100 mb-4">Get instant help from our AI assistant or connect with a human agent 24/7.</p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <Phone className="h-8 w-8 mr-3" />
                <h3 className="text-lg font-semibold">Call Center</h3>
              </div>
              <p className="text-green-100 mb-4">Speak directly with our support specialists for complex issues and urgent matters.</p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Call Now
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 mr-3" />
                <h3 className="text-lg font-semibold">Knowledge Base</h3>
              </div>
              <p className="text-purple-100 mb-4">Browse our comprehensive guides, tutorials, and FAQ to find answers instantly.</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Browse Guides
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Utility functions
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'waiting': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];
}
