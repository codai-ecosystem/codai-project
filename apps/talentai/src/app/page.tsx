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
  Search,
  Bell,
  User,
  Briefcase,
  Award,
  Building,
  UserCheck
} from 'lucide-react'
import { RealTimeStats } from '../../components/RealTimeStats'

type TabType = 'Overview' | 'Analytics' | 'Features' | 'Monitor'

export default function TalentaiPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<TabType>('Overview')
  const [stats, setStats] = useState({
    totalUsers: Math.floor(Math.random() * 10000) + 1000,
    activeConnections: Math.floor(Math.random() * 500) + 50,
    dataProcessed: Math.floor(Math.random() * 1000) + 100,
    uptime: 99.9
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate real-time stats updates
    const statsTimer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor(Math.random() * 10) - 5),
        dataProcessed: prev.dataProcessed + Math.floor(Math.random() * 50)
      }))
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(statsTimer)
    }
  }, [])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section */}
            <div className="text-center mb-12">
              <motion.h2
                className="text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  Talent AI Recruitment
                </span>
              </motion.h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                AI-driven talent acquisition and human resource management platform with real-time analytics.
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-400 mb-8">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">System Active</span>
              </div>
            </div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glassmorphism p-6 text-center rounded-xl">
                <div className="text-3xl font-bold text-purple-400">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Total Users</div>
                <div className="text-xs text-purple-300 mt-1">↗ +5.2%</div>
              </div>
              <div className="glassmorphism p-6 text-center rounded-xl">
                <div className="text-3xl font-bold text-violet-400">{stats.activeConnections}</div>
                <div className="text-sm text-slate-400">Active Now</div>
                <div className="text-xs text-violet-300 mt-1">↗ +2.1%</div>
              </div>
              <div className="glassmorphism p-6 text-center rounded-xl">
                <div className="text-3xl font-bold text-blue-400">{stats.dataProcessed.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Data Processed (GB)</div>
                <div className="text-xs text-blue-300 mt-1">↗ +8.7%</div>
              </div>
              <div className="glassmorphism p-6 text-center rounded-xl">
                <div className="text-3xl font-bold text-emerald-400">{stats.uptime}%</div>
                <div className="text-sm text-slate-400">Uptime</div>
                <div className="text-xs text-emerald-300 mt-1">Performance</div>
              </div>
            </motion.div>

            {/* Enterprise Features */}
            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="glassmorphism p-8 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.02, rotateY: 5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  Analytics Dashboard
                </h3>
                <p className="text-slate-400 mb-4">View real-time talent analytics and performance metrics</p>
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">View Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              <motion.div
                className="glassmorphism p-8 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.02, rotateY: 5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  User Management
                </h3>
                <p className="text-slate-400 mb-4">Manage candidates and HR teams efficiently</p>
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">Manage Users</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

              <motion.div
                className="glassmorphism p-8 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.02, rotateY: 5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  Data Management
                </h3>
                <p className="text-slate-400 mb-4">Organize talent data and insights intelligently</p>
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">Manage Data</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </motion.div>

            {/* Enterprise Security Features */}
            <motion.div
              className="glassmorphism rounded-xl p-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Enterprise Security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-300">High Performance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">Global Scale</span>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  Last updated: {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )

      case 'Analytics':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glassmorphism rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-400">
                Advanced Analytics Dashboard
              </h2>
              <RealTimeStats />
            </div>
          </motion.div>
        )

      case 'Features':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glassmorphism rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-400">
                Talent Management Features
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Briefcase className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold">Job Management</h3>
                  </div>
                  <p className="text-slate-400">Create, manage and track job postings with AI-powered matching.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <UserCheck className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold">Candidate Screening</h3>
                  </div>
                  <p className="text-slate-400">Automated screening and skill assessment with AI evaluation.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                  </div>
                  <p className="text-slate-400">Track hiring performance and ROI with detailed analytics.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-lg font-semibold">Enterprise Integration</h3>
                  </div>
                  <p className="text-slate-400">Seamless integration with existing HR and ATS systems.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'Monitor':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glassmorphism rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-400">
                System Monitoring
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <Network className="w-8 h-8 text-emerald-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Network Status</h3>
                  <p className="text-emerald-400 text-2xl font-bold">99.9%</p>
                  <p className="text-slate-400">Uptime</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <Database className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Database</h3>
                  <p className="text-blue-400 text-2xl font-bold">1.2ms</p>
                  <p className="text-slate-400">Response Time</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <Activity className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">API Health</h3>
                  <p className="text-purple-400 text-2xl font-bold">Healthy</p>
                  <p className="text-slate-400">All systems operational</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.9, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 50, 0],
              y: [0, 100, -50, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, delay: 10 }}
          />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Talent AI Recruitment
              </h1>
              <p className="text-xs text-slate-400">
                AI-driven talent acquisition and human resource management
              </p>
            </div>
          </motion.div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm text-slate-300">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="text-sm text-slate-400" aria-live="polite">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </nav>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 container mx-auto px-4 mb-8">
        <div className="flex justify-center space-x-1 bg-white/10 backdrop-blur-lg rounded-xl p-1 max-w-4xl mx-auto" role="tablist">
          {(['Overview', 'Analytics', 'Features', 'Monitor'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              aria-label={`Switch to ${tab} tab`}
              role="tab"
              aria-selected={activeTab === tab}
              tabIndex={0}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>

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