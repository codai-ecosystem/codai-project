'use client'

import React, { useState, useEffect } from 'react'
import {
  // Core Support Icons
  HeadphonesIcon,
  MessageSquare,
  Ticket,
  BookOpen,
  Users,
  BarChart3,
  Settings,

  // Metrics and Status Icons
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,

  // Action Icons
  Plus,
  Search,
  Filter,
  RefreshCw,

  // Feature Icons
  MessageCircle,
  Zap,
  Globe,
  Shield,

  // Navigation Icons
  Home,
  ArrowRight,
  ExternalLink,

  // Additional Support Icons
  Video
} from 'lucide-react'

// Import shared components with fallbacks for @codai/shared-ui
let Card: React.ComponentType<{ children: React.ReactNode; className?: string; onClick?: () => void }>
let CardContent: React.ComponentType<{ children: React.ReactNode; className?: string }>
let CardDescription: React.ComponentType<{ children: React.ReactNode; className?: string }>
let CardHeader: React.ComponentType<{ children: React.ReactNode; className?: string }>
let CardTitle: React.ComponentType<{ children: React.ReactNode; className?: string }>
let Badge: React.ComponentType<{ children: React.ReactNode; className?: string }>
let Button: React.ComponentType<{ children: React.ReactNode; className?: string; onClick?: () => void;[key: string]: any }>

try {
  const sharedComponents = require('@codai/shared-ui')
  Card = sharedComponents.Card
  CardContent = sharedComponents.CardContent
  CardDescription = sharedComponents.CardDescription
  CardHeader = sharedComponents.CardHeader
  CardTitle = sharedComponents.CardTitle
  Badge = sharedComponents.Badge
  Button = sharedComponents.Button
} catch (error) {
  // Fallback components when @codai/shared-ui is not available
  Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <div className={`bg-white rounded-lg shadow ${className}`} onClick={onClick}>{children}</div>
  )
  CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 ${className}`}>{children}</div>
  )
  CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
  )
  CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`px-6 py-4 ${className}`}>{children}</div>
  )
  CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
  )
  Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {children}
    </span>
  )
  Button = ({ children, className = '', onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void;[key: string]: any }) => (
    <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

// Enhanced Support Dashboard State Management
interface DashboardState {
  // Core Metrics
  totalTickets: number
  openTickets: number
  resolvedToday: number
  avgResponseTime: number
  satisfactionScore: number
  activeAgents: number

  // Real-time Updates
  onlineUsers: number
  activeChatSessions: number
  pendingTickets: number

  // View Management
  activeView: string
  searchTerm: string
  filterType: string
  refreshInterval: number

  // UI State
  showNotifications: boolean
  darkMode: boolean
  autoRefresh: boolean
}

// TypeScript interfaces for Support Platform data
interface SupportStats {
  totalTickets: number
  openTickets: number
  resolvedToday: number
  avgResponseTime: number
  satisfactionScore: number
  activeAgents: number
}

interface SupportTicket {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  category: string
  assignedAgent: string
  createdAt: Date
  updatedAt: Date
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  category: string
  action: () => void
}

export default function AjutaiDashboard() {
  // Enhanced Dashboard State
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    totalTickets: 1247,
    openTickets: 89,
    resolvedToday: 34,
    avgResponseTime: 2.3,
    satisfactionScore: 94.7,
    activeAgents: 12,
    onlineUsers: 156,
    activeChatSessions: 24,
    pendingTickets: 17,
    activeView: 'overview',
    searchTerm: '',
    filterType: 'all',
    refreshInterval: 30000,
    showNotifications: true,
    darkMode: false,
    autoRefresh: true
  })

  // Real-time Updates Simulation
  useEffect(() => {
    if (dashboardState.autoRefresh) {
      const interval = setInterval(() => {
        setDashboardState(prev => ({
          ...prev,
          onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 5 - 2),
          activeChatSessions: Math.max(0, prev.activeChatSessions + Math.floor(Math.random() * 3 - 1)),
          satisfactionScore: Math.min(100, Math.max(80, prev.satisfactionScore + (Math.random() - 0.5) * 2)),
          avgResponseTime: Math.max(1, prev.avgResponseTime + (Math.random() - 0.5) * 0.5)
        }))
      }, dashboardState.refreshInterval)

      return () => clearInterval(interval)
    }
  }, [dashboardState.autoRefresh, dashboardState.refreshInterval])

  // Navigation Views Configuration
  const navigationViews = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'blue' },
    { id: 'tickets', label: 'Tickets', icon: Ticket, color: 'purple', badge: dashboardState.openTickets },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, color: 'green' },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare, color: 'orange', badge: dashboardState.activeChatSessions },
    { id: 'community', label: 'Community', icon: Users, color: 'pink' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'indigo' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
  ]

  // Enhanced Summary Cards Data
  const summaryCards = [
    {
      title: 'Total Tickets',
      value: dashboardState.totalTickets.toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Ticket,
      color: 'blue'
    },
    {
      title: 'Resolution Rate',
      value: `${((dashboardState.totalTickets - dashboardState.openTickets) / dashboardState.totalTickets * 100).toFixed(1)}%`,
      change: '+3.2%',
      changeType: 'increase' as const,
      icon: CheckCircle2,
      color: 'green'
    },
    {
      title: 'Satisfaction Score',
      value: `${dashboardState.satisfactionScore.toFixed(1)}%`,
      change: '+1.8%',
      changeType: 'increase' as const,
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'Response Time',
      value: `${dashboardState.avgResponseTime.toFixed(1)}m`,
      change: '-0.3m',
      changeType: 'decrease' as const,
      icon: Clock,
      color: 'purple'
    }
  ]

  // Quick Actions Configuration
  const quickActions = [
    {
      title: 'New Ticket',
      description: 'Create support ticket',
      icon: Plus,
      color: 'blue',
      action: () => console.log('Create ticket')
    },
    {
      title: 'Live Chat',
      description: 'Start chat session',
      icon: MessageCircle,
      color: 'green',
      action: () => console.log('Start chat')
    },
    {
      title: 'Knowledge Base',
      description: 'Browse help articles',
      icon: BookOpen,
      color: 'purple',
      action: () => console.log('Browse knowledge')
    },
    {
      title: 'Community Forum',
      description: 'Join discussions',
      icon: Users,
      color: 'orange',
      action: () => console.log('Open forum')
    },
    {
      title: 'Video Call',
      description: 'Schedule video support',
      icon: Video,
      color: 'red',
      action: () => console.log('Schedule video')
    },
    {
      title: 'AI Assistant',
      description: 'Get instant help',
      icon: Zap,
      color: 'yellow',
      action: () => console.log('AI assistant')
    },
    {
      title: 'Report Issue',
      description: 'Report platform issue',
      icon: AlertCircle,
      color: 'red',
      action: () => console.log('Report issue')
    },
    {
      title: 'Feedback',
      description: 'Share your feedback',
      icon: Star,
      color: 'pink',
      action: () => console.log('Give feedback')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-teal-50">
      {/* Enhanced Header with Gradient Design - Orange to Teal Theme */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-teal-600 rounded-2xl mx-6 mt-6 p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <HeadphonesIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AJUTAI</h1>
              <p className="text-orange-100 text-lg">Intelligent Help & Support Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-orange-100">Online Users</p>
              <p className="text-2xl font-bold">{dashboardState.onlineUsers}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100">Active Agents</p>
              <p className="text-2xl font-bold">{dashboardState.activeAgents}</p>
            </div>
            <button
              onClick={() => setDashboardState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
              className="bg-white/20 p-3 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${dashboardState.autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 backdrop-blur-sm">
          {navigationViews.map((view) => {
            const IconComponent = view.icon
            const isActive = dashboardState.activeView === view.id

            return (
              <button
                key={view.id}
                onClick={() => setDashboardState(prev => ({ ...prev, activeView: view.id }))}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative ${isActive
                  ? 'bg-white text-teal-600 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="font-medium">{view.label}</span>
                {view.badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-teal-100 text-teal-600' : 'bg-white/20 text-white'
                    }`}>
                    {view.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Enhanced Summary Cards with @codai/shared-ui */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {summaryCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                    <IconComponent className={`h-6 w-6 text-${card.color}-600`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {card.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-medium">{card.change}</span>
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
                <p className={`text-3xl font-bold bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent`}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Support Operations Center */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Active Tickets Overview */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-orange-600" />
                <span>Active Support Tickets</span>
              </CardTitle>
              <CardDescription>Current support queue and ticket status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Urgent Tickets</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">7</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">High Priority</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">23</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">In Progress</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">45</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Resolved Today</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{dashboardState.resolvedToday}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base Metrics */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-teal-600" />
                <span>Knowledge & Community</span>
              </CardTitle>
              <CardDescription>Self-service resources and community engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Knowledge Articles</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">847</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">Community Posts</span>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800">2,156</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="h-4 w-4 text-pink-600" />
                    <span className="font-medium">Video Tutorials</span>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">134</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-cyan-600" />
                    <span className="font-medium">AI Resolutions</span>
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-800">78%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search actions..."
                value={dashboardState.searchTerm}
                onChange={(e) => setDashboardState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <Button className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                onClick={action.action}
              >
                <CardContent className="p-6 text-left">
                  <div className={`inline-flex p-3 rounded-xl bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors mb-4`}>
                    <IconComponent className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <CardTitle className="font-semibold text-gray-900 mb-2">{action.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm mb-4">{action.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 text-sm font-medium">Get Started</span>
                    <ArrowRight className="h-4 w-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Enhanced Footer with Action Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-8 w-8" />
                <CardTitle className="text-xl font-bold text-white">Support Analytics</CardTitle>
              </div>
              <CardDescription className="text-orange-100 mb-4">
                View detailed metrics and performance insights
              </CardDescription>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center space-x-2">
                <span>View Analytics</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8" />
                <CardTitle className="text-xl font-bold text-white">Security Center</CardTitle>
              </div>
              <CardDescription className="text-red-100 mb-4">
                Monitor security and compliance status
              </CardDescription>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center space-x-2">
                <span>Security Dashboard</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-8 w-8" />
                <CardTitle className="text-xl font-bold text-white">Platform Status</CardTitle>
              </div>
              <CardDescription className="text-teal-100 mb-4">
                Real-time platform health and uptime
              </CardDescription>
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center space-x-2">
                <span>Status Page</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

