'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  Brain,
  BarChart3,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  Users,
  Settings,
  ChevronRight,
  Star,
  ArrowRight,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react'
import GameMarketplace from '../components/GameMarketplace'
import AIAnalytics from '../components/AIAnalytics'

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

export default function JucAIPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'analytics' | 'settings'>('overview')

  const [metrics] = useState<AppMetric[]>([
    {
      id: '1',
      title: 'Active Players',
      value: '2.5M',
      change: '+15.8%',
      trend: 'up',
      icon: 'Users',
      color: 'pink'
    },
    {
      id: '2',
      title: 'AI Accuracy',
      value: '97.8%',
      change: '+3.2%',
      trend: 'up',
      icon: 'Brain',
      color: 'green'
    },
    {
      id: '3',
      title: 'Games Available',
      value: '500+',
      change: '+12',
      trend: 'up',
      icon: 'Gamepad2',
      color: 'blue'
    },
    {
      id: '4',
      title: 'Player Rating',
      value: '4.9/5',
      change: '+0.3',
      trend: 'up',
      icon: 'Star',
      color: 'purple'
    }
  ])

  const [featureCards] = useState<FeatureCard[]>([
    {
      id: '1',
      title: 'AI Game Engine',
      description: 'Revolutionary AI-powered game engine with intelligent NPC behavior and dynamic world generation.',
      icon: 'Brain',
      status: 'active'
    },
    {
      id: '2',
      title: 'Player Analytics',
      description: 'Advanced player behavior analysis with AI-driven insights and performance optimization.',
      icon: 'BarChart3',
      status: 'active'
    },
    {
      id: '3',
      title: 'Smart Matchmaking',
      description: 'Intelligent matchmaking system that creates balanced and engaging multiplayer experiences.',
      icon: 'Users',
      status: 'active'
    },
    {
      id: '4',
      title: 'Adaptive Difficulty',
      description: 'Dynamic difficulty adjustment system that adapts to player skill level in real-time.',
      icon: 'Target',
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
      Gamepad2,
      Brain,
      BarChart3,
      Zap,
      Activity,
      TrendingUp,
      Clock,
      Users,
      Settings,
      Star,
      Trophy,
      Target,
      Sparkles
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {renderIcon('Gamepad2', 'w-8 h-8 text-white')}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  JucAI
                </h1>
                <p className="text-sm text-gray-400">AI Gaming Platform</p>
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
          {(['overview', 'marketplace', 'analytics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-pink-500/30 text-pink-300 shadow-lg'
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
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center gaming-glow"
              >
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center gaming-pulse">
                    {renderIcon('Sparkles', 'w-8 h-8 text-white')}
                  </div>
                  <h2 className="text-3xl font-bold text-pink-400 neon-text">Next-Generation Gaming</h2>
                </div>
                <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
                  Experience the future of gaming with our AI-native platform. From intelligent NPCs that learn and adapt,
                  to dynamic worlds that evolve based on your playstyle, JucAI revolutionizes how games are created,
                  played, and experienced. Join millions of players in a new era of interactive entertainment.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Award Winning</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Real-time</span>
                  </div>
                </div>
              </motion.div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
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
                  </motion.div>
                ))}
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 game-card"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-pink-500/20">
                          {renderIcon(feature.icon, 'w-6 h-6 text-pink-400')}
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
                      <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2">
                        Explore Feature
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GameMarketplace />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AIAnalytics />
            </motion.div>
          )}

          {(activeTab === 'settings') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 gaming-pulse">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-pink-400 mb-4 neon-text">
                Platform Settings
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                Configure your gaming experience with advanced AI settings, performance optimization,
                and personalization options tailored to your playstyle.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="glass-button p-4 rounded-xl">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium">AI Preferences</p>
                </div>
                <div className="glass-button p-4 rounded-xl">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Performance</p>
                </div>
                <div className="glass-button p-4 rounded-xl">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Social</p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all font-semibold text-lg">
                Configure Settings
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
