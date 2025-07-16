'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  MessageSquare,
  Ticket,
  BookOpen,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Star,
  ArrowRight,
  Zap,
  Settings,
  CheckCircle
} from 'lucide-react'
import { AjutAIService, type SupportAnalytics } from '../services/ajutaiService'

interface AppMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: string
  color: string
}

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'beta' | 'coming-soon'
}

export default function AjutAIPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'analytics' | 'monitor'>('overview')
  const [analytics, setAnalytics] = useState<SupportAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRealAjutAIData()
  }, [])

  const loadRealAjutAIData = async () => {
    setLoading(true)
    try {
      const ajutService = AjutAIService.getInstance()
      const analyticsData = await ajutService.getAnalytics()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load AjutAI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [metrics] = useState<AppMetric[]>([])
  {
    id: '3',
      title: 'System Performance',
        value: '98.5%',
          change: '0%',
            trend: 'stable',
              icon: 'BarChart3',
                color: 'blue'
  },
  {
    id: '4',
      title: 'Support Quality',
        value: '4.9/5',
          change: '+0.2',
            trend: 'up',
              icon: 'Star',
                color: 'purple'
  }
  ])

  const [featureCards] = useState<FeatureCard[]>([
    {
      id: '1',
      title: 'AI Chat Support',
      description: 'Advanced AI-powered chat support with natural language processing and contextual responses',
      icon: 'MessageSquare',
      status: 'active'
    },
    {
      id: '2',
      title: 'Ticket Management',
      description: 'Comprehensive ticket management system with automated routing and priority assignment',
      icon: 'Ticket',
      status: 'active'
    },
    {
      id: '3',
      title: 'Knowledge Base',
      description: 'Intelligent knowledge base with AI-powered search and automated content generation',
      icon: 'BookOpen',
      status: 'active'
    },
    {
      id: '4',
      title: 'Analytics Dashboard',
      description: 'Real-time analytics and insights for support performance and user satisfaction metrics',
      icon: 'BarChart3',
      status: 'active'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconMap: { [key: string]: any } = {
      MessageSquare,
      Ticket,
      BookOpen,
      BarChart3,
      Activity,
      TrendingUp,
      Users,
      Settings,
      Star,
      Zap,
      Bot,
      CheckCircle
    }

    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className={className} /> : null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'beta': return 'text-yellow-400 bg-yellow-400/20'
      case 'coming-soon': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="container min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white overflow-hidden"
      style={{ width: '100%', maxWidth: '100%' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -50, 100, 0],
            y: [0, 50, -100, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
                  AJUTAI Enterprise
                </h1>
                <p className="text-sm text-gray-400">Universal Support System</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-sm text-gray-400" aria-live="polite">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 max-w-2xl mx-auto border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          role="tablist"
          aria-label="Main navigation"
        >              {(['overview', 'features', 'analytics', 'monitor'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                ? 'bg-blue-500/30 text-green-300 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            aria-label={`Switch to ${tab} tab`}
            tabIndex={0}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              role="tabpanel"
              id="overview-panel"
              aria-labelledby="overview-tab"
            >
              {/* Enterprise Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-green-400 mb-4">Enterprise Security</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  Advanced AI-powered support platform delivering intelligent customer assistance with High Performance and Global Scale capabilities for modern enterprises.
                </p>
              </motion.div>

              {/* Live Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-live="polite">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-pulse">
                      <div className="h-12 bg-white/10 rounded mb-4"></div>
                      <div className="h-6 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                  ))
                ) : analytics ? [
                  {
                    id: '1',
                    title: 'Total Tickets',
                    value: analytics.ticketMetrics.totalTickets.toString(),
                    change: `${analytics.ticketMetrics.openTickets} open`,
                    trend: 'up' as const,
                    icon: 'Ticket',
                    color: 'blue'
                  },
                  {
                    id: '2',
                    title: 'Active Agents',
                    value: analytics.agentMetrics.activeAgents.toString(),
                    change: `${analytics.agentMetrics.totalAgents} total`,
                    trend: 'up' as const,
                    icon: 'Users',
                    color: 'green'
                  },
                  {
                    id: '3',
                    title: 'Resolution Rate',
                    value: `${Math.round(analytics.chatMetrics.botResolutionRate)}%`,
                    change: 'automated',
                    trend: 'up' as const,
                    icon: 'CheckCircle',
                    color: 'green'
                  },
                  {
                    id: '4',
                    title: 'Satisfaction',
                    value: `${analytics.ticketMetrics.customerSatisfaction}/5`,
                    change: 'rating',
                    trend: 'up' as const,
                    icon: 'Star',
                    color: 'purple'
                  }
                ] : [
                  { id: '1', title: 'Total Tickets', value: '0', change: 'No data', trend: 'stable' as const, icon: 'Ticket', color: 'gray' },
                  { id: '2', title: 'Active Agents', value: '0', change: 'No data', trend: 'stable' as const, icon: 'Users', color: 'gray' },
                  { id: '3', title: 'Resolution Rate', value: '0%', change: 'No data', trend: 'stable' as const, icon: 'CheckCircle', color: 'gray' },
                  { id: '4', title: 'Satisfaction', value: '0/5', change: 'No data', trend: 'stable' as const, icon: 'Star', color: 'gray' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                        {renderIcon(metric.icon, `w-6 h-6 text-${metric.color}-400`)}
                      </div>
                      <div className={`flex items-center space-x-1 text-${metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'gray'}-400`}>
                        <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                      <p className="text-gray-300 font-medium">{metric.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Enterprise Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <h3 className="text-xl font-bold text-green-400 mb-6">Enterprise Security & Performance</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">99.9% Uptime</h4>
                    <p className="text-gray-400 text-sm">Enterprise-grade reliability</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Global Scale</h4>
                    <p className="text-gray-400 text-sm">Worldwide infrastructure</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">AI Security</h4>
                    <p className="text-gray-400 text-sm">Advanced threat protection</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              role="tabpanel"
              id="features-panel"
              aria-labelledby="features-tab"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-green-500/20">
                          {renderIcon(feature.icon, 'w-6 h-6 text-green-400')}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2"
                        aria-label={`Learn more about ${feature.title}`}
                        tabIndex={0}
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === 'analytics' || activeTab === 'monitor') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`${activeTab}-tab`}
            >
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                {activeTab === 'analytics' ? 'Advanced Analytics Dashboard' : 'System Monitor Dashboard'}
              </h2>
              <p className="text-gray-300 mb-6">
                {activeTab === 'analytics'
                  ? 'Comprehensive analytics and insights for support performance and customer satisfaction metrics.'
                  : 'Real-time system monitoring and performance analytics for comprehensive platform oversight.'
                }
              </p>
              <button
                className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-purple-600 transition-all font-medium"
                aria-label={`${activeTab === 'analytics' ? 'View Analytics Dashboard' : 'View System Monitor Dashboard'}`}
                tabIndex={0}
              >
                {activeTab === 'analytics' ? 'View Analytics' : 'View Dashboard'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
