'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  FileText,
  Search,
  Shield,
  HardDrive,
  Cloud,
  Users,
  Settings,
  ChevronRight,
  Star,
  ArrowRight,
  Zap,
  Layers,
  Lock,
  Activity
} from 'lucide-react'
import StorageManager from '@/components/storage/StorageManager'
import VectorExplorer from '@/components/vectors/VectorExplorer'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

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

export default function StocAIPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'storage' | 'vectors' | 'analytics' | 'settings'>('overview')

  const [metrics] = useState<AppMetric[]>([
    {
      id: '1',
      title: 'Storage Used',
      value: '2.4TB',
      change: '+12.3%',
      trend: 'up',
      icon: 'HardDrive',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Files Stored',
      value: '847K',
      change: '+18.7%',
      trend: 'up',
      icon: 'FileText',
      color: 'green'
    },
    {
      id: '3',
      title: 'Vector Embeddings',
      value: '1.2M',
      change: '+25.4%',
      trend: 'up',
      icon: 'Database',
      color: 'purple'
    },
    {
      id: '4',
      title: 'Search Queries',
      value: '95K/day',
      change: '+8.9%',
      trend: 'up',
      icon: 'Search',
      color: 'orange'
    }
  ])

  const [featureCards] = useState<FeatureCard[]>([
    {
      id: '1',
      title: 'File Storage',
      description: 'Secure file storage with intelligent organization and tagging capabilities',
      icon: 'FileText',
      status: 'active'
    },
    {
      id: '2',
      title: 'Vector Database',
      description: 'Advanced vector storage for AI embeddings and semantic search',
      icon: 'Database',
      status: 'active'
    },
    {
      id: '3',
      title: 'Smart Search',
      description: 'AI-powered content discovery with natural language queries',
      icon: 'Search',
      status: 'active'
    },
    {
      id: '4',
      title: 'Knowledge Base',
      description: 'RAG-ready knowledge management for AI agents and applications',
      icon: 'Layers',
      status: 'active'
    },
    {
      id: '5',
      title: 'Secure Vault',
      description: 'Encrypted document storage with enterprise-grade security',
      icon: 'Shield',
      status: 'beta'
    },
    {
      id: '6',
      title: 'Auto Processing',
      description: 'Automatic content summarization and metadata extraction',
      icon: 'Zap',
      status: 'coming-soon'
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
      Database,
      FileText,
      Search,
      Shield,
      HardDrive,
      Cloud,
      Users,
      Settings,
      Star,
      Zap,
      Layers,
      Lock,
      Activity
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
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
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {renderIcon('Database', 'w-8 h-8 text-white')}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  StocAI
                </h1>
                <p className="text-sm text-gray-400">AI-Native Storage Service</p>
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
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Live</span>
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
          {(['overview', 'features', 'storage', 'vectors', 'analytics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                ? 'bg-blue-500/30 text-blue-300 shadow-lg'
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
                <h2 className="text-2xl font-bold text-blue-400 mb-4">The memory backbone of the CODAI ecosystem</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  Enterprise-grade file, dataset, and vector storage with RAG capabilities. Intelligent content processing, semantic search, and seamless AI integration.
                </p>
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
                      <div className="flex items-center space-x-1 text-green-400">
                        <Database className="w-4 h-4" />
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-500/20">
                        {renderIcon(feature.icon, 'w-6 h-6 text-blue-400')}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2 w-full justify-center">
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'storage' && (
            <motion.div
              key="storage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StorageManager />
            </motion.div>
          )}

          {activeTab === 'vectors' && (
            <motion.div
              key="vectors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VectorExplorer />
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
              <AnalyticsDashboard />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <h2 className="text-2xl font-bold text-blue-400 mb-4">
                Settings Management
              </h2>
              <p className="text-gray-300 mb-6">
                Configure your storage settings, security preferences, and integration options.
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium">
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
