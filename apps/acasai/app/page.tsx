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
  Lightbulb
} from 'lucide-react'

export default function AcasaiPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('Overview')
  const [stats, setStats] = useState({
    totalUsers: Math.floor(Math.random() * 10000) + 1000,
    activeConnections: Math.floor(Math.random() * 500) + 50,
    dataProcessed: Math.floor(Math.random() * 1000) + 100,
    uptime: 99.9
  })

  const tabs = ['Overview', 'Analytics', 'Features', 'Monitor']

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
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Acasai
              </div>
              <p className="text-xs text-slate-400">AI Platform</p>
            </div>
          </motion.div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm text-slate-300">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Acasai
            </span>
          </motion.h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Advanced business platform with real-time analytics and intelligent automation.
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-400 mb-8">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">System Active</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glassmorphism rounded-xl p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  aria-label={`Switch to ${tab} tab`}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                    activeTab === tab
                      ? 'bg-blue-500/30 text-blue-400 shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            {activeTab === 'Overview' && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Enterprise Overview</h2>
                <p className="text-slate-300 mb-8">Real-time system monitoring and enterprise security features.</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                    <p className="text-2xl font-bold text-indigo-400">{stats.totalUsers}</p>
                    <p className="text-sm text-slate-400">Registered users</p>
                  </div>
                  <div className="glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Active Now</h3>
                    <p className="text-2xl font-bold text-blue-400">{stats.activeConnections}</p>
                    <p className="text-sm text-slate-400">Connected users</p>
                  </div>
                  <div className="glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">System Metrics</h3>
                    <p className="text-2xl font-bold text-emerald-400">{stats.uptime}%</p>
                    <p className="text-sm text-slate-400">Uptime metrics</p>
                  </div>
                  <div className="glassmorphism p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Security Status</h3>
                    <p className="text-2xl font-bold text-purple-400">Active</p>
                    <p className="text-sm text-slate-400">Global scale protection</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Analytics' && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Advanced Analytics Dashboard</h2>
                <p className="text-slate-300 mb-8">Comprehensive analytics and performance insights.</p>
                <div className="glassmorphism p-8 rounded-xl">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg">Real-time analytics and reporting</p>
                </div>
              </div>
            )}

            {activeTab === 'Features' && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Enterprise Features</h2>
                <p className="text-slate-300 mb-8">Advanced capabilities for enterprise operations.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glassmorphism p-6 rounded-xl">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                    <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
                    <p className="text-slate-400">Multi-layer security protocols</p>
                  </div>
                  <div className="glassmorphism p-6 rounded-xl">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-lg font-semibold mb-2">Global Scale</h3>
                    <p className="text-slate-400">Worldwide deployment capabilities</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Monitor' && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">System Monitor</h2>
                <p className="text-slate-300 mb-8">Real-time system monitoring and status.</p>
                <div className="glassmorphism p-8 rounded-xl">
                  <Monitor className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                  <p className="text-lg">Continuous system monitoring</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick Actions */}
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              Analytics Dashboard
            </h3>
            <p className="text-slate-400 mb-4">View real-time analytics and system metrics</p>
            <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">View Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div
            className="glassmorphism p-8 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            whileHover={{ scale: 1.02, rotateY: 5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              Data Management
            </h3>
            <p className="text-slate-400 mb-4">Manage and organize your data efficiently</p>
            <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">Manage Data</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div
            className="glassmorphism p-8 rounded-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            whileHover={{ scale: 1.02, rotateY: 5 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              Network Status
            </h3>
            <p className="text-slate-400 mb-4">Monitor network connectivity and uptime</p>
            <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">Check Status</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </motion.div>

        {/* Status Footer */}
        <motion.div
          className="glassmorphism rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-400">Secure Connection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">High Performance</span>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Last updated: {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
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