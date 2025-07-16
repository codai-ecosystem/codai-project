'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  Activity,
  Clock,
  Users,
  Settings,
  ChevronRight,
  Star,
  ArrowRight
} from 'lucide-react'
import marketaiLogger, {
  logCampaign,
  logAudience,
  logContent,
  logAnalytics,
  logUser,
  logSystem,
  logPerf,
  logABTest,
  logSocial
} from '../lib/logger'
import { MarketAIService, type Analytics } from '../services/marketaiService'

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

export default function MarketAIPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'analytics' | 'settings'>('overview')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRealMarketAIData()
  }, [])

  const loadRealMarketAIData = async () => {
    setLoading(true)
    try {
      const marketService = MarketAIService.getInstance()
      const analyticsData = await marketService.getAnalytics()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load MarketAI data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize logger on component mount
  useEffect(() => {
    const initializeLogger = async () => {
      try {
        await logSystem('MarketAI application starting', 'info', {
          module: 'page-load',
          context: { timestamp: Date.now(), version: '1.0.0' }
        })
        await logUser('Page loaded', {
          context: { route: '/marketai', userAgent: navigator.userAgent }
        })
      } catch (error) {
        console.warn('Failed to initialize MarketAI logger:', error)
      }
    }

    initializeLogger()
  }, [])

  // Log tab changes
  const handleTabChange = async (tab: 'overview' | 'features' | 'analytics' | 'settings') => {
    const startTime = Date.now()
    setActiveTab(tab)
    const duration = Date.now() - startTime

    try {
      await logUser(`Tab changed to ${tab}`, {
        context: { previousTab: activeTab, newTab: tab, timestamp: Date.now() }
      })
      await logPerf(`Tab switch to ${tab}`, duration, {
        context: { tabName: tab }
      })
    } catch (error) {
      console.warn('Failed to log tab change:', error)
    }
  }

  const [metrics] = useState<AppMetric[]>([])

  // Generate real metrics from analytics data
  const getRealMetrics = (): AppMetric[] => {
    if (!analytics) return []

    return [
      {
        id: '1',
        title: 'Total Campaigns',
        value: analytics.overview.totalCampaigns.toString(),
        change: `${analytics.overview.activeCampaigns} active`,
        trend: 'up',
        icon: 'Target',
        color: 'orange'
      },
      {
        id: '2',
        title: 'Total Revenue',
        value: `$${(analytics.overview.totalRevenue / 1000).toFixed(1)}K`,
        change: `${(analytics.overview.averageRoas).toFixed(1)}x ROAS`,
        trend: 'up',
        icon: 'TrendingUp',
        color: 'green'
      },
      {
        id: '3',
        title: 'Total Leads',
        value: (analytics.overview.totalLeads / 1000).toFixed(1) + 'K',
        change: `${analytics.overview.totalConversions} conversions`,
        trend: 'up',
        icon: 'Users',
        color: 'blue'
      },
      {
        id: '4',
        title: 'Average CTR',
        value: `${(analytics.overview.averageCtr * 100).toFixed(1)}%`,
        change: 'click rate',
        trend: 'up',
        icon: 'BarChart3',
        color: 'purple'
      }
    ]
  }

  const [featureCards] = useState<FeatureCard[]>([
    {
      id: '1',
      title: 'Campaign Management',
      description: 'Advanced campaign management capabilities with AI optimization',
      icon: 'Target',
      status: 'active'
    },
    {
      id: '2',
      title: 'AI Optimization',
      description: 'Advanced ai optimization capabilities with AI optimization',
      icon: 'TrendingUp',
      status: 'active'
    },
    {
      id: '3',
      title: 'Analytics',
      description: 'Advanced analytics capabilities with AI optimization',
      icon: 'Zap',
      status: 'active'
    },
    {
      id: '4',
      title: 'Automation',
      description: 'Advanced automation capabilities with AI optimization',
      icon: 'BarChart3',
      status: 'active'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Log analytics every 30 seconds for demo purposes
    const analyticsTimer = setInterval(async () => {
      try {
        await logAnalytics('page_views', Math.floor(Math.random() * 100), 'last_30s', {
          context: { page: '/marketai', activeTab }
        })
      } catch (error) {
        console.warn('Failed to log analytics:', error)
      }
    }, 30000)

    return () => {
      clearInterval(timer)
      clearInterval(analyticsTimer)
    }
  }, [activeTab])

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconMap: { [key: string]: any } = {
      Target,
      TrendingUp,
      Zap,
      BarChart3,
      Activity,
      Clock,
      Users,
      Settings,
      Star
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {renderIcon('Target', 'w-8 h-8 text-white')}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                  MarketAI
                </h1>
                <p className="text-sm text-gray-400">AI Marketing Platform</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Live</span>
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
        >
          {(['overview', 'features', 'analytics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                ? 'bg-orange-500/30 text-orange-300 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
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
            >
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-orange-400 mb-4">Intelligent marketing automation and campaign management with AI optimization</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  Experience the power of AI-driven technology with our advanced platform designed for modern businesses and developers.
                </p>
              </motion.div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="glassmorphism bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-pulse">
                      <div className="h-12 bg-white/10 rounded mb-4"></div>
                      <div className="h-6 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                  ))
                ) : getRealMetrics().map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
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
                    {/* Demo audience targeting button for metrics */}
                    {metric.title === 'Active Users' && (
                      <button
                        onClick={async () => {
                          try {
                            await logAudience('demographic_targeting', 12400, {
                              audienceId: `audience-${Date.now()}`,
                              context: {
                                ageGroup: '25-34',
                                interests: ['technology', 'marketing'],
                                location: 'US'
                              }
                            })
                          } catch (error) {
                            console.warn('Failed to log audience targeting:', error)
                          }
                        }}
                        className="mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        → Target Audience
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-orange-500/20">
                          {renderIcon(feature.icon, 'w-6 h-6 text-orange-400')}
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
                        onClick={async () => {
                          try {
                            // Demo different logging features based on card type
                            switch (feature.title) {
                              case 'Campaign Management':
                                await logCampaign('Demo campaign created', 'social_media', {
                                  campaignId: `demo-${Date.now()}`,
                                  context: { platform: 'facebook', budget: 1000 }
                                })
                                break
                              case 'AI Optimization':
                                await logContent('AI ad copy', 'gpt-4', {
                                  contentId: `content-${Date.now()}`,
                                  context: { wordCount: 50, sentiment: 'positive' }
                                })
                                break
                              case 'Analytics':
                                await logABTest('Header variation', 'variant_a', 12.5, {
                                  context: { impressions: 1000, conversions: 125 }
                                })
                                break
                              case 'Automation':
                                await logSocial('instagram', 'post_published', 250, {
                                  context: { likes: 180, comments: 45, shares: 25 }
                                })
                                break
                            }
                            await logUser(`Explored ${feature.title}`, {
                              context: { featureId: feature.id, action: 'learn_more' }
                            })
                          } catch (error) {
                            console.warn('Failed to log feature interaction:', error)
                          }
                        }}
                        className="bg-gradient-to-r from-orange-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2"
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

          {(activeTab === 'analytics' || activeTab === 'settings') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Panel
              </h2>
              <p className="text-gray-300 mb-6">
                {activeTab === 'analytics'
                  ? 'Advanced analytics and insights for your platform usage and performance metrics.'
                  : 'Configure your platform settings and preferences for optimal performance.'
                }
              </p>
              <button className="bg-gradient-to-r from-orange-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-purple-600 transition-all font-medium">
                Coming Soon
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
