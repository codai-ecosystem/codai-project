'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Mail,
  Send,
  Eye,
  MousePointer,
  Star,
  Target,
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Activity,
  PieChart,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MessageSquare,
  Heart,
  Share,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  Info,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Edit,
  Trash2,
  Copy,
  FileText,
  Image,
  Video,
  Attachment,
  Wifi,
  WifiOff,
  Database,
  Server,
  Shield,
  Lock,
  Unlock,
  Timer,
  Gauge,
  LineChart,
  DollarSign,
  Percent,
  Hash,
  AtSign,
  MapPin,
  Phone,
  Building,
  Crown,
  Award,
  Medal,
  Trophy,
  Briefcase,
  Laptop,
  HelpCircle,
  Lightbulb,
  Brain,
  Sparkles
} from 'lucide-react'

interface AnalyticsMetric {
  id: string
  name: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  period: string
  description: string
  icon: any
  color: string
  target?: number
  unit?: string
}

interface EmailPerformance {
  id: string
  subject: string
  sentDate: Date
  recipients: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  openRate: number
  clickRate: number
  replyRate: number
  bounceRate: number
  status: 'sent' | 'scheduled' | 'draft' | 'failed'
  campaign?: string
  tags: string[]
}

interface CommunicationAnalytics {
  totalEmails: number
  totalOpens: number
  totalClicks: number
  totalReplies: number
  avgResponseTime: string
  conversionRate: number
  engagementScore: number
  activeContacts: number
  unsubscribeRate: number
  deliverabilityRate: number
  spamScore: number
  reputationScore: number
}

interface ChannelPerformance {
  channel: string
  icon: any
  messages: number
  engagement: number
  responseRate: number
  avgResponseTime: string
  satisfaction: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface TimeAnalytics {
  hour: number
  emails: number
  opens: number
  clicks: number
  replies: number
  engagement: number
}

interface DeviceAnalytics {
  device: string
  icon: any
  percentage: number
  opens: number
  clicks: number
  engagement: number
  color: string
}

interface GeographicData {
  country: string
  flag: string
  users: number
  engagement: number
  topTime: string
  growth: number
}

export default function AnalyticsInsightsPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'email' | 'channels' | 'audience' | 'performance' | 'insights'>('overview')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d')
  const [isRealTime, setIsRealTime] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [showExportOptions, setShowExportOptions] = useState(false)

  const analytics: CommunicationAnalytics = {
    totalEmails: 12847,
    totalOpens: 8934,
    totalClicks: 2847,
    totalReplies: 1456,
    avgResponseTime: '2h 14m',
    conversionRate: 23.7,
    engagementScore: 87.4,
    activeContacts: 3456,
    unsubscribeRate: 1.2,
    deliverabilityRate: 98.7,
    spamScore: 0.3,
    reputationScore: 9.2
  }

  const metrics: AnalyticsMetric[] = [
    {
      id: '1',
      name: 'Email Open Rate',
      value: '69.5%',
      change: 12.4,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Percentage of emails opened by recipients',
      icon: Eye,
      color: 'from-blue-500 to-indigo-600',
      target: 70,
      unit: '%'
    },
    {
      id: '2',
      name: 'Click-Through Rate',
      value: '22.1%',
      change: 8.7,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Percentage of recipients who clicked email links',
      icon: MousePointer,
      color: 'from-green-500 to-emerald-600',
      target: 25,
      unit: '%'
    },
    {
      id: '3',
      name: 'Response Time',
      value: '2h 14m',
      change: -15.2,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Average time to respond to emails',
      icon: Clock,
      color: 'from-purple-500 to-violet-600',
      unit: 'time'
    },
    {
      id: '4',
      name: 'Conversion Rate',
      value: '23.7%',
      change: 18.9,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Percentage of recipients who took desired action',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      target: 25,
      unit: '%'
    },
    {
      id: '5',
      name: 'Engagement Score',
      value: '87.4',
      change: 5.6,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Overall engagement quality score',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      target: 90,
      unit: 'score'
    },
    {
      id: '6',
      name: 'Active Contacts',
      value: '3,456',
      change: 23.1,
      changeType: 'increase',
      period: 'vs last month',
      description: 'Number of actively engaged contacts',
      icon: Users,
      color: 'from-teal-500 to-cyan-600',
      unit: 'count'
    }
  ]

  const emailPerformance: EmailPerformance[] = [
    {
      id: '1',
      subject: 'Q4 Product Launch Announcement',
      sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      recipients: 5240,
      opened: 4167,
      clicked: 1256,
      replied: 234,
      bounced: 23,
      openRate: 79.5,
      clickRate: 30.1,
      replyRate: 5.6,
      bounceRate: 0.4,
      status: 'sent',
      campaign: 'Product Launch 2025',
      tags: ['product', 'launch', 'announcement']
    },
    {
      id: '2',
      subject: 'Summer Sale: 40% Off Everything',
      sentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recipients: 8456,
      opened: 5891,
      clicked: 1847,
      replied: 123,
      bounced: 47,
      openRate: 69.7,
      clickRate: 31.4,
      replyRate: 2.1,
      bounceRate: 0.6,
      status: 'sent',
      campaign: 'Summer Sale 2025',
      tags: ['sale', 'promotion', 'discount']
    },
    {
      id: '3',
      subject: 'Your Weekly Newsletter',
      sentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      recipients: 12340,
      opened: 7456,
      clicked: 1234,
      replied: 89,
      bounced: 67,
      openRate: 60.4,
      clickRate: 16.5,
      replyRate: 1.2,
      bounceRate: 0.5,
      status: 'sent',
      campaign: 'Weekly Newsletter',
      tags: ['newsletter', 'weekly', 'content']
    },
    {
      id: '4',
      subject: 'Welcome to ConversAI Platform',
      sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      recipients: 345,
      opened: 289,
      clicked: 156,
      replied: 67,
      bounced: 3,
      openRate: 83.8,
      clickRate: 54.0,
      replyRate: 23.2,
      bounceRate: 0.9,
      status: 'sent',
      campaign: 'Onboarding Series',
      tags: ['welcome', 'onboarding', 'new-user']
    },
    {
      id: '5',
      subject: 'Feature Update: New AI Assistant',
      sentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      recipients: 6789,
      opened: 4234,
      clicked: 1567,
      replied: 234,
      bounced: 34,
      openRate: 62.4,
      clickRate: 37.0,
      replyRate: 5.5,
      bounceRate: 0.5,
      status: 'sent',
      campaign: 'Feature Updates',
      tags: ['feature', 'ai', 'update']
    }
  ]

  const channelPerformance: ChannelPerformance[] = [
    {
      channel: 'Email Marketing',
      icon: Mail,
      messages: 12847,
      engagement: 87.4,
      responseRate: 23.7,
      avgResponseTime: '2h 14m',
      satisfaction: 4.6,
      trend: 'up',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      channel: 'Live Chat',
      icon: MessageSquare,
      messages: 3456,
      engagement: 94.2,
      responseRate: 89.3,
      avgResponseTime: '45s',
      satisfaction: 4.8,
      trend: 'up',
      color: 'from-green-500 to-emerald-600'
    },
    {
      channel: 'Social Media',
      icon: Share,
      messages: 5678,
      engagement: 72.1,
      responseRate: 45.6,
      avgResponseTime: '4h 23m',
      satisfaction: 4.2,
      trend: 'stable',
      color: 'from-purple-500 to-violet-600'
    },
    {
      channel: 'SMS/WhatsApp',
      icon: Phone,
      messages: 2345,
      engagement: 91.7,
      responseRate: 78.4,
      avgResponseTime: '12m',
      satisfaction: 4.7,
      trend: 'up',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const timeAnalytics: TimeAnalytics[] = [
    { hour: 8, emails: 1245, opens: 856, clicks: 234, replies: 89, engagement: 68.8 },
    { hour: 9, emails: 2134, opens: 1567, clicks: 456, replies: 167, engagement: 73.4 },
    { hour: 10, emails: 1876, opens: 1234, clicks: 378, replies: 134, engagement: 65.8 },
    { hour: 11, emails: 2456, opens: 1789, clicks: 567, replies: 234, engagement: 72.8 },
    { hour: 12, emails: 1567, opens: 934, clicks: 267, replies: 98, engagement: 59.6 },
    { hour: 13, emails: 1234, opens: 789, clicks: 234, replies: 78, engagement: 63.9 },
    { hour: 14, emails: 2789, opens: 2134, clicks: 678, replies: 267, engagement: 76.5 },
    { hour: 15, emails: 2345, opens: 1678, clicks: 534, replies: 189, engagement: 71.5 },
    { hour: 16, emails: 1987, opens: 1345, clicks: 423, replies: 156, engagement: 67.7 },
    { hour: 17, emails: 1456, opens: 934, clicks: 278, replies: 89, engagement: 64.2 }
  ]

  const deviceAnalytics: DeviceAnalytics[] = [
    {
      device: 'Desktop',
      icon: Monitor,
      percentage: 52.3,
      opens: 4678,
      clicks: 1456,
      engagement: 74.2,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      device: 'Mobile',
      icon: Smartphone,
      percentage: 31.7,
      opens: 2834,
      clicks: 967,
      engagement: 68.9,
      color: 'from-green-500 to-emerald-600'
    },
    {
      device: 'Tablet',
      icon: Tablet,
      percentage: 16.0,
      opens: 1429,
      clicks: 424,
      engagement: 71.6,
      color: 'from-purple-500 to-violet-600'
    }
  ]

  const geographicData: GeographicData[] = [
    {
      country: 'Romania',
      flag: '🇷🇴',
      users: 1245,
      engagement: 87.4,
      topTime: '14:00',
      growth: 23.1
    },
    {
      country: 'United States',
      flag: '🇺🇸',
      users: 2345,
      engagement: 74.2,
      topTime: '10:00',
      growth: 18.7
    },
    {
      country: 'Germany',
      flag: '🇩🇪',
      users: 987,
      engagement: 81.5,
      topTime: '11:00',
      growth: 15.4
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      users: 756,
      engagement: 79.2,
      topTime: '09:00',
      growth: 12.8
    },
    {
      country: 'France',
      flag: '🇫🇷',
      users: 634,
      engagement: 76.9,
      topTime: '15:00',
      growth: 9.3
    },
    {
      country: 'Canada',
      flag: '🇨🇦',
      users: 543,
      engagement: 82.1,
      topTime: '11:00',
      growth: 16.2
    }
  ]

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return ArrowUp
      case 'decrease': return ArrowDown
      default: return Minus
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const refreshData = () => {
    // Simulate data refresh
    setIsRealTime(true)
    setTimeout(() => setIsRealTime(false), 2000)
  }

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    // Simulate export functionality
    console.log(`Exporting data as ${format}`)
    setShowExportOptions(false)
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <BarChart className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-sm text-gray-500">
                {analytics.totalEmails.toLocaleString()} emails • {((analytics.totalOpens / analytics.totalEmails) * 100).toFixed(1)}% open rate • {analytics.engagementScore}% engagement
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={refreshData}
                className={`p-2 rounded-lg transition-colors ${isRealTime ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${isRealTime ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                  title="Export Data"
                >
                  <Download className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {showExportOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10"
                    >
                      <button
                        onClick={() => exportData('csv')}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => exportData('excel')}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
                      >
                        Export as Excel
                      </button>
                      <button
                        onClick={() => exportData('pdf')}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
                      >
                        Export as PDF
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {currentTime?.toLocaleTimeString('ro-RO') || '--:--:--'}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 grid grid-cols-6 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deliverability</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{analytics.deliverabilityRate}%</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Spam Score</span>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{analytics.spamScore}%</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reputation</span>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{analytics.reputationScore}/10</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Unsubscribe</span>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{analytics.unsubscribeRate}%</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{analytics.avgResponseTime}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Contacts</span>
              <Users className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatNumber(analytics.activeContacts)}</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-180px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <div className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'email', label: 'Email Performance', icon: Mail },
              { id: 'channels', label: 'Communication Channels', icon: MessageSquare },
              { id: 'audience', label: 'Audience Analytics', icon: Users },
              { id: 'performance', label: 'Time & Device', icon: Clock },
              { id: 'insights', label: 'AI Insights', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${selectedTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {metrics.map((metric) => {
                    const ChangeIcon = getChangeIcon(metric.changeType)
                    return (
                      <motion.div
                        key={metric.id}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                        whileHover={{ y: -2 }}
                        onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color} text-white`}>
                            <metric.icon className="h-6 w-6" />
                          </div>
                          <div className={`flex items-center gap-1 text-sm ${getChangeColor(metric.changeType)}`}>
                            <ChangeIcon className="h-4 w-4" />
                            {Math.abs(metric.change)}%
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{metric.name}</h3>
                        <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                        <p className="text-sm text-gray-500">{metric.period}</p>

                        <AnimatePresence>
                          {selectedMetric === metric.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-200"
                            >
                              <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                              {metric.target && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress to target</span>
                                    <span>{metric.target}{metric.unit}</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all`}
                                      style={{
                                        width: `${Math.min((parseFloat(metric.value.toString()) / metric.target) * 100, 100)}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Performance Trend Chart Placeholder */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                    <div className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Last 30 days</span>
                    </div>
                  </div>
                  <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Interactive chart will be displayed here</p>
                      <p className="text-sm text-gray-400">Showing email performance trends over time</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900">Email Performance Analysis</h2>

                {/* Email Performance Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Email Campaigns</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Subject</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Recipients</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Open Rate</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Click Rate</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Reply Rate</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {emailPerformance.map((email) => (
                          <tr key={email.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{email.subject}</p>
                                <p className="text-sm text-gray-500">{email.sentDate.toLocaleDateString('ro-RO')}</p>
                                {email.campaign && (
                                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                    {email.campaign}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-900">{formatNumber(email.recipients)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{email.openRate.toFixed(1)}%</span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${email.openRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{email.clickRate.toFixed(1)}%</span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${email.clickRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-900">{email.replyRate.toFixed(1)}%</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(email.status)}`}>
                                {email.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'channels' && (
              <motion.div
                key="channels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900">Communication Channels Performance</h2>

                <div className="grid grid-cols-2 gap-6">
                  {channelPerformance.map((channel) => {
                    const TrendIcon = getTrendIcon(channel.trend)
                    return (
                      <motion.div
                        key={channel.channel}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${channel.color} text-white`}>
                            <channel.icon className="h-6 w-6" />
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {channel.trend === 'up' ? '+' : channel.trend === 'down' ? '-' : ''}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-4">{channel.channel}</h3>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Messages</span>
                            <span className="font-medium text-gray-900">{formatNumber(channel.messages)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Engagement</span>
                            <span className="font-medium text-gray-900">{channel.engagement}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Response Rate</span>
                            <span className="font-medium text-gray-900">{channel.responseRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Response Time</span>
                            <span className="font-medium text-gray-900">{channel.avgResponseTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Satisfaction</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium text-gray-900">{channel.satisfaction}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {selectedTab === 'audience' && (
              <motion.div
                key="audience"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900">Audience Analytics</h2>

                <div className="grid grid-cols-2 gap-6">
                  {/* Geographic Distribution */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                    <div className="space-y-3">
                      {geographicData.map((geo) => (
                        <div key={geo.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{geo.flag}</span>
                            <div>
                              <p className="font-medium text-gray-900">{geo.country}</p>
                              <p className="text-sm text-gray-500">{formatNumber(geo.users)} users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{geo.engagement}%</p>
                            <p className="text-sm text-green-600">+{geo.growth}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Analytics */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Analytics</h3>
                    <div className="space-y-4">
                      {deviceAnalytics.map((device) => (
                        <div key={device.device} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <device.icon className="h-5 w-5 text-gray-500" />
                              <span className="font-medium text-gray-900">{device.device}</span>
                            </div>
                            <span className="font-medium text-gray-900">{device.percentage}%</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${device.color} rounded-full transition-all`}
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{formatNumber(device.opens)} opens</span>
                            <span>{device.engagement}% engagement</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900">Time & Device Performance</h2>

                {/* Time Analytics */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Activity Hours</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {timeAnalytics.map((time) => (
                      <div key={time.hour} className="text-center">
                        <div className="mb-2">
                          <div
                            className="mx-auto bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t"
                            style={{
                              height: `${(time.engagement / 100) * 120}px`,
                              width: '24px'
                            }}
                          />
                          <div className="w-6 h-1 bg-gray-200 mx-auto" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">{time.hour}:00</p>
                        <p className="text-xs text-gray-500">{time.engagement.toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-gray-900">AI-Powered Insights</h2>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Communication Optimization Recommendations</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-blue-900">Optimal Send Time Recommendation</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Based on your audience behavior, emails sent at 2:00 PM show 23% higher engagement. Consider scheduling your next campaign at this time.
                            </p>
                            <div className="mt-2 text-xs text-blue-600">
                              Confidence: 94% • Impact: High • ROI: +15%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-green-900">Subject Line Optimization</h4>
                            <p className="text-sm text-green-700 mt-1">
                              Subject lines with 35-50 characters and action words show 31% better open rates. Your recent "Q4 Launch" campaign performed exceptionally well.
                            </p>
                            <div className="mt-2 text-xs text-green-600">
                              Confidence: 87% • Impact: Medium • ROI: +12%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-orange-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-orange-900">Personalization Opportunity</h4>
                            <p className="text-sm text-orange-700 mt-1">
                              Adding location-based personalization could increase click rates by 18%. Romania-based contacts respond 24% better to localized content.
                            </p>
                            <div className="mt-2 text-xs text-orange-600">
                              Confidence: 91% • Impact: High • ROI: +20%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>ConversAI Analytics • Communication Performance Insights</span>
            <span>Real-time Data • Advanced Analytics • AI-Powered Recommendations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                <BarChart className="h-4 w-4" />
                Analytics
              </div>
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <TrendingUp className="h-4 w-4" />
                Performance
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Brain className="h-4 w-4" />
                AI Insights
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
