/**
 * CODAI Mobile Application - Enhanced Mobile Experience Platform
 * Comprehensive mobile ecosystem with advanced analytics and device management
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone,
  Activity,
  Zap,
  Users,
  Bell,
  Fingerprint,
  WifiOff,
  RefreshCw,
  Home,
  MessageCircle,
  Camera,
  Heart,
  ShieldCheck,
  Wifi,
  Cloud
} from 'lucide-react'

interface MobileStats {
  activeSessions: number
  appInstalls: number
  pushNotifications: number
  appRating: number
  satisfaction: number
  loadTime: string
}

interface PerformanceMetrics {
  cpuUsage: number
  memoryUsage: number
  networkActivity: number
  loadTime: string
  fps: number
  memory: string
}

interface AppFeature {
  icon: any
  name: string
  status: string
  color: string
}

export const CodaiMobileApp = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLive, setIsLive] = useState(true)

  const [mobileStats, setMobileStats] = useState<MobileStats>({
    activeSessions: 1247,
    appInstalls: 8534,
    pushNotifications: 23456,
    appRating: 4.9,
    satisfaction: 96,
    loadTime: '0.8s'
  })

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 12,
    memoryUsage: 34,
    networkActivity: 78,
    loadTime: '0.8s',
    fps: 60,
    memory: '45MB'
  })

  const appFeatures: AppFeature[] = [
    { icon: Bell, name: 'Push Notifications', status: 'Active', color: 'text-yellow-400' },
    { icon: Fingerprint, name: 'Biometric Auth', status: 'Enabled', color: 'text-green-400' },
    { icon: WifiOff, name: 'Offline Mode', status: 'Ready', color: 'text-blue-400' }
  ]

  const mobileFeatures = [
    { icon: Smartphone, title: 'Device Detection', description: 'Cross-platform analytics', color: 'text-indigo-400' },
    { icon: Bell, title: 'Push Notifications', description: 'Real-time messaging', color: 'text-yellow-400' },
    { icon: Fingerprint, title: 'Biometric Auth', description: 'Secure authentication', color: 'text-green-400' },
    { icon: WifiOff, title: 'Offline Support', description: 'Background sync', color: 'text-blue-400' }
  ]

  const techStack = [
    {
      icon: Smartphone,
      title: 'React Native',
      description: 'Cross-platform mobile development with native performance',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Activity,
      title: 'Real-time Analytics',
      description: 'Comprehensive mobile app performance monitoring',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Cloud,
      title: 'Cloud Integration',
      description: 'Seamless synchronization and data management',
      color: 'from-green-500 to-cyan-600'
    }
  ]

  useEffect(() => {
    initializeMobileServices()

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate real-time data updates
    const dataInterval = setInterval(() => {
      if (isLive) {
        setMobileStats(prev => ({
          ...prev,
          activeSessions: prev.activeSessions + Math.floor(Math.random() * 10) - 5,
          appInstalls: prev.appInstalls + Math.floor(Math.random() * 5),
          pushNotifications: prev.pushNotifications + Math.floor(Math.random() * 20)
        }))

        setPerformanceMetrics(prev => ({
          ...prev,
          cpuUsage: Math.max(5, Math.min(25, prev.cpuUsage + Math.floor(Math.random() * 6) - 3)),
          memoryUsage: Math.max(20, Math.min(50, prev.memoryUsage + Math.floor(Math.random() * 4) - 2)),
          networkActivity: Math.max(50, Math.min(95, prev.networkActivity + Math.floor(Math.random() * 10) - 5))
        }))
      }
    }, 3000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [isLive])

  const initializeMobileServices = async () => {
    try {
      console.log('Initializing CODAI Mobile Experience Platform...')
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate initialization
      setIsInitialized(true)
    } catch (error) {
      console.error('Mobile services initialization error:', error)
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Loading CODAI Mobile...</h2>
          <p className="text-slate-400">Initializing mobile experience platform</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 25, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, delay: 6 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, delay: 12 }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center relative"
            >
              <Smartphone className="w-6 h-6 text-white" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
              >
                <Wifi className="w-2 h-2 text-green-900" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MOBILE
              </h1>
              <p className="text-slate-300 text-sm">Experience Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-green-400"
              />
              <span className="text-sm text-slate-300">Port 4036 • Mobile Platform Active</span>
            </div>
            <div className="text-sm text-slate-400">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </nav>
      </motion.header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MOBILE
            </span>
          </motion.h1>
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            Advanced Mobile Experience Platform
          </p>
          <div className="flex items-center justify-center space-x-2 text-indigo-400 mb-8">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-indigo-400 rounded-full"
            />
            <span className="text-sm font-medium">Cross-Platform Mobile Analytics & Management</span>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(102, 126, 234, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold text-lg relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                whileHover={{ opacity: 0.3, x: ['0%', '100%'] }}
                transition={{ duration: 0.5 }}
              />
              Launch Mobile Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-indigo-500/30 rounded-xl text-white font-medium hover:bg-white/20 transition-all"
            >
              View Analytics
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Dashboard */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            Mobile Experience Dashboard
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Device Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-2xl border border-indigo-500/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-indigo-400" />
                  Device Analytics
                </h3>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                  Live
                </div>
              </div>

              {/* Device Simulation */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-auto w-48 h-72 bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl p-5 mb-6 shadow-2xl"
              >
                <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
                  />

                  <div className="text-xs mb-2 flex items-center justify-between relative z-10">
                    <span>CODAI Mobile</span>
                    <div className="flex items-center space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-green-400"
                      />
                      <div className="w-6 h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-sm relative">
                        <motion.div
                          animate={{ width: ['20%', '85%', '20%'] }}
                          transition={{ duration: 5, repeat: Infinity }}
                          className="h-full bg-white/30 rounded-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                    {[
                      { icon: Home, color: 'bg-blue-500' },
                      { icon: MessageCircle, color: 'bg-green-500' },
                      { icon: Camera, color: 'bg-purple-500' },
                      { icon: Heart, color: 'bg-red-500' }
                    ].map((app, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className={`w-8 h-8 ${app.color} rounded-lg flex items-center justify-center cursor-pointer`}
                      >
                        <app.icon className="w-4 h-4 text-white" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-xs text-center opacity-80 relative z-10">
                    Real-time monitoring active
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3">
                {[
                  { label: 'Active Sessions', value: mobileStats.activeSessions, color: 'text-green-400' },
                  { label: 'App Installs', value: mobileStats.appInstalls, color: 'text-blue-400' },
                  { label: 'Push Notifications', value: mobileStats.pushNotifications, color: 'text-purple-400' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    />
                    <div className="flex items-center space-x-3 relative z-10">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
                        className={`w-2 h-2 ${metric.color.replace('text-', 'bg-')} rounded-full`}
                      />
                      <span className="text-sm">{metric.label}</span>
                    </div>
                    <motion.span
                      key={metric.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className={`font-bold ${metric.color} relative z-10`}
                    >
                      {metric.value.toLocaleString()}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Performance Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-2xl border border-indigo-500/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                  Performance Monitor
                </h3>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-6 h-6 text-indigo-400" />
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-lg font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">App Performance</span>
                    <span className="text-xs text-green-400">Excellent</span>
                  </div>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>Load Time: <span className="text-green-400">{performanceMetrics.loadTime}</span></div>
                    <div>FPS: <span className="text-blue-400">{performanceMetrics.fps}</span></div>
                    <div>Memory: <span className="text-yellow-400">{performanceMetrics.memory}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'CPU Usage', value: performanceMetrics.cpuUsage, color: 'bg-green-400' },
                    { label: 'Memory Usage', value: performanceMetrics.memoryUsage, color: 'bg-blue-400' },
                    { label: 'Network Activity', value: performanceMetrics.networkActivity, color: 'bg-purple-400' }
                  ].map((metric, index) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{metric.label}</span>
                        <motion.span
                          key={metric.value}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className={metric.color.replace('bg-', 'text-')}
                        >
                          {metric.value}%
                        </motion.span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, delay: 0.7 + index * 0.2 }}
                          className={`${metric.color} h-2 rounded-full relative overflow-hidden`}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/30"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">System Health</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>• No crashes detected</div>
                    <div>• All services operational</div>
                    <div>• Optimal performance maintained</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* User Experience Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-2xl border border-indigo-500/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2 text-pink-400" />
                  User Experience
                </h3>
                <div className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-medium">
                  Analytics
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-black/30 rounded-lg text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-2xl font-bold text-pink-400"
                    >
                      {mobileStats.appRating}
                    </motion.div>
                    <div className="text-xs text-slate-400">App Rating</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-black/30 rounded-lg text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 }}
                      className="text-2xl font-bold text-green-400"
                    >
                      {mobileStats.satisfaction}%
                    </motion.div>
                    <div className="text-xs text-slate-400">Satisfaction</div>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Engagement</span>
                    <span className="text-indigo-400">92%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                      className="bg-indigo-400 h-2 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/30"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Popular Features:</h4>
                  <div className="space-y-2">
                    {appFeatures.map((feature, index) => (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                        className="flex items-center justify-between p-2 bg-black/20 rounded hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <motion.div
                            whileHover={{ scale: 1.4, rotate: 15 }}
                            className={feature.color}
                          >
                            <feature.icon className="w-4 h-4" />
                          </motion.div>
                          <span className="text-sm">{feature.name}</span>
                        </div>
                        <span className={`text-xs ${feature.color}`}>{feature.status}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Mobile Platform Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mobileFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl text-center hover:bg-white/20 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.4, rotate: 15 }}
                  className={`w-8 h-8 mx-auto mb-3 ${feature.color}`}
                >
                  <feature.icon className="w-full h-full" />
                </motion.div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${tech.color} rounded-lg flex items-center justify-center mb-4`}>
                <tech.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{tech.title}</h3>
              <p className="text-slate-300">{tech.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: mobileStats.activeSessions.toLocaleString(), label: 'Active Sessions', color: 'text-indigo-400' },
            { value: mobileStats.appRating.toString(), label: 'App Rating', color: 'text-green-400' },
            { value: `${mobileStats.satisfaction}%`, label: 'Satisfaction', color: 'text-purple-400' },
            { value: mobileStats.loadTime, label: 'Load Time', color: 'text-pink-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-xl border border-indigo-500/30 p-6 text-center rounded-xl hover:bg-white/15 transition-all duration-300"
            >
              <motion.div
                key={stat.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`text-3xl font-bold ${stat.color} mb-2`}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
