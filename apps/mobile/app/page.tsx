'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor,
  Activity,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Clock,
  BarChart3,
  Layers,
  Network,
  Database,
  Lightbulb,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  ChevronRight,
  Calendar,
  MapPin,
  Award,
  Target,
  Briefcase,
  PieChart
} from 'lucide-react'
import { EnterpriseHeader } from '../components/EnterpriseHeader'
import { RealTimeStats } from '../components/RealTimeStats'
import { FeatureCard } from '../components/FeatureCard'
import { ActionPanel } from '../components/ActionPanel'
import { DataTable } from '../components/DataTable'
import type { MobileStats, MobileFeature } from '../types'

export default function MobilePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'management' | 'settings'>('dashboard')
  const [stats, setStats] = useState<MobileStats>({
    totalItems: Math.floor(Math.random() * 50000) + 10000,
    activeUsers: Math.floor(Math.random() * 1000) + 200,
    efficiency: Math.random() * 30 + 70,
    performance: Math.random() * 20 + 80,
    processingSpeed: Math.random() * 0.1 + 0.05,
    uptime: 99.9
  })
  
  const [features] = useState<MobileFeature[]>([
    {
      id: '1',
      title: 'Mobile app lifecycle management',
      description: 'Advanced mobile app lifecycle management with enterprise-grade capabilities',
      status: 'active',
      icon: Database,
      progress: Math.floor(Math.random() * 40) + 60
    },
    {
      id: '2',
      title: 'Cross-platform deployment',
      description: 'Advanced cross-platform deployment with enterprise-grade capabilities',
      status: 'active',
      icon: TrendingUp,
      progress: Math.floor(Math.random() * 40) + 60
    },
    {
      id: '3',
      title: 'Performance monitoring',
      description: 'Advanced performance monitoring with enterprise-grade capabilities',
      status: 'active',
      icon: Shield,
      progress: Math.floor(Math.random() * 40) + 60
    },
    {
      id: '4',
      title: 'Security compliance',
      description: 'Advanced security compliance with enterprise-grade capabilities',
      status: 'active',
      icon: Award,
      progress: Math.floor(Math.random() * 40) + 60
    },
    {
      id: '5',
      title: 'App store integration',
      description: 'Advanced app store integration with enterprise-grade capabilities',
      status: 'active',
      icon: Target,
      progress: Math.floor(Math.random() * 40) + 60
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate real-time stats updates
    const statsTimer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalItems: prev.totalItems + Math.floor(Math.random() * 10),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 20) - 10),
        efficiency: Math.min(100, Math.max(60, prev.efficiency + (Math.random() * 4) - 2)),
        performance: Math.min(100, Math.max(70, prev.performance + (Math.random() * 2) - 1)),
        processingSpeed: Math.max(0.01, prev.processingSpeed + (Math.random() * 0.02) - 0.01)
      }))
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(statsTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 50, 0],
              y: [0, 100, -50, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, delay: 10 }}
          />
        </div>
      </div>

      {/* Enterprise Header */}
      <EnterpriseHeader
        title="Mobile App Manager"
        subtitle="Enterprise mobile application management and deployment platform"
        isOnline={isOnline}
        currentTime={currentTime}
        colorScheme={appConfig.colorScheme}
      />

      {/* Tab Navigation */}
      <div className="relative z-10 container mx-auto px-4 mb-8">
        <div className="flex justify-center space-x-1 bg-white/10 backdrop-blur-lg rounded-xl p-1 max-w-4xl mx-auto">
          {(['dashboard', 'analytics', 'management', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Real-time Stats */}
              <RealTimeStats stats={stats} colorScheme={appConfig.colorScheme} />

              {/* Feature Cards */}
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    colorScheme={appConfig.colorScheme}
                    delay={index * 0.1}
                  />
                ))}
              </motion.div>

              {/* Action Panel */}
              <ActionPanel colorScheme={appConfig.colorScheme} />
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
              <div className="glassmorphism rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-400">
                  Analytics Dashboard
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <PieChart className="w-5 h-5 text-blue-400" />
                      <span className="text-emerald-400 text-sm">↗ +12%</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.efficiency.toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">Efficiency Rate</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span className="text-emerald-400 text-sm">↗ +8%</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.performance.toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">Performance Score</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span className="text-emerald-400 text-sm">↗ +15%</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.processingSpeed.toFixed(3)}s</div>
                    <div className="text-sm text-slate-400">Response Time</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">Stable</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.uptime}%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'management' && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DataTable colorScheme={appConfig.colorScheme} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glassmorphism rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-400">
                  Settings & Configuration
                </h2>
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">System Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Processing Mode</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                          <option>Real-time</option>
                          <option>Batch</option>
                          <option>Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Performance Level</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                          <option>Maximum</option>
                          <option>Balanced</option>
                          <option>Power Saving</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Footer */}
      <motion.div
        className="relative z-10 container mx-auto px-4 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="glassmorphism rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-400">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">High Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">Global Scale</span>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Last updated: {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}